import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ProductFlowSection } from "@/components/ProductFlow";
import { SecurityChecks } from "@/components/SecurityChecks";
import { MultiCloud } from "@/components/MultiCloud";
import { ThreeSurfaces } from "@/components/ThreeSurfaces";
import { DeploymentRegistry } from "@/components/DeploymentRegistry";
import { ModelFlex } from "@/components/ModelFlex";
import { HowItWorks } from "@/components/HowItWorks";
import { AgentTeam } from "@/components/AgentTeam";
import { ReadinessScore } from "@/components/ReadinessScore";
import { Problem } from "@/components/Problem";
import { UseCases } from "@/components/UseCases";
import { WhyPrody } from "@/components/WhyPrody";
import { EarlyAccess } from "@/components/EarlyAccess";
import { CTABanner } from "@/components/CTABanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="bg-[#09090b]">
        <Nav dark />
        <Hero />
      </div>
      <main>
        <SecurityChecks />
        <MultiCloud />
        <ThreeSurfaces />
        <ProductFlowSection />
        <DeploymentRegistry />
        <ModelFlex />
        <HowItWorks />
        <AgentTeam />
        <ReadinessScore />
        <Problem />
        <UseCases />
        <WhyPrody />
        <EarlyAccess />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
