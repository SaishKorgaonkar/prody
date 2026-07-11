"use client";

export function AnnouncementBar() {
  return (
    <div className="flex h-9 items-center justify-center bg-primary px-4 text-center text-[12px] text-white">
      <span>
        Prody is in early access.{" "}
        <a href="#extension" className="underline underline-offset-2 hover:text-white/90">
          Get started free
        </a>
      </span>
    </div>
  );
}
