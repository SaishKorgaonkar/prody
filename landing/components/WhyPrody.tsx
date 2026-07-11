import { FilterChip, Section, SectionHeading } from "./ui";

const pillars = [
  {
    title: "Works where you code",
    body: "Start in your IDE or paste a GitHub link. Same engine, same session, no context switching.",
    chip: "IDE + Web",
  },
  {
    title: "Private by default",
    body: "Security scans run on your machine. Sensitive code never leaves your environment unless you deploy.",
    chip: "On-device",
  },
  {
    title: "Real infrastructure",
    body: "Actual cloud provisioning and deploys, not mockups. Prody executes, explains, and asks before critical actions.",
    chip: "Production",
  },
  {
    title: "Always watching",
    body: "After deploy, Prody monitors health and scales on traffic in your cloud project, autonomously.",
    chip: "24/7 ops",
  },
];

export function WhyPrody() {
  return (
    <Section id="why-prody" variant="stone">
      <SectionHeading
        label="Why Prody"
        title="Engineering work, not another dashboard"
        description="Prody is an autonomous team that does the work: scans, plans, deploys, and operates, in language you actually understand."
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
