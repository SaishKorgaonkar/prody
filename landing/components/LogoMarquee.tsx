const items = [
  "5 security checks",
  "GCP, AWS, Azure",
  "IDE, dashboard, CLI",
  "Ollama, OpenRouter, Gemini",
  "Fail-closed security",
  "One deployment registry",
  "Human approval before deploy",
];

export function LogoMarquee() {
  const loop = [...items, ...items];

  return (
    <div
      className="overflow-hidden border-y border-hairline bg-stone py-3.5"
      aria-hidden
    >
      <div className="marquee-track flex w-max gap-10">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-10 text-[13px] font-medium text-ink-muted"
          >
            {item}
            <span className="text-coral/60">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
