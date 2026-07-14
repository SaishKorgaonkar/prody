import type { ReactNode } from "react";
import { ScrollTabSection } from "./ScrollTabSection";

const checks = [
  "Secret leaks",
  "Data flow",
  "Prod readiness",
  "Logic audit",
  "Attacker view",
];

function DarkPanelShell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="hero-visual-grid-dark pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <p className="font-mono-label text-[11px] uppercase text-coral">{label}</p>
        {children}
      </div>
    </div>
  );
}

const platformTabs = [
  {
    id: "security",
    label: "Security",
    tagline: "Five checks, fail-closed",
    panel: (
      <DarkPanelShell label="Security gate">
        <div className="mt-4 space-y-2.5">
          {checks.map((c, i) => (
            <div
              key={c}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="text-[14px] text-white/90">{c}</span>
              <span
                className={`text-[12px] ${i < 4 ? "text-enterprise-green" : "text-coral"}`}
              >
                {i < 4 ? "PASS" : "running"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/50">
          Catch secrets, data leaks, and attacker paths before anything goes
          live. Deploy blocked until all checks pass.
        </p>
      </DarkPanelShell>
    ),
  },
  {
    id: "cloud",
    label: "Cloud",
    tagline: "GCP, AWS, or Azure",
    panel: (
      <DarkPanelShell label="Multi-cloud">
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { name: "Google Cloud", svc: "Cloud Run" },
            { name: "AWS", svc: "App Runner" },
            { name: "Azure", svc: "Container Apps" },
          ].map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-[13px] font-medium text-white">{c.name}</p>
              <p className="mt-1 text-[12px] text-white/45">{c.svc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/50">
          Cloud Run, App Runner, or Container Apps. Same pipeline at intake.
        </p>
      </DarkPanelShell>
    ),
  },
  {
    id: "surfaces",
    label: "Surfaces",
    tagline: "IDE, dashboard, CLI",
    panel: (
      <DarkPanelShell label="Three surfaces">
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { t: "IDE", s: "Cursor, VS Code", cmd: "Prody: Ship" },
            { t: "Dashboard", s: "Web session", cmd: "Live agent stream" },
            { t: "CLI", s: "Terminal", cmd: "prody ship ./app" },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-mono-label text-[11px] uppercase text-coral">
                {s.t}
              </p>
              <p className="mt-2 text-[14px] text-white">{s.s}</p>
              <code className="mt-3 block rounded-lg bg-black/40 px-3 py-2 text-[11px] text-white/70">
                {s.cmd}
              </code>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/50">
          Start where you work. Every session syncs to one registry.
        </p>
      </DarkPanelShell>
    ),
  },
  {
    id: "registry",
    label: "Registry",
    tagline: "Track every deploy",
    panel: (
      <DarkPanelShell label="Deployment registry">
        <ul className="mt-4 space-y-2">
          {[
            { n: "notes-api", c: "AWS", st: "Running" },
            { n: "demo-app", c: "GCP", st: "Healthy" },
            { n: "shop-beta", c: "Azure", st: "Stopped" },
          ].map((r) => (
            <li
              key={r.n}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-[14px] text-white">{r.n}</p>
                <p className="text-[11px] text-white/40">{r.c}</p>
              </div>
              <span
                className={
                  r.st === "Stopped"
                    ? "text-[12px] text-white/35"
                    : "text-[12px] text-enterprise-green"
                }
              >
                {r.st}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[14px] leading-relaxed text-white/50">
          See what is running and stop resources before cost surprises.
        </p>
      </DarkPanelShell>
    ),
  },
  {
    id: "models",
    label: "Models",
    tagline: "Bring your own",
    panel: (
      <DarkPanelShell label="Model providers">
        <div className="mt-4 space-y-2.5">
          {[
            { n: "Ollama", b: "Local", d: "Gemma on your machine" },
            { n: "OpenRouter", b: "Cloud", d: "Claude, GPT, Gemini with one key" },
            { n: "Gemini", b: "Managed", d: "Full deploy and MCP harness" },
          ].map((m) => (
            <div
              key={m.n}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div>
                <p className="text-[14px] text-white">{m.n}</p>
                <p className="text-[12px] text-white/45">{m.d}</p>
              </div>
              <span className="rounded-full border border-coral/40 bg-coral/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-coral">
                {m.b}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-white/50">
          Ollama locally, OpenRouter in the cloud, Gemini for managed deploy.
        </p>
      </DarkPanelShell>
    ),
  },
];

export function FeatureShowcase() {
  return (
    <ScrollTabSection
      sectionId="security"
      eyebrow="Platform"
      title="Everything you need to ship"
      subtitle="Security, cloud choice, surfaces, registry, and models."
      tabs={platformTabs}
      tabListLabel="Platform features"
    />
  );
}
