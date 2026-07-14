import { ScrollTabSection } from "./ScrollTabSection";

const steps = [
  {
    id: "submit",
    label: "Submit",
    tagline: "Intake",
    title: "Submit your app",
    body: "Start from your IDE, the web dashboard, or the CLI. Prody detects your stack and prepares the project.",
  },
  {
    id: "security",
    label: "5 checks",
    tagline: "Security",
    title: "Five security checks",
    body: "Secrets, data flow, production readiness, logic audit, and attacker review. Fail-closed before deploy.",
  },
  {
    id: "fix",
    label: "Fix and retry",
    tagline: "Security",
    title: "Fix and retry",
    body: "If a check fails, Prody writes a structured fix guide in your repo. Patch, retry, repeat until the gate passes.",
  },
  {
    id: "architecture",
    label: "Architecture",
    tagline: "Architect",
    title: "Architecture plan",
    body: "Pick GCP, AWS, or Azure. The architect agent designs infra for your stack and generates a diagram.",
  },
  {
    id: "approve",
    label: "You approve",
    tagline: "Human gate",
    title: "You approve",
    body: "Review the plan and architecture. Nothing deploys without your sign-off.",
  },
  {
    id: "deploy",
    label: "Deploy",
    tagline: "DevOps + SRE",
    title: "Deploy and operate",
    body: "Prody provisions your cloud, returns a live URL, and adds the deployment to your registry.",
  },
];

function StepPanel({
  step,
  n,
}: {
  step: (typeof steps)[number];
  n: string;
}) {
  return (
    <div>
      <p className="font-mono-label text-[11px] uppercase text-coral">
        Step {n} · {step.tagline}
      </p>
      <h3 className="font-display mt-4 text-[28px] leading-tight text-white md:text-[32px]">
        {step.title}
      </h3>
      <p className="mt-4 text-[15px] leading-relaxed text-white/55">{step.body}</p>
    </div>
  );
}

const pipelineTabs = steps.map((step, i) => ({
  id: step.id,
  label: step.label,
  tagline: step.tagline,
  panel: <StepPanel step={step} n={String(i + 1).padStart(2, "0")} />,
}));

export function PipelineStory() {
  return (
    <ScrollTabSection
      sectionId="flow"
      theme="dark"
      eyebrow="How it works"
      title={
        <>
          From submit
          <br />
          <span className="text-white/40">to production</span>
        </>
      }
      subtitle="Security runs before deploy. One orchestrator, specialized agents."
      tabs={pipelineTabs}
      tabListLabel="Pipeline steps"
    />
  );
}
