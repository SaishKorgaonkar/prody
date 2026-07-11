"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionStatus, subscribeSessionEvents } from "@/lib/api";
import { mockStatus } from "@/lib/mock";
import type { SessionEvent, SessionStatus } from "@/lib/types";
import { ApprovalPanel } from "@/components/ApprovalPanel";
import { DashboardNav } from "@/components/DashboardNav";
import { EventStream } from "@/components/EventStream";
import { ReadinessPanel } from "@/components/ReadinessPanel";

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

  useEffect(() => {
    const unsub = subscribeSessionEvents(sessionId, (event) => {
      setEvents((prev) => [...prev, event]);
      if (event.agent === "security") {
        setStatus((s) => ({ ...s, phase: "security_scan" }));
      }
      if (event.agent === "architect") {
        setStatus((s) => ({ ...s, phase: "architect", readiness_score: 87 }));
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
      if (event.agent === "devops") {
        setStatus((s) => ({ ...s, phase: "deploy" }));
      }
    });

    const poll = setInterval(async () => {
      const next = await getSessionStatus(sessionId);
      setStatus(next);
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
