"""DevOps agent — executes the real GCP deployment (execution phase).

Unlike the prototype (which let the LLM emit gcloud commands), deployment here
is DETERMINISTIC and tool-grounded: the orchestrator drives `tools/gcloud.py`
directly, so the demo can't be broken by a hallucinated command or an LLM
refusal. This module owns the deploy *procedure* + the natural-language
narration that makes each real step explainable.
"""
import re
from typing import Callable, Optional

from engine import llm
from tools import gcloud

SYSTEM = (
    "You are the Senior DevOps agent on an autonomous engineering team. You have "
    "just performed a real Google Cloud deployment on the user's behalf. Narrate "
    "what you did in short, confident, plain-language updates a non-engineer "
    "understands. Never expose raw gcloud noise; translate it into outcomes."
)


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9-]", "-", (name or "app").lower()).strip("-")
    slug = re.sub(r"-+", "-", slug) or "app"
    return slug[:40]


def service_name_for(project_or_path: str) -> str:
    import os
    return _slugify(os.path.basename(os.path.normpath(project_or_path)))


def deploy(source_dir: str, project_id: str, service_name: Optional[str] = None,
           region: Optional[str] = None, emit: Optional[Callable] = None) -> dict:
    """Run the real Cloud Run deployment. Returns tools.gcloud.deploy_cloud_run dict.

    Ensures required APIs are enabled first. `project_id` must already exist /
    be selected — project creation is a separate, human-approved step.
    """
    service_name = service_name or service_name_for(source_dir)
    gcloud.enable_apis(project_id, emit=emit)
    return gcloud.deploy_cloud_run(
        project_id=project_id, service_name=service_name,
        source_dir=source_dir, region=region, emit=emit,
    )


def narrate_result(result: dict) -> str:
    """Human-readable summary of a deploy result (LLM with deterministic fallback)."""
    if result.get("ok"):
        fallback = (f"Your application is live in production at {result['deploy_url']}. "
                    f"It's running on Google Cloud Run in {result['region']} with "
                    "automatic HTTPS and scales to zero when idle, so you only pay "
                    "for real traffic.")
    else:
        fallback = ("The deployment did not complete. I've kept everything safe and "
                    "made no partial changes to production. Review the log and retry.")
    return llm.narrate(
        SYSTEM,
        f"Summarize this deployment result for the app owner in 2-3 sentences: {result}",
        fallback=fallback,
    )
