import { type ReactNode } from "react";

export function MonoLabel({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`font-mono-label text-[14px] uppercase leading-[1.4] ${light ? "text-white/60" : "text-ink-muted"}`}
    >
      {children}
    </p>
  );
}

export function ButtonPrimary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-10 items-center justify-center rounded-[32px] bg-primary px-6 py-3 text-[14px] font-medium leading-[1.71] text-white transition-opacity hover:opacity-85 ${className}`}
    >
      {children}
    </a>
  );
}

export function ButtonSecondary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-10 items-center text-[14px] font-medium leading-[1.71] text-ink underline underline-offset-4 transition-colors hover:text-action-blue ${className}`}
    >
      {children}
    </a>
  );
}

export function FilterChip({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-[30px] border px-4 py-2 text-[14px] leading-[1.4] ${
        active
          ? "border-coral bg-coral text-primary"
          : "border-coral/50 bg-coral/10 text-ink"
      }`}
    >
      {children}
    </span>
  );
}

export function Section({
  id,
  children,
  className = "",
  variant = "white",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "white" | "stone";
}) {
  return (
    <section
      id={id}
      className={`py-20 md:py-24 ${variant === "stone" ? "bg-stone" : "bg-canvas"} ${className}`}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-10 lg:px-16">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-[720px]">
      <MonoLabel>{label}</MonoLabel>
      <h2 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-0.48px] text-ink md:text-[48px]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-[18px] leading-[1.5] text-ink-muted">
          {description}
        </p>
      )}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-hairline bg-canvas p-6 md:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
