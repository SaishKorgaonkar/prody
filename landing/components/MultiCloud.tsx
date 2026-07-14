import { FilterChip, Section, SectionHeading } from "./ui";

const clouds = [
  {
    id: "gcp",
    name: "Google Cloud",
    service: "Cloud Run",
    detail: "Serverless containers with MCP-native deploy for full autonomous provisioning.",
  },
  {
    id: "aws",
    name: "AWS",
    service: "App Runner",
    detail: "Container-from-source deploy with the same security gate and approval flow.",
  },
  {
    id: "azure",
    name: "Azure",
    service: "Container Apps",
    detail: "Scale-to-zero containers — one orchestrator, your choice of cloud.",
  },
];

export function MultiCloud() {
  return (
    <Section id="clouds" variant="white">
      <SectionHeading
        label="Multi-cloud"
        title="Deploy where your users are"
        description="Pick GCP, AWS, or Azure at intake. Prody's orchestrator handles the rest — same pipeline, same deployment registry, different cloud."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {clouds.map((cloud, i) => (
          <div
            key={cloud.id}
            className="rounded-2xl border border-hairline bg-stone p-8 transition-colors hover:border-action-blue/30"
          >
            <FilterChip active={i === 0}>{cloud.service}</FilterChip>
            <h3 className="font-display mt-5 text-[26px] tracking-[-0.32px] text-ink">
              {cloud.name}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
              {cloud.detail}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
