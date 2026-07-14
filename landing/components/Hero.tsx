import { HeroVideoGlass } from "./HeroVideoGlass";
import { ProductFlowStrip } from "./ProductFlow";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      {/* Full-bleed video background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroVideoGlass />
      </div>

      <div className="hero-dark-grid pointer-events-none absolute inset-0 z-[1] opacity-40" />
      <div
        className="hero-video-fade pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(720px,92dvh)] max-w-[1280px] flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 md:px-10 lg:px-16 lg:py-24">
        <div className="max-w-[620px]">
          <p className="font-mono-label text-[11px] uppercase text-coral sm:text-[12px] md:text-[13px]">
            Autonomous engineering layer
          </p>

          <h1 className="mt-3 text-[clamp(2rem,6vw,4.25rem)] font-semibold leading-[1.08] tracking-[-0.04em] sm:mt-4">
            <span className="text-white">Ship secure apps</span>
            <br />
            <span className="text-white/45">to any cloud.</span>
          </h1>

          <p className="mt-4 max-w-[520px] text-[15px] leading-[1.55] text-white/75 sm:mt-5 sm:text-[17px] md:text-[18px] lg:mt-6">
            Five security checks, then deploy to GCP, AWS, or Azure. From your
            IDE, dashboard, or terminal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#early-access"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#09090b] transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get early access
            </a>
            <a
              href="#platform"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[14px] font-medium text-white backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/[0.08] sm:w-auto"
            >
              See the platform
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center justify-center text-[14px] text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline sm:min-h-0 sm:justify-start"
            >
              How it works
            </a>
          </div>
        </div>
      </div>

      <ProductFlowStrip />
    </section>
  );
}
