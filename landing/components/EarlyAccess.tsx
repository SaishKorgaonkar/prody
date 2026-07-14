import { EarlyAccessForm } from "./EarlyAccessForm";
import { Section } from "./ui";

const perks = [
  {
    title: "Early access",
    line: "First cohort when we open the gate.",
  },
  {
    title: "Security first",
    line: "Five checks before anything deploys.",
  },
  {
    title: "Any cloud",
    line: "GCP, AWS, or Azure from day one.",
  },
];

export function EarlyAccess() {
  return (
    <Section
      id="early-access"
      variant="stone"
      className="scroll-mt-24 !py-16 md:!py-20"
    >
      <div className="footer-shell overflow-hidden rounded-[28px] border border-hairline bg-canvas shadow-[0_24px_80px_-32px_rgba(23,23,28,0.18)] sm:rounded-[32px]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] md:items-center md:gap-12 md:px-10 md:py-12 lg:px-14">
          <div>
            <p className="font-mono-label text-[12px] uppercase text-coral">
              Early access
            </p>
            <h2 className="font-display mt-3 max-w-[420px] text-[28px] leading-[1.12] tracking-[-0.4px] text-ink sm:text-[32px] md:text-[36px]">
              Join the first teams shipping with Prody
            </h2>
            <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-ink-muted">
              Get notified when early access opens. Security gate, multi-cloud
              deploy, and one registry for everything you ship.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="rounded-xl border border-hairline bg-stone px-4 py-3.5"
                >
                  <p className="text-[14px] font-medium text-ink">{perk.title}</p>
                  <p className="mt-1 text-[12px] leading-snug text-ink-muted">
                    {perk.line}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-hairline bg-stone p-5 md:p-6">
            <p className="text-[15px] font-medium text-ink">Request access</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              We&apos;ll email you when your spot opens.
            </p>
            <div className="mt-5">
              <EarlyAccessForm
                source="early-access"
                variant="light"
                layout="card"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
