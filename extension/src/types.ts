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

export type GateVerdict = {
  status: string;
  summary?: Record<string, number>;
  executive_summary?: string;
};

export type SessionSnapshot = {
  sessionId: string;
  phase: string;
  status: string;
  findings: ProdyFinding[];
  resolvedFindings: ProdyFinding[];
  gate: GateVerdict | null;
  logs: ProdyEvent[];
  deployUrl?: string;
  readinessScore?: number;
  pendingApproval?: {
    step_id: string;
    description: string;
    image_url?: string | null;
  };
  blocked: boolean;
  fixesDocPath?: string;
};
