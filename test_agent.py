import unittest
from unittest.mock import patch, MagicMock
import os
import base64
import io
import tempfile
import zipfile
from types import SimpleNamespace

# Set dummy API key for testing
os.environ["GEMINI_API_KEY"] = "dummy_key"

import agent

class TestAgent(unittest.TestCase):
    
    @patch('agent.run_command')
    def test_inspect_application(self, mock_run_command):
        mock_run_command.return_value = "drwxr-xr-x 1 user group 4096 Jul 11 12:00 ."
        result = agent.inspect_application("/fake/dir")
        mock_run_command.assert_called_with("ls -la /fake/dir")
        self.assertEqual(result, "drwxr-xr-x 1 user group 4096 Jul 11 12:00 .")

    def test_extracts_local_directory_with_spaces(self):
        with tempfile.TemporaryDirectory(prefix="simple agent ") as directory:
            message = f"deepmind-hack26blr-4264 {directory}"
            self.assertEqual(agent.extract_local_directory(message), directory)

    def test_record_deployment_creates_structured_handoff(self):
        old_record = agent.DEPLOYMENT_RECORD
        try:
            result = agent.record_deployment(
                project_id="test-project-123",
                region="us-central1",
                service_name="sample-service",
                service_uri="https://sample-service.example.run.app",
                revision="sample-service-00002",
                rollback_revision="sample-service-00001",
            )

            self.assertIn('"service_name": "sample-service"', result)
            self.assertEqual(
                agent.DEPLOYMENT_RECORD["rollback_revision"],
                "sample-service-00001",
            )
        finally:
            agent.DEPLOYMENT_RECORD = old_record

    def test_record_deployment_rejects_non_https_uri(self):
        with self.assertRaises(ValueError):
            agent.record_deployment(
                project_id="test-project-123",
                region="us-central1",
                service_name="sample-service",
                service_uri="http://unsafe.example",
            )

    def test_build_application_environment_copies_nested_files(self):
        with tempfile.TemporaryDirectory() as directory:
            os.makedirs(os.path.join(directory, "static"))
            with open(os.path.join(directory, "app.py"), "w") as file:
                file.write("print('hello')\n")
            with open(os.path.join(directory, "static", "logo.bin"), "wb") as file:
                file.write(b"\x00\x01\xff")

            environment = agent.build_application_environment(directory)

            self.assertEqual(environment["type"], "remote")
            archive_sources = environment["sources"][:-1]
            encoded = "".join(source["content"] for source in archive_sources)
            with zipfile.ZipFile(io.BytesIO(base64.b64decode(encoded))) as archive:
                self.assertEqual(archive.read("app.py"), b"print('hello')\n")
                self.assertEqual(archive.read("static/logo.bin"), b"\x00\x01\xff")
            self.assertEqual(
                environment["sources"][-1]["target"],
                "/workspace/.app-transfer/restore.py",
            )

    def test_deduplicate_tools_preserves_one_registration(self):
        tools = [
            {"type": "code_execution"},
            {"type": "code_execution"},
            {"type": "function", "name": "deploy"},
            {"type": "function", "name": "deploy"},
            {"type": "mcp_server", "name": "cloud_run", "url": "first"},
            {"type": "mcp_server", "name": "cloud_run", "url": "duplicate"},
        ]

        self.assertEqual(
            agent.deduplicate_tools(tools),
            [tools[0], tools[2], tools[4]],
        )

    def test_log_redaction_removes_credentials(self):
        value = (
            "Authorization: Bearer secret-token "
            "api_key=secret-key access_token=secret-access"
        )
        redacted = agent._redact_text(value)

        self.assertNotIn("secret-token", redacted)
        self.assertNotIn("secret-key", redacted)
        self.assertNotIn("secret-access", redacted)

    def test_invoke_handler_ignores_agent_metadata(self):
        def handler(project_id, services):
            return project_id, services

        result = agent.invoke_handler(
            handler,
            {
                "project_id": "test-project",
                "services": ["run.googleapis.com"],
                "explanation": "Enable API",
                "toolSummary": "Enable services",
                "toolAction": "Enabling",
            },
        )

        self.assertEqual(
            result,
            ("test-project", ["run.googleapis.com"]),
        )

    @patch("agent.subprocess.run")
    def test_upload_application_archive_uses_local_source(self, mock_run):
        mock_run.return_value = SimpleNamespace(
            returncode=0,
            stdout="uploaded",
            stderr="",
        )
        old_directory = agent.ACTIVE_APPLICATION_DIRECTORY
        try:
            with tempfile.TemporaryDirectory() as directory:
                with open(os.path.join(directory, "app.py"), "w") as file:
                    file.write("print('hello')\n")
                agent.ACTIVE_APPLICATION_DIRECTORY = directory

                result = agent.upload_application_archive(
                    "test-project",
                    "gs://source-bucket/application.tar.gz",
                )

                command = mock_run.call_args.args[0]
                self.assertEqual(command[0], agent.GCLOUD_BIN)
                self.assertEqual(command[1:3], ["storage", "cp"])
                self.assertEqual(
                    command[4],
                    "gs://source-bucket/application.tar.gz",
                )
                self.assertEqual(result, "uploaded")
        finally:
            agent.ACTIVE_APPLICATION_DIRECTORY = old_directory

    @patch("agent.upload_application_archive", return_value="uploaded locally")
    def test_deploy_translates_remote_archive_upload(self, mock_upload):
        result = agent.deploy_infrastructure(
            "test-project",
            [
                "export CLOUDSDK_PYTHON=python3 && gcloud storage cp "
                "/workspace/application.tar.gz "
                "gs://source-bucket/application.tar.gz --project test-project"
            ],
        )

        mock_upload.assert_called_once_with(
            "test-project",
            "gs://source-bucket/application.tar.gz",
        )
        self.assertIn("uploaded locally", result)

    @patch("agent.subprocess.run")
    def test_build_application_image_returns_artifact_uri(self, mock_run):
        mock_run.side_effect = [
            SimpleNamespace(returncode=0, stdout="", stderr=""),
            SimpleNamespace(returncode=0, stdout="built", stderr=""),
        ]
        old_directory = agent.ACTIVE_APPLICATION_DIRECTORY
        try:
            with tempfile.TemporaryDirectory() as directory:
                with open(os.path.join(directory, "app.py"), "w") as file:
                    file.write("print('hello')\n")
                agent.ACTIVE_APPLICATION_DIRECTORY = directory

                result = agent.build_application_image(
                    project_id="test-project",
                    region="us-central1",
                    repository="deployment-images",
                    image_name="test-app",
                    dockerfile="FROM python:3.12-slim\nCOPY . /app\n",
                )

            self.assertIn(
                "us-central1-docker.pkg.dev/test-project/"
                "deployment-images/test-app:latest",
                result,
            )
            build_command = mock_run.call_args_list[1].args[0]
            self.assertEqual(build_command[1:3], ["builds", "submit"])
        finally:
            agent.ACTIVE_APPLICATION_DIRECTORY = old_directory

    @patch("agent.time.sleep")
    @patch("agent.CLIENT")
    def test_interaction_poll_retries_transient_timeout(
        self, mock_client, mock_sleep
    ):
        running = SimpleNamespace(
            id="interaction-1",
            environment_id="environment-1",
            status="in_progress",
            steps=[],
        )
        completed = SimpleNamespace(
            id="interaction-1",
            environment_id="environment-1",
            status="completed",
            steps=[],
        )
        mock_client.interactions.get.side_effect = [
            TimeoutError("temporary timeout"),
            completed,
        ]

        result = agent.wait_for_interaction(running)

        self.assertIs(result, completed)
        self.assertEqual(mock_client.interactions.get.call_count, 2)
        self.assertGreaterEqual(mock_sleep.call_count, 3)

    @patch('agent.run_command')
    def test_create_gcp_project(self, mock_run_command):
        mock_run_command.side_effect = ["Created project", "Linked billing"]
        result = agent.create_gcp_project("test-proj", "billing-123")
        self.assertEqual(result, "Created project\nLinked billing")

    @patch('agent.CLIENT')
    def test_generate_architecture_image(self, mock_client):
        # Mock the image generation response
        mock_response = MagicMock()
        mock_image = MagicMock()
        mock_image.image.image_bytes = b"fake_image_data"
        mock_response.generated_images = [mock_image]
        mock_client.models.generate_images.return_value = mock_response
        
        with patch('builtins.open', unittest.mock.mock_open()) as mock_file:
            result = agent.generate_architecture_image("test prompt")
            self.assertTrue("Successfully generated" in result)
            mock_file.assert_called_with("architecture.jpg", "wb")
            mock_file().write.assert_called_with(b"fake_image_data")

    def test_main_execution(self):
        response = SimpleNamespace(
            id="interaction-1",
            environment_id="environment-1",
            output_text="Please provide the application directory.",
        )
        with patch('agent.run_managed_agent', return_value=response), \
             patch('agent.build_google_cloud_mcp_tools', return_value=[]), \
             patch('agent.get_input', side_effect=SystemExit(0)):
            with self.assertRaises(SystemExit):
                agent.main()

    @patch.dict(
        os.environ,
        {"GOOGLE_CLOUD_MCP_PROJECT": "test-project-123"},
    )
    def test_main_stops_after_recorded_deployment(self):
        calls = []

        def managed_agent_side_effect(prompt, instructions, tools, handlers, **kwargs):
            calls.append((prompt, instructions, tools))
            if "Senior DevOps" in instructions:
                agent.record_deployment(
                    project_id="test-project-123",
                    region="us-central1",
                    service_name="sample-service",
                    service_uri="https://sample-service.example.run.app",
                )
                output = "Deployment ready."
            else:
                output = "Please approve."
            return SimpleNamespace(
                id=f"interaction-{len(calls)}",
                environment_id=f"environment-{len(calls)}",
                output_text=output,
            )

        old_record = agent.DEPLOYMENT_RECORD
        try:
            with patch(
                "agent.run_managed_agent",
                side_effect=managed_agent_side_effect,
            ), patch(
                "agent.build_google_cloud_mcp_tools",
                return_value=[],
            ), patch(
                "agent.get_input",
                return_value="APPROVE",
            ):
                agent.main()

            self.assertEqual(len(calls), 2)
            self.assertIn("Senior DevOps", calls[1][1])
            self.assertEqual(
                agent.DEPLOYMENT_RECORD["service_name"],
                "sample-service",
            )
        finally:
            agent.DEPLOYMENT_RECORD = old_record

    @patch.dict(os.environ, {"GOOGLE_CLOUD_MCP_PROJECT": "control-project"})
    @patch('agent._gcloud_output', return_value="access-token")
    def test_build_google_cloud_mcp_tools(self, mock_gcloud_output):
        tools = agent.build_google_cloud_mcp_tools()

        self.assertEqual(
            [tool["name"] for tool in tools],
            [
                "google_cloud_run",
                "google_cloud_storage",
                "google_cloud_resource_manager",
            ],
        )
        self.assertEqual(
            tools[0]["headers"]["Authorization"],
            "Bearer access-token",
        )
        self.assertEqual(
            tools[0]["headers"]["x-goog-user-project"],
            "control-project",
        )
        self.assertEqual(
            tools[0]["allowed_tools"],
            [
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
        )
        mock_gcloud_output.assert_called_once_with(
            "auth", "application-default", "print-access-token"
        )

    @patch('agent.CLIENT')
    def test_managed_agent_executes_requested_tool(self, mock_client):
        function_call = SimpleNamespace(
            type="function_call",
            id="call-1",
            name="deploy",
            arguments={"project_id": "test-project"},
        )
        requires_action = SimpleNamespace(
            id="interaction-1",
            environment_id="environment-1",
            status="requires_action",
            steps=[function_call],
        )
        completed = SimpleNamespace(
            id="interaction-2",
            environment_id="environment-1",
            status="completed",
            steps=[],
            output_text="Deployment completed.",
        )
        mock_client.interactions.create.side_effect = [requires_action, completed]
        handler = MagicMock(return_value="deployed")

        result = agent.run_managed_agent(
            "Deploy now",
            "Use the deployment tool.",
            [{"type": "function", "name": "deploy", "parameters": {"type": "object"}}],
            {"deploy": handler},
        )

        self.assertEqual(result.output_text, "Deployment completed.")
        handler.assert_called_once_with(project_id="test-project")
        follow_up = mock_client.interactions.create.call_args_list[1].kwargs
        self.assertEqual(follow_up["agent"], agent.MANAGED_AGENT)
        self.assertEqual(follow_up["previous_interaction_id"], "interaction-1")
        self.assertEqual(follow_up["environment"], "environment-1")
        self.assertEqual(follow_up["input"][0]["type"], "function_result")
        self.assertTrue(follow_up["background"])
        self.assertTrue(follow_up["store"])

if __name__ == '__main__':
    unittest.main()

