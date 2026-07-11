export type ProdyFinding = {
  id?: string;
  title: string;
  severity: string;
  confidence?: string;
  source?: string;
  cwe?: string;
  evidence?: string;
  remediation?: string;
  location?: string;
};

export type ProdyEvent = {
  type: string;
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
  phase?: string;
  t?: number;
  seq?: number;
};

/** Which gate a `gate`/`finding`/`error` event belongs to. Mirrors the
 * engine's `data.gate_type` on `gate` events and `agent` ("functional" |
 * "security") on `finding`/`error` events. */
export type GateType = "functional" | "security";

export type GateVerdict = {
  status: string;
  summary?: Record<string, number>;
  executive_summary?: string;
};

export type PendingApproval = {
  step_id: string;
  description: string;
  image_url?: string | null;
};

export type SessionSnapshot = {
  sessionId: string;
  phase: string;
  status: string;
  /** Security-gate findings (agent: "security"). Kept as `findings`/`gate`
   * for backward compatibility with the pre-functional-gate contract. */
  findings: ProdyFinding[];
  resolvedFindings: ProdyFinding[];
  gate: GateVerdict | null;
  /** Functional-gate ("does it work?") findings and verdict — new phase that
   * now runs before security_scan. */
  functionalFindings: ProdyFinding[];
  resolvedFunctionalFindings: ProdyFinding[];
  functionalGate: GateVerdict | null;
  logs: ProdyEvent[];
  deployUrl?: string;
  readinessScore?: number;
  pendingApproval?: PendingApproval;
  blocked: boolean;
  /** Which gate caused `blocked` — drives the sidebar's messaging. */
  blockedBy?: GateType;
  fixesDocPath?: string;
};
