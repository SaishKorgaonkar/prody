import io
import tarfile
import unittest
import zipfile
from pathlib import Path

from deployment_session import DeploymentSessionManager
from web_app import create_app


class TestWebApp(unittest.TestCase):
    def setUp(self):
        self.manager = DeploymentSessionManager(Path(__file__).parent)
        self.addCleanup(self.manager.close)
        app = create_app(self.manager)
        app.config["TESTING"] = True
        self.client = app.test_client()

    @staticmethod
    def zip_payload(files):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, "w") as archive:
            for name, content in files.items():
                archive.writestr(name, content)
        return stream.getvalue()

    def test_home_page_renders_uploader(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Drop your project archive here", response.data)

    def test_zip_analysis_detects_stack_and_languages(self):
        payload = self.zip_payload(
            {
                "sample/requirements.txt": "Flask==3.0",
                "sample/app.py": "print('hello')",
                "sample/static/app.js": "console.log('hello')",
            }
        )

        response = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(payload), "sample.zip")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["primaryStack"], "Flask / Python")
        self.assertEqual(body["fileCount"], 3)
        self.assertEqual(
            {language["name"] for language in body["languages"]},
            {"Python", "JavaScript"},
        )

    def test_tar_gz_analysis_is_supported(self):
        stream = io.BytesIO()
        content = b"module example.com/demo\n"
        with tarfile.open(fileobj=stream, mode="w:gz") as archive:
            member = tarfile.TarInfo("demo/go.mod")
            member.size = len(content)
            archive.addfile(member, io.BytesIO(content))

        response = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(stream.getvalue()), "demo.tar.gz")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["primaryStack"], "Go")

    def test_archive_with_parent_path_is_rejected(self):
        payload = self.zip_payload({"../secret.txt": "unsafe"})

        response = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(payload), "unsafe.zip")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("unsafe file path", response.get_json()["error"])

    def test_invalid_archive_returns_clear_error(self):
        response = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(b"not a zip"), "project.zip")},
            content_type="multipart/form-data",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"],
            "This file is not a valid ZIP archive.",
        )

    def test_uploaded_project_creates_controllable_session(self):
        payload = self.zip_payload({"app.py": "print('hello')"})
        upload = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(payload), "sample.zip")},
            content_type="multipart/form-data",
        )
        session_id = upload.get_json()["id"]
        session = self.manager.get(session_id)
        calls = []
        session.start = lambda: calls.append("start")
        session.send_input = lambda value: calls.append(("input", value))
        session.stop = lambda: calls.append("stop")

        start = self.client.post(f"/api/projects/{session_id}/start")
        user_input = self.client.post(
            f"/api/projects/{session_id}/input",
            json={"value": "APPROVE"},
        )
        stop = self.client.post(f"/api/projects/{session_id}/stop")

        self.assertEqual(start.status_code, 202)
        self.assertEqual(user_input.status_code, 202)
        self.assertEqual(stop.status_code, 202)
        self.assertEqual(calls, ["start", ("input", "APPROVE"), "stop"])

    def test_unknown_session_returns_not_found(self):
        response = self.client.post("/api/projects/missing/start")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "Deployment session not found.")

    def test_event_stream_returns_buffered_output_and_completion(self):
        payload = self.zip_payload({"app.py": "print('hello')"})
        upload = self.client.post(
            "/api/projects/analyze",
            data={"application": (io.BytesIO(payload), "sample.zip")},
            content_type="multipart/form-data",
        )
        session_id = upload.get_json()["id"]
        session = self.manager.get(session_id)
        session.status = "completed"
        with session._condition:
            session._append_locked("Architect: ready\n")

        response = self.client.get(f"/api/projects/{session_id}/events")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"event: output", response.data)
        self.assertIn(b"Architect: ready", response.data)
        self.assertIn(b"event: complete", response.data)


if __name__ == "__main__":
    unittest.main()
