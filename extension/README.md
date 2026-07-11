# Prody IDE Extension

VS Code / **Cursor** / **Antigravity** extension — security review loop, agent-ready fix guide, architecture approval, deploy URL.

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

Then in VS Code / Cursor:

1. **Run Extension** — open `extension/` folder, press F5, or use **Extensions: Install from VSIX** after `npm run package`.

Or from repo root:

```bash
cd extension && npm install && npm run compile
code --install-extension extension/prody-cloud-engineer-0.1.0.vsix
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
