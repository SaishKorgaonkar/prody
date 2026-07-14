import { Section } from "./ui";

const audiences = [
  { title: "Solo developer", line: "Ship side projects to any cloud" },
  { title: "Founder", line: "Security and deploy without an ops hire" },
  { title: "AI-native teams", line: "Code fast. Ship with guardrails." },
];

const stats = [
  { n: "5", label: "security checks" },
  { n: "3", label: "clouds" },
  { n: "3", label: "surfaces" },
  { n: "1", label: "registry" },
];

export function BentoProof() {
  return (
    <Section id="why-prody" variant="stone" className="!py-16 md:!py-20">
      <div className="mb-10 max-w-[560px]">
        <p className="font-mono-label text-[14px] uppercase text-coral">
          Why Prody
        </p>
        <h2 className="font-display mt-3 text-[32px] leading-[1.12] tracking-[-0.48px] text-ink md:text-[40px]">
          Production clarity, not more dashboards
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-5">
        <div className="bento-tile md:col-span-3 md:row-span-2 rounded-[22px] border border-hairline bg-canvas p-8 md:p-10">
          <p className="font-mono-label text-[12px] uppercase text-ink-muted">
            Production readiness
          </p>
          <p className="font-display mt-4 text-[64px] leading-none tracking-[-2px] text-ink md:text-[72px]">
            87
            <span className="text-[24px] text-ink-muted">/100</span>
          </p>
          <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-ink-muted">
            Plain-language status on security, reliability, and cost. Built for
            founders and leads, not security auditors.
          </p>
          <div className="mt-8 space-y-2">
            {[
              { l: "Security", v: 92 },
              { l: "Reliability", v: 88 },
              { l: "Performance", v: 85 },
            ].map((d) => (
              <div key={d.l} className="flex items-center gap-3">
                <span className="w-24 text-[13px] text-ink-muted">{d.l}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone">
                  <div
                    className="h-full rounded-full bg-enterprise-green"
                    style={{ width: `${d.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {audiences.map((a, i) => (
          <div
            key={a.title}
            className={`bento-tile rounded-[22px] border border-hairline bg-canvas p-6 md:col-span-1 ${
              i === 0 ? "md:col-start-4" : ""
            }`}
          >
            <p className="font-mono-label text-[11px] uppercase text-coral">
              Built for
            </p>
            <h3 className="font-display mt-3 text-[18px] text-ink">{a.title}</h3>
            <p className="mt-1 text-[13px] text-ink-muted">{a.line}</p>
          </div>
        ))}

        <div className="bento-tile flex flex-wrap gap-6 rounded-[22px] border border-dashed border-coral/35 bg-coral/[0.04] p-6 md:col-span-3 md:flex-nowrap md:justify-between md:px-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-display text-[36px] leading-none text-coral">
                {s.n}
              </p>
              <p className="mt-1 text-[12px] uppercase tracking-wide text-ink-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
