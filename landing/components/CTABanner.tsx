import { ButtonPrimary, ButtonSecondary, Section } from "./ui";

export function TrustLogos() {
  const logos = ["Startups", "SMEs", "Solo devs", "Vibe coders", "Eng teams"];

  return (
    <section className="border-y border-hairline bg-stone py-16 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 text-center md:px-10 lg:px-16">
        <p className="text-[14px] text-ink-muted">
          Trusted by builders who ship without a DevOps team
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((logo) => (
            <span
              key={logo}
              className="font-display text-[16px] font-medium tracking-[-0.2px] text-ink-muted md:text-[18px]"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <Section variant="white">
      <div className="rounded-[22px] border border-hairline bg-stone p-10 text-center md:p-14">
        <p className="font-mono-label text-[14px] uppercase text-coral">
          Start with Prody
        </p>
        <h2 className="font-display mx-auto mt-4 max-w-[640px] text-[36px] leading-[1.1] tracking-[-0.48px] text-ink md:text-[48px]">
          Production-ready software, without the ops team
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-[1.5] text-ink-muted">
          Connect from your IDE or drop a GitHub link. Prody secures, deploys,
          and operates while you keep building.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <ButtonPrimary href="#extension">Connect Extension</ButtonPrimary>
          <ButtonSecondary href="#dashboard">Open Dashboard</ButtonSecondary>
        </div>
      </div>
    </Section>
  );
}
