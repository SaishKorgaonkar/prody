const steps = [
  {
    id: "submit",
    label: "Submit",
    detail: "IDE or GitHub link",
  },
  {
    id: "security",
    label: "Security",
    detail: "Scan & gate verdict",
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
    detail: "Live on GCP",
  },
];

export function ProductFlowStrip() {
  return (
    <div className="relative z-10 border-t border-white/10 bg-[#09090b]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8 md:px-10 lg:px-16">
        <p className="font-mono-label text-[11px] uppercase tracking-wider text-white/40">
          The flow
        </p>
        <ol className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-2 lg:gap-0">
          {steps.map((step, i) => (
            <li key={step.id} className="flex min-w-0 flex-1 items-start gap-2 lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/80">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-semibold text-white sm:text-[15px]">
                    {step.label}
                  </span>
                </div>
                <p className="mt-1 pl-8 text-[12px] leading-snug text-white/45 sm:pl-0 sm:mt-0.5 lg:pl-8 lg:mt-1">
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
        <h2 className="font-display mt-3 max-w-[640px] text-[32px] leading-[1.12] tracking-[-0.5px] text-ink md:text-[40px]">
          Same pipeline in Cursor, VS Code, Antigravity, or the web dashboard
        </h2>
        <p className="mt-4 max-w-[560px] text-[16px] leading-relaxed text-ink-muted">
          Prody does not jump straight to deploy. Security runs first. If something
          fails, you fix it in your editor and retry. Only when the gate passes
          does architecture and deployment begin.
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
              <h3 className="font-display mt-2 text-[20px] text-ink">{step.label}</h3>
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
