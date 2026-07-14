"use client";

import { useState, type FormEvent } from "react";

type Variant = "dark" | "light";

export function EarlyAccessForm({
  source = "hero",
  variant = "light",
  className = "",
}: {
  source?: string;
  variant?: Variant;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          role: role || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setMessage(
        "You're on the list. We'll email you when early access opens."
      );
      setEmail("");
      setRole("");
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection and try again.");
    }
  }

  const isDark = variant === "dark";
  const inputClass = isDark
    ? "border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white/40"
    : "border-hairline bg-canvas text-ink placeholder:text-ink-muted focus:border-action-blue";
  const btnClass = isDark
    ? "bg-white text-[#09090b] hover:opacity-90"
    : "bg-primary text-white hover:opacity-90";

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border px-5 py-4 text-left ${
          isDark
            ? "border-enterprise-green/40 bg-enterprise-green/10 text-white"
            : "border-enterprise-green/30 bg-enterprise-green/5 text-ink"
        } ${className}`}
      >
        <p className="text-[15px] font-medium leading-snug">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className={`w-full rounded-full border px-5 py-3 text-[14px] outline-none transition-colors ${inputClass}`}
          />
        </label>
        <label className="w-full sm:w-[170px]">
          <span className="sr-only">Role</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={status === "loading"}
            className={`w-full rounded-full border px-5 py-3 text-[14px] outline-none transition-colors ${inputClass}`}
          >
            <option value="">Role</option>
            <option value="solo_dev">Solo developer</option>
            <option value="founder">Founder</option>
            <option value="team">Engineering team</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className={`inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-full px-8 py-3 text-[14px] font-medium transition-opacity disabled:opacity-60 ${btnClass}`}
        >
          {status === "loading" ? "Joining…" : "Get early access"}
        </button>
      </div>
      {status === "error" && message && (
        <p className="mt-3 text-left text-[13px] text-coral" role="alert">
          {message}
        </p>
      )}
      <p
        className={`mt-3 text-left text-[12px] leading-relaxed ${
          isDark ? "text-white/40" : "text-ink-muted"
        }`}
      >
        Early access updates only. No spam.
      </p>
    </form>
  );
}
