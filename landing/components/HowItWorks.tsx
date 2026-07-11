import { Section, SectionHeading } from "./ui";

const steps = [
  { n: "01", label: "Detect", body: "Security scans for secrets, vulns, and misconfigurations." },
  { n: "02", label: "Fix", body: "Issues explained in plain language and patched autonomously." },
  { n: "03", label: "Validate", body: "Re-scan confirms readiness. Score updates in real time." },
  { n: "04", label: "Deploy", body: "DevOps provisions GCP and deploys with secure defaults." },
  { n: "05", label: "Monitor", body: "SRE watches your live service in the same GCP project." },
  { n: "06", label: "Scale", body: "Autoscale on traffic. You never open the cloud console." },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" variant="stone">
      <SectionHeading
        label="How it works"
        title="From code to production in one flow"
      />

      <div className="mt-12 divide-y divide-hairline rounded-2xl border border-hairline bg-canvas">
        {steps.map((step) => (
          <div
            key={step.n}
            className="grid gap-3 px-6 py-6 md:grid-cols-[64px_180px_1fr] md:items-center md:gap-6 md:px-8"
          >
            <span className="font-mono-label text-[14px] text-ink-muted">{step.n}</span>
            <h3 className="font-display text-[20px] leading-[1.3] text-ink md:text-[22px]">
              {step.label}
            </h3>
            <p className="text-[15px] leading-[1.5] text-ink-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
