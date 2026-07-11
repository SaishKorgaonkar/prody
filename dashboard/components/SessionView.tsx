"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionStatus, subscribeSessionEvents } from "@/lib/api";
import { mockStatus } from "@/lib/mock";
import type {
  Finding,
  GateVerdict,
  SessionEvent,
  SessionPhase,
  SessionStatus,
} from "@/lib/types";
import { ApprovalPanel } from "@/components/ApprovalPanel";
import { DashboardNav } from "@/components/DashboardNav";
import { EventStream } from "@/components/EventStream";
import { GatePanel } from "@/components/GatePanel";
import { ReadinessPanel } from "@/components/ReadinessPanel";

const KNOWN_PHASES: SessionPhase[] = [
  "intake",
  "functional_gate",
  "security_scan",
  "architect",
  "deploy",
  "sre",
  "complete",
  "error",
];

function isSessionPhase(value: unknown): value is SessionPhase {
  return (
    typeof value === "string" &&
    (KNOWN_PHASES as string[]).includes(value)
  );
}

function toGateVerdict(
  data: Record<string, unknown> | undefined
): GateVerdict | null {
  if (!data || typeof data.status !== "string") return null;
  return {
    status: data.status as GateVerdict["status"],
    summary: typeof data.summary === "string" ? data.summary : undefined,
    gate_type:
      data.gate_type === "functional" || data.gate_type === "security"
        ? data.gate_type
        : undefined,
  };
}

function toFinding(data: Record<string, unknown> | undefined): Finding | null {
  if (!data || typeof data.title !== "string") return null;
  return { ...data, title: data.title } as Finding;
}

export function SessionView({
  sessionId,
  mock = false,
}: {
  sessionId: string;
  mock?: boolean;
}) {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [status, setStatus] = useState<SessionStatus>(
    mock ? mockStatus(sessionId) : { session_id: sessionId, phase: "intake" }
  );
  const [functionalGate, setFunctionalGate] = useState<GateVerdict | null>(
    null
  );
  const [securityGate, setSecurityGate] = useState<GateVerdict | null>(null);
  const [functionalFindings, setFunctionalFindings] = useState<Finding[]>([]);
  const [securityFindings, setSecurityFindings] = useState<Finding[]>([]);

  useEffect(() => {
    const unsub = subscribeSessionEvents(sessionId, (event) => {
      setEvents((prev) => [...prev, event]);

      // Prefer the explicit phase carried by the event envelope / phase
      // events; fall back to the legacy per-agent heuristic so older event
      // shapes (and the local mock stream) keep working unchanged.
      const explicitPhase =
        (event.type === "phase_start" || event.type === "phase_done") &&
        (isSessionPhase(event.phase)
          ? event.phase
          : isSessionPhase(event.data?.phase)
            ? (event.data?.phase as SessionPhase)
            : undefined);

      if (explicitPhase) {
        setStatus((s) => ({ ...s, phase: explicitPhase }));
      } else if (event.agent === "functional") {
        setStatus((s) => ({ ...s, phase: "functional_gate" }));
      } else if (event.agent === "security") {
        setStatus((s) => ({ ...s, phase: "security_scan" }));
      } else if (event.agent === "architect") {
        setStatus((s) => ({ ...s, phase: "architect", readiness_score: 87 }));
      } else if (event.agent === "devops") {
        setStatus((s) => ({ ...s, phase: "deploy" }));
      }

      if (event.type === "finding") {
        const finding = toFinding(event.data);
        if (finding) {
          if (event.agent === "functional") {
            setFunctionalFindings((prev) => [...prev, finding]);
          } else {
            setSecurityFindings((prev) => [...prev, finding]);
          }
        }
      }

      if (event.type === "gate") {
        const verdict = toGateVerdict(event.data);
        if (verdict) {
          const gateType =
            verdict.gate_type ??
            (event.agent === "functional" ? "functional" : "security");
          if (gateType === "functional") {
            setFunctionalGate(verdict);
          } else {
            setSecurityGate(verdict);
          }
        }
      }

      if (event.type === "approval_required" && event.data) {
        setStatus((s) => ({
          ...s,
          status: "awaiting_approval",
          pending_approval: event.data as SessionStatus["pending_approval"],
        }));
      }
      if (event.type === "approved") {
        setStatus((s) => ({
          ...s,
          status: "running",
          pending_approval: null,
        }));
      }
    });

    const poll = setInterval(async () => {
      const next = await getSessionStatus(sessionId);
      setStatus(next);
      if (next.functional_gate_status) {
        setFunctionalGate(next.functional_gate_status);
      }
      if (next.gate_status) {
        setSecurityGate(next.gate_status);
      }
    }, 5000);

    return () => {
      unsub();
      clearInterval(poll);
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-canvas">
      <DashboardNav />
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono-label text-[12px] uppercase text-coral">
              Live session
            </p>
            <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.5px] text-ink sm:text-[28px]">
              {sessionId}
            </h1>
            {mock && (
              <p className="mt-1 text-[13px] text-ink-muted">
                Mock mode (backend not ready). Claude: ship C7 to connect live SSE.
              </p>
            )}
          </div>
          <Link
            href="/"
            className="text-[14px] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            New session
          </Link>
        </div>

        <div className="mb-6">
          <GatePanel
            functional={functionalGate}
            security={securityGate}
            functionalFindings={functionalFindings}
            securityFindings={securityFindings}
          />
        </div>

        {status.pending_approval && !mock && (
          <div className="mb-6">
            <ApprovalPanel
              sessionId={sessionId}
              pending={status.pending_approval}
              onResolved={() => {
                void getSessionStatus(sessionId).then(setStatus);
              }}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <EventStream events={events} />
          <ReadinessPanel status={status} />
        </div>
      </main>
    </div>
  );
}
