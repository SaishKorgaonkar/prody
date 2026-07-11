import { DashboardNav } from "@/components/DashboardNav";
import { IntakeForm } from "@/components/IntakeForm";

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-canvas">
      <DashboardNav />
      <main className="mx-auto max-w-[640px] px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono-label text-[12px] uppercase text-coral">
          Web dashboard
        </p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-[-0.8px] text-ink sm:text-[40px]">
          Ship from a GitHub link
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-muted">
          Paste a repo URL or point at a local project. Prody runs security,
          plans infra, and deploys while you watch every agent step.
        </p>
        <div className="mt-10">
          <IntakeForm />
        </div>
      </main>
    </div>
  );
}
