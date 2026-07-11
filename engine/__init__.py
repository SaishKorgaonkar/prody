"""Prody engine — the autonomous cloud-engineering orchestration layer.

A client-side multi-agent orchestrator (mirroring the pentest agent's pattern)
that sequences the phases a real engineering team performs between code and
production: intake -> security_scan -> architect -> deploy -> sre.

Public surface consumed by `backend/main.py`:
  - SessionRegistry / Session   (engine.session)
  - Event / EventType           (engine.events)
  - run_pipeline               (engine.orchestrator)
  - resolve_intake             (engine.intake)
"""
