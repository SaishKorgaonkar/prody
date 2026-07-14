import { FilterChip, Section, SectionHeading } from "./ui";

const agents = [
  {
    name: "Intake",
    role: "Detects stack, resolves repo or local path, prepares the project",
    chip: "Start",
  },
  {
    name: "Security",
    role: "Runs 5 ordered checks, from secrets through attacker review, and enforces the gate",
    chip: "5 checks",
  },
  {
    name: "Architect",
    role: "Designs cloud-native infra for GCP, AWS, or Azure and generates a diagram",
    chip: "Plan",
  },
  {
    name: "DevOps",
    role: "Deploys via MCP or cloud CLI and returns your production URL",
    chip: "Deploy",
  },
  {
    name: "SRE",
    role: "Health-checks the live service, readiness score, and registry handoff",
    chip: "Operate",
  },
];

export function AgentTeam() {
  return (
    <Section id="agents" variant="white">
      <SectionHeading
        label="Agent team"
        title="Who runs each phase"
        description="Specialized agents, one orchestrator. Sessions sync across IDE, dashboard, and CLI in real time."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-2xl border border-hairline bg-stone p-6"
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
