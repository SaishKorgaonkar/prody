const links = [
  { href: "#security", label: "Security" },
  { href: "#clouds", label: "Clouds" },
  { href: "#surfaces", label: "Product" },
  { href: "#flow", label: "Flow" },
  { href: "#how-it-works", label: "How it works" },
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

        <nav className="hidden items-center justify-center gap-4 md:flex md:gap-5 lg:gap-7">
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

        <div className="flex shrink-0 items-center justify-end">
          <a
            href="#early-access"
            className={`inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-[12px] font-medium transition-opacity hover:opacity-90 sm:min-h-10 sm:px-5 sm:text-[13px] ${
              dark
                ? "bg-white text-[#09090b]"
                : "bg-primary text-white"
            }`}
          >
            Early access
          </a>
        </div>
      </div>
    </header>
  );
}
