import { HeroVideoGlass } from "./HeroVideoGlass";
import { ProductFlowStrip } from "./ProductFlow";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      <div className="hero-dark-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <HeroVideoGlass />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-14 sm:px-8 md:px-10 md:py-16 lg:px-16 lg:py-20">
        <div className="flex min-h-[min(520px,calc(100dvh-12rem))] max-w-[620px] flex-col justify-center">
          <p className="font-mono-label text-[12px] uppercase text-coral sm:text-[13px]">
            Autonomous engineering layer
          </p>

          <h1 className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-1.6px] sm:text-[52px] sm:tracking-[-2px] md:text-[60px] lg:text-[68px]">
            <span className="text-white">Ship secure apps</span>
            <br />
            <span className="text-white/45">to any cloud.</span>
          </h1>

          <p className="mt-6 text-[17px] font-medium leading-[1.4] text-white/85 sm:text-[19px]">
            Five security checks, multi-cloud deploy, and one place to manage
            everything — from your IDE, dashboard, or terminal.
          </p>

          <p className="mt-4 max-w-[520px] text-[15px] leading-[1.65] text-white/50 sm:text-[16px]">
            Prody is the missing team between AI-generated code and production.
            No infra degree required. You approve; Prody executes.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href="#early-access"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#09090b] transition-opacity hover:opacity-90 sm:w-auto"
            >
              Get early access
            </a>
            <a
              href="#security"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:border-white/35 hover:bg-white/[0.08] sm:w-auto"
            >
              See security checks
            </a>
            <a
              href="#flow"
              className="text-[14px] text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline sm:ml-1"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative mt-10 h-[280px] w-full sm:h-[320px] lg:hidden">
          <HeroVideoGlass mobile />
        </div>
      </div>

      <ProductFlowStrip />
    </section>
  );
}
