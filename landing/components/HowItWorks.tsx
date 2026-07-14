import { Section, SectionHeading } from "./ui";

const steps = [
  {
    n: "01",
    label: "Submit your app",
    body: "Start from Cursor, VS Code, Antigravity, the web dashboard, or `prody ship` in your terminal. Same orchestrator every time.",
  },
  {
    n: "02",
    label: "Security and fix loop",
    body: "Five ordered checks: secrets, data flow, production readiness, logic audit, and attacker review. Fail-closed. Prody writes a fix guide, you patch and retry until the gate passes.",
  },
  {
    n: "03",
    label: "Architecture and approval",
    body: "Pick GCP, AWS, or Azure. The architect agent designs infra for your stack. Review the plan and diagram. Nothing deploys without your sign-off.",
  },
  {
    n: "04",
    label: "Deploy and manage",
    body: "Prody provisions your cloud, returns a live URL, and adds the deployment to your registry, visible from IDE, dashboard, and CLI.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works" variant="stone" className="!py-16 md:!py-20">
      <SectionHeading
        label="How it works"
        title="What happens after you start a session"
        description="Every path through Prody follows the same phase graph. Security always comes before deploy."
      />

      <div className="mt-10 divide-y divide-hairline rounded-2xl border border-hairline bg-canvas">
        {steps.map((step) => (
          <div
            key={step.n}
            className="grid gap-3 px-6 py-5 md:grid-cols-[56px_200px_1fr] md:items-center md:gap-6 md:px-8 md:py-6"
          >
            <span className="font-mono-label text-[14px] text-ink-muted">
              {step.n}
            </span>
            <h3 className="font-display text-[19px] leading-[1.3] text-ink md:text-[20px]">
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
