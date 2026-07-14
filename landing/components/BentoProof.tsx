import type { ReactNode } from "react";
import { Section, SectionHeading } from "./ui";

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

const dimensions = [
  { label: "Security", v: 92 },
  { label: "Reliability", v: 88 },
  { label: "Performance", v: 85 },
];

function BentoCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-canvas p-6 md:p-7 ${className}`}
    >
      <p className="font-mono-label text-[12px] uppercase text-coral">{label}</p>
      {children}
    </div>
  );
}

export function BentoProof() {
  return (
    <Section id="why-prody" variant="stone" className="!py-16 md:!py-20">
      <SectionHeading
        label="Why Prody"
        title="Production clarity, not more dashboards"
        description="Plain-language status on security, reliability, and cost, built for founders and leads, not security auditors."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:items-stretch">
        <BentoCard label="Production readiness" className="flex flex-col">
          <p className="font-display mt-4 text-[56px] leading-none tracking-[-2px] text-ink md:text-[64px]">
            87
            <span className="text-[22px] text-ink-muted">/100</span>
          </p>
          <p className="mt-4 max-w-[320px] text-[14px] leading-relaxed text-ink-muted">
            Overall readiness with actionable recommendations before you launch.
          </p>
          <div className="mt-auto space-y-2.5 border-t border-hairline pt-5">
            {dimensions.map((d) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="w-24 text-[13px] text-ink-muted">{d.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone">
                  <div
                    className="h-full rounded-full bg-enterprise-green"
                    style={{ width: `${d.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </BentoCard>

        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            {audiences.map((a) => (
              <BentoCard key={a.title} label="Built for">
                <h3 className="font-display mt-3 text-[17px] leading-snug text-ink">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">
                  {a.line}
                </p>
              </BentoCard>
            ))}
          </div>

          <BentoCard label="At a glance">
            <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-[32px] leading-none text-ink">
                    {s.n}
                  </p>
                  <p className="mt-1.5 text-[11px] uppercase tracking-wide text-ink-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </Section>
  );
}
