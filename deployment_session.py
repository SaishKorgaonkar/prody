"""Isolated, PTY-backed sessions for the interactive deployment agent."""

from __future__ import annotations

import atexit
import errno
import os
import pty
import shutil
import signal
import subprocess
import tarfile
import tempfile
import threading
import time
import uuid
import zipfile
from collections import deque
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path, PurePosixPath
from typing import Any

MAX_OUTPUT_CHARS = 1_000_000


def _safe_relative_path(name: str) -> Path:
    normalized = name.replace("\\", "/")
    path = PurePosixPath(normalized)
    if not normalized or path.is_absolute() or ".." in path.parts:
        raise ValueError("The archive contains an unsafe file path.")
    return Path(*path.parts)


def extract_archive(payload: bytes, filename: str, destination: Path) -> None:
    """Extract a validated archive without links or traversal paths."""
    destination.mkdir(parents=True, exist_ok=False)
    lowered = filename.lower()

    if lowered.endswith(".zip"):
        with zipfile.ZipFile(BytesIO(payload)) as archive:
            for member in archive.infolist():
                relative = _safe_relative_path(member.filename)
                target = destination / relative
                unix_mode = member.external_attr >> 16
                if (unix_mode & 0o170000) == 0o120000:
                    raise ValueError("Archive links are not supported.")
                if member.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(member) as source, target.open("wb") as output:
                    shutil.copyfileobj(source, output)
        return

    if lowered.endswith((".tar.gz", ".tgz")):
        with tarfile.open(fileobj=BytesIO(payload), mode="r:gz") as archive:
            for member in archive.getmembers():
                relative = _safe_relative_path(member.name)
                target = destination / relative
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                    continue
                if not member.isfile():
                    raise ValueError("Archive links and special files are not supported.")
                target.parent.mkdir(parents=True, exist_ok=True)
                source = archive.extractfile(member)
                if source is None:
                    raise ValueError("An archive member could not be read.")
                with source, target.open("wb") as output:
                    shutil.copyfileobj(source, output)
        return

    raise ValueError("Upload a .zip, .tar.gz, or .tgz application archive.")


@dataclass
class DeploymentSession:
    session_id: str
    project_dir: Path
    repository_dir: Path
    filename: str
    status: str = "uploaded"
    return_code: int | None = None
    created_at: float = field(default_factory=time.time)
    _process: subprocess.Popen[bytes] | None = field(default=None, init=False)
    _input_fd: int | None = field(default=None, init=False)
    _output_fd: int | None = field(default=None, init=False)
    _using_pty: bool = field(default=True, init=False)
    _reader: threading.Thread | None = field(default=None, init=False)
    _output: deque[tuple[int, str]] = field(default_factory=deque, init=False)
    _output_chars: int = field(default=0, init=False)
    _sequence: int = field(default=0, init=False)
    _condition: threading.Condition = field(
        default_factory=threading.Condition, init=False
    )
    _path_submitted: bool = field(default=False, init=False)
    _prompt_scan: str = field(default="", init=False)

    def start(self) -> None:
        with self._condition:
            if self.status == "running":
                raise RuntimeError("The deployment is already running.")
            if self.status not in {"uploaded", "completed", "failed", "stopped"}:
                raise RuntimeError(f"The deployment cannot start from {self.status}.")
            self.status = "running"
            self.return_code = None
            self._path_submitted = False
            self._prompt_scan = ""
            self._append_locked("\n[Northstar] Starting managed deployment workflow…\n")

        environment = os.environ.copy()
        environment["PYTHONUNBUFFERED"] = "1"
        script = self.repository_dir / "run.sh"
        master_fd = None
        slave_fd = None
        try:
            try:
                master_fd, slave_fd = pty.openpty()
            except OSError:
                self._using_pty = False
                process = subprocess.Popen(
                    [str(script)],
                    cwd=self.repository_dir,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    env=environment,
                    start_new_session=True,
                    bufsize=0,
                    close_fds=True,
                )
                assert process.stdin is not None
                assert process.stdout is not None
                self._input_fd = process.stdin.fileno()
                self._output_fd = process.stdout.fileno()
                with self._condition:
                    self._append_locked(
                        "[Northstar] PTY unavailable; using a direct output stream.\n"
                    )
            else:
                self._using_pty = True
                process = subprocess.Popen(
                    [str(script)],
                    cwd=self.repository_dir,
                    stdin=slave_fd,
                    stdout=slave_fd,
                    stderr=slave_fd,
                    env=environment,
                    start_new_session=True,
                    close_fds=True,
                )
                self._input_fd = master_fd
                self._output_fd = master_fd
        except Exception:
            if master_fd is not None:
                os.close(master_fd)
            if slave_fd is not None:
                os.close(slave_fd)
            with self._condition:
                self.status = "failed"
                self._append_locked("[Northstar] Failed to start ./run.sh.\n")
                self._condition.notify_all()
            raise
        finally:
            if slave_fd is not None:
                try:
                    os.close(slave_fd)
                except OSError:
                    pass

        self._process = process
        self._reader = threading.Thread(
            target=self._read_output,
            name=f"deployment-{self.session_id}",
            daemon=True,
        )
        self._reader.start()

    def _append_locked(self, text: str) -> None:
        if not text:
            return
        self._sequence += 1
        self._output.append((self._sequence, text))
        self._output_chars += len(text)
        while self._output and self._output_chars > MAX_OUTPUT_CHARS:
            _, removed = self._output.popleft()
            self._output_chars -= len(removed)

    def _read_output(self) -> None:
        assert self._output_fd is not None
        assert self._process is not None
        try:
            while True:
                try:
                    chunk = os.read(self._output_fd, 4096)
                except OSError as exc:
                    if exc.errno == errno.EIO:
                        break
                    raise
                if not chunk:
                    break
                text = chunk.decode("utf-8", errors="replace")
                should_submit_path = False
                with self._condition:
                    self._append_locked(text)
                    self._prompt_scan = (self._prompt_scan + text)[-512:]
                    if not self._path_submitted and "User: " in self._prompt_scan:
                        self._path_submitted = True
                        should_submit_path = True
                    self._condition.notify_all()
                if should_submit_path:
                    self.send_input(str(self.project_dir))
        except Exception as exc:
            with self._condition:
                self._append_locked(
                    f"\n[Northstar] Output stream error: {type(exc).__name__}: {exc}\n"
                )
                self._condition.notify_all()
        finally:
            return_code = self._process.wait()
            if self._using_pty:
                try:
                    os.close(self._output_fd)
                except OSError:
                    pass
            else:
                if self._process.stdin is not None:
                    self._process.stdin.close()
                if self._process.stdout is not None:
                    self._process.stdout.close()
            with self._condition:
                self.return_code = return_code
                if self.status == "running":
                    self.status = "completed" if return_code == 0 else "failed"
                self._append_locked(
                    f"\n[Northstar] Workflow {self.status}"
                    + (
                        ".\n"
                        if return_code == 0
                        else f" with exit code {return_code}.\n"
                    )
                )
                self._condition.notify_all()

    def send_input(self, value: str) -> None:
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Input cannot be empty.")
        if len(value) > 4096 or "\x00" in value:
            raise ValueError("Input is too long or contains invalid characters.")
        cleaned = value.rstrip("\r\n")
        with self._condition:
            if self.status != "running" or self._input_fd is None:
                raise RuntimeError("The deployment is not accepting input.")
            input_fd = self._input_fd
            if not self._using_pty:
                self._append_locked(f"> {cleaned}\n")
                self._condition.notify_all()
        os.write(input_fd, (cleaned + "\n").encode("utf-8"))

    def stop(self) -> None:
        with self._condition:
            process = self._process
            if self.status != "running" or process is None:
                raise RuntimeError("The deployment is not running.")
            self.status = "stopped"
            self._append_locked("\n[Northstar] Stopping workflow…\n")
            self._condition.notify_all()
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            return

        def force_stop() -> None:
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass

        threading.Thread(target=force_stop, daemon=True).start()

    def events_after(
        self, sequence: int, timeout: float = 15.0
    ) -> tuple[list[tuple[int, str]], dict[str, Any]]:
        with self._condition:
            if not any(item_sequence > sequence for item_sequence, _ in self._output):
                if self.status == "running":
                    self._condition.wait(timeout=timeout)
            events = [
                (item_sequence, text)
                for item_sequence, text in self._output
                if item_sequence > sequence
            ]
            return events, self.snapshot_locked()

    def snapshot_locked(self) -> dict[str, Any]:
        return {
            "id": self.session_id,
            "filename": self.filename,
            "status": self.status,
            "returnCode": self.return_code,
            "lastSequence": self._sequence,
        }

    def snapshot(self) -> dict[str, Any]:
        with self._condition:
            return self.snapshot_locked()

    def close(self) -> None:
        if self.status == "running":
            try:
                self.stop()
            except RuntimeError:
                pass


class DeploymentSessionManager:
    def __init__(self, repository_dir: Path):
        self.repository_dir = repository_dir.resolve()
        self._temporary_root = Path(tempfile.mkdtemp(prefix="northstar-sessions-"))
        self._sessions: dict[str, DeploymentSession] = {}
        self._lock = threading.Lock()
        atexit.register(self.close)

    def create(self, payload: bytes, filename: str) -> DeploymentSession:
        session_id = uuid.uuid4().hex
        session_root = self._temporary_root / session_id
        project_dir = session_root / "application"
        session_root.mkdir(parents=True, exist_ok=False)
        try:
            extract_archive(payload, filename, project_dir)
        except Exception:
            shutil.rmtree(session_root, ignore_errors=True)
            raise
        session = DeploymentSession(
            session_id=session_id,
            project_dir=project_dir,
            repository_dir=self.repository_dir,
            filename=filename,
        )
        with self._lock:
            self._sessions[session_id] = session
        return session

    def get(self, session_id: str) -> DeploymentSession:
        with self._lock:
            session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(session_id)
        return session

    def close(self) -> None:
        with self._lock:
            sessions = list(self._sessions.values())
            self._sessions.clear()
        for session in sessions:
            session.close()
        shutil.rmtree(self._temporary_root, ignore_errors=True)
