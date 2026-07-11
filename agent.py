import os
import sys
import subprocess
import shutil
import re
import base64
import io
import inspect
import json
import logging
import shlex
import tarfile
import tempfile
import time
import zipfile
from logging.handlers import RotatingFileHandler
from pathlib import Path
from importlib.metadata import PackageNotFoundError, version

from google import genai
from google.genai import types

MIN_GENAI_VERSION = (2, 3, 0)
MANAGED_AGENT = "antigravity-preview-05-2026"


def _version_tuple(value: str) -> tuple[int, ...]:
    return tuple(int(part) for part in value.split(".")[:3])


try:
    GENAI_VERSION = version("google-genai")
except PackageNotFoundError:
    GENAI_VERSION = "0.0.0"

if _version_tuple(GENAI_VERSION) < MIN_GENAI_VERSION:
    print(
        "Error: Google Managed Agents require google-genai >= 2.3.0 "
        f"(installed: {GENAI_VERSION}). Run: python3.12 -m pip install -U google-genai"
    )
    raise SystemExit(1)

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set.")
    raise SystemExit(1)
CLIENT = genai.Client(api_key=API_KEY)

# Resolve gcloud binary path - check common install locations
GCLOUD_PATHS = [
    "/Users/pavang/google-cloud-sdk/bin",
    "/usr/local/google-cloud-sdk/bin",
    "/opt/homebrew/share/google-cloud-sdk/bin",
    "/usr/local/bin",
    "/usr/bin",
]
os.environ["PATH"] = ":".join(GCLOUD_PATHS) + ":" + os.environ.get("PATH", "")

# gcloud requires Python 3.10+ - auto-detect and set CLOUDSDK_PYTHON
PYTHON_CANDIDATES = [
    "/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12",
    "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3.11",
    "/Library/Frameworks/Python.framework/Versions/3.10/bin/python3.10",
    "/usr/local/bin/python3.12",
    "/usr/local/bin/python3.11",
    "/usr/local/bin/python3.10",
]
for py in PYTHON_CANDIDATES:
    if os.path.exists(py):
        os.environ["CLOUDSDK_PYTHON"] = py
        print(f"[System] CLOUDSDK_PYTHON set to: {py}")
        break
else:
    print("[Warning] Python 3.10+ not found. gcloud may fail to run.")
    print("  Install Python 3.12 from https://www.python.org/downloads/")

GCLOUD_BIN = shutil.which("gcloud")
if GCLOUD_BIN:
    print(f"[System] gcloud found at: {GCLOUD_BIN}")
else:
    print("[Warning] gcloud not found in PATH. Cloud deployment tools will fail.")
    print("  Please install the Google Cloud SDK: https://cloud.google.com/sdk/docs/install")

# Commands that exit the agent at any prompt
EXIT_COMMANDS = {"exit", "quit", "q", "bye", ":q"}
SANDBOX_APPLICATION_DIR = "/workspace/application"
INLINE_SOURCE_FILE_LIMIT = 900_000
INLINE_SOURCE_TOTAL_LIMIT = 2_000_000
INTERACTION_POLL_SECONDS = 5
INTERACTION_POLL_TIMEOUT_SECONDS = 180
INTERACTION_POLL_MAX_RETRIES = 3
LOG_PATH = Path(
    os.environ.get(
        "DEPLOYMENT_AGENT_LOG",
        Path(__file__).resolve().with_name("managed_agent.log"),
    )
)

LOGGER = logging.getLogger("managed_deployment_agent")
LOGGER.setLevel(logging.DEBUG)
LOGGER.propagate = False
if not LOGGER.handlers:
    log_handler = RotatingFileHandler(
        LOG_PATH,
        maxBytes=5_000_000,
        backupCount=3,
        encoding="utf-8",
    )
    log_handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    )
    LOGGER.addHandler(log_handler)

_LOGGED_INTERACTION_STEPS = set()
ACTIVE_APPLICATION_DIRECTORY = None

def print_banner():
    print("=========================================")
    print(" Multi-Agent GCP Deployment System      ")
    print(" Powered by: Managed Agents iAPI        ")
    print("=========================================")
    print("[1] Cloud Architect Agent (Planning Phase)")
    print("[2] Senior DevOps Agent  (Execution Phase)")
    print("==========================================")
    print(" Commands: exit | quit | q | bye | Ctrl+C")
    print(f" Detailed log: {LOG_PATH}")
    print("=========================================\n")

def get_input(prompt: str) -> str:
    """Read user input and raise SystemExit on exit commands or Ctrl+C/D."""
    try:
        user_input = input(prompt).strip()
    except (KeyboardInterrupt, EOFError):
        print("\n\n[Agent] Goodbye! Exiting the deployment system.")
        raise SystemExit(0)
    if user_input.lower() in EXIT_COMMANDS:
        print("\n[Agent] Goodbye! Exiting the deployment system.")
        raise SystemExit(0)
    return user_input

def run_command(command: str) -> str:
    if command.lstrip().startswith("gcloud ") and "--quiet" not in command:
        command = f"{command} --quiet"
    print(f"\n[Tool Execution] {command}")
    LOGGER.info("command_start command=%s", _redact_text(command))
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        LOGGER.info(
            "command_complete returncode=%s stdout=%s stderr=%s",
            result.returncode,
            _redact_text(result.stdout),
            _redact_text(result.stderr),
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        LOGGER.error(
            "command_failed returncode=%s stdout=%s stderr=%s",
            e.returncode,
            _redact_text(e.stdout or ""),
            _redact_text(e.stderr or ""),
        )
        return f"Error executing command: {e.stderr}"


def _gcloud_output(*args: str) -> str:
    """Runs a non-interactive gcloud query without exposing credentials."""
    if not GCLOUD_BIN:
        raise RuntimeError("gcloud is required to authenticate Google Cloud MCP servers.")
    LOGGER.info("gcloud_query_start args=%s", list(args))
    result = subprocess.run(
        [GCLOUD_BIN, *args, "--quiet"],
        check=True,
        capture_output=True,
        text=True,
        stdin=subprocess.DEVNULL,
        timeout=30,
    )
    LOGGER.info(
        "gcloud_query_complete args=%s returncode=%s",
        list(args),
        result.returncode,
    )
    return result.stdout.strip()


def build_google_cloud_mcp_tools(quota_project: str | None = None) -> list[dict]:
    """Builds authenticated, least-privilege Google Cloud remote MCP tools."""
    quota_project = quota_project or os.environ.get("GOOGLE_CLOUD_MCP_PROJECT")
    if not quota_project:
        quota_project = _gcloud_output("config", "get-value", "project")
    if not quota_project or quota_project == "(unset)":
        raise RuntimeError(
            "Set GOOGLE_CLOUD_MCP_PROJECT or select a project with "
            "'gcloud config set project PROJECT_ID'."
        )

    try:
        access_token = _gcloud_output("auth", "application-default", "print-access-token")
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        access_token = _gcloud_output("auth", "print-access-token")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "x-goog-user-project": quota_project,
    }
    return [
        {
            "type": "mcp_server",
            "name": "google_cloud_run",
            "url": "https://run.googleapis.com/mcp",
            "headers": headers,
            "allowed_tools": [
                {
                    "tools": [
                        "get_service",
                        "list_services",
                        "deploy_service_from_image",
                        "deploy_service_from_archive",
                        "deploy_service_from_file_contents",
                    ]
                }
            ],
        },
        {
            "type": "mcp_server",
            "name": "google_cloud_storage",
            "url": "https://storage.googleapis.com/storage/mcp",
            "headers": headers,
            "allowed_tools": [
                {
                    "tools": [
                        "list_buckets",
                        "list_objects",
                        "create_bucket",
                        "read_text",
                        "read_object",
                        "write_text",
                        "get_object_metadata",
                    ]
                }
            ],
        },
        {
            "type": "mcp_server",
            "name": "google_cloud_resource_manager",
            "url": "https://cloudresourcemanager.googleapis.com/mcp",
            "headers": headers,
            "allowed_tools": [{"tools": ["search_projects"]}],
        },
    ]


def extract_project_id(text: str) -> str | None:
    """Extracts an explicitly labeled GCP project ID from conversation text."""
    matches = re.findall(
        r"(?i)\bproject[\s_-]+id\s*(?:is|=|:)?\s*[`'\"]?([a-z][a-z0-9-]{4,28}[a-z0-9])",
        text,
    )
    return matches[-1] if matches else None


def extract_local_directory(text: str) -> str | None:
    """Finds the longest existing absolute directory path in user input."""
    matches = []
    for start, char in enumerate(text):
        if char != "/":
            continue
        for end in range(start + 1, len(text) + 1):
            candidate = text[start:end].strip().strip("`'\"")
            if os.path.isdir(os.path.expanduser(candidate)):
                matches.append(os.path.abspath(os.path.expanduser(candidate)))
    return max(matches, key=len) if matches else None


def build_application_environment(directory: str) -> dict:
    """Packages a local directory into inline sources for a remote sandbox."""
    root = Path(directory).expanduser().resolve()
    if not root.is_dir():
        raise ValueError(f"Application directory does not exist: {directory}")

    archive_buffer = io.BytesIO()
    with zipfile.ZipFile(
        archive_buffer, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
    ) as archive:
        for path in sorted(root.rglob("*")):
            if path.is_symlink():
                raise ValueError(
                    f"Application directory contains a symbolic link, which cannot be "
                    f"safely copied: {path.relative_to(root)}"
                )
            relative = path.relative_to(root)
            if path.is_dir():
                archive.writestr(f"{relative.as_posix().rstrip('/')}/", b"")
            elif path.is_file():
                archive.write(path, relative.as_posix())

    encoded = base64.b64encode(archive_buffer.getvalue()).decode("ascii")
    chunks = [
        encoded[offset : offset + INLINE_SOURCE_FILE_LIMIT]
        for offset in range(0, len(encoded), INLINE_SOURCE_FILE_LIMIT)
    ] or [""]
    restore_script = f"""\
import base64
import io
from pathlib import Path
import zipfile

transfer = Path("/workspace/.app-transfer")
payload = "".join(path.read_text() for path in sorted(transfer.glob("archive.b64.*")))
target = Path("{SANDBOX_APPLICATION_DIR}")
target.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(io.BytesIO(base64.b64decode(payload))) as archive:
    archive.extractall(target)
print(f"Application restored to {{target}}")
"""
    total_size = len(encoded.encode("utf-8")) + len(restore_script.encode("utf-8"))
    if total_size > INLINE_SOURCE_TOTAL_LIMIT:
        raise ValueError(
            "Application is too large for direct sandbox transfer "
            f"({total_size:,} bytes encoded; limit {INLINE_SOURCE_TOTAL_LIMIT:,}). "
            "Use a Git repository or a GCS source for this application."
        )

    sources = [
        {
            "type": "inline",
            "content": chunk,
            "target": f"/workspace/.app-transfer/archive.b64.{index:03d}",
        }
        for index, chunk in enumerate(chunks)
    ]
    sources.append(
        {
            "type": "inline",
            "content": restore_script,
            "target": "/workspace/.app-transfer/restore.py",
        }
    )
    LOGGER.info(
        "application_packaged directory=%s archive_bytes=%d encoded_bytes=%d "
        "source_count=%d",
        root,
        len(archive_buffer.getvalue()),
        len(encoded),
        len(sources),
    )
    return {"type": "remote", "sources": sources}


def application_transfer_prompt(user_input: str) -> str:
    """Adds deterministic restoration instructions to a path-bearing turn."""
    return (
        "The local application directory supplied by the user has been copied into "
        "this new sandbox as an encoded archive. Before doing anything else, run "
        "`python /workspace/.app-transfer/restore.py`. Detect the sandbox operating system "
        "and available command-line tools, then construct and run whatever read-only shell "
        "commands you need to explore the complete application at "
        f"`{SANDBOX_APPLICATION_DIR}`. You are not restricted to a predefined list of "
        "listing, searching, or file-reading commands. Continue the requested work without "
        "asking the user to provide its files again.\n\n"
        f"User message: {user_input}"
    )


def _redact_text(value: str) -> str:
    """Redacts common credential forms before writing diagnostics."""
    value = re.sub(
        r"(?i)(authorization\s*[:=]\s*bearer\s+)[^\s,'\"]+",
        r"\1<redacted>",
        value,
    )
    value = re.sub(
        r"(?i)\b(api[_-]?key|access[_-]?token|secret)\s*[:=]\s*[^\s,'\"]+",
        r"\1=<redacted>",
        value,
    )
    return value


def _sanitize_log_value(value):
    """Converts SDK models to JSON-safe data and removes sensitive fields."""
    if hasattr(value, "model_dump"):
        value = value.model_dump(mode="json", exclude_none=True)
    if isinstance(value, dict):
        sanitized = {}
        for key, item in value.items():
            if key.lower() in {
                "authorization",
                "headers",
                "api_key",
                "access_token",
                "token",
                "secret",
            }:
                sanitized[key] = "<redacted>"
            else:
                sanitized[key] = _sanitize_log_value(item)
        return sanitized
    if isinstance(value, (list, tuple)):
        return [_sanitize_log_value(item) for item in value]
    if isinstance(value, str):
        return _redact_text(value)
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return repr(value)


def log_interaction_snapshot(interaction) -> None:
    """Writes status and newly observed managed-agent steps to the log."""
    interaction_id = getattr(interaction, "id", "<unknown>")
    status = getattr(interaction, "status", "<unknown>")
    steps = getattr(interaction, "steps", None) or []
    LOGGER.info(
        "interaction_snapshot id=%s status=%s environment_id=%s step_count=%d",
        interaction_id,
        status,
        getattr(interaction, "environment_id", None),
        len(steps),
    )
    for index, step in enumerate(steps):
        step_id = getattr(step, "id", None) or f"index-{index}"
        identity = (interaction_id, step_id)
        if identity in _LOGGED_INTERACTION_STEPS:
            continue
        _LOGGED_INTERACTION_STEPS.add(identity)
        step_type = getattr(step, "type", type(step).__name__)
        step_name = getattr(step, "name", None)
        LOGGER.debug(
            "interaction_step id=%s step_id=%s payload=%s",
            interaction_id,
            step_id,
            json.dumps(_sanitize_log_value(step), ensure_ascii=False, default=str),
        )
        print(
            f"[Managed Agent] New step: {step_type}"
            + (f" ({step_name})" if step_name else ""),
            flush=True,
        )


def deduplicate_tools(tools: list[dict]) -> list[dict]:
    """Removes duplicate tool registrations while preserving their order."""
    unique_tools = []
    seen = set()
    for tool in tools:
        tool_type = tool.get("type")
        identity = (tool_type, tool.get("name")) if tool.get("name") else (tool_type,)
        if identity in seen:
            continue
        seen.add(identity)
        unique_tools.append(tool)
    return unique_tools


def invoke_handler(handler, arguments: dict):
    """Calls a client tool after dropping agent presentation metadata."""
    signature = inspect.signature(handler)
    accepts_kwargs = any(
        parameter.kind == inspect.Parameter.VAR_KEYWORD
        for parameter in signature.parameters.values()
    )
    if accepts_kwargs:
        return handler(**arguments)
    accepted = {
        name
        for name, parameter in signature.parameters.items()
        if parameter.kind
        in {
            inspect.Parameter.POSITIONAL_OR_KEYWORD,
            inspect.Parameter.KEYWORD_ONLY,
        }
    }
    filtered = {key: value for key, value in arguments.items() if key in accepted}
    ignored = sorted(set(arguments) - set(filtered))
    if ignored:
        LOGGER.info(
            "function_call_metadata_ignored handler=%s keys=%s",
            getattr(handler, "__name__", repr(handler)),
            ignored,
        )
    return handler(**filtered)


def wait_for_interaction(interaction):
    """Polls a background interaction and emits visible progress."""
    log_interaction_snapshot(interaction)
    if interaction.status not in {"queued", "in_progress"}:
        return interaction

    started = time.monotonic()
    consecutive_errors = 0
    print(f"[Managed Agent] Interaction {interaction.id} is running...", flush=True)
    while interaction.status in {"queued", "in_progress"}:
        time.sleep(INTERACTION_POLL_SECONDS)
        try:
            interaction = CLIENT.interactions.get(
                id=interaction.id,
                timeout=INTERACTION_POLL_TIMEOUT_SECONDS,
            )
            consecutive_errors = 0
        except Exception as exc:
            consecutive_errors += 1
            LOGGER.warning(
                "interaction_poll_failed id=%s attempt=%d/%d error=%s",
                getattr(interaction, "id", "<unknown>"),
                consecutive_errors,
                INTERACTION_POLL_MAX_RETRIES,
                _redact_text(str(exc)),
                exc_info=True,
            )
            if consecutive_errors >= INTERACTION_POLL_MAX_RETRIES:
                raise
            delay = INTERACTION_POLL_SECONDS * consecutive_errors
            print(
                f"[Managed Agent] Poll failed ({type(exc).__name__}); retrying "
                f"in {delay}s ({consecutive_errors}/{INTERACTION_POLL_MAX_RETRIES})...",
                flush=True,
            )
            time.sleep(delay)
            continue
        log_interaction_snapshot(interaction)
        elapsed = int(time.monotonic() - started)
        print(
            f"[Managed Agent] Status: {interaction.status} ({elapsed}s elapsed)",
            flush=True,
        )
    return interaction


def inspect_application(directory: str) -> str:
    """Scans the application files to determine the tech stack.

    Args:
        directory: The directory path of the application.
    """
    return run_command(f"ls -la {directory}")

def generate_architecture_image(prompt: str) -> str:
    """Generates a professional cloud architecture diagram and saves it.

    Args:
        prompt: A technical description of the GCP services and their connections.
    """
    # Enforce a strict professional diagram style by making the full prompt very explicit.
    # negative_prompt and aspect_ratio are NOT supported by the Gemini API - avoid using them.
    full_prompt = (
        "Professional Google Cloud Platform (GCP) architecture diagram. "
        "Technical whitepaper style. Clean white background. "
        "Flat 2D diagram with no 3D effects. "
        "Official GCP service icons in blue and grey. "
        "Each service is inside a clearly labeled rounded rectangle box. "
        "Services are connected by directional arrows with short text labels. "
        "Layout flows cleanly from left to right. "
        "No people. No hands. No photographs. No illustrations. No decorative art. No dark backgrounds. "
        "This diagram specifically shows: "
        + prompt
    )

    # Try models in order of preference
    image_models = ['imagen-4.0-generate-001', 'imagen-4.0-fast-generate-001']

    for model_name in image_models:
        print(f"\n[Architect Tool] Attempting image generation with '{model_name}'...")
        try:
            result = CLIENT.models.generate_images(
                model=model_name,
                prompt=full_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                )
            )
            if result.generated_images:
                image = result.generated_images[0]
                with open("architecture.jpg", "wb") as f:
                    f.write(image.image.image_bytes)
                return f"Successfully generated and saved architecture diagram to architecture.jpg (used model: {model_name})"
        except Exception as e:
            print(f"[Architect Tool] Model '{model_name}' failed: {e}")
            continue

    return "All image generation models failed. Proceeding with text-only architecture plan."

def create_gcp_project(project_id: str, billing_account_id: str) -> str:
    """Creates a GCP project and links it to a billing account."""
    out1 = run_command(f"gcloud projects create {project_id}")
    out2 = run_command(f"gcloud billing projects link {project_id} --billing-account {billing_account_id}")
    return f"{out1}\n{out2}"

def enable_apis(project_id: str, services: list[str]) -> str:
    """Enables required GCP APIs for a project."""
    services_str = " ".join(services)
    return run_command(f"gcloud services enable {services_str} --project {project_id}")


def upload_application_archive(project_id: str, destination: str) -> str:
    """Archives the original local application and uploads it to GCS."""
    if not GCLOUD_BIN:
        raise RuntimeError("gcloud is required to upload the application archive.")
    if not ACTIVE_APPLICATION_DIRECTORY:
        raise RuntimeError("No local application directory has been registered.")
    if not destination.startswith("gs://"):
        raise ValueError("Archive destination must be a gs:// URI.")

    root = Path(ACTIVE_APPLICATION_DIRECTORY).expanduser().resolve()
    if not root.is_dir():
        raise RuntimeError(f"Application directory no longer exists: {root}")

    with tempfile.TemporaryDirectory(prefix="deployment-agent-") as temp_directory:
        staging_directory = Path(temp_directory) / "application"
        shutil.copytree(root, staging_directory)
        requirements = staging_directory / "requirements.txt"
        dependencies_vendored = False
        if requirements.is_file():
            print("[Tool Execution] Installing Python dependencies into archive...")
            LOGGER.info(
                "application_dependency_install_start requirements=%s",
                requirements,
            )
            dependency_result = subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "pip",
                    "install",
                    "--requirement",
                    str(requirements),
                    "--target",
                    str(staging_directory / "vendor"),
                    "--platform",
                    "manylinux2014_x86_64",
                    "--implementation",
                    "cp",
                    "--python-version",
                    f"{sys.version_info.major}.{sys.version_info.minor}",
                    "--abi",
                    f"cp{sys.version_info.major}{sys.version_info.minor}",
                    "--only-binary=:all:",
                    "--disable-pip-version-check",
                    "--no-input",
                ],
                check=True,
                capture_output=True,
                text=True,
                stdin=subprocess.DEVNULL,
                timeout=300,
            )
            dependencies_vendored = True
            LOGGER.info(
                "application_dependency_install_complete stdout=%s stderr=%s",
                _redact_text(dependency_result.stdout),
                _redact_text(dependency_result.stderr),
            )

        archive_path = Path(temp_directory) / "application.tar.gz"
        with tarfile.open(archive_path, "w:gz") as archive:
            for path in sorted(staging_directory.iterdir()):
                archive.add(path, arcname=path.name, recursive=True)

        command = [
            GCLOUD_BIN,
            "storage",
            "cp",
            str(archive_path),
            destination,
            "--project",
            project_id,
            "--quiet",
        ]
        print(
            f"\n[Tool Execution] Uploading local application archive to {destination}"
        )
        LOGGER.info(
            "application_archive_upload_start source=%s destination=%s project=%s "
            "archive_bytes=%d",
            root,
            destination,
            project_id,
            archive_path.stat().st_size,
        )
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            stdin=subprocess.DEVNULL,
            timeout=300,
        )
        LOGGER.info(
            "application_archive_upload_complete destination=%s stdout=%s stderr=%s",
            destination,
            _redact_text(result.stdout),
            _redact_text(result.stderr),
        )
        dependency_note = (
            " Python dependencies were installed under vendor; set PYTHONPATH=vendor."
            if dependencies_vendored
            else ""
        )
        message = result.stdout.strip() or (
            f"Uploaded application archive to {destination}."
        )
        return f"{message}{dependency_note}"


def read_cloud_run_logs(
    project_id: str,
    region: str,
    service_name: str,
    limit: int = 100,
) -> str:
    """Reads recent Cloud Run service logs using the authenticated local CLI."""
    if not GCLOUD_BIN:
        raise RuntimeError("gcloud is required to read Cloud Run logs.")
    result = subprocess.run(
        [
            GCLOUD_BIN,
            "run",
            "services",
            "logs",
            "read",
            service_name,
            f"--region={region}",
            f"--project={project_id}",
            f"--limit={min(max(limit, 1), 500)}",
            "--quiet",
        ],
        check=True,
        capture_output=True,
        text=True,
        stdin=subprocess.DEVNULL,
        timeout=120,
    )
    LOGGER.info(
        "cloud_run_logs_read project=%s region=%s service=%s output=%s",
        project_id,
        region,
        service_name,
        _redact_text(result.stdout),
    )
    return result.stdout or "No Cloud Run log entries were returned."


def build_application_image(
    project_id: str,
    region: str,
    repository: str,
    image_name: str,
    dockerfile: str,
    file_overrides: list[dict] | None = None,
) -> str:
    """Builds a custom image from a temporary, optionally corrected app copy."""
    if not GCLOUD_BIN:
        raise RuntimeError("gcloud is required to build an application image.")
    if not ACTIVE_APPLICATION_DIRECTORY:
        raise RuntimeError("No local application directory has been registered.")
    for label, value in {
        "project_id": project_id,
        "region": region,
        "repository": repository,
        "image_name": image_name,
    }.items():
        if not re.fullmatch(r"[a-z0-9][a-z0-9._-]*", value):
            raise ValueError(f"Invalid {label}: {value}")

    root = Path(ACTIVE_APPLICATION_DIRECTORY).expanduser().resolve()
    with tempfile.TemporaryDirectory(prefix="deployment-image-") as temp_directory:
        staging_directory = Path(temp_directory) / "application"
        shutil.copytree(root, staging_directory)
        (staging_directory / "Dockerfile").write_text(dockerfile, encoding="utf-8")

        for override in file_overrides or []:
            relative = Path(override["filename"])
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError(f"Unsafe override path: {relative}")
            target = staging_directory / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(override["content"], encoding="utf-8")

        describe = subprocess.run(
            [
                GCLOUD_BIN,
                "artifacts",
                "repositories",
                "describe",
                repository,
                f"--location={region}",
                f"--project={project_id}",
                "--quiet",
            ],
            capture_output=True,
            text=True,
            stdin=subprocess.DEVNULL,
            timeout=120,
        )
        if describe.returncode != 0:
            subprocess.run(
                [
                    GCLOUD_BIN,
                    "artifacts",
                    "repositories",
                    "create",
                    repository,
                    "--repository-format=docker",
                    f"--location={region}",
                    f"--project={project_id}",
                    "--quiet",
                ],
                check=True,
                capture_output=True,
                text=True,
                stdin=subprocess.DEVNULL,
                timeout=300,
            )

        image_uri = (
            f"{region}-docker.pkg.dev/{project_id}/{repository}/{image_name}:latest"
        )
        print(f"\n[Tool Execution] Building remediation image {image_uri}")
        LOGGER.info(
            "application_image_build_start source=%s image=%s override_count=%d",
            root,
            image_uri,
            len(file_overrides or []),
        )
        result = subprocess.run(
            [
                GCLOUD_BIN,
                "builds",
                "submit",
                str(staging_directory),
                f"--tag={image_uri}",
                f"--project={project_id}",
                "--quiet",
            ],
            check=True,
            capture_output=True,
            text=True,
            stdin=subprocess.DEVNULL,
            timeout=1200,
        )
        LOGGER.info(
            "application_image_build_complete image=%s stdout=%s stderr=%s",
            image_uri,
            _redact_text(result.stdout),
            _redact_text(result.stderr),
        )
        return (
            f"Built container image: {image_uri}. Deploy it with "
            "google_cloud_run:deploy_service_from_image."
        )


def _sandbox_archive_upload(command: str, project_id: str) -> str | None:
    """Translates a sandbox archive upload into a local source upload."""
    try:
        tokens = shlex.split(command)
    except ValueError:
        return None
    try:
        gcloud_index = tokens.index("gcloud")
    except ValueError:
        return None
    gcloud_args = tokens[gcloud_index + 1 :]
    if len(gcloud_args) < 4 or gcloud_args[:2] != ["storage", "cp"]:
        return None
    source, destination = gcloud_args[2:4]
    if source != "/workspace/application.tar.gz" or not destination.startswith("gs://"):
        return None
    LOGGER.info(
        "translated_sandbox_archive_upload command=%s destination=%s",
        _redact_text(command),
        destination,
    )
    return upload_application_archive(project_id, destination)


def deploy_infrastructure(project_id: str, gcloud_commands: list[str]) -> str:
    """Executes the deployment commands for the application.
    
    Args:
        project_id: The GCP project ID.
        gcloud_commands: A list of gcloud commands to execute.
    """
    output = ""
    for cmd in gcloud_commands:
        translated_upload = _sandbox_archive_upload(cmd, project_id)
        if translated_upload is not None:
            output += translated_upload + "\n"
            continue
        normalized = " ".join(cmd.strip().lower().split())
        if "/workspace/" in cmd:
            output += (
                "Rejected: /workspace paths exist only in the remote managed-agent "
                "sandbox and cannot be read by local gcloud. Use "
                "upload_application_archive for application source uploads.\n"
            )
            continue
        if normalized.startswith("gcloud run "):
            output += (
                "Rejected: Cloud Run operations must use the google_cloud_run MCP server.\n"
            )
            continue
        if normalized.startswith("gcloud storage buckets create"):
            output += (
                "Rejected: bucket creation must use the google_cloud_storage MCP server.\n"
            )
            continue
        if "--project" not in cmd and project_id:
            cmd = f"{cmd} --project {project_id}"
        output += run_command(cmd) + "\n"
    return output


AGENT_BUILTIN_TOOLS = [
    {"type": "code_execution"},
    {"type": "google_search"},
    {"type": "url_context"},
]

ARCHITECT_TOOLS = [
    *AGENT_BUILTIN_TOOLS,
    {
        "type": "function",
        "name": "generate_architecture_image",
        "description": "Generates and saves a GCP architecture diagram from a technical description.",
        "parameters": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "GCP services and their connections"}
            },
            "required": ["prompt"],
        },
    },
]

DEVOPS_TOOLS = [
    *AGENT_BUILTIN_TOOLS,
    {
        "type": "function",
        "name": "create_gcp_project",
        "description": "Creates a GCP project and links its billing account.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "billing_account_id": {"type": "string"},
            },
            "required": ["project_id", "billing_account_id"],
        },
    },
    {
        "type": "function",
        "name": "enable_apis",
        "description": "Enables the required Google Cloud APIs in a project.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "services": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["project_id", "services"],
        },
    },
    {
        "type": "function",
        "name": "upload_application_archive",
        "description": (
            "Creates a tar.gz from the original local application and uploads it to "
            "a GCS URI. Use this instead of gcloud storage cp for /workspace files."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "destination": {
                    "type": "string",
                    "description": "Full gs:// URI for application.tar.gz",
                },
            },
            "required": ["project_id", "destination"],
        },
    },
    {
        "type": "function",
        "name": "read_cloud_run_logs",
        "description": (
            "Reads recent startup and runtime logs for a Cloud Run service. Use this "
            "when a revision fails readiness or health checks."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "region": {"type": "string"},
                "service_name": {"type": "string"},
                "limit": {"type": "integer"},
            },
            "required": ["project_id", "region", "service_name"],
        },
    },
    {
        "type": "function",
        "name": "build_application_image",
        "description": (
            "Builds a custom container image from a temporary copy of the original "
            "application. Supply a Dockerfile and optional corrected file contents. "
            "Use this to remediate missing native libraries, startup commands, ports, "
            "or other failures that source-archive runtimes cannot support."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "region": {"type": "string"},
                "repository": {"type": "string"},
                "image_name": {"type": "string"},
                "dockerfile": {"type": "string"},
                "file_overrides": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "filename": {"type": "string"},
                            "content": {"type": "string"},
                        },
                        "required": ["filename", "content"],
                    },
                },
            },
            "required": [
                "project_id",
                "region",
                "repository",
                "image_name",
                "dockerfile",
            ],
        },
    },
    {
        "type": "function",
        "name": "deploy_infrastructure",
        "description": "Executes approved gcloud deployment commands and returns their output.",
        "parameters": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "gcloud_commands": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["project_id", "gcloud_commands"],
        },
    },
]


def run_managed_agent(
    prompt,
    instructions: str,
    tools: list[dict],
    handlers: dict,
    previous_interaction_id: str | None = None,
    environment: str | dict | None = None,
):
    """Runs Antigravity through iAPI and executes requested client-side tools."""
    tools = deduplicate_tools(tools)
    LOGGER.info(
        "interaction_create previous_interaction_id=%s environment=%s tools=%s",
        previous_interaction_id,
        (
            environment
            if isinstance(environment, str) or environment is None
            else {
                "type": environment.get("type"),
                "source_count": len(environment.get("sources", [])),
            }
        ),
        [
            {"type": tool.get("type"), "name": tool.get("name")}
            for tool in tools
        ],
    )
    try:
        interaction = CLIENT.interactions.create(
            agent=MANAGED_AGENT,
            input=prompt,
            environment=environment or "remote",
            tools=tools,
            system_instruction=instructions,
            previous_interaction_id=previous_interaction_id,
            background=True,
            store=True,
            timeout=60,
        )
    except Exception:
        LOGGER.exception("interaction_create_failed")
        raise
    interaction = wait_for_interaction(interaction)

    while interaction.status == "requires_action":
        completed_call_ids = {
            step.call_id
            for step in interaction.steps
            if step.type == "function_result"
        }
        pending_calls = []
        seen_call_ids = set()
        for step in interaction.steps:
            if (
                step.type == "function_call"
                and step.id not in completed_call_ids
                and step.id not in seen_call_ids
                and step.name in handlers
            ):
                seen_call_ids.add(step.id)
                pending_calls.append(step)
        if not pending_calls:
            requested_calls = [
                f"{getattr(step, 'name', '<unnamed>')} ({getattr(step, 'type', '<unknown>')})"
                for step in interaction.steps
                if getattr(step, "type", None) == "function_call"
                and getattr(step, "id", None) not in completed_call_ids
            ]
            requested = ", ".join(requested_calls) or "none"
            supported = ", ".join(sorted(handlers)) or "none"
            raise RuntimeError(
                "Managed agent requires an unsupported client action. "
                f"Requested: {requested}. Supported client functions: {supported}."
            )

        function_results = []
        for call in pending_calls:
            print(f"\n[Managed Agent] Calling {call.name}...")
            LOGGER.info(
                "function_call_start interaction_id=%s call_id=%s name=%s arguments=%s",
                interaction.id,
                call.id,
                call.name,
                json.dumps(
                    _sanitize_log_value(call.arguments),
                    ensure_ascii=False,
                    default=str,
                ),
            )
            try:
                result = invoke_handler(handlers[call.name], call.arguments)
            except Exception as exc:
                LOGGER.exception(
                    "function_call_failed interaction_id=%s call_id=%s name=%s",
                    interaction.id,
                    call.id,
                    call.name,
                )
                result = f"Tool failed: {type(exc).__name__}: {exc}"
            LOGGER.info(
                "function_call_complete interaction_id=%s call_id=%s name=%s result=%s",
                interaction.id,
                call.id,
                call.name,
                _redact_text(str(result)),
            )
            function_results.append(
                {
                    "type": "function_result",
                    "name": call.name,
                    "call_id": call.id,
                    "result": {"output": result},
                }
            )

        try:
            interaction = CLIENT.interactions.create(
                agent=MANAGED_AGENT,
                input=function_results,
                environment=interaction.environment_id,
                tools=tools,
                system_instruction=instructions,
                previous_interaction_id=interaction.id,
                background=True,
                store=True,
                timeout=60,
            )
        except Exception:
            LOGGER.exception(
                "interaction_function_result_submit_failed previous_interaction_id=%s",
                interaction.id,
            )
            raise
        interaction = wait_for_interaction(interaction)

    if interaction.status != "completed":
        LOGGER.error(
            "interaction_terminal_failure id=%s status=%s error=%s",
            interaction.id,
            interaction.status,
            _sanitize_log_value(getattr(interaction, "error", None)),
        )
        raise RuntimeError(f"Managed agent ended with status: {interaction.status}")
    LOGGER.info(
        "interaction_completed id=%s output=%s",
        interaction.id,
        _redact_text(getattr(interaction, "output_text", "") or ""),
    )
    return interaction

def main():
    global ACTIVE_APPLICATION_DIRECTORY

    architect_instructions = (
        "You are a Cloud Architect specialized strictly in designing GCP cloud architectures. "
        "Your job is to:\n"
        "1. Ask the user for their application directory.\n"
        "2. When the orchestrator says it copied the application to /workspace/application, "
        "restore it as instructed, detect the sandbox OS and available tools, and inspect that "
        "directory directly with the built-in terminal. Build your own read-only shell commands "
        "for listing, searching, and reading files based on the detected system; there is no "
        "fixed exploration command set. Do not modify application files while inspecting them.\n"
        "3. Design an appropriate GCP architecture and explain it clearly to the user.\n"
        "4. ALWAYS generate a visual architecture diagram by calling the 'generate_architecture_image' tool. "
        "When calling this tool, the prompt must be a structured, technical description listing ONLY the GCP services used and how they connect. "
        "Example format: 'User request flows to Cloud Load Balancer, which routes to Cloud Run service running the app container, "
        "container images stored in Artifact Registry, secrets from Secret Manager, logs sent to Cloud Logging, "
        "static assets served from Cloud Storage via Cloud CDN.' "
        "Do NOT include artistic descriptions, colors, or visual style in the prompt - the tool handles that automatically.\n"
        "5. After the diagram is generated, tell the user the architecture diagram has been saved to architecture.jpg and ask them to review it. "
        "Tell them to say 'APPROVE' if they are ready to deploy."
    )
    
    devops_instructions = (
        "You are a Senior DevOps Managed Agent strictly specialized in autonomously executing GCP deployments. "
        "You receive an approved architecture from the Cloud Architect. "
        "When the orchestrator says the application was copied into the sandbox, restore it "
        "immediately, detect the sandbox OS and available tools, and use /workspace/application "
        "as the source directory. During discovery, construct any read-only shell commands needed "
        "to list, search, and read the project; do not rely on a fixed command set. Never ask the "
        "user to share files that are already present there. "
        "Your job is to:\n"
        "1. Use google_cloud_resource_manager MCP to inspect existing projects. If needed, create and bill a project "
        "with create_gcp_project because project creation and billing are not exposed by Google Cloud MCP. "
        "(Default billing account: 019B50-4CED52-737F15)\n"
        "2. Enable necessary APIs using enable_apis because Service Usage has no Google Cloud MCP server.\n"
        "3. ALWAYS use google_cloud_run MCP for Cloud Run deployment and verification.\n"
        "For deploy_service_from_archive, use the MCP schema exactly: "
        '{"service":{"name":"SERVICE","project":"PROJECT","region":"REGION",'
        '"invokerIamDisabled":true,"template":{"containers":[{"sourceCode":'
        '{"cloudStorageSource":{"bucket":"BUCKET","object":"application.tar.gz"}},'
        '"command":["python3"],"args":["app.py"],"env":[{"name":"PYTHONPATH",'
        '"value":"vendor"}],"ports":[{"containerPort":8080}],'
        '"baseImageUri":"python312"}]}}}. '
        "Use camelCase field names, pass command as an array, and split the GCS URI into "
        "bucket and object. Adapt the command, args, runtime, and port to the inspected app. "
        "If the MCP rejects a payload, correct it against this schema; never fall back to "
        "gcloud run.\n"
        "4. ALWAYS use google_cloud_storage MCP for bucket creation and supported object operations. "
        "The gcloud fallback may only upload local binary files, which Storage MCP cannot write.\n"
        "5. Use deploy_infrastructure only for unsupported services such as Cloud Build, Artifact Registry, "
        "load balancing, and CDN. Never use it for Cloud Run or bucket creation. "
        "Files under /workspace exist only in the remote sandbox and local gcloud cannot read them. "
        "To upload application source, ALWAYS call upload_application_archive with the destination "
        "GCS URI; never request a gcloud storage cp command containing /workspace.\n"
        "AUTONOMOUS REMEDIATION: A deployment is not successful until get_service reports Ready. "
        "If deployment or readiness fails, do not repeat the same payload. Call read_cloud_run_logs, "
        "identify the concrete startup/build error, and choose a corrected strategy. You may call "
        "build_application_image with a production Dockerfile and corrected file_overrides when "
        "the archive runtime lacks native libraries, uses the wrong startup command or port, or "
        "requires other image-level changes. That tool works from a temporary local copy, so include "
        "all fixes made in the sandbox as file_overrides. Then deploy the returned image using "
        "google_cloud_run:deploy_service_from_image with this exact shape: "
        '{"service":{"name":"SERVICE","project":"PROJECT","region":"REGION",'
        '"invokerIamDisabled":true,"template":{"containers":[{"image":"IMAGE_URI",'
        '"ports":[{"containerPort":8080}]}]}}}. Verify again with get_service and logs. '
        "Try at most three distinct remediation strategies and summarize the final verified result. "
        "Do not run gcloud inside the remote sandbox because its bundled installation is unreliable.\n"
        "CRITICAL: Never print, suggest, or return shell commands, gcloud commands, Terraform, or manual deployment steps. "
        "If required values such as project ID or application directory are missing, ask only for those values. "
        "Once all values are known, you MUST deploy by requesting the provided tools and must not claim success unless "
        "their results confirm success. Prefer Google Cloud MCP for every supported operation. "
        "Your final response may only summarize tool results and deployed resource URLs."
    )

    architect_handlers = {
        "generate_architecture_image": generate_architecture_image,
    }
    devops_handlers = {
        "create_gcp_project": create_gcp_project,
        "enable_apis": enable_apis,
        "upload_application_archive": upload_application_archive,
        "read_cloud_run_logs": read_cloud_run_logs,
        "build_application_image": build_application_image,
        "deploy_infrastructure": deploy_infrastructure,
    }
    
    # ── Phase 1: Cloud Architect (iAPI) ───────────────────────────────────
    print_banner()
    print("--- Phase 1: Cloud Architect ---")
    architect_interaction_id = None
    architect_history = []
    approved = False
    application_directory = None
    application_environment = None

    try:
        # First turn - no previous_interaction_id yet, iAPI creates a new session
        response = run_managed_agent(
            "Hello! Please start by asking for the application directory.",
            architect_instructions,
            ARCHITECT_TOOLS,
            architect_handlers,
        )
        architect_interaction_id = response.id
        architect_environment_id = response.environment_id
        print(f"Architect: {response.output_text}")
        architect_history.append(f"Architect: {response.output_text}")
    except Exception as e:
        LOGGER.exception("architect_session_start_failed")
        print(f"Error starting Architect session: {e}")
        return

    while not approved:
        try:
            user_input = get_input("User: ")
            architect_history.append(f"User: {user_input}")

            if "approve" in user_input.lower():
                approved = True
                print("\n[Orchestrator] Architecture approved! Handing off to Senior DevOps Agent...\n")
                break

            detected_directory = extract_local_directory(user_input)
            interaction_input = user_input
            interaction_environment = architect_environment_id
            if detected_directory and detected_directory != application_directory:
                application_environment = build_application_environment(detected_directory)
                application_directory = detected_directory
                ACTIVE_APPLICATION_DIRECTORY = detected_directory
                interaction_input = application_transfer_prompt(user_input)
                interaction_environment = application_environment
                print(
                    f"[Orchestrator] Copying {application_directory} into the managed "
                    f"agent sandbox at {SANDBOX_APPLICATION_DIR}..."
                )

            # Continue the conversation, provisioning a source-backed sandbox when needed.
            response = run_managed_agent(
                interaction_input,
                architect_instructions,
                ARCHITECT_TOOLS,
                architect_handlers,
                previous_interaction_id=architect_interaction_id,
                environment=interaction_environment,
            )
            architect_interaction_id = response.id
            architect_environment_id = response.environment_id
            print(f"Architect: {response.output_text}")
            architect_history.append(f"Architect: {response.output_text}")

        except SystemExit:
            raise
        except Exception as e:
            LOGGER.exception("architect_communication_failed")
            print(f"Error communicating with Architect: {e}")

    # ── Phase 2: Senior DevOps Agent (iAPI) ───────────────────────────────
    print("--- Phase 2: Senior DevOps ---")
    devops_interaction_id = None

    context = "\n".join(architect_history)
    mcp_project = (
        os.environ.get("GOOGLE_CLOUD_MCP_PROJECT")
        or extract_project_id(context)
    )
    if not mcp_project:
        try:
            configured_project = _gcloud_output("config", "get-value", "project")
            if configured_project and configured_project != "(unset)":
                mcp_project = configured_project
        except Exception:
            pass
    if not mcp_project:
        mcp_project = get_input("Google Cloud project ID for MCP authentication: ")

    try:
        devops_tools = [
            *DEVOPS_TOOLS,
            *build_google_cloud_mcp_tools(mcp_project),
        ]
    except Exception as exc:
        LOGGER.exception("mcp_configuration_failed")
        print(f"Error configuring Google Cloud MCP servers: {exc}")
        return

    handoff_prompt = (
        "Here is the context of the conversation between the user and the Cloud Architect. "
        "The user has approved the architecture. Please review the plan, identify what needs to be deployed, "
        "and begin provisioning the resources using your tools.\n\n"
        + (
            "The complete local application has been copied into this sandbox. First run "
            "`python /workspace/.app-transfer/restore.py`, then deploy from "
            f"`{SANDBOX_APPLICATION_DIR}`. Do not ask the user to provide application files.\n\n"
            if application_environment
            else ""
        )
        + f"--- CONVERSATION HISTORY ---\n{context}"
    )

    try:
        print("[Orchestrator] Sending context to DevOps Agent (this may take a moment)...\n")
        # First DevOps turn - fresh iAPI session for DevOps agent
        response = run_managed_agent(
            handoff_prompt,
            devops_instructions,
            devops_tools,
            devops_handlers,
            environment=application_environment,
        )
        devops_interaction_id = response.id
        devops_environment_id = response.environment_id
        print(f"DevOps: {response.output_text}")

        while True:
            user_input = get_input("User (DevOps Phase): ")

            detected_directory = extract_local_directory(user_input)
            interaction_input = user_input
            interaction_environment = devops_environment_id
            if detected_directory and detected_directory != application_directory:
                application_environment = build_application_environment(detected_directory)
                application_directory = detected_directory
                ACTIVE_APPLICATION_DIRECTORY = detected_directory
                interaction_input = application_transfer_prompt(user_input)
                interaction_environment = application_environment
                print(
                    f"[Orchestrator] Copying {application_directory} into the managed "
                    f"agent sandbox at {SANDBOX_APPLICATION_DIR}..."
                )

            # Continue DevOps session via previous_interaction_id
            response = run_managed_agent(
                interaction_input,
                devops_instructions,
                devops_tools,
                devops_handlers,
                previous_interaction_id=devops_interaction_id,
                environment=interaction_environment,
            )
            devops_interaction_id = response.id
            devops_environment_id = response.environment_id
            print(f"DevOps: {response.output_text}")

    except SystemExit:
        raise
    except KeyboardInterrupt:
        print("\n[Agent] Goodbye! Exiting the deployment system.")
    except Exception as e:
        LOGGER.exception("devops_communication_failed")
        print(f"Error communicating with DevOps: {e}")

if __name__ == "__main__":
    main()
