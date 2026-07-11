import type { SessionPhase } from "@/lib/types";

const phases: { id: SessionPhase; label: string }[] = [
  { id: "intake", label: "Intake" },
  { id: "security_scan", label: "Security" },
  { id: "architect", label: "Architect" },
  { id: "deploy", label: "Deploy" },
  { id: "sre", label: "SRE" },
];

const order = phases.map((p) => p.id);

export function PhaseStepper({ current }: { current: SessionPhase }) {
  const idx = order.indexOf(current);

  return (
    <ol className="flex flex-wrap gap-2 sm:gap-3">
      {phases.map((phase, i) => {
        const done = idx > i;
        const active = phase.id === current;
        return (
          <li
            key={phase.id}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium sm:text-[13px] ${
              active
                ? "bg-primary text-white"
                : done
                  ? "bg-enterprise-green/10 text-enterprise-green"
                  : "bg-stone text-ink-muted"
            }`}
          >
            {phase.label}
          </li>
        );
      })}
    </ol>
  );
}
