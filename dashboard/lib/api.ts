import { API_BASE } from "./config";
import { mockEventStream, mockStatus } from "./mock";
import type {
  SessionEvent,
  SessionStatus,
  StartSessionRequest,
  StartSessionResponse,
} from "./types";

export async function startSession(
  body: StartSessionRequest
): Promise<StartSessionResponse> {
  const res = await fetch(`${API_BASE}/api/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Backend unavailable (${res.status})`);
  }

  return res.json();
}

export async function getSessionStatus(
  sessionId: string
): Promise<SessionStatus> {
  const res = await fetch(`${API_BASE}/api/session/${sessionId}/status`);

  if (!res.ok) {
    return mockStatus(sessionId);
  }

  return res.json();
}

export function subscribeSessionEvents(
  sessionId: string,
  onEvent: (event: SessionEvent) => void,
  onError?: (err: Error) => void
): () => void {
  let closed = false;
  let source: EventSource | null = null;

  const connect = () => {
    source = new EventSource(`${API_BASE}/api/session/${sessionId}/events`);

    source.onmessage = (msg) => {
      try {
        onEvent(JSON.parse(msg.data) as SessionEvent);
      } catch {
        onEvent({ type: "raw", message: msg.data });
      }
    };

    source.onerror = () => {
      source?.close();
      if (!closed) {
        void runMock();
      }
    };
  };

  const runMock = async () => {
    try {
      for await (const event of mockEventStream(sessionId)) {
        if (closed) break;
        onEvent(event);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error("Stream failed"));
    }
  };

  try {
    connect();
  } catch {
    void runMock();
  }

  return () => {
    closed = true;
    source?.close();
  };
}

export async function approveStep(
  sessionId: string,
  stepId: string,
  approved = true
): Promise<void> {
  await fetch(`${API_BASE}/api/session/${sessionId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step_id: stepId, approved }),
  });
}
