const columns = [
  { title: "Product", links: [{ l: "How it works", h: "#how-it-works" }, { l: "Agents", h: "#agents" }, { l: "Capabilities", h: "#capabilities" }] },
  { title: "Developers", links: [{ l: "Connect Extension", h: "#extension" }, { l: "Open Dashboard", h: "#dashboard" }, { l: "Why Prody", h: "#why-prody" }] },
  { title: "Company", links: [{ l: "About", h: "#" }, { l: "Contact", h: "#" }] },
  { title: "Legal", links: [{ l: "Privacy", h: "#" }, { l: "Terms", h: "#" }] },
];

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 lg:px-16">
        <div className="border-b border-white/10 pb-12">
          <p className="font-display text-[28px] tracking-[-0.5px] md:text-[32px]">
            Prody
          </p>
          <p className="mt-3 max-w-[400px] text-[15px] leading-[1.5] text-white/65">
            The autonomous engineering layer between code and production.
          </p>
          <p className="mt-4 max-w-[400px] text-[12px] leading-[1.4] text-white/45">
            By using Prody you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-12 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-medium uppercase tracking-wide text-white/90">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.l}>
                    <a
                      href={link.h}
                      className="text-[12px] text-white/55 transition-colors hover:text-white"
                    >
                      {link.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[12px] text-white/45">© 2026 Prody. All rights reserved.</p>
      </div>
    </footer>
  );
}
