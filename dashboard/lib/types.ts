export type SessionPhase =
  | "intake"
  | "functional_gate"
  | "security_scan"
  | "architect"
  | "deploy"
  | "sre"
  | "complete"
  | "error";

// Which gate produced a `finding` / `gate` event or verdict.
export type GateType = "functional" | "security";

export type GateStatusValue = "PASS" | "PASS_WITH_WARNINGS" | "FAIL" | "ERROR";

// A single finding surfaced by either the functional or security gate.
export type Finding = {
  title: string;
  severity?: string;
  description?: string;
  [key: string]: unknown;
};

// Verdict badge payload carried by `gate` events and by the status
// endpoint's `gate_status` / `functional_gate_status` fields.
export type GateVerdict = {
  status: GateStatusValue;
  summary?: string;
  gate_type?: GateType;
  findings?: Finding[];
};

export type SessionEvent = {
  type: string;
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp?: string;
  // Fields carried by the live engine SSE envelope: { type, agent, message, data, t, seq, phase }.
  t?: number;
  seq?: number;
  phase?: string;
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
  // Security gate verdict (kept as `gate_status` for back-compat with the
  // original single-gate contract).
  gate_status?: GateVerdict | null;
  // Functional (does-it-work) gate verdict — new alongside gate_status.
  functional_gate_status?: GateVerdict | null;
};

export type StartSessionRequest = {
  source: "ide" | "dashboard";
  repo_url?: string;
  project_path?: string;
};

export type StartSessionResponse = {
  session_id: string;
};
