import { DASHBOARD_URL } from "@/lib/config";
import { ButtonPrimary, ButtonSecondary, FilterChip, Section, SectionHeading } from "./ui";

const surfaces = [
  {
    id: "extension",
    chip: "IDE Extension",
    title: "Start in your editor",
    subtitle: "Cursor · VS Code · Antigravity",
    body: "Run Prody from the command palette. Security findings appear in the sidebar; fix guides land in your repo for your agent to implement.",
    bullets: [
      "Security loop: scan → fix guide → retry",
      "Same session continues on the web dashboard",
      "Approve architecture without leaving the IDE",
    ],
    cta: "Connect Extension",
    ctaHref: "#extension",
  },
  {
    id: "dashboard",
    chip: "Web Dashboard",
    title: "Start with a GitHub link",
    subtitle: "GitHub · Local path",
    body: "Paste a repo or project path and watch the agent team work live: security, plan, approval gate, deploy URL.",
    bullets: [
      "Live SSE event stream per session",
      "Architecture approval with diagram",
      "Production readiness score + live URL",
    ],
    cta: "Open Dashboard",
    ctaHref: DASHBOARD_URL,
  },
];

export function TwoSurfaces() {
  return (
    <Section id="surfaces" variant="white">
      <SectionHeading
        label="Where to start"
        title="Pick your entry point"
        description="One engine powers both surfaces. The pipeline is identical either way."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {surfaces.map((s) => (
          <div
            key={s.id}
            id={s.id}
            className="rounded-2xl border border-hairline bg-stone p-8 md:p-10"
          >
            <FilterChip active={s.id === "dashboard"}>{s.chip}</FilterChip>
            <h3 className="font-display mt-5 text-[28px] leading-[1.2] tracking-[-0.32px] text-ink md:text-[32px]">
              {s.title}
            </h3>
            <p className="mt-1 text-[14px] text-ink-muted">{s.subtitle}</p>
            <p className="mt-4 text-[16px] leading-[1.5] text-ink-muted">{s.body}</p>
            <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[14px] text-ink">
                  <span className="text-action-blue">✓</span> {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonPrimary href={s.ctaHref}>{s.cta}</ButtonPrimary>
              <ButtonSecondary href="#how-it-works">See the pipeline</ButtonSecondary>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
