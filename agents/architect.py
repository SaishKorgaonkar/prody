"""Architect agent — designs the production architecture (planning phase).

Reasoning agent (Interactions API). Given the grey-box stack detection and the
security posture, it proposes a Cloud Run based production architecture and
explains it in business-first language. Degrades to a deterministic heuristic
plan when the LLM is unavailable, so the pipeline always has a plan to deploy.
"""
from typing import Optional

from engine import llm

SYSTEM = (
    "You are the Cloud Architect on an autonomous engineering team. You design "
    "production-ready Google Cloud architectures for applications built by solo "
    "developers, founders, and small teams who have NO infrastructure expertise. "
    "Default to Google Cloud Run (serverless containers) for web apps: it is "
    "secure-by-default, scales to zero, and needs no cluster management. Explain "
    "every choice in plain business language a non-engineer understands — talk "
    "about reliability, security, and cost, not Kubernetes internals. Be concise."
)


def _heuristic_plan(stack: dict, gate: Optional[dict]) -> dict:
    langs = stack.get("languages", ["unknown"])
    frameworks = stack.get("frameworks", [])
    fw = frameworks[0] if frameworks else (langs[0] if langs else "app")
    return {
        "target": "Google Cloud Run",
        "compute": "Serverless container (scales to zero, autoscaling on traffic)",
        "build": ("Existing Dockerfile" if stack.get("has_dockerfile")
                  else "Google Cloud Buildpacks (no Dockerfile needed)"),
        "networking": "Managed HTTPS endpoint with automatic TLS certificate",
        "scaling": "0 → N instances automatically based on request volume",
        "data": "Add Cloud SQL / Firestore later if persistent storage is needed",
        "estimated_monthly_cost": "$0–$15 at low traffic (pay-per-use, scales to zero)",
        "why": (f"A {fw} web service fits Cloud Run perfectly: you get a secure, "
                "auto-scaling production endpoint without managing servers, and it "
                "costs nothing while idle."),
    }


def design(stack: dict, gate: Optional[dict] = None) -> dict:
    """Return {plan: dict, explanation: str}. Never raises."""
    heuristic = _heuristic_plan(stack, gate)
    gate_line = ""
    if gate:
        gate_line = (f"Security gate verdict: {gate.get('status')}. "
                     f"Findings summary: {gate.get('summary')}.")

    prompt = (
        "Design the production architecture for this application.\n"
        f"Detected stack: {stack}\n{gate_line}\n"
        "Return JSON with keys: target, compute, build, networking, scaling, "
        "data, estimated_monthly_cost, why. Keep values short and plain-language."
    )
    plan = llm.structured(SYSTEM, prompt, fallback=heuristic)

    explanation = llm.narrate(
        SYSTEM,
        "Explain this architecture to the app's owner in 3-4 sentences of plain "
        f"business language. Architecture: {plan}",
        fallback=heuristic["why"],
    )
    return {"plan": plan, "explanation": explanation}
