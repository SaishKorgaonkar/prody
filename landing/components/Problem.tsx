import { Section, SectionHeading } from "./ui";

const pains = [
  {
    title: "Security before deploy",
    body: "Shipping without a scan is how secrets and vulns reach production. Prody gates deploy on a real review.",
  },
  {
    title: "Architecture without a degree",
    body: "Cloud Run, IAM, networking — Prody designs it, shows you a diagram, and waits for approval.",
  },
  {
    title: "Ops after go-live",
    body: "A live URL is not the finish line. SRE watches health and explains readiness in plain language.",
  },
];

export function Problem() {
  return (
    <Section variant="stone">
      <SectionHeading
        label="Why Prody exists"
        title="The gap between working code and production"
        description="You can build an app in an afternoon. Making it secure, deployed, and operable still takes a team. Prody is that team."
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
