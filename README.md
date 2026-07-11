# Multi-Agent GCP Deployment System

A command-line deployment assistant powered by Google's Gemini Interactions API and the Antigravity Managed Agent. It designs a Google Cloud architecture, generates an architecture diagram, waits for approval, and then deploys the application.

## How it works

The workflow has two phases:

1. **Cloud Architect**
   - Inspects the application directory.
   - Proposes a GCP architecture.
   - Generates `architecture.jpg` using Imagen.
   - Waits for the user to approve the design.

2. **Senior DevOps**
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
- `google-genai >= 2.3.0`
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
  cloudresourcemanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
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

Start the web upload experience:

```bash
python3.12 web_app.py
```

Then open `http://localhost:8080`. Drop a `.zip`, `.tar.gz`, or `.tgz`
application archive into the uploader to inspect its stack, then select
**Continue to architecture**. The website starts `./run.sh`, submits the
temporary application directory at the first prompt, and streams the complete
Architect and DevOps conversation into the in-page console. Enter `APPROVE`,
project IDs, and other requested responses directly in that console. The
workflow can also be stopped or run again from the page.

The web controller is intended to run locally. Its managed-agent process
inherits `GEMINI_API_KEY`, `GOOGLE_CLOUD_MCP_PROJECT`, Google Cloud CLI
authentication, and the rest of the web server environment. Authenticate and
export required variables before starting `web_app.py`. Uploaded source is
extracted into an isolated temporary directory, is never executed by the web
controller, and is removed when the controller exits.
For safety, the controller binds to `127.0.0.1` by default because the page can
operate your authenticated deployment agent. Set `WEB_HOST` only when you have
placed the service behind appropriate authentication and network controls.

Start the interactive managed-agent workflow:

```bash
./run.sh
```

During the architecture phase, provide the absolute path to the application.
Review the generated architecture and enter `APPROVE` to begin deployment.
After Cloud Run reports Ready, the DevOps agent records the deployment URL and
the workflow ends.

Exit at any prompt with `exit`, `quit`, `q`, `bye`, `:q`, or `Ctrl+C`.

## Tests

```bash
GEMINI_API_KEY=dummy python3.12 -m unittest -v test_agent.py
python3.12 -m unittest -v test_web_app.py test_deployment_session.py
```

## Security

- Use least-privilege Google Cloud identities.
- Prefer short-lived access tokens.
- Review the architecture before approving deployment.
- Do not commit API keys, access tokens, service-account keys, or other credentials.
- Google Cloud MCP tools are restricted to explicit allowlists; destructive Storage tools are not exposed.
