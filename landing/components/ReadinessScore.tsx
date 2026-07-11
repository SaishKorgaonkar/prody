import { MonoLabel, Section, SectionHeading } from "./ui";

const dimensions = [
  { label: "Security", value: "Ready", pct: 92 },
  { label: "Reliability", value: "Ready", pct: 88 },
  { label: "Performance", value: "Good", pct: 85 },
  { label: "Backup", value: "Planned", pct: 70 },
  { label: "Scalability", value: "Auto-scale", pct: 90 },
  { label: "Est. monthly cost", value: "~₹2,400", pct: null },
];

export function ReadinessScore() {
  return (
    <Section variant="white">
      <SectionHeading
        label="Production readiness"
        title="Business language, not audit reports"
        description="Instead of CVE IDs and port numbers, get answers founders and SMEs actually understand."
      />

      <div className="mt-12 rounded-[22px] border border-hairline bg-stone p-8 md:p-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <MonoLabel>Overall readiness</MonoLabel>
            <p className="font-display mt-3 text-[56px] leading-[1] tracking-[-1px] text-ink md:text-[60px]">
              87<span className="text-[24px] text-ink-muted">/100</span>
            </p>
            <p className="mt-3 max-w-[280px] text-[16px] leading-[1.5] text-ink-muted">
              Ready for launch with minor backup improvements recommended.
            </p>
          </div>

          <div className="w-full max-w-lg divide-y divide-hairline rounded-xl border border-hairline bg-canvas">
            {dimensions.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <span className="text-[14px] text-ink">{d.label}</span>
                <div className="flex items-center gap-4">
                  {d.pct !== null && (
                    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-stone sm:block">
                      <div
                        className="h-full rounded-full bg-enterprise-green"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  )}
                  <span className="min-w-[80px] text-right text-[14px] font-medium text-action-blue">
                    {d.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
