import { Section, SectionHeading } from "./ui";

const pains = [
  {
    title: "Secure deployments",
    body: "Exposed secrets, misconfigured APIs, and dependency vulnerabilities block production.",
  },
  {
    title: "Infrastructure planning",
    body: "Compute, networking, databases, and topology still require expertise most teams lack.",
  },
  {
    title: "Operating in production",
    body: "Monitoring, scaling, and incident response remain manual, even after AI made building easy.",
  },
];

export function Problem() {
  return (
    <Section variant="stone">
      <SectionHeading
        label="The problem"
        title="Building got easy. Operating didn't."
        description="Developers, founders, and Indian SMEs can ship apps fast, but production still demands DevOps, SRE, and security teams they can't afford."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {pains.map((pain) => (
          <div
            key={pain.title}
            className="rounded-2xl border border-hairline bg-canvas p-6 md:p-8"
          >
            <h3 className="font-display text-[22px] leading-[1.3] text-ink">
              {pain.title}
            </h3>
            <p className="mt-3 text-[16px] leading-[1.5] text-ink-muted">
              {pain.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
