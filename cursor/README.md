# Prody in Cursor — 2-minute setup

Cursor is a VS Code fork. **You do not need a separate extension** — use the same `extension/` package.

## 1. Start backend

```bash
pip install -r requirements.txt
uvicorn pentest.main:app --host 127.0.0.1 --port 8900
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

## 2. Install the Prody extension in Cursor

**Option A — Development (recommended for hackathon)**

```bash
cd extension
npm install
npm run compile
```

1. In Cursor: **File → Open Folder** → select the `extension/` folder
2. Press **F5** (or Run → Start Debugging)
3. A new **Extension Development Host** window opens — open your app project there

**Option B — Install from folder**

1. Compile: `cd extension && npm run compile`
2. Cursor → **Extensions** → `...` menu → **Install from VSIX...**  
   Or: **Install Extension from Location** → pick `extension/` folder (if available in your Cursor version)

**Option C — CLI**

```bash
cd extension && npm run compile && npx @vscode/vsce package --allow-missing-repository
cursor --install-extension prody-cloud-engineer-0.1.0.vsix
```

## 3. Cursor agent rules (already in repo)

| Rule | Purpose |
|------|---------|
| `.cursor/rules/prody-workflow.mdc` | Always-on Prody ship/security/deploy context |
| `.cursor/rules/prody-security-fixes.mdc` | Auto-applies when `PRODY_SECURITY_FIXES.md` is open |

Root **`AGENTS.md`** also documents the loop for Antigravity / other agents.

## 4. Demo flow in Cursor

1. Open your app workspace (e.g. `demo_app/`)
2. Command Palette → **Prody: Ship to Production**
3. If security **FAIL**s → open `PRODY_SECURITY_FIXES.md`
4. Ask Cursor: *"Implement all fixes in PRODY_SECURITY_FIXES.md"*
5. Command Palette → **Prody: Retry After Fixes**
6. When **PASS** → approve architecture in Prody sidebar → get deploy URL

## Commands

Same as VS Code — search **Prody** in Command Palette:

- Ship to Production
- Retry After Fixes
- Open Security Fixes Guide
- Approve & Deploy

## Settings (Cursor)

**Settings → search `prody`**

- `prody.engineUrl` → `http://127.0.0.1:8000`
- `prody.dashboardUrl` → `http://localhost:3001`
