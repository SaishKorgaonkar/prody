import { Section, SectionHeading } from "./ui";

const features = [
  {
    title: "Every deploy in one list",
    body: "Started from IDE, dashboard, or CLI. All sessions appear in your deployment registry instantly.",
  },
  {
    title: "Stop before it costs you",
    body: "Teardown cloud resources from the dashboard or terminal. No orphaned App Runner services draining your wallet.",
  },
  {
    title: "Live health + readiness",
    body: "Post-deploy SRE checks, readiness score, and plain-language status, not another wall of logs.",
  },
];

export function DeploymentRegistry() {
  return (
    <Section id="registry" variant="white">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionHeading
          label="Deployment registry"
          title="Never lose track of what's running"
          description="Prody is not fire-and-forget. Your production footprint stays visible and controllable across every surface."
        />

        <div className="rounded-2xl border border-hairline bg-stone p-6 md:p-8">
          <p className="font-mono-label text-[11px] uppercase text-ink-muted">
            My deployments
          </p>
          <ul className="mt-4 space-y-3">
            {[
              { name: "notes-api", cloud: "AWS", status: "Running", cost: "~$8/mo" },
              { name: "demo-app", cloud: "GCP", status: "Healthy", cost: "~$12/mo" },
              { name: "shop-beta", cloud: "Azure", status: "Stopped", cost: "N/A" },
            ].map((row) => (
              <li
                key={row.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline bg-canvas px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{row.name}</p>
                  <p className="text-[12px] text-ink-muted">{row.cloud}</p>
                </div>
                <div className="flex items-center gap-3 text-[12px]">
                  <span
                    className={
                      row.status === "Running" || row.status === "Healthy"
                        ? "text-enterprise-green"
                        : "text-ink-muted"
                    }
                  >
                    {row.status}
                  </span>
                  <span className="text-ink-muted">{row.cost}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-ink-muted">
            Illustrative UI. Same data whether you shipped from IDE or CLI.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-hairline bg-stone p-6"
          >
            <h3 className="font-display text-[18px] text-ink">{f.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
