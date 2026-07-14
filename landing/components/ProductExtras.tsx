import { Card, Section } from "./ui";

const providers = [
  {
    name: "Ollama",
    badge: "Local",
    body: "Gate summaries on your machine. Privacy-first narration.",
  },
  {
    name: "OpenRouter",
    badge: "Cloud",
    body: "Claude, GPT, Gemini with one key for agents and planning.",
  },
  {
    name: "Gemini",
    badge: "Managed",
    body: "Full deploy harness with MCP and autonomous architecture.",
  },
];

export function ProductExtras() {
  return (
    <Section id="extras" variant="white" className="!py-16 md:!py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
        <div>
          <p className="font-mono-label text-[14px] uppercase text-coral">
            Deployment registry
          </p>
          <h2 className="font-display mt-3 text-[32px] leading-[1.12] tracking-[-0.48px] text-ink md:text-[36px]">
            Never lose track of what&apos;s running
          </h2>
          <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-ink-muted">
            Ship from IDE, dashboard, or CLI. Every session lands in one list.
            Teardown cloud resources before they surprise you on the bill.
          </p>

          <div className="mt-8 rounded-2xl border border-hairline bg-stone p-5 md:p-6">
            <p className="font-mono-label text-[11px] uppercase text-ink-muted">
              My deployments
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                { name: "notes-api", cloud: "AWS", status: "Running" },
                { name: "demo-app", cloud: "GCP", status: "Healthy" },
                { name: "shop-beta", cloud: "Azure", status: "Stopped" },
              ].map((row) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between rounded-xl border border-hairline bg-canvas px-4 py-3"
                >
                  <div>
                    <p className="text-[14px] font-medium text-ink">{row.name}</p>
                    <p className="text-[12px] text-ink-muted">{row.cloud}</p>
                  </div>
                  <span
                    className={
                      row.status === "Stopped"
                        ? "text-[12px] text-ink-muted"
                        : "text-[12px] text-enterprise-green"
                    }
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="font-mono-label text-[14px] uppercase text-coral">
            Bring your own model
          </p>
          <h2 className="font-display mt-3 text-[32px] leading-[1.12] tracking-[-0.48px] text-ink md:text-[36px]">
            Your models, your rules
          </h2>
          <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-ink-muted">
            Configure models per role: local narration, cloud agents, or full
            managed deploy.
          </p>

          <div className="mt-8 space-y-3">
            {providers.map((p) => (
              <Card key={p.name} className="!p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-[20px] text-ink">{p.name}</h3>
                  <span className="rounded-full border border-coral/40 bg-coral/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-coral">
                    {p.badge}
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                  {p.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
