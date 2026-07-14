import { Section, SectionHeading } from "./ui";

const steps = [
  {
    n: "01",
    label: "Submit your app",
    body: "Start from Cursor, VS Code, Antigravity, the web dashboard, or `prody ship` in your terminal. Same orchestrator every time.",
  },
  {
    n: "02",
    label: "Five security checks",
    body: "Secrets, data flow, production readiness, deep logic, and an attacker review — in order, fail-closed.",
  },
  {
    n: "03",
    label: "Fix and retry",
    body: "If a check fails, Prody writes a structured fix guide for your coding agent. Patch, retry, repeat until the gate passes.",
  },
  {
    n: "04",
    label: "Pick your cloud",
    body: "GCP, AWS, or Azure. The architect agent designs infra for your stack and generates a diagram for review.",
  },
  {
    n: "05",
    label: "You approve",
    body: "Nothing deploys without sign-off. Review the plan and architecture image, then approve to continue.",
  },
  {
    n: "06",
    label: "Deploy & manage",
    body: "Prody provisions your cloud, returns a live URL, and adds the deployment to your registry — visible from every surface.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" variant="stone">
      <SectionHeading
        label="How it works"
        title="What happens after you start a session"
        description="Every path through Prody follows the same phase graph. Security always comes before deploy."
      />

      <div className="mt-12 divide-y divide-hairline rounded-2xl border border-hairline bg-canvas">
        {steps.map((step) => (
          <div
            key={step.n}
            className="grid gap-3 px-6 py-6 md:grid-cols-[64px_220px_1fr] md:items-center md:gap-6 md:px-8"
          >
            <span className="font-mono-label text-[14px] text-ink-muted">
              {step.n}
            </span>
            <h3 className="font-display text-[20px] leading-[1.3] text-ink md:text-[22px]">
              {step.label}
            </h3>
            <p className="text-[15px] leading-[1.55] text-ink-muted">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
