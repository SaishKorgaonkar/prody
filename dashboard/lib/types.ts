export type SessionPhase =
  | "intake"
  | "security_scan"
  | "architect"
  | "deploy"
  | "sre"
  | "complete"
  | "error";

export type SessionEvent = {
  type: string;
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: string;
};

export type PendingApproval = {
  step_id: string;
  phase?: string;
  description: string;
  image_url?: string | null;
  architecture?: Record<string, unknown>;
};

export type SessionStatus = {
  session_id: string;
  phase: SessionPhase;
  status?: string;
  readiness_score?: number;
  deploy_url?: string;
  pending_approval?: PendingApproval | null;
  project_path?: string;
  repo_url?: string;
};

export type StartSessionRequest = {
  source: "ide" | "dashboard";
  repo_url?: string;
  project_path?: string;
};

export type StartSessionResponse = {
  session_id: string;
};
