import { Section, SectionHeading } from "./ui";

const audiences = [
  {
    title: "Solo developers",
    body: "Ship side projects to GCP without learning the console first.",
  },
  {
    title: "Startup founders",
    body: "Get security, deploy, and ops coverage without hiring infra staff.",
  },
  {
    title: "Small businesses",
    body: "Run production apps with an autonomous engineering layer on top.",
  },
];

export function UseCases() {
  return (
    <Section variant="white">
      <SectionHeading
        label="Built for"
        title="Teams that build fast and need to ship safely"
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
