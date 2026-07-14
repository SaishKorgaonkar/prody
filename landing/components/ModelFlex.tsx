import { Card, Section, SectionHeading } from "./ui";

const providers = [
  {
    name: "Ollama",
    badge: "Local",
    headline: "Privacy-first narration",
    body: "Run Gemma or Llama on your machine. Gate summaries and finding explanations never leave your laptop.",
  },
  {
    name: "OpenRouter",
    badge: "One key",
    headline: "100+ models",
    body: "Connect once, pick Claude, GPT, Gemini, or open-weights models for security agents and planning.",
  },
  {
    name: "Gemini",
    badge: "Full power",
    headline: "Managed deploy",
    body: "Unlock autonomous architecture, MCP deploy, and the complete agent harness when you need it.",
  },
];

export function ModelFlex() {
  return (
    <Section id="models" variant="stone">
      <SectionHeading
        label="Bring your own model"
        title="Your models, your rules"
        description="Configure models per role: local narration, cloud agents, or full managed deploy. Prody recommends defaults; you stay in control."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {providers.map((p) => (
          <Card key={p.name} className="hover:border-coral/25 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-[22px] text-ink">{p.name}</h3>
              <span className="rounded-full border border-coral/40 bg-coral/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-coral">
                {p.badge}
              </span>
            </div>
            <p className="mt-3 text-[15px] font-medium text-ink">{p.headline}</p>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              {p.body}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
