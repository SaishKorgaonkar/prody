import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { TrustLogos } from "@/components/CTABanner";
import { Problem } from "@/components/Problem";
import { UseCases } from "@/components/UseCases";
import { TwoSurfaces } from "@/components/TwoSurfaces";
import { HowItWorks } from "@/components/HowItWorks";
import { AgentTeam } from "@/components/AgentTeam";
import { Capabilities } from "@/components/Capabilities";
import { ReadinessScore } from "@/components/ReadinessScore";
import { WhyPrody } from "@/components/WhyPrody";
import { CTABanner } from "@/components/CTABanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="bg-[#09090b]">
        <AnnouncementBar dark />
        <Nav dark />
        <Hero />
      </div>
      <main>
        <TrustLogos />
        <Problem />
        <UseCases />
        <TwoSurfaces />
        <HowItWorks />
        <AgentTeam />
        <Capabilities />
        <ReadinessScore />
        <WhyPrody />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
