import { Section, SectionHeading } from "./ui";

const audiences = [
  {
    title: "Solo developers",
    body: "Ship side projects to any cloud with security checks and teardown — no ops rabbit holes.",
  },
  {
    title: "Startup founders",
    body: "Security, multi-cloud deploy, and a deployment registry without hiring infra staff.",
  },
  {
    title: "Vibe coders",
    body: "AI builds the app; Prody handles the five checks, the cloud, and the cleanup.",
  },
];

export function UseCases() {
  return (
    <Section variant="white">
      <SectionHeading
        label="Built for"
        title="Builders who ship fast and need to stay safe"
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {audiences.map((item, i) => (
          <div
            key={item.title}
            className="relative rounded-2xl border border-hairline bg-stone p-6 md:p-8"
          >
            <span className="font-display text-[48px] leading-none text-ink/10">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-2 text-[20px] text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.55] text-ink-muted">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
