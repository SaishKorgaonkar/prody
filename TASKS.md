# Prody — Build Task List

> Last updated: 2026-07-11  
> Legend: ✅ Done · 🔄 In progress · ⬜ Not started · ⏳ Blocked on teammate

---

## Git Branches

| Branch | Owner | Status |
|--------|-------|--------|
| **`feat/landing-integration`** | Saish (you) | **Active** — landing + docs + pentest merge |
| `feat/pentest-agent` | Teammate | ✅ Merged into `feat/landing-integration` |
| Deploy agent branch | Teammate | ⏳ **Not on remote yet** — merge when pushed |

**Your branch:** `feat/landing-integration`  
**Remote:** push with `git push -u origin feat/landing-integration`

### Integrate deploy agent (when ready)

```bash
git fetch origin
git checkout feat/landing-integration
git merge origin/<deploy-agent-branch>   # replace with actual branch name
# resolve conflicts, commit, push
```

---

## Overall Progress

| Track | Status | Notes |
|-------|--------|-------|
| Marketing landing (`landing/`) | ✅ **Launch-ready** | HashiCorp Sans, hero video glass layout, Prody branding |
| Security agent (`pentest/`) | ✅ **Integrated** | From `feat/pentest-agent` — iAPI multi-agent pentest gate |
| Engine core (`engine/`) | ⬜ | Not started — **next up** |
| Deploy agent | ⏳ | Teammate working — branch not pushed yet |
| Agent team (`agents/`) | 🔄 | CLI prototype ([agent.py](agent.py)) + pentest gate |
| IDE surface (Antigravity) | ⬜ | AGENTS.md + skills not created |
| Dashboard surface | ⬜ | Not started |
| Demo rehearsal | ⬜ | Not started |

---

## Architecture Decision Log

### SRE agent runs on GCP (deployed by DevOps)

After DevOps deploys, SRE monitors in the **same GCP project** with context: `{ project_id, service_name, region, deploy_url, session_id }`.

| Phase | Agent | Where | Branch / code |
|-------|-------|-------|---------------|
| Pre-deploy scan | Security | Local Gemma / pentest API | ✅ `pentest/` |
| Architecture + deploy | Architect, DevOps | Cloud + gcloud | ⏳ deploy agent branch |
| Post-deploy monitor/scale | SRE | GCP project context | ⬜ |

### Security → Deploy handoff

Deploy agent must call `GET /scan/{id}/gate` on the pentest service and refuse deploy on `FAIL`. See [pentest/README.md](pentest/README.md).

---

## Track 1 — Marketing Landing (`landing/`) ✅

| Task | Status |
|------|--------|
| Next.js scaffold | ✅ |
| Cohere-inspired design tokens | ✅ |
| HashiCorp Sans typography | ✅ |
| Hero: split layout, video right, glass chips | ✅ |
| Product sections (Problem, Agents, CTA, etc.) | ✅ |
| `npm run build` passes | ✅ |

**Run:** `cd landing && npm run dev`

---

## Track 2 — Security Agent (`pentest/`) ✅ INTEGRATED

| Task | Status |
|------|--------|
| Multi-agent pentest orchestrator | ✅ |
| Recon / Scanner / Exploit / Reporter agents | ✅ |
| FastAPI gate API (`pentest/main.py`) | ✅ |
| Scope guard + deterministic validation | ✅ |
| Sample vulnerable Flask app | ✅ |
| Wire gate into deploy agent | ⏳ Blocked on deploy branch |

**Run:** `uvicorn pentest.main:app --host 127.0.0.1 --port 8900`

---

## Track 3 — Engine Core ⬜ NEXT

| Task | Status |
|------|--------|
| `engine/session.py` | ⬜ |
| `engine/intake.py` | ⬜ |
| `engine/orchestrator.py` | ⬜ |
| `engine/events.py` | ⬜ |
| `backend/main.py` | ⬜ |
| Extract tools from `agent.py` → `tools/gcloud.py` | ⬜ |
| Connect pentest gate before deploy step | ⬜ |

---

## Track 4 — Agent Team

| Task | Status |
|------|--------|
| Security agent (pentest gate) | ✅ |
| Architect agent (Gemini + NB2) | ⬜ in `agent.py` |
| DevOps / deploy agent | ⏳ teammate branch |
| SRE agent (GCP project context) | ⬜ |
| Orchestrator approval gates | ⬜ |

---

## Track 5 — Surfaces

| Task | Status |
|------|--------|
| Antigravity `AGENTS.md` + skills | ⬜ |
| Dashboard UI | ⬜ |
| IDE ↔ dashboard session handoff | ⬜ |

---

## Track 6 — Demo

| Task | Status |
|------|--------|
| `demo_app/` with intentional flaws | ⬜ (use `samples/vulnerable_flask/` for pentest demo) |
| Cloud Run deploy flow | ⬜ |
| Traffic + autoscale | ⬜ |
| 3-minute dual-surface rehearsal | ⬜ |

---

## Next Up (priority order)

1. **Push** `feat/landing-integration` and share branch name with team
2. **Merge deploy agent** when teammate pushes their branch
3. **Engine API** — session model + orchestrator that chains pentest gate → deploy
4. **`demo_app/`** fixture + end-to-end scan → deploy → monitor flow
5. Antigravity `AGENTS.md` + dashboard surface
