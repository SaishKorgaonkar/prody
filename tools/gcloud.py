"""Real gcloud tooling — the DevOps agent's hands on Google Cloud.

Extracted and hardened from the `agent.py` prototype:
  * NO mocks. Every function shells out to the real `gcloud` CLI.
  * Cross-platform: resolves the `gcloud` executable via PATH (handles the
    Windows `gcloud.cmd` shim) and inspects the project with `pathlib`, never
    `ls -la`.
  * Argument-list subprocess calls (no `shell=True`) so project ids / paths
    can't be shell-injected.

Each call returns a structured `GcloudResult` so the orchestrator can stream
progress and make decisions (e.g. parse the Cloud Run service URL) instead of
scraping free-text.
"""
import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, List, Optional

# Default billing account carried over from the agent.py prototype. Override via
# env so we never hardcode a secret-ish value in more than one place.
DEFAULT_BILLING_ACCOUNT = os.getenv("PRODY_BILLING_ACCOUNT", "019B50-4CED52-737F15")
DEFAULT_REGION = os.getenv("PRODY_REGION", "us-central1")
GCLOUD_TIMEOUT_S = int(os.getenv("PRODY_GCLOUD_TIMEOUT_S", "600"))

# APIs a Cloud Run deploy from source needs.
CLOUD_RUN_APIS = ["run.googleapis.com", "cloudbuild.googleapis.com",
                  "artifactregistry.googleapis.com"]


@dataclass
class GcloudResult:
    ok: bool
    args: List[str]
    stdout: str = ""
    stderr: str = ""
    returncode: int = -1

    @property
    def cmd(self) -> str:
        return "gcloud " + " ".join(self.args)

    def to_dict(self) -> dict:
        return {"ok": self.ok, "cmd": self.cmd, "returncode": self.returncode,
                "stdout": self.stdout[-4000:], "stderr": self.stderr[-4000:]}


def gcloud_path() -> Optional[str]:
    """Resolve the gcloud executable cross-platform (gcloud / gcloud.cmd)."""
    return (shutil.which("gcloud") or shutil.which("gcloud.cmd")
            or shutil.which("gcloud.CMD"))


def gcloud_available() -> bool:
    return gcloud_path() is not None


def run_gcloud(args: List[str], emit: Optional[Callable] = None,
               cwd: Optional[str] = None, timeout: int = GCLOUD_TIMEOUT_S) -> GcloudResult:
    """Run `gcloud <args>` and capture structured output. Never raises."""
    exe = gcloud_path()
    if emit:
        emit("tool_run", {"tool": "gcloud", "args": args})
    if not exe:
        return GcloudResult(
            ok=False, args=args,
            stderr="gcloud CLI not found on PATH. Install the Google Cloud SDK "
                   "and run `gcloud auth login`.")
    try:
        proc = subprocess.run(
            [exe, *args, "--quiet"],
            capture_output=True, text=True, timeout=timeout, cwd=cwd,
        )
        return GcloudResult(
            ok=proc.returncode == 0, args=args,
            stdout=proc.stdout or "", stderr=proc.stderr or "",
            returncode=proc.returncode,
        )
    except subprocess.TimeoutExpired as e:
        return GcloudResult(ok=False, args=args,
                            stderr=f"gcloud timed out after {timeout}s: {e}")
    except Exception as e:  # noqa: BLE001 — surface any spawn failure to the agent
        return GcloudResult(ok=False, args=args, stderr=f"{type(e).__name__}: {e}")


# ---- account / project context ----------------------------------------
def active_account() -> Optional[str]:
    r = run_gcloud(["auth", "list", "--filter=status:ACTIVE",
                    "--format=value(account)"])
    return r.stdout.strip() or None if r.ok else None


def current_project() -> Optional[str]:
    r = run_gcloud(["config", "get-value", "project"])
    val = r.stdout.strip()
    return val if (r.ok and val and val != "(unset)") else None


def context() -> dict:
    """GCP context the SRE agent + dashboard display."""
    return {
        "gcloud_available": gcloud_available(),
        "account": active_account(),
        "project": current_project(),
        "region": DEFAULT_REGION,
    }


# ---- project lifecycle -------------------------------------------------
def create_gcp_project(project_id: str, billing_account_id: Optional[str] = None,
                       emit: Optional[Callable] = None) -> GcloudResult:
    """Create a GCP project and (best-effort) link billing."""
    r = run_gcloud(["projects", "create", project_id], emit=emit)
    billing = billing_account_id or DEFAULT_BILLING_ACCOUNT
    if r.ok and billing:
        run_gcloud(["beta", "billing", "projects", "link", project_id,
                    "--billing-account", billing], emit=emit)
    return r


def enable_apis(project_id: str, services: Optional[List[str]] = None,
                emit: Optional[Callable] = None) -> GcloudResult:
    services = services or CLOUD_RUN_APIS
    return run_gcloud(["services", "enable", *services,
                       "--project", project_id], emit=emit)


# ---- Cloud Run deploy (real) ------------------------------------------
_URL_RE = re.compile(r"https://[^\s\"']+\.run\.app")


def _extract_service_url(text: str) -> Optional[str]:
    m = _URL_RE.search(text or "")
    return m.group(0) if m else None


def deploy_cloud_run(project_id: str, service_name: str, source_dir: str,
                     region: Optional[str] = None, allow_unauthenticated: bool = True,
                     emit: Optional[Callable] = None) -> dict:
    """Deploy `source_dir` to Cloud Run from source (real `gcloud run deploy`).

    Cloud Build packages the source (Dockerfile if present, else buildpacks),
    so this works for the flawed demo app and most language stacks. Returns
    {ok, service, region, deploy_url, log}.
    """
    region = region or DEFAULT_REGION
    args = [
        "run", "deploy", service_name,
        "--source", source_dir,
        "--region", region,
        "--project", project_id,
        "--platform", "managed",
        "--format", "value(status.url)",
    ]
    args.append("--allow-unauthenticated" if allow_unauthenticated
                else "--no-allow-unauthenticated")

    r = run_gcloud(args, emit=emit, cwd=source_dir)
    url = _extract_service_url(r.stdout) or _extract_service_url(r.stderr)
    if r.ok and not url:
        url = describe_service_url(project_id, service_name, region)

    return {
        "ok": bool(r.ok and url),
        "service": service_name,
        "region": region,
        "project_id": project_id,
        "deploy_url": url,
        "log": (r.stdout + "\n" + r.stderr).strip()[-6000:],
    }


def describe_service_url(project_id: str, service_name: str,
                         region: Optional[str] = None) -> Optional[str]:
    region = region or DEFAULT_REGION
    r = run_gcloud(["run", "services", "describe", service_name,
                    "--region", region, "--project", project_id,
                    "--format", "value(status.url)"])
    return r.stdout.strip() or None if r.ok else None


# ---- grey-box inspection (cross-platform; replaces `ls -la`) -----------
def inspect_application(directory: str, max_entries: int = 200) -> dict:
    """List a project's top-level files/dirs using pathlib (cross-platform)."""
    root = Path(directory).expanduser()
    if not root.is_dir():
        return {"error": f"directory not found: {directory}"}
    entries = []
    for i, p in enumerate(sorted(root.iterdir())):
        if i >= max_entries:
            break
        entries.append({
            "name": p.name,
            "type": "dir" if p.is_dir() else "file",
            "size": (p.stat().st_size if p.is_file() else None),
        })
    return {"directory": str(root.resolve()), "entries": entries}
