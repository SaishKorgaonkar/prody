"""Prody's AI engineering team — one module per specialized agent.

Refactored out of the `agent.py` CLI prototype into composable agents the
orchestrator sequences:

  * architect — designs the production GCP architecture (reasoning agent)
  * devops    — executes the real gcloud deployment (deterministic + narration)
  * sre       — post-deploy health + operational handoff

Each agent owns a SYSTEM instruction and a small, explainable API the
orchestrator calls; the security agent lives in `pentest/` and is consumed via
the gate.
"""
