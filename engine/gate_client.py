"""Client for the pentest security gate (runs on :8900).

The engine calls this before deploy. The deploy phase MUST refuse to proceed on
a FAIL verdict (TASKS.md interface contract + pentest/README.md gate policy).

Flow:
    POST /scan/start          { project_path }        -> { scan_id }
    GET  /scan/{id}/gate                              -> { status, ... } | PENDING
    (poll until the verdict is terminal or we time out)
"""
import os
import time
from typing import Callable, Optional

import httpx

PENTEST_BASE_URL = os.getenv("PRODY_PENTEST_URL", "http://127.0.0.1:8900")
GATE_POLL_INTERVAL_S = float(os.getenv("PRODY_GATE_POLL_S", "1.5"))
GATE_TIMEOUT_S = int(os.getenv("PRODY_GATE_TIMEOUT_S", "360"))

TERMINAL_VERDICTS = ("PASS", "PASS_WITH_WARNINGS", "FAIL", "ERROR")


class GateUnavailable(RuntimeError):
    """Raised when the pentest service can't be reached."""


def start_scan(project_path: str, target_url: Optional[str] = None,
               base_url: str = PENTEST_BASE_URL, timeout: float = 30.0) -> str:
    """Kick off a scan; returns the scan_id. Raises GateUnavailable if down."""
    payload = {"project_path": project_path}
    if target_url:
        payload["target_url"] = target_url
    try:
        r = httpx.post(f"{base_url}/scan/start", json=payload, timeout=timeout)
    except httpx.HTTPError as e:
        raise GateUnavailable(f"pentest service unreachable at {base_url}: {e}") from e
    if r.status_code >= 400:
        raise GateUnavailable(f"scan start failed ({r.status_code}): {r.text}")
    return r.json()["scan_id"]


def get_gate(scan_id: str, base_url: str = PENTEST_BASE_URL,
             timeout: float = 15.0) -> dict:
    """Read the current gate verdict (may be PENDING)."""
    try:
        r = httpx.get(f"{base_url}/scan/{scan_id}/gate", timeout=timeout)
    except httpx.HTTPError as e:
        raise GateUnavailable(f"gate read failed: {e}") from e
    return r.json()


def poll_until_verdict(scan_id: str, on_event: Optional[Callable] = None,
                       base_url: str = PENTEST_BASE_URL,
                       timeout_s: int = GATE_TIMEOUT_S) -> dict:
    """Poll the gate until a terminal verdict or timeout.

    `on_event(kind, data)` is invoked with the pentest status log tail so the
    engine can forward security findings into its own SSE stream.
    """
    deadline = time.time() + timeout_s
    seen_findings = 0
    while time.time() < deadline:
        # Forward findings/log progress to the engine stream.
        if on_event:
            try:
                s = httpx.get(f"{base_url}/scan/{scan_id}/status", timeout=10).json()
                findings = s.get("findings_count", 0)
                if findings > seen_findings:
                    on_event("progress", {"findings_count": findings,
                                          "phase": s.get("phase")})
                    seen_findings = findings
            except httpx.HTTPError:
                pass

        gate = get_gate(scan_id, base_url=base_url)
        status = gate.get("status")
        if status in TERMINAL_VERDICTS:
            return gate
        time.sleep(GATE_POLL_INTERVAL_S)

    return {"status": "ERROR", "error": "gate timed out", "scan_id": scan_id}


def is_blocking(verdict: dict) -> bool:
    """A deploy is blocked on FAIL (and on ERROR — fail closed, no verdict = no deploy)."""
    return verdict.get("status") in ("FAIL", "ERROR")
