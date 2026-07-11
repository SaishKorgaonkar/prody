# Multi-Agent GCP Deployment System

A command-line deployment assistant powered by Google's Gemini Interactions API and the Antigravity Managed Agent. It designs a Google Cloud architecture, generates an architecture diagram, waits for approval, and then deploys the application.

## How it works

The workflow has two agent phases with an automatic security gate between them:

1. **Cloud Architect**
   - Inspects the application directory.
   - Proposes a GCP architecture.
   - Generates `architecture.jpg` using Imagen.
   - Waits for the user to approve the design.

2. **Security gate (automatic)**
   - After approval and before any deployment, runs the local functional-testing + penetration-testing gate against the app directory.
   - Refuses to hand off to DevOps on a `FAIL` verdict (a broken or insecure app never ships). See [Pre-deploy security gate](#pre-deploy-security-gate).

3. **Senior DevOps**
   - Receives the approved architecture and conversation context.
   - Uses Google Cloud remote MCP servers where supported.
   - Uses non-interactive `gcloud` tools only for unsupported operations.
   - Reports deployment results and resource URLs.

## Google Cloud MCP servers

The DevOps agent uses these authenticated remote MCP servers:

- Cloud Run: `https://run.googleapis.com/mcp`
- Cloud Storage: `https://storage.googleapis.com/storage/mcp`
- Resource Manager: `https://cloudresourcemanager.googleapis.com/mcp`

Operations without a suitable Google Cloud MCP tool—such as billing, API enablement, Cloud Build, Artifact Registry, and load-balancer configuration—use constrained local `gcloud` functions.

## Requirements

- Python 3.12
- Google Cloud CLI
- `google-genai >= 2.11.0`
- A Gemini API key
- An authenticated Google Cloud account

Install dependencies:

```bash
python3.12 -m pip install -r requirements.txt
```

Authenticate:

```bash
gcloud auth login
gcloud auth application-default login
```

The identity used by MCP must have:

- `roles/mcp.toolUser`
- Permissions required by each Google Cloud service
- `roles/serviceusage.serviceUsageAdmin` when enabling APIs

Enable the required product APIs in the target project, including:

```bash
gcloud services enable \
  run.googleapis.com \
  storage.googleapis.com \
  cloudresourcemanager.googleapis.com
```

## Configuration

Set the Gemini API key:

```bash
export GEMINI_API_KEY="YOUR_API_KEY"
```

Optionally specify the project used for MCP authentication and quota:

```bash
export GOOGLE_CLOUD_MCP_PROJECT="YOUR_PROJECT_ID"
```

If this variable is omitted, the application uses an explicitly mentioned project ID from the conversation or the active `gcloud` project.

## Run

```bash
./run.sh
```

During the architecture phase, provide the absolute path to the application. Review the generated architecture and enter `APPROVE` to begin deployment.

Exit at any prompt with `exit`, `quit`, `q`, `bye`, `:q`, or `Ctrl+C`.

## Pre-deploy security gate

After you approve the architecture, the assistant automatically runs a **functional-testing + penetration-testing gate** against your application directory *before* handing off to the DevOps deployment agent — and **refuses to deploy on a `FAIL`** verdict. The gate is the FastAPI service in [`pentest/`](pentest/README.md): it verifies the app works (functional gate) and, only if it does, chains a security scan (SQLi/XSS/secrets/etc.). Deployment proceeds only on a `PASS` / `PASS_WITH_WARNINGS` combined verdict.

The deploy agent calls this gate over HTTP and **auto-starts the service on loopback** (`uvicorn pentest.main:app`) if it isn't already running — no extra step is required, just install `requirements.txt`.

Environment overrides:

```bash
export SECURITY_GATE_URL="http://127.0.0.1:8900"   # where the gate service lives (auto-started if local)
export SECURITY_GATE_TIMEOUT_S="600"                # max seconds to wait for the verdict
export SKIP_SECURITY_GATE="1"                        # bypass the gate entirely (not recommended)
```

The combined verdict is printed before deployment; on `FAIL` the run stops with the offending functional/security findings. See [`pentest/README.md`](pentest/README.md) for the gate internals and API.

## Tests

```bash
GEMINI_API_KEY=dummy python3.12 -m unittest -v test_agent.py
```

## Security

- Use least-privilege Google Cloud identities.
- Prefer short-lived access tokens.
- Review the architecture before approving deployment.
- Do not commit API keys, access tokens, service-account keys, or other credentials.
- Google Cloud MCP tools are restricted to explicit allowlists; destructive Storage tools are not exposed.
