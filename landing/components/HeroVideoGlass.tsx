"use client";

import { useEffect, useRef } from "react";

const glassChips = [
  { label: "Security scan", className: "left-[8%] top-[14%]" },
  { label: "Cloud Run deploy", className: "right-[10%] top-[26%]" },
  { label: "Auto-scale active", className: "left-[14%] bottom-[34%]" },
  { label: "5 agents live", className: "right-[8%] bottom-[20%]" },
];

export function HeroVideoGlass() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch {
        // Retry when the browser allows muted autoplay.
      }
    };

    void play();
    video.addEventListener("loadeddata", play);
    return () => video.removeEventListener("loadeddata", play);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/4 h-[420px] w-[420px] rounded-full bg-coral/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-action-blue/10 blur-[90px]"
      />

      <video
        ref={videoRef}
        src="/hero-loop.mp4"
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div className="hero-visual-grid pointer-events-none absolute inset-0 opacity-[0.35] max-lg:opacity-20" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/40 via-transparent to-transparent lg:bg-none" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-canvas from-0% via-canvas/60 via-[10%] to-transparent to-[32%] lg:block" />

      {glassChips.map((chip) => (
        <div
          key={chip.label}
          className={`absolute hidden rounded-xl border border-white/55 bg-white/45 px-3.5 py-2 shadow-[0_8px_32px_rgba(23,23,28,0.08)] backdrop-blur-xl md:block ${chip.className}`}
        >
          <span className="text-[12px] font-medium text-ink/85">{chip.label}</span>
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/50 bg-white/40 px-4 py-3 backdrop-blur-xl md:left-auto md:right-8 md:max-w-[260px]">
        <p className="font-mono-label text-[11px] uppercase text-ink-muted">
          Live preview
        </p>
        <p className="mt-1 text-[13px] font-medium leading-[1.4] text-ink">
          Scan, deploy, and scale in one flow
        </p>
      </div>
    </div>
  );
}
