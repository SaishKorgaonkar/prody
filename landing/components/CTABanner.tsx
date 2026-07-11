import { DASHBOARD_URL } from "@/lib/config";
import { ButtonPrimary, ButtonSecondary, Section } from "./ui";

export function CTABanner() {
  return (
    <Section variant="white">
      <div className="rounded-[22px] border border-hairline bg-stone p-10 text-center md:p-14">
        <p className="font-mono-label text-[14px] uppercase text-coral">
          Ready to ship
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-[640px] text-[36px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[48px]">
          Start a session. Watch it go live.
        </h2>
        <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-[1.5] text-ink-muted">
          Security first, then architecture, your approval, and deploy. Same flow
          from the dashboard or your IDE.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <ButtonPrimary href={DASHBOARD_URL}>Open Dashboard</ButtonPrimary>
          <ButtonSecondary href="#extension">Connect Extension</ButtonSecondary>
        </div>
      </div>
    </Section>
  );
}
