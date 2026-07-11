"use client";

import { useEffect, useRef } from "react";

export function HeroVideoGlass({ mobile = false }: { mobile?: boolean }) {
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
    <div
      className={`relative h-full w-full overflow-hidden ${mobile ? "rounded-2xl" : ""}`}
    >
      <video
        ref={videoRef}
        src="/hero-loop.mp4?v=2"
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div className="hero-visual-grid-dark pointer-events-none absolute inset-0 opacity-[0.35]" />

      <div className="pointer-events-none absolute inset-0 bg-black/35" />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/55 to-transparent ${
          mobile ? "from-20% via-[#09090b]/40 to-45%" : "from-0% via-[#09090b]/65 via-30% to-55%"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b]/50 via-transparent to-[#09090b]/20" />
    </div>
  );
}
