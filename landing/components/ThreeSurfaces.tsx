import { FilterChip, Section, SectionHeading } from "./ui";

const surfaces = [
  {
    id: "ide",
    chip: "IDE",
    title: "Ship from your editor",
    subtitle: "Cursor · VS Code · Antigravity",
    body: "Run Prody from the command palette. Security findings in the sidebar, fix guides in your repo, approve architecture without leaving the IDE.",
    bullets: [
      "Security loop: scan → fix guide → retry",
      "Syncs to dashboard automatically",
      "Optional: use your IDE's native models for fixes",
    ],
  },
  {
    id: "dashboard",
    chip: "Dashboard",
    title: "Manage every deployment",
    subtitle: "Web · GitHub · Local path",
    body: "See all your deploys in one place, whether started from IDE or web. Live agent stream, 5-check security status, teardown to stop billing.",
    bullets: [
      "Deployment registry across surfaces",
      "5-check security panel with live status",
      "Stop resources before they cost you",
    ],
  },
  {
    id: "cli",
    chip: "CLI",
    title: "Automate from terminal",
    subtitle: "prody ship · watch · stop",
    body: "Terminal-native workflow for power users and CI. Same OAuth account, same deployment list, same orchestrator.",
    bullets: [
      "prody ship ./app --cloud aws",
      "Watch SSE events in your terminal",
      "List and stop deploys from anywhere",
    ],
  },
];

export function ThreeSurfaces() {
  return (
    <Section id="surfaces" variant="white">
      <SectionHeading
        label="Three surfaces"
        title="One pipeline, everywhere you work"
        description="Deploy from IDE, dashboard, or CLI. Every session lands in the same registry, so you manage production from one place."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {surfaces.map((s, i) => (
          <div
            key={s.id}
            id={s.id === "ide" ? "extension" : s.id}
            className="rounded-2xl border border-hairline bg-stone p-8 md:p-9"
          >
            <FilterChip active={i === 0}>{s.chip}</FilterChip>
            <h3 className="font-display mt-5 text-[24px] leading-[1.2] tracking-[-0.32px] text-ink md:text-[26px]">
              {s.title}
            </h3>
            <p className="mt-1 text-[13px] text-ink-muted">{s.subtitle}</p>
            <p className="mt-4 text-[15px] leading-[1.55] text-ink-muted">
              {s.body}
            </p>
            <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
              {s.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-[14px] text-ink"
                >
                  <span className="text-action-blue">✓</span> {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
