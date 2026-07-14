"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ScrollTabItem = {
  id: string;
  label: string;
  tagline: string;
  panel: ReactNode;
};

export function ScrollTabSection({
  sectionId,
  theme = "light",
  eyebrow,
  title,
  subtitle,
  tabs,
  tabListLabel,
}: {
  sectionId: string;
  theme?: "light" | "dark";
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  tabs: ScrollTabItem[];
  tabListLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const isDark = theme === "dark";

  const scrollToTab = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;

      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const top =
        section.getBoundingClientRect().top +
        window.scrollY +
        (scrollable * index) / tabs.length;

      window.scrollTo({ top, behavior: "smooth" });
    },
    [tabs.length]
  );

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setScrollEnabled(!reduced.matches);
    apply();
    reduced.addEventListener("change", apply);
    return () => reduced.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!scrollEnabled) return;

    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const scrolled = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        scrollable
      );
      const progress = scrolled / scrollable;
      const index = Math.min(
        tabs.length - 1,
        Math.max(0, Math.floor(progress * tabs.length))
      );

      setActiveIndex(index);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scrollEnabled, tabs.length]);

  const sectionHeight = scrollEnabled ? `${100 + tabs.length * 38}vh` : "auto";
  const active = tabs[activeIndex];

  const tabActive = isDark
    ? "border-coral/50 bg-white/[0.06] shadow-sm"
    : "border-coral/50 bg-coral/[0.06] shadow-sm";
  const tabIdle = isDark
    ? "border-transparent bg-white/[0.03] hover:border-white/15"
    : "border-transparent bg-stone hover:border-hairline";

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={isDark ? "relative bg-[#09090b]" : "relative bg-canvas"}
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-14 flex min-h-[calc(100vh-3.5rem)] flex-col justify-center px-4 py-16 sm:top-16 sm:min-h-[calc(100vh-4rem)] sm:px-6 md:px-10 lg:px-16 md:py-20">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="max-w-[560px]">
            <p className="font-mono-label text-[14px] uppercase text-coral">
              {eyebrow}
            </p>
            <h2
              className={`font-display mt-3 text-[32px] leading-[1.12] tracking-[-0.48px] md:text-[44px] ${
                isDark ? "text-white" : "text-ink"
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`mt-4 text-[16px] leading-relaxed ${
                  isDark ? "text-white/50" : "text-ink-muted"
                }`}
              >
                {subtitle}
              </p>
            )}
            {scrollEnabled && (
              <p
                className={`mt-3 text-[13px] ${
                  isDark ? "text-white/35" : "text-ink-muted/80"
                }`}
              >
                Scroll to explore
              </p>
            )}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-12">
            <div
              className="flex flex-col gap-2.5"
              role="tablist"
              aria-label={tabListLabel}
            >
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === i}
                  onClick={() => {
                    setActiveIndex(i);
                    if (scrollEnabled) scrollToTab(i);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all duration-300 lg:px-5 lg:py-3.5 ${
                    activeIndex === i ? tabActive : tabIdle
                  }`}
                >
                  <span
                    className={`font-display text-[15px] ${
                      isDark ? "text-white" : "text-ink"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[12px] ${
                      isDark ? "text-white/45" : "text-ink-muted"
                    }`}
                  >
                    {tab.tagline}
                  </span>
                </button>
              ))}

              <div
                className={`mt-2 hidden h-1 overflow-hidden rounded-full lg:block ${
                  isDark ? "bg-white/10" : "bg-stone"
                }`}
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-coral transition-all duration-300 ease-out"
                  style={{
                    width: `${((activeIndex + 1) / tabs.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div aria-live="polite">
              <div
                key={active.id}
                className={`feature-panel-enter min-h-[280px] rounded-2xl border p-6 md:min-h-[320px] md:p-8 ${
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-hairline bg-[#09090b]"
                }`}
              >
                {active.panel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
