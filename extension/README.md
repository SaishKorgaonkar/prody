# Prody IDE Extension

**One extension** for VS Code, **Cursor**, and **Antigravity** (all VS Code–compatible).

→ **Cursor quick start:** [../cursor/README.md](../cursor/README.md)

## Prerequisites

```bash
pip install -r requirements.txt
uvicorn pentest.main:app --host 127.0.0.1 --port 8900
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Set `GEMINI_API_KEY` and `gcloud auth login` for full deploy.

## Install (development)

```bash
cd extension
npm install
npm run compile
```

Then in VS Code / Cursor / Antigravity:

1. **Run Extension** — open the `extension/` folder, press **F5** (see [cursor/README.md](../cursor/README.md) for Cursor)
2. Or **Install from VSIX** after `npx @vscode/vsce package --allow-missing-repository`

Or from repo root:

```bash
cd extension && npm install && npm run compile
cursor --install-extension extension/prody-cloud-engineer-0.1.0.vsix   # Cursor
code --install-extension extension/prody-cloud-engineer-0.1.0.vsix   # VS Code
```

## Commands

| Command | Action |
|---------|--------|
| **Prody: Ship to Production** | Start full pipeline (functional gate → security gate → architect → approve → deploy) |
| **Prody: Retry After Fixes** | Re-scan after you fixed issues (compares resolved vs open, per gate) |
| **Prody: Open Security Fixes Guide** | Opens `PRODY_SECURITY_FIXES.md` |
| **Prody: Approve & Deploy** | Approve the pending human-in-the-loop gate (e.g. deploy) |
| **Prody: Reject Plan** | Reject the pending human-in-the-loop gate |
| **Prody: Open Web Dashboard** | Same session on web |

## Functional + security gates

The engine runs two hard gates before it will deploy, in order:

1. **Functional gate** (`functional_gate` phase) — "does your app actually work?". Runs deterministic smoke tests / pytest against a private copy of your app and verdicts **PASS / PASS_WITH_WARNINGS / FAIL**.
2. **Security gate** (`security_scan` phase) — the existing pentest review, same verdict scale.

Both verdicts and their findings stream into the **Prody** sidebar as separate sections (Functional / Security), each with its own pill (PASS/WARN/FAIL/ERROR).

1. Extension starts session with `source: "ide"` and workspace path.
2. Functional and security findings stream into the **Prody** sidebar under their own headings as they arrive (`agent: "functional"` or `agent: "security"` on `finding`/`gate` events; `gate` events also carry `data.gate_type`).
3. On a **FAIL** from *either* gate, writes **`PRODY_SECURITY_FIXES.md`** — structured for your coding agent (Cursor, Antigravity, Claude), with separate "Open functional issues" and "Open security issues" sections. A functional **FAIL** short-circuits the security scan entirely, so the security section may be empty until you retry.
4. You or your agent implement fixes.
5. **Retry After Fixes** — new scan; resolved issues show with ✅ in sidebar, per gate.
6. Once both gates **PASS**/**PASS_WITH_WARNINGS**, the pipeline continues to architecture + approval + deploy.

## Settings

- `prody.engineUrl` — default `http://127.0.0.1:8000`
- `prody.dashboardUrl` — default `http://localhost:3001`
- `prody.fixesFileName` — default `PRODY_SECURITY_FIXES.md`
