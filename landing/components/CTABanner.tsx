import { ButtonPrimary, Section } from "./ui";

export function CTABanner() {
  return (
    <Section variant="white">
      <div className="rounded-[22px] border border-hairline bg-stone p-10 text-center md:p-14">
        <p className="font-mono-label text-[14px] uppercase text-coral">
          Early access
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-[640px] text-[36px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[48px]">
          Production without the ops team
        </h2>
        <p className="mx-auto mt-4 max-w-[540px] text-[16px] leading-[1.5] text-ink-muted">
          Multi-cloud deploy, five security checks, bring-your-own-model, and
          one registry for IDE, dashboard, and CLI.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <ButtonPrimary href="#early-access">Get early access</ButtonPrimary>
        </div>
      </div>
    </Section>
  );
}
