import { DASHBOARD_URL } from "@/lib/config";

const links = [
  { href: "#flow", label: "Flow" },
  { href: "#surfaces", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#agents", label: "Agents" },
];

export function Nav({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        dark
          ? "border-white/10 bg-[#09090b]/90"
          : "border-hairline bg-canvas/95"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 md:px-10 lg:px-16">
        <a
          href="#"
          className={`font-display shrink-0 text-[18px] font-medium tracking-[-0.4px] sm:text-[20px] ${
            dark ? "text-white" : "text-ink"
          }`}
        >
          Prody
        </a>

        <nav className="hidden items-center justify-center gap-6 lg:flex lg:gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[14px] transition-colors ${
                dark
                  ? "text-white/60 hover:text-white"
                  : "text-ink hover:text-action-blue"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-5">
          <a
            href="#extension"
            className={`hidden text-[14px] underline underline-offset-4 md:inline ${
              dark
                ? "text-white/60 hover:text-white"
                : "text-ink"
            }`}
          >
            Sign in
          </a>
          <a
            href={DASHBOARD_URL}
            className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-[12px] font-medium transition-opacity hover:opacity-90 sm:min-h-10 sm:px-5 sm:py-2.5 sm:text-[13px] ${
              dark
                ? "bg-white text-[#09090b]"
                : "bg-primary text-white"
            }`}
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
