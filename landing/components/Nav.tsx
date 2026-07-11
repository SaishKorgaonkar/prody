const links = [
  { href: "#surfaces", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#agents", label: "Agents" },
  { href: "#why-prody", label: "Why Prody" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 lg:px-16">
        <a href="#" className="font-display text-[20px] font-medium tracking-[-0.4px] text-ink">
          Prody
        </a>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] text-ink transition-colors hover:text-action-blue"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-5">
          <a
            href="#extension"
            className="hidden text-[14px] text-ink underline underline-offset-4 sm:inline"
          >
            Sign in
          </a>
          <a
            href="#dashboard"
            className="inline-flex min-h-10 items-center justify-center rounded-[32px] bg-primary px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
