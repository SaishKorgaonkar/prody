const productLinks = [
  { l: "Platform", h: "#platform" },
  { l: "How it works", h: "#how-it-works" },
  { l: "Why Prody", h: "#why-prody" },
  { l: "Early access", h: "#early-access" },
];

const resourceLinks = [
  { l: "Security gate", h: "#platform" },
  { l: "Multi-cloud", h: "#platform" },
  { l: "Deployment registry", h: "#extras" },
  { l: "Contact", h: "#early-access" },
];

export function Footer() {
  return (
    <div className="bg-stone px-3 pb-4 pt-10 sm:px-4 sm:pb-6 sm:pt-14 md:pt-16">
      <footer className="footer-shell mx-auto max-w-[1280px] overflow-hidden rounded-[28px] border border-hairline bg-canvas shadow-[0_24px_80px_-32px_rgba(23,23,28,0.18)] sm:rounded-[32px]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12 md:px-10 md:py-12 lg:px-14">
          <div className="min-w-0">
            <p className="font-display text-[clamp(2.75rem,8vw,5rem)] leading-[0.92] tracking-[-0.04em] text-ink">
              Prody
            </p>
            <p className="font-display mt-3 max-w-[400px] text-[20px] leading-tight tracking-[-0.28px] text-ink sm:mt-4 sm:text-[22px]">
              Ship with confidence
            </p>
            <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-ink-muted">
              Secure, deploy, and manage on any cloud. From your IDE, dashboard,
              or terminal.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 md:gap-14">
            <div className="min-w-[140px]">
              <p className="font-mono-label text-[11px] uppercase text-coral">
                Product
              </p>
              <ul className="mt-4 space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.l}>
                    <a
                      href={link.h}
                      className="text-[14px] text-ink/80 transition-colors hover:text-action-blue"
                    >
                      {link.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-[140px]">
              <p className="font-mono-label text-[11px] uppercase text-coral">
                Explore
              </p>
              <ul className="mt-4 space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.l}>
                    <a
                      href={link.h}
                      className="text-[14px] text-ink/80 transition-colors hover:text-action-blue"
                    >
                      {link.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline px-6 py-5 text-[12px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-10 lg:px-14">
          <p>© 2026 Prody. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <a href="#" className="transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-ink">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
