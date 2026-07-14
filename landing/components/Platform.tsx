import { Section, SectionHeading } from "./ui";

type PlatformItem = {
  tag: string;
  title: string;
  line: string;
};

function ItemCard({ item }: { item: PlatformItem }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-hairline bg-stone px-4 py-3.5">
      <p className="font-mono-label text-[11px] uppercase text-coral">{item.tag}</p>
      <p className="mt-2 text-[15px] font-medium leading-snug text-ink">
        {item.title}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-ink-muted">{item.line}</p>
    </div>
  );
}

function PlatformPanel({
  label,
  title,
  items,
  footer,
  itemGridClass,
}: {
  label: string;
  title: string;
  items: PlatformItem[];
  footer: string;
  itemGridClass: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-hairline bg-canvas p-6 md:p-7">
      <p className="font-mono-label text-[12px] uppercase text-coral">{label}</p>
      <h3 className="font-display mt-3 text-[22px] leading-tight text-ink">
        {title}
      </h3>

      <div className={`mt-5 grid flex-1 gap-3 ${itemGridClass}`}>
        {items.map((item) => (
          <ItemCard key={item.tag} item={item} />
        ))}
      </div>

      <p className="mt-5 border-t border-hairline pt-4 text-[13px] leading-relaxed text-ink-muted">
        {footer}
      </p>
    </div>
  );
}

const securityItems: PlatformItem[] = [
  {
    tag: "01",
    title: "Secrets",
    line: "Keys, env vars, client-side leaks.",
  },
  {
    tag: "02",
    title: "Data flow",
    line: "PII in logs, cookies, API responses.",
  },
  {
    tag: "03",
    title: "Prod readiness",
    line: "Headers, CORS, debug routes.",
  },
  {
    tag: "04",
    title: "Logic audit",
    line: "Auth, IDOR, injection, payments.",
  },
  {
    tag: "05",
    title: "Attacker view",
    line: "Bypass, escalation, exposed paths.",
  },
];

const cloudItems: PlatformItem[] = [
  {
    tag: "GCP",
    title: "Google Cloud",
    line: "Cloud Run, serverless containers.",
  },
  {
    tag: "AWS",
    title: "AWS",
    line: "App Runner, deploy from source.",
  },
  {
    tag: "Azure",
    title: "Azure",
    line: "Container Apps, scale to zero.",
  },
];

const surfaceItems: PlatformItem[] = [
  {
    tag: "IDE",
    title: "Cursor · VS Code",
    line: "Command palette, fix guides in repo.",
  },
  {
    tag: "Dashboard",
    title: "Web session",
    line: "Agent stream, security, teardown.",
  },
  {
    tag: "CLI",
    title: "prody ship",
    line: "Same registry from terminal.",
  },
];

export function Platform() {
  return (
    <Section id="platform" variant="stone" className="!py-16 md:!py-20">
      <SectionHeading
        label="Platform"
        title="Security first. Any cloud. Where you work."
        description="Five ordered checks before deploy. Pick GCP, AWS, or Azure. Start from IDE, dashboard, or CLI, with one registry for everything."
      />

      <div className="mt-10 space-y-5">
        <PlatformPanel
          label="Security gate"
          title="Five checks, fail-closed"
          items={securityItems}
          footer="Deploy blocked on critical findings. Prody writes fix guides your agent can implement, then you retry until the gate passes."
          itemGridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        />

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <PlatformPanel
            label="Multi-cloud"
            title="Deploy where your users are"
            items={cloudItems}
            footer="Same pipeline and registry at intake. Your cloud of choice, one orchestrator."
            itemGridClass="grid-cols-1 sm:grid-cols-3"
          />
          <PlatformPanel
            label="Three surfaces"
            title="One pipeline, everywhere"
            items={surfaceItems}
            footer="Every session syncs to the same deployment registry."
            itemGridClass="grid-cols-1 sm:grid-cols-3"
          />
        </div>
      </div>
    </Section>
  );
}
