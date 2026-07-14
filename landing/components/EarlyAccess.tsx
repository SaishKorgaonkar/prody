import { EarlyAccessForm } from "./EarlyAccessForm";
import { Section } from "./ui";

export function EarlyAccess() {
  return (
    <Section id="early-access" variant="stone">
      <div className="rounded-[22px] border border-hairline bg-canvas px-6 py-10 md:px-12 md:py-14">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="font-mono-label text-[14px] uppercase text-coral">
            Early access
          </p>
          <h2 className="font-display mt-4 text-[32px] leading-[1.12] tracking-[-0.48px] text-ink md:text-[40px]">
            Join early access
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-muted">
            Get notified when Prody opens to new teams.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-[560px]">
          <EarlyAccessForm source="early-access" variant="light" />
        </div>
      </div>
    </Section>
  );
}
