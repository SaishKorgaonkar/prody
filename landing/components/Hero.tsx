import { ButtonPrimary, ButtonSecondary } from "./ui";
import { HeroVideoGlass } from "./HeroVideoGlass";

const stats = [
  { value: "5", label: "AI agents" },
  { value: "2", label: "Ways to start" },
  { value: "0", label: "Cloud consoles" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="relative flex min-h-[min(920px,92vh)] flex-col lg:flex-row lg:items-stretch">
        <div className="hero-grid relative z-10 flex flex-col justify-center px-6 py-14 md:px-10 md:py-16 lg:w-[min(520px,42vw)] lg:shrink-0 lg:py-20 lg:pl-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))] lg:pr-10 xl:pl-[max(2.5rem,calc((100vw-1280px)/2+2.5rem))]">
          <p className="font-mono-label text-[13px] uppercase text-coral">
            Autonomous AI cloud engineer
          </p>

          <h1 className="mt-4 text-[56px] font-semibold leading-[1.02] tracking-[-2px] text-ink md:text-[80px] md:tracking-[-2.5px] xl:text-[92px]">
            Prody
          </h1>

          <p className="mt-5 max-w-[440px] text-[20px] font-semibold leading-[1.2] tracking-[-0.35px] text-ink md:text-[24px]">
            Your autonomous engineering team, from code to production.
          </p>

          <p className="mt-4 max-w-[420px] text-[16px] leading-[1.6] text-ink-muted md:text-[17px]">
            Deploy, secure, monitor, and scale from your IDE or a GitHub link.
            Never open the cloud console.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <ButtonPrimary href="#extension">Connect Extension</ButtonPrimary>
            <ButtonSecondary href="#dashboard">Open Dashboard</ButtonSecondary>
          </div>

          <div className="mt-10 flex flex-wrap gap-8 border-t border-hairline pt-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[28px] font-semibold leading-none tracking-[-0.5px] text-ink md:text-[32px]">
                  {stat.value}
                </p>
                <p className="mt-1 text-[13px] text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[420px] flex-1 lg:min-h-0">
          <HeroVideoGlass />
        </div>
      </div>
    </section>
  );
}
