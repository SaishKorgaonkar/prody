"""Web entrypoint for uploading and inspecting applications before deployment."""

from __future__ import annotations

import io
import json
import os
import tarfile
import zipfile
from collections import Counter
from pathlib import Path
from pathlib import PurePosixPath
from typing import Iterable

from flask import Flask, Response, jsonify, render_template, request, stream_with_context

from deployment_session import DeploymentSessionManager

MAX_ARCHIVE_BYTES = 50 * 1024 * 1024
MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024
MAX_ARCHIVE_MEMBERS = 10_000

LANGUAGES = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".go": "Go",
    ".java": "Java",
    ".kt": "Kotlin",
    ".rb": "Ruby",
    ".php": "PHP",
    ".rs": "Rust",
    ".cs": "C#",
    ".swift": "Swift",
    ".html": "HTML",
    ".css": "CSS",
}

STACK_MARKERS = (
    ("next.config.js", "Next.js"),
    ("next.config.mjs", "Next.js"),
    ("vite.config.ts", "Vite"),
    ("vite.config.js", "Vite"),
    ("angular.json", "Angular"),
    ("manage.py", "Django"),
    ("app.py", "Flask / Python"),
    ("main.py", "Python"),
    ("package.json", "Node.js"),
    ("requirements.txt", "Python"),
    ("pyproject.toml", "Python"),
    ("go.mod", "Go"),
    ("Cargo.toml", "Rust"),
    ("pom.xml", "Java / Maven"),
    ("build.gradle", "Java / Gradle"),
    ("Dockerfile", "Container"),
)


def _safe_member_names(names: Iterable[str]) -> list[str]:
    safe_names = []
    for raw_name in names:
        normalized = raw_name.replace("\\", "/")
        path = PurePosixPath(normalized)
        if path.is_absolute() or ".." in path.parts:
            raise ValueError("The archive contains an unsafe file path.")
        if normalized and not normalized.endswith("/"):
            safe_names.append(normalized)
    if not safe_names:
        raise ValueError("The archive does not contain any files.")
    if len(safe_names) > MAX_ARCHIVE_MEMBERS:
        raise ValueError(
            f"The archive contains more than {MAX_ARCHIVE_MEMBERS:,} files."
        )
    return safe_names


def _read_archive(payload: bytes, filename: str) -> tuple[list[str], int]:
    stream = io.BytesIO(payload)
    lowered = filename.lower()
    if lowered.endswith(".zip"):
        if not zipfile.is_zipfile(stream):
            raise ValueError("This file is not a valid ZIP archive.")
        stream.seek(0)
        with zipfile.ZipFile(stream) as archive:
            members = archive.infolist()
            names = _safe_member_names(member.filename for member in members)
            unpacked_size = sum(
                member.file_size for member in members if not member.is_dir()
            )
    elif lowered.endswith((".tar.gz", ".tgz")):
        try:
            stream.seek(0)
            with tarfile.open(fileobj=stream, mode="r:gz") as archive:
                members = archive.getmembers()
                names = _safe_member_names(
                    member.name for member in members if member.isfile()
                )
                unpacked_size = sum(
                    member.size for member in members if member.isfile()
                )
        except tarfile.TarError as exc:
            raise ValueError("This file is not a valid compressed TAR archive.") from exc
    else:
        raise ValueError("Upload a .zip, .tar.gz, or .tgz application archive.")

    if unpacked_size > MAX_UNCOMPRESSED_BYTES:
        raise ValueError("The extracted application would be larger than 500 MB.")
    return names, unpacked_size


def _detect_stack(names: list[str]) -> tuple[str, list[str]]:
    basenames = {PurePosixPath(name).name for name in names}
    detected = []
    for marker, label in STACK_MARKERS:
        if marker in basenames and label not in detected:
            detected.append(label)
    primary = detected[0] if detected else "Custom application"
    return primary, detected[:4]


def _language_breakdown(names: list[str]) -> list[dict[str, int | str]]:
    counts = Counter(
        LANGUAGES[PurePosixPath(name).suffix.lower()]
        for name in names
        if PurePosixPath(name).suffix.lower() in LANGUAGES
    )
    total = sum(counts.values())
    if not total:
        return []
    return [
        {
            "name": language,
            "files": count,
            "percent": round(count / total * 100),
        }
        for language, count in counts.most_common(4)
    ]


def create_app(
    session_manager: DeploymentSessionManager | None = None,
) -> Flask:
    app = Flask(__name__)
    # Leave room for multipart headers while enforcing the file limit below.
    app.config["MAX_CONTENT_LENGTH"] = MAX_ARCHIVE_BYTES + (1024 * 1024)
    manager = session_manager or DeploymentSessionManager(Path(__file__).parent)
    app.extensions["deployment_sessions"] = manager

    def find_session(session_id: str):
        try:
            return manager.get(session_id)
        except KeyError:
            return None

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/healthz")
    def health():
        return jsonify(status="ok", service="deployment-studio")

    @app.post("/api/projects/analyze")
    def analyze_project():
        uploaded = request.files.get("application")
        if uploaded is None or not uploaded.filename:
            return jsonify(error="Choose an application archive to continue."), 400

        payload = uploaded.read(MAX_ARCHIVE_BYTES + 1)
        if len(payload) > MAX_ARCHIVE_BYTES:
            return jsonify(error="The archive must be 50 MB or smaller."), 413
        if not payload:
            return jsonify(error="The uploaded archive is empty."), 400

        try:
            names, unpacked_size = _read_archive(payload, uploaded.filename)
            session = manager.create(payload, uploaded.filename)
        except ValueError as exc:
            return jsonify(error=str(exc)), 400

        primary_stack, detected = _detect_stack(names)
        root_entries = sorted(
            {
                name.split("/", 1)[0]
                for name in names
                if not name.startswith("__MACOSX/")
            }
        )
        return jsonify(
            id=session.session_id,
            filename=uploaded.filename,
            archiveBytes=len(payload),
            unpackedBytes=unpacked_size,
            fileCount=len(names),
            primaryStack=primary_stack,
            detected=detected,
            languages=_language_breakdown(names),
            rootEntries=root_entries[:8],
            status="ready",
        )

    @app.post("/api/projects/<session_id>/start")
    def start_deployment(session_id: str):
        session = find_session(session_id)
        if session is None:
            return jsonify(error="Deployment session not found."), 404
        try:
            session.start()
        except RuntimeError as exc:
            return jsonify(error=str(exc)), 409
        except OSError:
            app.logger.exception("deployment_start_failed session_id=%s", session_id)
            return jsonify(error="The managed workflow could not be started."), 500
        return jsonify(session.snapshot()), 202

    @app.get("/api/projects/<session_id>/status")
    def deployment_status(session_id: str):
        session = find_session(session_id)
        if session is None:
            return jsonify(error="Deployment session not found."), 404
        return jsonify(session.snapshot())

    @app.post("/api/projects/<session_id>/input")
    def deployment_input(session_id: str):
        session = find_session(session_id)
        if session is None:
            return jsonify(error="Deployment session not found."), 404
        body = request.get_json(silent=True) or {}
        try:
            session.send_input(body.get("value"))
        except ValueError as exc:
            return jsonify(error=str(exc)), 400
        except RuntimeError as exc:
            return jsonify(error=str(exc)), 409
        return jsonify(status="accepted"), 202

    @app.post("/api/projects/<session_id>/stop")
    def stop_deployment(session_id: str):
        session = find_session(session_id)
        if session is None:
            return jsonify(error="Deployment session not found."), 404
        try:
            session.stop()
        except RuntimeError as exc:
            return jsonify(error=str(exc)), 409
        return jsonify(session.snapshot()), 202

    @app.get("/api/projects/<session_id>/events")
    def deployment_events(session_id: str):
        session = find_session(session_id)
        if session is None:
            return jsonify(error="Deployment session not found."), 404
        try:
            query_cursor = int(request.args.get("after", "0"))
            reconnect_cursor = int(request.headers.get("Last-Event-ID", "0"))
            after = max(0, query_cursor, reconnect_cursor)
        except ValueError:
            return jsonify(error="The event cursor must be an integer."), 400

        @stream_with_context
        def event_stream():
            sequence = after
            last_status = None
            while True:
                events, snapshot = session.events_after(sequence)
                for event_sequence, text in events:
                    sequence = event_sequence
                    payload = json.dumps({"text": text})
                    yield f"id: {event_sequence}\nevent: output\ndata: {payload}\n\n"
                if snapshot["status"] != last_status:
                    last_status = snapshot["status"]
                    payload = json.dumps(snapshot)
                    yield f"event: status\ndata: {payload}\n\n"
                if snapshot["status"] != "running":
                    yield f"event: complete\ndata: {json.dumps(snapshot)}\n\n"
                    break
                if not events:
                    yield ": keep-alive\n\n"

        return Response(
            event_stream(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    @app.errorhandler(413)
    def archive_too_large(_error):
        return jsonify(error="The archive must be 50 MB or smaller."), 413

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("WEB_HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8080")),
        debug=os.getenv("FLASK_DEBUG") == "1",
    )
