import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Platform } from "@/components/Platform";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductExtras } from "@/components/ProductExtras";
import { BentoProof } from "@/components/BentoProof";
import { EarlyAccess } from "@/components/EarlyAccess";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <div className="bg-[#09090b]">
        <Hero />
      </div>
      <main>
        <Platform />
        <HowItWorks />
        <ProductExtras />
        <BentoProof />
        <EarlyAccess />
      </main>
      <Footer />
    </>
  );
}
