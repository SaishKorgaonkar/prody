import { FilterChip, Section, SectionHeading } from "./ui";

const agents = [
  {
    name: "Intake",
    role: "Detects stack and prepares your project for the pipeline",
    chip: "Start",
  },
  {
    name: "Security",
    role: "Scans for vulnerabilities, emits findings, and enforces the gate",
    chip: "Gate",
  },
  {
    name: "Architect",
    role: "Designs GCP infrastructure and generates an architecture diagram",
    chip: "Plan",
  },
  {
    name: "DevOps",
    role: "Deploys to Cloud Run via MCP and returns your production URL",
    chip: "Deploy",
  },
  {
    name: "SRE",
    role: "Health-checks the live service and hands off monitoring context",
    chip: "Operate",
  },
];

export function AgentTeam() {
  return (
    <Section id="agents" variant="stone">
      <SectionHeading
        label="Agent team"
        title="Who runs each step"
        description="Specialized agents handle one phase each. The orchestrator keeps the session in sync across IDE and web."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-2xl border border-hairline bg-canvas p-6"
          >
            <FilterChip>{agent.chip}</FilterChip>
            <h3 className="font-display mt-4 text-[22px] leading-[1.3] text-ink">
              {agent.name}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">
              {agent.role}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
