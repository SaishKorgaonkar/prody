import { Card, Section, SectionHeading } from "./ui";

const checks = [
  {
    n: "01",
    title: "Secret leak prevention",
    body: "Hardcoded API keys, exposed env vars, and client-side secrets, caught before deploy.",
    tool: "Gitleaks-style scan",
  },
  {
    n: "02",
    title: "Personal data flow",
    body: "Trace where user data goes. PII in logs, insecure cookies, and overbroad API responses.",
    tool: "Data flow audit",
  },
  {
    n: "03",
    title: "Production readiness",
    body: "Debug endpoints, missing security headers, permissive CORS, and rate limits.",
    tool: "Pre-deploy checklist",
  },
  {
    n: "04",
    title: "Deep logic audit",
    body: "Auth middleware, IDOR, SQL injection, XSS, and payment logic on critical paths.",
    tool: "Trail-of-Bits-style review",
  },
  {
    n: "05",
    title: "Attacker's perspective",
    body: "Login bypass, privilege escalation, content injection, and exposed internal paths.",
    tool: "Adversarial review",
  },
];

export function SecurityChecks() {
  return (
    <Section id="security" variant="stone">
      <SectionHeading
        label="Security gate"
        title="Five checks before you launch"
        description="Prody runs a ordered security pipeline on your code. The mistakes that get vibe-coded apps hacked, found and explained before anything goes live."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <Card key={check.n} className="flex flex-col">
            <span className="font-mono-label text-[12px] text-coral">
              Check {check.n}
            </span>
            <h3 className="font-display mt-3 text-[20px] leading-snug text-ink">
              {check.title}
            </h3>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-muted">
              {check.body}
            </p>
            <p className="mt-4 border-t border-hairline pt-3 text-[12px] text-ink-muted">
              {check.tool}
            </p>
          </Card>
        ))}
        <Card className="flex flex-col justify-center border-dashed border-coral/40 bg-coral/[0.04] sm:col-span-2 lg:col-span-1">
          <p className="font-mono-label text-[12px] uppercase text-coral">
            Fail-closed
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">
            Deploy is blocked on critical findings. Prody writes a fix guide your
            coding agent can implement, then you retry until the gate passes.
          </p>
        </Card>
      </div>
    </Section>
  );
}
