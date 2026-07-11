import io
import os
import stat
import tarfile
import tempfile
import time
import unittest
import zipfile
from pathlib import Path

from deployment_session import DeploymentSession, extract_archive


class TestArchiveExtraction(unittest.TestCase):
    def test_zip_is_extracted_without_running_source(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w") as archive:
            archive.writestr("project/app.py", "print('hello')")

        with tempfile.TemporaryDirectory() as directory:
            destination = Path(directory) / "application"
            extract_archive(stream.getvalue(), "project.zip", destination)

            self.assertEqual(
                (destination / "project" / "app.py").read_text(),
                "print('hello')",
            )

    def test_zip_symlink_is_rejected(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w") as archive:
            member = zipfile.ZipInfo("linked-file")
            member.create_system = 3
            member.external_attr = (stat.S_IFLNK | 0o777) << 16
            archive.writestr(member, "target")

        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "links"):
                extract_archive(
                    stream.getvalue(),
                    "project.zip",
                    Path(directory) / "application",
                )

    def test_tar_link_is_rejected(self):
        stream = io.BytesIO()
        with tarfile.open(fileobj=stream, mode="w:gz") as archive:
            member = tarfile.TarInfo("linked-file")
            member.type = tarfile.SYMTYPE
            member.linkname = "target"
            archive.addfile(member)

        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, "links"):
                extract_archive(
                    stream.getvalue(),
                    "project.tar.gz",
                    Path(directory) / "application",
                )


class TestDeploymentSession(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.project = self.root / "application"
        self.project.mkdir()

    def make_session(self, script: str) -> DeploymentSession:
        run_script = self.root / "run.sh"
        run_script.write_text(script)
        run_script.chmod(0o755)
        session = DeploymentSession(
            session_id="test-session",
            project_dir=self.project,
            repository_dir=self.root,
            filename="project.zip",
        )
        self.addCleanup(session.close)
        return session

    @staticmethod
    def wait_for_text(
        session: DeploymentSession, expected: str, timeout: float = 5
    ) -> str:
        deadline = time.monotonic() + timeout
        sequence = 0
        output = ""
        while time.monotonic() < deadline:
            events, _ = session.events_after(sequence, timeout=0.1)
            for sequence, text in events:
                output += text
            if expected in output:
                return output
        raise AssertionError(f"Did not receive {expected!r}. Output: {output!r}")

    def test_prompt_streaming_auto_path_and_browser_input(self):
        session = self.make_session(
            """#!/bin/bash
printf "Architect ready\\nUser: "
read application
printf "APP=%s\\nReply: " "$application"
read reply
printf "REPLY=%s\\n" "$reply"
"""
        )

        session.start()
        output = self.wait_for_text(session, "Reply:")
        self.assertIn(f"APP={self.project}", output)

        session.send_input("APPROVE")
        output = self.wait_for_text(session, "REPLY=APPROVE")
        self.assertIn("REPLY=APPROVE", output)

        deadline = time.monotonic() + 3
        while session.snapshot()["status"] == "running" and time.monotonic() < deadline:
            time.sleep(0.02)
        self.assertEqual(session.snapshot()["status"], "completed")
        self.assertEqual(session.snapshot()["returnCode"], 0)

    def test_stop_terminates_process_group(self):
        session = self.make_session(
            """#!/bin/bash
printf "Working\\n"
sleep 30
"""
        )
        session.start()
        self.wait_for_text(session, "Working")

        session.stop()

        deadline = time.monotonic() + 5
        while session._process.poll() is None and time.monotonic() < deadline:
            time.sleep(0.02)
        self.assertIsNotNone(session._process.poll())
        self.assertEqual(session.snapshot()["status"], "stopped")


if __name__ == "__main__":
    unittest.main()
