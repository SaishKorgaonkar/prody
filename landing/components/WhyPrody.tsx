import { FilterChip, Section, SectionHeading } from "./ui";

const pillars = [
  {
    title: "Three surfaces, one brain",
    body: "IDE, dashboard, and CLI share the same orchestrator and deployment registry. Start anywhere; manage everywhere.",
    chip: "IDE + Web + CLI",
  },
  {
    title: "Your models, your choice",
    body: "Ollama for local privacy, OpenRouter for flexibility, Gemini for full managed deploy. Configure per role.",
    chip: "BYOM",
  },
  {
    title: "Real infrastructure",
    body: "Actual cloud provisioning on GCP, AWS, or Azure, not mockups. Prody executes, explains, and asks before critical actions.",
    chip: "Multi-cloud",
  },
  {
    title: "Fail-closed security",
    body: "Five checks before launch. No deploy on critical findings. Fix guides your agent can implement, not vague warnings.",
    chip: "5 checks",
  },
];

export function WhyPrody() {
  return (
    <Section id="why-prody" variant="stone">
      <SectionHeading
        label="Why Prody"
        title="Help when you need it, not another dashboard to learn"
        description="Prody does the engineering work, explains in plain language, and syncs every deploy to a registry you control."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {pillars.map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl border border-hairline bg-canvas p-6 transition-colors hover:border-coral/30 md:p-8"
          >
            <FilterChip>{item.chip}</FilterChip>
            <h3 className="font-display mt-4 text-[22px] leading-[1.25] text-ink">
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
