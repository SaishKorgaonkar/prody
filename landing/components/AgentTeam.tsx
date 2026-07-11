import { FilterChip, Section, SectionHeading } from "./ui";

const agents = [
  { name: "Orchestrator", role: "Routes work, manages approvals, keeps your session in sync", chip: "Routing" },
  { name: "Security", role: "Finds secrets and vulnerabilities, explains risks in plain English", chip: "On-device" },
  { name: "Architect", role: "Inspects your app and designs the right cloud architecture", chip: "Planning" },
  { name: "DevOps", role: "Provisions resources and deploys with secure defaults", chip: "Deploy" },
  { name: "SRE / Ops", role: "Monitors live services and scales when traffic spikes", chip: "Operations" },
];

export function AgentTeam() {
  return (
    <Section id="agents" variant="stone">
      <SectionHeading
        label="Agent team"
        title="Five helpers when you're stuck"
        description="Each agent handles one part of the last mile, so you're never alone in the cloud console."
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
