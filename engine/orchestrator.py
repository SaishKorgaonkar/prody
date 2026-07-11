"""The engine orchestrator — Prody's multi-agent phase pipeline.

Mirrors the pentest orchestrator's design (client-side multi-agent coordination,
since Managed Agents don't yet delegate to subagents): it sequences the agents a
real engineering team would, hands structured state between phases, and is robust
by design — a failing phase is logged, deploy is gated on security, and a status
is always produced.

    intake -> security_scan -> architect -> [human approval] -> deploy -> sre

Security is a hard gate: deploy is REFUSED on a FAIL/ERROR verdict (or if the
pentest gate can't be reached — fail closed, never ship unscanned code).
"""
import traceback
from typing import Optional

from . import gate_client, intake as intake_mod
from .events import Agent, EventType
from .session import Session
from deploy_agent import runner as deploy_runner
from agents import architect as architect_agent
from agents import devops as devops_agent
from agents import sre as sre_agent
from tools import gcloud


def _log(session: Session, message: str, agent: str = Agent.ORCHESTRATOR,
         data: Optional[dict] = None) -> None:
    session.emit(EventType.LOG, agent=agent, message=message, data=data)


# ---- phase 1: intake ---------------------------------------------------
def _phase_intake(session: Session) -> bool:
    session.emit_phase_start("intake", "Understanding your application")
    try:
        path = intake_mod.resolve_intake(session.repo_url, session.project_path)
        session.project_path = path
        stack = intake_mod.detect_stack(path)
        session.stack = stack
        session.emit(EventType.AGENT_MESSAGE, agent=Agent.INTAKE,
                     message=(f"Detected a {', '.join(stack['frameworks'] or stack['languages'])} "
                              f"application. Preparing it for production."),
                     data=stack)
        session.emit_phase_done("intake")
        return True
    except Exception as e:
        session.emit(EventType.ERROR, agent=Agent.INTAKE,
                     message=f"Could not read the project: {e}")
        return False


# ---- phase 2: security_scan (the hard gate) ---------------------------
def _phase_security(session: Session) -> bool:
    session.emit_phase_start("security_scan", "Checking your app for security risks")

    def on_event(kind, data):
        if kind == "progress":
            session.emit(EventType.LOG, agent=Agent.SECURITY,
                         message=f"Security review in progress ({data.get('findings_count', 0)} issues found so far)…",
                         data=data)

    try:
        scan_id = gate_client.start_scan(session.project_path)
        session.metadata["scan_id"] = scan_id
        session.emit(EventType.AGENT_MESSAGE, agent=Agent.SECURITY,
                     message="Running a full pre-deployment security review on a private test copy of your app.",
                     data={"scan_id": scan_id})
        verdict = gate_client.poll_until_verdict(scan_id, on_event=on_event)
    except gate_client.GateUnavailable as e:
        session.emit(EventType.ERROR, agent=Agent.SECURITY,
                     message=("Security review service is offline, so I won't deploy unscanned "
                              "code. Start the security gate on :8900 and retry."),
                     data={"detail": str(e)})
        return False

    session.gate = verdict
    for f in verdict.get("findings", []):
        session.emit(EventType.FINDING, agent=Agent.SECURITY,
                     message=f.get("title", "Security finding"), data=f)

    status = verdict.get("status")
    session.emit(EventType.GATE, agent=Agent.SECURITY,
                 message=verdict.get("executive_summary")
                 or f"Security verdict: {status}",
                 data={"status": status, "summary": verdict.get("summary")})
    session.emit_phase_done("security_scan")

    if gate_client.is_blocking(verdict):
        if status == "FAIL":
            msg = ("Deployment blocked: your app has serious security issues that must "
                   "be fixed before it can safely go to production.")
        else:  # ERROR — the scan couldn't complete, so we won't ship unverified.
            msg = ("Deployment blocked: the security review couldn't finish, so I won't "
                   "ship code that hasn't been verified. "
                   + (verdict.get("error") or ""))
        session.emit(EventType.ERROR, agent=Agent.SECURITY, message=msg.strip(),
                     data={"status": status})
        return False
    return True


# ---- phase 3: architect -----------------------------------------------
def _phase_architect(session: Session) -> bool:
    session.emit_phase_start("architect", "Designing your production setup")
    if deploy_runner.is_available():
        ok = deploy_runner.run_architect_phase(session)
        session.emit_phase_done("architect")
        return ok

    result = architect_agent.design(session.stack, session.gate)
    session.architecture = result
    session.emit(EventType.AGENT_MESSAGE, agent=Agent.ARCHITECT,
                 message=result["explanation"], data=result["plan"])
    session.emit_phase_done("architect")
    return True


# ---- phase 4+5: deploy (MCP managed agent or legacy gcloud) -----------
def _uses_managed_deploy(session: Session) -> bool:
    return bool(session.metadata.get("architect_interaction_id"))
def _resolve_project_id(session: Session) -> Optional[str]:
    return session.metadata.get("project_id") or gcloud.current_project()


def _phase_deploy(session: Session) -> bool:
    session.emit_phase_start("deploy", "Deploying to production")

    if _uses_managed_deploy(session):
        ok = deploy_runner.run_deploy_phase(session)
        session.emit_phase_done("deploy")
        return ok

    if not gcloud.gcloud_available():
        session.emit(EventType.ERROR, agent=Agent.DEVOPS,
                     message=("Google Cloud CLI isn't available on this machine, so I can't "
                              "deploy for real. Install the Cloud SDK and run `gcloud auth login`."))
        return False

    project_id = _resolve_project_id(session)
    if not project_id:
        session.emit(EventType.ERROR, agent=Agent.DEVOPS,
                     message=("No Google Cloud project is selected. Set one with "
                              "`gcloud config set project <id>` or pass project_id, then retry."))
        return False

    service_name = (session.metadata.get("service_name")
                    or devops_agent.service_name_for(session.project_path))
    region = session.metadata.get("region")

    # Human-in-the-loop: deploys are a critical action (context.md — Human Approval).
    approved = session.request_approval(
        step_id="deploy",
        description=(f"Ready to deploy '{service_name}' to Google Cloud Run "
                     f"in project {project_id}. Approve to go live in production."),
        data={"project_id": project_id, "service_name": service_name,
              "region": region or gcloud.DEFAULT_REGION,
              "architecture": (session.architecture or {}).get("plan")},
    )
    if not approved:
        session.emit(EventType.LOG, agent=Agent.DEVOPS,
                     message="Deployment was not approved — nothing was changed in production.")
        session.emit_phase_done("deploy")
        return False

    session.emit(EventType.AGENT_MESSAGE, agent=Agent.DEVOPS,
                 message=f"Approved. Deploying '{service_name}' to Cloud Run now — this is a real deployment.",
                 data={"project_id": project_id, "service_name": service_name})

    def emit_tool(kind, data):
        session.emit(EventType.TOOL_RUN, agent=Agent.DEVOPS,
                     message=f"Running: {data.get('tool')} {data.get('args', '')}", data=data)

    result = devops_agent.deploy(
        source_dir=session.project_path, project_id=project_id,
        service_name=service_name, region=region, emit=emit_tool)
    session.metadata["deploy_result"] = result

    narration = devops_agent.narrate_result(result)
    if result.get("ok"):
        session.deploy_url = result["deploy_url"]
        session.emit(EventType.DEPLOY_URL, agent=Agent.DEVOPS,
                     message=narration, data={"deploy_url": result["deploy_url"],
                                              "region": result["region"]})
        session.emit_phase_done("deploy")
        return True

    session.emit(EventType.ERROR, agent=Agent.DEVOPS, message=narration,
                 data={"log": result.get("log", "")[-2000:]})
    return False


# ---- phase 6: sre ------------------------------------------------------
def _phase_sre(session: Session) -> None:
    session.emit_phase_start("sre", "Confirming production health")
    deploy_result = session.metadata.get("deploy_result", {})
    assessment = sre_agent.assess(session.session_id, deploy_result)
    session.sre_handoff = assessment["handoff"]
    session.emit(EventType.SRE_HANDOFF, agent=Agent.SRE,
                 message=assessment["explanation"],
                 data={"handoff": assessment["handoff"], "health": assessment["health"]})
    session.emit_phase_done("sre")


# ---- readiness ---------------------------------------------------------
def _compute_readiness(session: Session) -> int:
    score = 0
    status = (session.gate or {}).get("status")
    score += {"PASS": 45, "PASS_WITH_WARNINGS": 30}.get(status, 0)
    if session.deploy_url:
        score += 35
    if session.sre_handoff and session.deploy_url:
        score += 20
    return min(score, 100)


# ---- entry point -------------------------------------------------------
def run_pipeline(session: Session) -> None:
    """Blocking entry point — run the full engagement, mutating `session`.

    Designed to run on a background thread (backend/main.py starts it there).
    """
    try:
        session.status = "running"
        session.emit(EventType.SESSION_START, message="Prody engineering team is on it.",
                     data={"source": session.source})

        if not _phase_intake(session):
            session.status = "error"
        elif not _phase_security(session):
            session.status = "error"
        elif not _phase_architect(session):
            session.status = "error"
        elif not _phase_deploy(session):
            session.status = "error"
        else:
            _phase_sre(session)
            session.status = "done"

        session.readiness_score = _compute_readiness(session)
        session.emit(EventType.READINESS, message="Production readiness assessed.",
                     data={"readiness_score": session.readiness_score})
        session.emit(EventType.FINISHED,
                     message=("All done — your app is in production."
                              if session.status == "done"
                              else "Stopped before deployment. See the events above for why."),
                     data={"status": session.status, "deploy_url": session.deploy_url,
                           "readiness_score": session.readiness_score})
    except Exception as e:  # noqa: BLE001 — a pipeline crash must still leave a status
        session.status = "error"
        session.emit(EventType.ERROR, message=f"Unexpected engine error: {e}",
                     data={"trace": traceback.format_exc()[-2000:]})
        session.emit(EventType.FINISHED, message="Engine stopped on an error.",
                     data={"status": "error"})
