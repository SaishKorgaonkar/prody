"use client";

import Image from "next/image";

export function AgentConsoleCard() {
  const agents = [
    { name: "Security", status: "Scanning repo", color: "#ff7759", active: true },
    { name: "Architect", status: "Designing topology", color: "#7b42bc", active: false },
    { name: "DevOps", status: "Awaiting approval", color: "#1863dc", active: false },
    { name: "SRE", status: "Monitoring · GCP", color: "#24c574", active: false },
  ];

  return (
    <div className="flex min-h-[340px] flex-col rounded-[22px] border border-hairline bg-primary p-5 shadow-lg md:p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono-label text-[12px] uppercase text-white/60">
          Prody · Agent console
        </span>
        <span className="flex items-center gap-2 text-[12px] text-white/60">
          <span className="h-2 w-2 rounded-full bg-[#24c574]" />
          Live
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
              agent.active ? "bg-white/10" : "bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: agent.color }}
              />
              <span className="text-[14px] text-white">{agent.name}</span>
            </div>
            <span className="text-[12px] text-white/60">{agent.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="font-mono-label text-[11px] uppercase text-white/50">
          Prody says
        </p>
        <p className="mt-1 text-[13px] leading-[1.5] text-white/90">
          Your payment key is visible in source code. I&apos;ll patch it before
          deploy.
        </p>
      </div>
    </div>
  );
}

export function HeroMediaCard() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[22px] border border-hairline bg-stone shadow-lg">
      <Image
        src="/hero-bg-frame-1.png"
        alt="Infrastructure topology"
        fill
        className="object-cover"
        sizes="(max-width:768px) 100vw, 40vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="font-mono-label text-[12px] uppercase text-white/70">
          Infrastructure evolution
        </span>
        <p className="mt-1 text-[14px] leading-[1.4] text-white">
          Code → validated → deployed → scaling
        </p>
      </div>
    </div>
  );
}
