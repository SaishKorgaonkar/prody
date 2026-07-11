# Prody Notes — demo target app

A tiny, **production-ready** Flask service Prody deploys end-to-end. It follows
secure defaults (no hardcoded secrets, parameterised SQL, escaped output) so it
**passes the security gate** and deploys to Cloud Run — showing the full
pipeline: intake → security → architecture → deploy → SRE.

> Contrast with [`samples/vulnerable_flask`](../samples/vulnerable_flask), which
> is intentionally insecure so the gate returns **FAIL** and Prody refuses to
> deploy it.

## Run locally

```bash
pip install -r requirements.txt
python main.py           # http://127.0.0.1:8080
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Info page |
| GET | `/healthz` | Liveness check (used by the SRE agent) |
| GET | `/notes` | List notes |
| POST | `/notes` | Add a note `{"body": "..."}` |
| GET | `/search?q=` | Search notes (escaped, injection-safe) |

## Deploy via Prody

Point the engine at this folder:

```bash
curl -s -X POST localhost:8000/api/session/start \
  -H 'content-type: application/json' \
  -d '{"source":"dashboard","project_path":"<abs path>/demo_app"}'
```
