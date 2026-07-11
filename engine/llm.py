"""Thin Gemini wrapper for the engine's reasoning agents.

Problem-Statement-2 alignment: each agent is a Managed Agents / Interactions API
conversation (same primitive as the pentest agent's `iapi.py`). Here the engine
agents mostly *reason and explain* (the Architect designs; the DevOps/SRE narrate
real work the orchestrator performs deterministically), so this module offers:

  * `narrate(...)`  — one-shot natural-language reasoning (explainable actions)
  * `structured(...)` — one-shot JSON generation constrained by a schema
  * `run_agent(...)`  — full tool-calling loop for agents that drive tools

Every call degrades gracefully: if `GEMINI_API_KEY` is unset or the API errors,
it returns a deterministic fallback so the demo pipeline never hard-fails on the
LLM. Real infrastructure work (gcloud) is never mocked; only the prose is.
"""
import json
import os
from dataclasses import dataclass
from typing import Any, Callable, List, Optional

MODEL = os.getenv("PRODY_MODEL", "gemini-3.5-flash")
FALLBACK_MODEL = os.getenv("PRODY_FALLBACK_MODEL", "gemini-2.5-flash")
MAX_AGENT_TURNS = int(os.getenv("PRODY_MAX_AGENT_TURNS", "10"))
MAX_TOOL_RESULT_CHARS = 8000


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict
    fn: Callable[..., Any]

    @property
    def decl(self) -> dict:
        return {"type": "function", "name": self.name,
                "description": self.description, "parameters": self.parameters}


def api_key() -> Optional[str]:
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


def available() -> bool:
    return bool(api_key())


_CLIENT = None


def _client():
    global _CLIENT
    if _CLIENT is None:
        from google import genai  # imported lazily so the engine loads without genai
        _CLIENT = genai.Client(api_key=api_key())
    return _CLIENT


def _stringify(out: Any) -> str:
    if isinstance(out, str):
        return out[:MAX_TOOL_RESULT_CHARS]
    return json.dumps(out, default=str)[:MAX_TOOL_RESULT_CHARS]


def narrate(system: str, prompt: str, fallback: str = "",
            model: str = MODEL) -> str:
    """One-shot reasoning text. Returns `fallback` if the LLM is unavailable."""
    if not available():
        return fallback
    try:
        it = _client().interactions.create(
            model=model, input=prompt, system_instruction=system)
        return (it.output_text or "").strip() or fallback
    except Exception:
        return fallback


def structured(system: str, prompt: str, fallback: dict,
               model: str = MODEL) -> dict:
    """One-shot JSON generation. Returns `fallback` on any failure."""
    if not available():
        return fallback
    try:
        it = _client().interactions.create(
            model=model,
            input=prompt + "\n\nRespond with ONLY a single JSON object.",
            system_instruction=system)
        text = (it.output_text or "").strip()
        # Tolerate ```json fences.
        if text.startswith("```"):
            text = text.strip("`")
            text = text[text.find("{"):]
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1:
            return json.loads(text[start:end + 1])
    except Exception:
        pass
    return fallback


def run_agent(tools: List[Tool], kickoff: str, system: str,
              emit: Optional[Callable] = None, model: str = MODEL,
              max_turns: int = MAX_AGENT_TURNS) -> str:
    """Full tool-calling agent loop (Interactions API), executing tools locally.

    Returns the agent's final natural-language output. Raises if the LLM is
    unavailable — callers that need graceful degradation should check
    `available()` first.
    """
    if not available():
        raise RuntimeError("GEMINI_API_KEY not set")
    registry = {t.name: t for t in tools}
    decls = [t.decl for t in tools]

    def _emit(kind, data=None):
        if emit:
            emit(kind, data)

    it = _client().interactions.create(
        model=model, input=kickoff, system_instruction=system, tools=decls)

    for _ in range(max_turns):
        calls = [s for s in (it.steps or [])
                 if getattr(s, "type", None) == "function_call"]
        if not calls:
            return it.output_text or ""
        results = []
        for c in calls:
            args = c.arguments or {}
            _emit("tool_run", {"tool": c.name, "args": args})
            tool = registry.get(c.name)
            if tool is None:
                res, is_err = f"ERROR: unknown tool {c.name}", True
            else:
                try:
                    res, is_err = _stringify(tool.fn(**args)), False
                except Exception as e:
                    res, is_err = f"ERROR: {type(e).__name__}: {e}", True
            step = {"type": "function_result", "call_id": c.id,
                    "name": c.name, "result": res}
            if is_err:
                step["is_error"] = True
            results.append(step)
        it = _client().interactions.create(
            model=model, previous_interaction_id=it.id, input=results, tools=decls)

    return it.output_text or ""
