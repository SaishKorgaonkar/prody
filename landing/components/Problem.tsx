import { Section, SectionHeading } from "./ui";

const pains = [
  {
    title: "Secure deployments",
    body: "Secrets, bad configs, and vulnerable deps stop you right before launch.",
  },
  {
    title: "Infrastructure planning",
    body: "You shouldn't need a cloud architect just to pick compute, networking, and a database.",
  },
  {
    title: "Operating in production",
    body: "After deploy, monitoring and scaling still feel like a second job nobody signed up for.",
  },
];

export function Problem() {
  return (
    <Section variant="stone">
      <SectionHeading
        label="Sound familiar?"
        title="You built it. Now you're stuck."
        description="The code works on your machine. Production asks for security, infra, and someone to keep it running. That's where most teams get stuck, and where Prody steps in."
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
