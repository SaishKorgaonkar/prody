# Prody Dashboard

Web surface for starting sessions and watching agent activity.

## Run

```bash
cd dashboard
npm install
npm run dev
```

Open http://localhost:3001

## Backend

Set `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:8000`) when Claude's engine is running:

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

If the backend is down, the UI falls back to **mock SSE** so you can demo the flow.

## Routes

| Path | Purpose |
|------|---------|
| `/` | GitHub URL + local path intake |
| `/session/[id]` | Live event stream + readiness panel |
