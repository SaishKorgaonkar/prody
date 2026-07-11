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
| **Prody: Ship to Production** | Start full pipeline (security → architect → approve → deploy) |
| **Prody: Retry After Fixes** | Re-scan after you fixed issues (compares resolved vs open) |
| **Prody: Open Security Fixes Guide** | Opens `PRODY_SECURITY_FIXES.md` |
| **Prody: Approve & Deploy** | Approve architecture gate |
| **Prody: Open Web Dashboard** | Same session on web |

## Security loop

1. Extension starts session with `source: "ide"` and workspace path.
2. Findings stream into the **Prody** sidebar.
3. On **FAIL**, writes **`PRODY_SECURITY_FIXES.md`** — structured for your coding agent (Cursor, Antigravity, Claude).
4. You or your agent implement fixes.
5. **Retry After Fixes** — new scan; resolved issues show with ✅ in sidebar.
6. On **PASS**, pipeline continues to architecture + approval + deploy.

## Settings

- `prody.engineUrl` — default `http://127.0.0.1:8000`
- `prody.dashboardUrl` — default `http://localhost:3001`
- `prody.fixesFileName` — default `PRODY_SECURITY_FIXES.md`
