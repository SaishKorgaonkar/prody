"use client";

import { useEffect, useRef } from "react";

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
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src="/hero-loop.mp4?v=2"
        className="hero-video-object absolute inset-0 z-0 h-full w-full object-cover saturate-[1.08] contrast-[1.04]"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <div className="hero-visual-grid-dark pointer-events-none absolute inset-0 z-[1] opacity-[0.22]" />
    </div>
  );
}
