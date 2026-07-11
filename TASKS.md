# Prody — Build Task List

> Last updated: 2026-07-11  
> Legend: ✅ Done · 🔄 In progress · ⬜ Not started

---

## Overall Progress

| Track | Status | Notes |
|-------|--------|-------|
| Marketing landing (`landing/`) | ✅ **Launch-ready** | Prody-branded hero, no hackathon copy, Why Prody + Use Cases sections |
| Engine core (`engine/`) | ⬜ | Not started — **next up** |
| Agent team (`agents/`) | ⬜ | CLI prototype has Architect + DevOps only ([agent.py](agent.py)) |
| IDE surface (Antigravity) | ⬜ | AGENTS.md + skills not created |
| Dashboard surface | ⬜ | Not started |
| Demo rehearsal | ⬜ | Not started |

---

## Design System

**Design:** Cohere-inspired — white + stone alternating sections, dark text throughout. Hero is static (no animation). Footer only dark band.

---

## Architecture Decision Log

### SRE agent runs on GCP (deployed by DevOps)

After DevOps deploys, SRE monitors in the **same GCP project** with context: `{ project_id, service_name, region, deploy_url, session_id }`.

| Phase | Agent | Where |
|-------|-------|-------|
| Pre-deploy scan | Security | Local Gemma |
| Architecture + deploy | Architect, DevOps | Cloud + gcloud |
| Post-deploy monitor/scale | SRE | GCP project context |

---

## Track 1 — Marketing Landing (`landing/`) ✅

| Task | Status |
|------|--------|
| Next.js scaffold | ✅ |
| **Cohere design tokens** (white canvas, enterprise green, navy, coral, pill CTAs) | ✅ |
| Space Grotesk display + Inter body + JetBrains Mono labels | ✅ |
| Announcement bar + centered nav | ✅ |
| Minimal hero — monumental headline on white | ✅ |
| **Hero media cards** — agent console + visible PNG crossfade animation | ✅ |
| Trust logo strip | ✅ |
| Problem, Two Surfaces, How It Works | ✅ |
| Agent Team (enterprise green dark band) | ✅ |
| Capabilities (rule-separated grid) | ✅ |
| Readiness Score (pale green + list table) | ✅ |
| Powered By (dark navy band) | ✅ |
| CTA banner + dark footer | ✅ |
| `npm run build` passes | ✅ |
| Optional: screen recording loop in media card | ⬜ |

**Run:** `cd landing && npm run dev`

---

## Track 2 — Engine Core ⬜ NEXT

| Task | Status |
|------|--------|
| `engine/session.py` | ⬜ |
| `engine/intake.py` | ⬜ |
| `engine/orchestrator.py` | ⬜ |
| `engine/events.py` | ⬜ |
| `backend/main.py` | ⬜ |
| Extract tools from `agent.py` → `tools/gcloud.py` | ⬜ |

---

## Track 3 — Agent Team

| Task | Status |
|------|--------|
| Security agent (Gemma 4 local) | ⬜ |
| Architect agent (Gemini + NB2) | ⬜ |
| DevOps agent (gcloud + SRE handoff) | ⬜ |
| SRE agent (GCP project context) | ⬜ |
| Orchestrator approval gates | ⬜ |

---

## Track 4 — Surfaces

| Task | Status |
|------|--------|
| Antigravity `AGENTS.md` + skills | ⬜ |
| Dashboard UI | ⬜ |
| IDE ↔ dashboard session handoff | ⬜ |

---

## Track 5 — Demo

| Task | Status |
|------|--------|
| `demo_app/` with intentional flaws | ⬜ |
| Cloud Run deploy flow | ⬜ |
| Traffic + autoscale | ⬜ |
| 3-minute dual-surface rehearsal | ⬜ |

---

## Next Up

1. Verify landing build after Cohere redesign
2. Engine API + session model
3. `demo_app/` fixture
