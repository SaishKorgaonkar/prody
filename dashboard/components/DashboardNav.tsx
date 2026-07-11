import Link from "next/link";
import { LANDING_URL } from "@/lib/config";

export function DashboardNav() {
  return (
    <header className="border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="text-[18px] font-semibold tracking-[-0.4px] text-ink sm:text-[20px]">
          Prody
        </Link>
        <div className="flex items-center gap-4 text-[13px] sm:text-[14px]">
          <span className="hidden text-ink-muted sm:inline">Dashboard</span>
          <a
            href={LANDING_URL}
            className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Marketing site
          </a>
        </div>
      </div>
    </header>
  );
}
