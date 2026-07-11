# Prody — Build Task List & Agent Coordination

> **Last updated:** 2026-07-11 (Cursor — dashboard scaffold)

---

## 🤝 Agent Coordination Protocol

**Both agents MUST follow this every session:**

1. **Read this file first** — especially `Agent Log`, `Interface Contracts`, and your owned tasks.
2. **Work only on your owned tasks** unless the log says the other agent handed off.
3. **After every meaningful chunk of work**, append an entry to `## Agent Log` (newest on top).
4. **Never delete** another agent's log entries. Append only.
5. **If blocked**, log it immediately with `@Cursor` or `@Claude` tag and what you need.
6. **Commit to `feat/landing-integration`** (or sub-branch) with prefix `cursor:` or `claude:` in commit message.
7. **Do not commit secrets** (`.env`, API keys).

### Log entry format

```markdown
### [YYYY-MM-DD HH:MM] @AgentName — short title
- **Done:** ...
- **Files changed:** `path/a`, `path/b`
- **For @OtherAgent:** ...
- **Blocked:** none | description
- **Next:** ...
```

---

## 👥 Task Ownership Split

| Area | Owner | Why |
|------|-------|-----|
| `engine/` + `backend/` + `tools/` | **Claude Code** | Python orchestration, FastAPI, gcloud |
| `agent.py` refactor → modular agents | **Claude Code** | Existing CLI prototype |
| `pentest/` gate wiring into orchestrator | **Claude Code** | Calls `GET /scan/{id}/gate` |
| `demo_app/` + deploy flow | **Claude Code** | Real gcloud, Cloud Run |
| `AGENTS.md` + Antigravity skills | **Claude Code** | Managed agent / IDE surface |
| Merge deploy-agent branch | **Cursor** | Git integration when branch lands |
| `dashboard/` web UI (new) | **Cursor** | Next.js, SSE consumer, drag-drop |
| `landing/` polish + CTA wiring | **Cursor** | Marketing site done; hook to dashboard |
| Session handoff UI (IDE ↔ dashboard) | **Cursor** | Needs `backend/` SSE contract |
| `TASKS.md` + demo script doc | **Both** | Keep log updated |
| End-to-end demo rehearsal | **Both** | Claude runs pipeline, Cursor runs UI |

---

## 🔌 Interface Contracts (do not break without logging)

Both agents build against these shapes. **Update here if you change them.**

### Pentest gate (exists — `pentest/main.py`)

```
POST /scan/start     { project_path, target_url? }  → { scan_id }
GET  /scan/{id}/gate                              → { verdict: PASS|PASS_WITH_WARNINGS|FAIL, ... }
GET  /scan/{id}/stream                            → SSE events
```

Deploy/orchestrator **must refuse** deploy when `verdict == FAIL`.

### Engine API (Claude builds — Cursor consumes)

```
POST /api/session/start   { source: "ide"|"dashboard", repo_url?, project_path? }  → { session_id }
GET  /api/session/{id}/events   → SSE: { type, agent, message, data? }
POST /api/session/{id}/approve  { step_id }   → user approval gate
GET  /api/session/{id}/status   → { phase, readiness_score?, deploy_url? }
```

Phases: `intake` → `security_scan` → `architect` → `deploy` → `sre`

### SRE handoff payload (DevOps → SRE)

```json
{ "project_id", "service_name", "region", "deploy_url", "session_id" }
```

---

## Agent Log

> **Newest entries at the top.** Both agents append here.

### [2026-07-11 16:00] @Cursor — unified team integration branch

- **Done:** Merged `feat/integrated-deploy-mcp` + `feat/prody-ide-extension` + landing flow into **`feat/prody-team-integration`** (single PR target for teammate).
- **Contains:** engine, backend, dashboard, deploy_agent MCP, IDE extension, Cursor rules, landing pipeline narrative.
- **For @Teammate:** Branch off `feat/prody-team-integration` only. Resolve dashboard/MCP polish here; one PR when ready.
- **Blocked:** none

### [2026-07-11 14:35] @Cursor — status sync (Claude on C5–C6)

- **Verified on disk:** C1–C3 ✅ (`engine/session.py`, `events.py`, `intake.py`). C4 ✅ (`tools/gcloud.py`). C6 client ✅ (`engine/gate_client.py`). Also: `engine/llm.py`, `agents/architect.py` (C8 started early).
- **In progress:** C5 `engine/orchestrator.py` — not on disk yet; Claude terminal shows "Building orchestrator + gate wiring".
- **Still needed:** C7 `backend/main.py`, C9–C14, then dashboard connects live (no mock).
- **For @Claude:** After C5–C6, prioritize C7 with CORS for `http://localhost:3001`. Log here when `/api/session/start` responds.
- **Blocked:** none

### [2026-07-11 15:05] @Cursor — dashboard K3–K7 shipped

- **Done:** Scaffolded `dashboard/` Next.js app (:3001). Intake form (GitHub URL + drop zone + local path). Session page with SSE consumer + mock fallback. Readiness panel + phase stepper. Landing CTAs wired to `http://localhost:3001`.
- **Files changed:** `dashboard/**`, `landing/lib/config.ts`, `landing/components/Hero.tsx`, `Nav.tsx`, `CTABanner.tsx`, `TwoSurfaces.tsx`, `Footer.tsx`, `.gitignore`, `TASKS.md`
- **For @Claude:** Dashboard calls `POST /api/session/start`, `GET /api/session/{id}/events` (SSE), `GET /api/session/{id}/status` per contract below. When C7 is live on :8000, mock mode auto-disables. CORS: allow `http://localhost:3001`.
- **Blocked:** none
- **Next:** K8 DEMO.md. K9 push when Saish asks. Merge deploy branch when ready.

### [2026-07-11 14:00] @Cursor — hero + task split ready

- **Done:** Landing hero redesigned (COMPUT3-style dark hero, video right). TASKS.md split between Cursor and Claude Code. Interface contracts drafted.
- **Files changed:** `landing/components/Hero.tsx`, `HeroVideoGlass.tsx`, `Nav.tsx`, `page.tsx`, `TASKS.md`
- **For @Claude:** Please build `engine/` + `backend/main.py` matching Interface Contracts above. Pentest runs on `:8900`. Start with session model + orchestrator that blocks deploy on gate FAIL. Log every commit here.
- **Blocked:** Deploy-agent teammate branch not on remote yet. I'll merge when pushed.
- **Next:** Scaffold `dashboard/` Next.js app with SSE viewer + repo URL intake. Waiting on your `/api/session/{id}/events` shape — build to contract above or update this section.

### [2026-07-11 13:44] @Cursor — branch established

- **Done:** Created `feat/landing-integration`, merged `feat/pentest-agent`, pushed to origin.
- **For @Claude:** Review `pentest/README.md`, `pentest/main.py`, `agent.py`. Security gate is ready; wire it before deploy step.
- **Next:** Landing polish (complete).

---

## Git

| Branch | Status |
|--------|--------|
| **`feat/prody-team-integration`** | **Canonical team branch** — engine + dashboard + MCP + IDE extension + landing |
| `feat/integrated-deploy-mcp` | Superseded by team branch (merged in) |
| `feat/prody-ide-extension` | Superseded by team branch (merged in) |
| `feat/landing-integration` | Older base |
| `feat/managed-agents-mcp` | Teammate deploy agent (already integrated in `deploy_agent/`) |

```bash
git fetch origin
git checkout feat/prody-team-integration
git pull
```

**One PR:** open from `feat/prody-team-integration` → `main` (or `feat/landing-integration` if that stays default).

---

## Overall Progress

| Track | Owner | Status |
|-------|-------|--------|
| Landing (`landing/`) | Cursor | ✅ Dark hero, video, responsive |
| Security (`pentest/`) | Teammate | ✅ Merged |
| Engine (`engine/` + `backend/`) | Claude | 🔄 C4 done, C5–C6 in progress |
| Dashboard UI (`dashboard/`) | Cursor | ✅ Intake + SSE UI (mock until C7) |
| Deploy agent | Teammate + Claude | ⏳ Branch pending |
| SRE agent | Claude | ⬜ Post-deploy |
| Antigravity `AGENTS.md` | Claude | ⬜ |
| Demo E2E | Both | ⬜ |

---

## Claude Code — Task List

> **Priority order. Check off in this file and log each completion.**

| # | Task | Status | Notes |
|---|------|--------|-------|
| C1 | `engine/session.py` — session id, phase, metadata | ✅ | On disk |
| C2 | `engine/events.py` — SSE event types | ✅ | On disk |
| C3 | `engine/intake.py` — repo path / URL intake | ✅ | On disk |
| C4 | `tools/gcloud.py` — extract from `agent.py` | ✅ | Real gcloud, cross-platform |
| C5 | `engine/orchestrator.py` — phase pipeline | 🔄 | Claude building now |
| C6 | Wire pentest: call gate before deploy | 🔄 | `engine/gate_client.py` done; wiring in orchestrator |
| C7 | `backend/main.py` — FastAPI + SSE endpoints | ⬜ | Port `:8000` — **next after C5–C6** |
| C8 | Refactor `agent.py` agents into `agents/` modules | 🔄 | `agents/architect.py` started |
| C9 | `demo_app/` — simple flawed app for demo | ⬜ | Can extend `samples/vulnerable_flask/` |
| C10 | Cloud Run deploy via real `gcloud` | ⬜ | No mocks |
| C11 | SRE agent stub + GCP context handoff | ⬜ | `{ project_id, service_name, region, deploy_url }` |
| C12 | Root `AGENTS.md` + Antigravity skills | ⬜ | Managed agent entry point |
| C13 | `requirements.txt` — merge pentest + engine deps | ⬜ | |
| C14 | README section: how to run full demo | ⬜ | |

**Claude run commands (target):**

```bash
# Terminal 1 — security gate
uvicorn pentest.main:app --host 127.0.0.1 --port 8900

# Terminal 2 — prody engine
uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 3 — dashboard (Cursor builds)
cd dashboard && npm run dev
```

---

## Cursor — Task List

| # | Task | Status | Notes |
|---|------|--------|-------|
| K1 | Landing hero + responsive | ✅ | COMPUT3-style dark hero |
| K2 | `git fetch` + merge deploy-agent branch | ⏳ | When teammate pushes |
| K3 | Scaffold `dashboard/` Next.js app | ✅ | Port 3001 |
| K4 | Dashboard: repo URL + drag-drop intake UI | ✅ | POST `/api/session/start` |
| K5 | Dashboard: live agent event stream (SSE) | ✅ | Mock fallback until backend |
| K6 | Dashboard: readiness score + deploy URL display | ✅ | |
| K7 | Wire landing CTAs → dashboard URLs | ✅ | `NEXT_PUBLIC_DASHBOARD_URL` |
| K8 | `DEMO.md` — 3-minute rehearsal script | ⬜ | |
| K9 | Push landing/dashboard commits | ⬜ | `cursor:` prefix |

---

## Architecture (unchanged)

| Phase | Agent | Where |
|-------|-------|-------|
| Pre-deploy scan | Security | `pentest/` local :8900 |
| Architecture + deploy | Architect, DevOps | Gemini + real gcloud |
| Post-deploy | SRE | GCP project context |

**Security → Deploy:** gate API must return PASS before deploy proceeds.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [context.md](context.md) | Product vision |
| [hackathon.md](hackathon.md) | Hackathon tracks + principles |
| [agent.py](agent.py) | CLI prototype (Architect + DevOps) |
| [pentest/main.py](pentest/main.py) | Security gate API |
| [pentest/orchestrator.py](pentest/orchestrator.py) | Multi-agent pentest pipeline |
| [landing/](landing/) | Marketing site |
| `engine/` | **Claude creates** |
| `backend/` | **Claude creates** |
| `dashboard/` | **Cursor creates** |

---

## Critical Path to Demo (today)

```
1. Claude: engine + backend SSE          ─┐
2. Cursor:  dashboard SSE consumer       ─┼─ parallel after C7 stub exists
3. Claude: pentest gate wired in pipeline  │
4. Claude: demo_app + gcloud deploy       ─┘
5. Cursor:  merge deploy branch if ready
6. Both:    run DEMO.md rehearsal
```

---

## Next Up

1. **@Claude** — Finish C5–C6, then **C7 backend** (CORS `:3001`). Log when live.
2. **@Cursor** — K8 DEMO.md; wire dashboard to real SSE when C7 lands.
3. **Saish** — Nothing blocks Claude; keep pentest ready on :8900 for gate tests.
