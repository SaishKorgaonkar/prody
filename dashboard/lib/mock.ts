import type { SessionEvent, SessionStatus } from "./types";

export function mockStatus(sessionId: string): SessionStatus {
  return {
    session_id: sessionId,
    phase: "security_scan",
    readiness_score: 87,
    project_path: "demo/sample-app",
  };
}

export async function* mockEventStream(
  sessionId: string
): AsyncGenerator<SessionEvent> {
  const steps: SessionEvent[] = [
    {
      type: "phase_start",
      agent: "intake",
      message: "Session started from dashboard",
      data: { session_id: sessionId },
    },
    {
      type: "agent_log",
      agent: "security",
      message: "Starting grey-box security scan on local project...",
    },
    {
      type: "agent_log",
      agent: "security",
      message: "Recon: detected Flask app, 12 routes, 2 dependencies flagged",
    },
    {
      type: "agent_log",
      agent: "security",
      message: "Gate verdict: PASS_WITH_WARNINGS (medium findings only)",
    },
    {
      type: "phase_start",
      agent: "architect",
      message: "Planning Cloud Run deployment in asia-south1",
    },
    {
      type: "agent_log",
      agent: "architect",
      message: "Architecture: Cloud Run + Secret Manager + Cloud Build",
    },
    {
      type: "phase_start",
      agent: "devops",
      message: "Waiting for backend engine (Claude building C7)...",
      data: { mock: true },
    },
  ];

  for (const event of steps) {
    await new Promise((r) => setTimeout(r, 900));
    yield { ...event, timestamp: new Date().toISOString() };
  }
}
