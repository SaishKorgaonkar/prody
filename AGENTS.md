# Prody — Agent instructions (IDE + Antigravity)

**Read [`INTEGRATION.md`](INTEGRATION.md) first** for full system context, run commands, and API contract.

When the user asks to **ship**, **deploy**, or **run Prody** on this workspace:

## Security-first loop

1. Ensure the Prody engine is running: `uvicorn backend.main:app --host 127.0.0.1 --port 8000`
2. Ensure the security gate is running: `uvicorn pentest.main:app --host 127.0.0.1 --port 8900`
3. User runs **Prody: Ship to Production** (VS Code / Cursor / Antigravity extension) OR starts a session via the dashboard.
4. If security **FAIL**s, read **`PRODY_SECURITY_FIXES.md`** in the workspace root and implement every fix under **Open issues**.
5. After fixes, user runs **Prody: Retry After Fixes** — do not skip re-scanning.
6. Only after gate **PASS** or **PASS_WITH_WARNINGS** does deploy proceed (with human approval for architecture).

## Implementing security fixes

- Use the **Suggested fix** text in `PRODY_SECURITY_FIXES.md` for each finding.
- Prefer minimal, secure changes — parameterized queries, no hardcoded secrets, escaped output.
- Do not weaken the security gate or bypass Prody checks.
- After implementing fixes, remind the user to retry Prody.

## Deploy

- Deploy is executed by the Prody engine (Managed Agents + GCP MCP), not by editing cloud resources manually in chat.
- User must **approve** the architecture in the Prody sidebar before production deploy.

## Surfaces

| Surface | URL |
|---------|-----|
| Engine API | http://127.0.0.1:8000 |
| Dashboard | http://localhost:3001 |
| Pentest gate | http://127.0.0.1:8900 |
