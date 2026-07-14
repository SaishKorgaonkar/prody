import { Section, SectionHeading } from "./ui";

const pains = [
  {
    title: "Security before deploy",
    body: "Five ordered checks catch the mistakes that get vibe-coded apps hacked: secrets, data leaks, and attacker paths, before anything goes live.",
  },
  {
    title: "Any cloud, one flow",
    body: "GCP, AWS, or Azure. Same orchestrator, same security gate, same deployment registry. No console PhD required.",
  },
  {
    title: "Manage what you ship",
    body: "Deploy from IDE, forget in production? Prody keeps every session visible, so you can stop resources before they surprise you on the bill.",
  },
];

export function Problem() {
  return (
    <Section variant="stone">
      <SectionHeading
        label="Why Prody exists"
        title="The gap between working code and production"
        description="AI can build an app in an afternoon. Making it secure, deployed on the right cloud, and manageable still takes a team. Prody is that team."
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
