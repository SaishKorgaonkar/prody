import type { SessionStatus } from "@/lib/types";
import { PhaseStepper } from "./PhaseStepper";

export function ReadinessPanel({ status }: { status: SessionStatus }) {
  const score = status.readiness_score ?? 0;

  return (
    <div className="rounded-2xl border border-hairline bg-stone p-5 sm:p-6">
      <p className="font-mono-label text-[12px] uppercase text-ink-muted">
        Production readiness
      </p>
      <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-1px] text-ink">
        {score}
        <span className="text-[18px] text-ink-muted">/100</span>
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-enterprise-green transition-all"
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {status.deploy_url && (
        <a
          href={status.deploy_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-[14px] font-medium text-action-blue underline-offset-2 hover:underline"
        >
          {status.deploy_url}
        </a>
      )}
      <div className="mt-5 border-t border-hairline pt-4">
        <PhaseStepper current={status.phase} />
      </div>
    </div>
  );
}
