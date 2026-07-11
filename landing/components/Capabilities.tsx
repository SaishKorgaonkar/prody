import { ButtonSecondary, Section, SectionHeading } from "./ui";

const capabilities = [
  { title: "Secure code validation", body: "Secrets, insecure APIs, dependency vulns, before deploy." },
  { title: "Infrastructure planning", body: "Compute, networking, DB, storage, topology for your app." },
  { title: "Intelligent deployment", body: "Secure defaults, minimal config, real gcloud execution." },
  { title: "Runtime security", body: "Continuous monitoring for threats in production." },
  { title: "Autonomous operations", body: "Health checks, restarts, scaling, recovery." },
  { title: "Infrastructure intelligence", body: "\"What changed?\" \"Which deploy caused this?\"" },
  { title: "Cost optimization", body: "Analyze spend, balance performance and availability." },
  { title: "Production readiness", body: "Security, reliability, performance, backup, scalability, cost." },
];

export function Capabilities() {
  return (
    <Section id="capabilities" variant="white">
      <SectionHeading
        label="Capabilities"
        title="Everything an engineering team does"
        description="Autonomous execution, not suggestions. Business language, not audit reports."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap) => (
          <div
            key={cap.title}
            className="rounded-2xl border border-hairline bg-stone p-6"
          >
            <h3 className="text-[16px] font-medium leading-[1.35] text-ink">
              {cap.title}
            </h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-ink-muted">{cap.body}</p>
            <ButtonSecondary href="#how-it-works" className="mt-4 text-[13px]">
              Learn more
            </ButtonSecondary>
          </div>
        ))}
      </div>
    </Section>
  );
}
