"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/config";
import { approveStep } from "@/lib/api";
import type { PendingApproval } from "@/lib/types";

export function ApprovalPanel({
  sessionId,
  pending,
  onResolved,
}: {
  sessionId: string;
  pending: PendingApproval;
  onResolved?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const imageSrc = pending.image_url
    ? `${API_BASE}${pending.image_url}`
    : null;
  const approveLabel =
    pending.phase === "deploy" ? "Approve & deploy" : "Approve & continue";

  async function decide(approved: boolean) {
    setBusy(true);
    try {
      await approveStep(sessionId, pending.step_id, approved);
      onResolved?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-coral/30 bg-stone p-5 sm:p-6">
      <p className="font-mono-label text-[12px] uppercase text-coral">
        Approval required{pending.phase ? ` · ${pending.phase}` : ""}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">
        {pending.description}
      </p>
      {imageSrc && (
        <div className="mt-4 overflow-hidden rounded-xl border border-hairline bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Proposed GCP architecture"
            className="max-h-[360px] w-full object-contain"
          />
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide(true)}
          className="rounded-full bg-enterprise-green px-5 py-2.5 text-[14px] font-medium text-white disabled:opacity-50"
        >
          {approveLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide(false)}
          className="rounded-full border border-hairline px-5 py-2.5 text-[14px] text-ink-muted disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
