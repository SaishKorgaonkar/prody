import { Section, SectionHeading } from "./ui";

const steps = [
  {
    n: "01",
    label: "Submit your app",
    body: "Open the dashboard with a GitHub URL or local path, or start from the IDE extension with your workspace.",
  },
  {
    n: "02",
    label: "Security scan",
    body: "Prody runs a pre-deploy security review. Findings stream live with severity, evidence, and remediation guidance.",
  },
  {
    n: "03",
    label: "Fix and retry",
    body: "If the gate fails, Prody writes a fix guide for your coding agent. You patch in the IDE, then retry until checks pass.",
  },
  {
    n: "04",
    label: "Architecture plan",
    body: "The architect agent inspects your app, designs GCP infrastructure, and generates a diagram for review.",
  },
  {
    n: "05",
    label: "You approve",
    body: "Nothing deploys without your sign-off. Review the plan and architecture image, then approve to continue.",
  },
  {
    n: "06",
    label: "Deploy and monitor",
    body: "DevOps provisions Cloud Run (and related services), returns your live URL, and SRE confirms production health.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" variant="white">
      <SectionHeading
        label="How it works"
        title="What happens after you click start"
        description="Every session follows the same pipeline. Security always comes before deploy."
      />

      <div className="mt-12 divide-y divide-hairline rounded-2xl border border-hairline bg-stone">
        {steps.map((step) => (
          <div
            key={step.n}
            className="grid gap-3 px-6 py-6 md:grid-cols-[64px_200px_1fr] md:items-center md:gap-6 md:px-8"
          >
            <span className="font-mono-label text-[14px] text-ink-muted">{step.n}</span>
            <h3 className="font-display text-[20px] leading-[1.3] text-ink md:text-[22px]">
              {step.label}
            </h3>
            <p className="text-[15px] leading-[1.55] text-ink-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
