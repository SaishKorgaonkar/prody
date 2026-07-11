import { DASHBOARD_URL } from "@/lib/config";
import { HeroVideoGlass } from "./HeroVideoGlass";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#09090b]">
      <div className="hero-dark-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block">
        <HeroVideoGlass />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-14 sm:px-8 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="flex min-h-[calc(100dvh-8.5rem)] max-w-[560px] flex-col justify-center">
          <p className="font-mono-label text-[12px] uppercase text-coral sm:text-[13px]">
            Introducing Prody
          </p>

          <h1 className="mt-4 text-[42px] font-semibold leading-[1.06] tracking-[-1.8px] sm:text-[56px] sm:tracking-[-2px] md:text-[64px] lg:text-[72px]">
            <span className="text-white">Stuck here?</span>
            <br />
            <span className="text-white/40">Prody&apos;s here to help.</span>
          </h1>

          <p className="mt-6 text-[18px] font-medium leading-[1.35] text-white/90 sm:text-[20px]">
            From your last commit to a live app, without opening the cloud console.
          </p>

          <p className="mt-4 max-w-[480px] text-[15px] leading-[1.65] text-white/50 sm:text-[16px]">
            You wrote the code. Prody handles security, deploy, and ops in plain
            language, from your IDE or a GitHub link.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <a
              href="#extension"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-[14px] font-medium text-[#09090b] transition-opacity hover:opacity-90 sm:w-auto"
            >
              Connect Extension
            </a>
            <a
              href={DASHBOARD_URL}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:border-white/35 hover:bg-white/[0.08] sm:w-auto"
            >
              Open Dashboard
            </a>
          </div>
        </div>

        <div className="relative mt-10 h-[280px] w-full sm:h-[320px] lg:hidden">
          <HeroVideoGlass mobile />
        </div>
      </div>
    </section>
  );
}
