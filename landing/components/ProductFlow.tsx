const steps = [
  {
    id: "submit",
    label: "Submit",
    detail: "IDE, CLI, or dashboard",
  },
  {
    id: "security",
    label: "5 checks",
    detail: "Secrets to attacker review",
  },
  {
    id: "fix",
    label: "Fix & retry",
    detail: "Agent-ready fix guide",
  },
  {
    id: "plan",
    label: "Architecture",
    detail: "Plan + diagram",
  },
  {
    id: "approve",
    label: "You approve",
    detail: "Human gate",
  },
  {
    id: "deploy",
    label: "Deploy",
    detail: "GCP, AWS, Azure",
  },
];

export function ProductFlowStrip() {
  return (
    <div className="relative z-10 border-t border-white/10 bg-[#09090b]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:px-16">
        <p className="font-mono-label text-[11px] uppercase tracking-wider text-white/40">
          The pipeline
        </p>
        <ol className="pipeline-scroll mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:flex lg:flex-row lg:items-start lg:gap-2">
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="flex w-[min(72vw,240px)] shrink-0 snap-start flex-col sm:w-auto sm:min-w-0 sm:flex-1 lg:flex-row lg:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/80">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-white sm:text-[14px] lg:text-[15px]">
                    {step.label}
                  </span>
                </div>
                <p className="mt-1 pl-8 text-[11px] leading-snug text-white/45 sm:text-[12px]">
                  {step.detail}
                </p>
              </div>
              {i < steps.length - 1 && (
                <span
                  className="hidden shrink-0 px-1 text-white/25 lg:inline"
                  aria-hidden
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function ProductFlowSection() {
  return (
    <section id="flow" className="border-b border-hairline bg-stone py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10 lg:px-16">
        <p className="font-mono-label text-[12px] uppercase text-coral">
          End-to-end
        </p>
        <h2 className="font-display mt-3 max-w-[720px] text-[32px] leading-[1.12] tracking-[-0.5px] text-ink md:text-[40px]">
          One orchestrator. IDE, dashboard, and CLI, same session, same
          deployment registry.
        </h2>
        <p className="mt-4 max-w-[600px] text-[16px] leading-relaxed text-ink-muted">
          Prody never skips security. Five ordered checks run before architecture
          or deploy. Fail the gate, fix in your editor, retry. Pass, and only
          then does your cloud of choice enter the picture.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="rounded-2xl border border-hairline bg-canvas p-6"
            >
              <span className="font-mono-label text-[12px] text-ink-muted">
                Step {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-2 text-[20px] text-ink">
                {step.label}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
