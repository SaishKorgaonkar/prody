"use client";

import type { MouseEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const sectionLinks = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Prody", href: "#why-prody" },
];

const SCROLL_END = 140;

function scrollHomeToTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.history.replaceState(null, "", "/");
}

export function Nav() {
  const { scrollY } = useScroll();

  const top = useTransform(scrollY, [0, SCROLL_END], [0, 16]);
  const sideInset = useTransform(scrollY, [0, SCROLL_END], [0, 16]);
  const maxWidth = useTransform(scrollY, [0, SCROLL_END], [2000, 896]);
  const borderRadius = useTransform(scrollY, [0, SCROLL_END], [0, 9999]);
  const paddingX = useTransform(scrollY, [0, SCROLL_END], [48, 20]);
  const paddingY = useTransform(scrollY, [0, SCROLL_END], [14, 10]);
  const blur = useTransform(scrollY, [0, SCROLL_END], [10, 16]);
  const shadowOpacity = useTransform(scrollY, [0, SCROLL_END], [0, 1]);

  const background = useTransform(
    scrollY,
    [0, SCROLL_END],
    ["rgba(9, 9, 11, 0.82)", "rgba(255, 255, 255, 0.92)"]
  );
  const border = useTransform(
    scrollY,
    [0, SCROLL_END],
    [
      "1px solid rgba(255, 255, 255, 0.12)",
      "1px solid rgba(217, 217, 221, 0.95)",
    ]
  );
  const backdropFilter = useTransform(blur, (b) => `blur(${b}px)`);
  const boxShadow = useTransform(shadowOpacity, (o) =>
    o < 0.05
      ? "none"
      : `0 4px 24px rgba(15, 23, 42, ${o * 0.08}), 0 1px 3px rgba(15, 23, 42, ${o * 0.04})`
  );

  const logoColor = useTransform(scrollY, [0, SCROLL_END], ["#ffffff", "#212121"]);
  const linkColor = useTransform(
    scrollY,
    [0, SCROLL_END],
    ["rgba(255, 255, 255, 0.65)", "rgba(33, 33, 33, 0.72)"]
  );
  const ctaBackground = useTransform(
    scrollY,
    [0, SCROLL_END],
    ["#ffffff", "#17171c"]
  );
  const ctaColor = useTransform(
    scrollY,
    [0, SCROLL_END],
    ["#09090b", "#ffffff"]
  );

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center"
      style={{ top, paddingLeft: sideInset, paddingRight: sideInset }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
    >
      <motion.div
        className="pointer-events-auto flex w-full items-center gap-3 md:gap-4"
        style={{
          maxWidth,
          borderRadius,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          paddingTop: paddingY,
          paddingBottom: paddingY,
          background,
          border,
          backdropFilter,
          WebkitBackdropFilter: backdropFilter,
          boxShadow,
        }}
      >
        <motion.a
          href="#"
          onClick={scrollHomeToTop}
          className="font-display shrink-0 text-base font-medium tracking-[-0.4px] md:text-lg"
          style={{ color: logoColor }}
        >
          Prody
        </motion.a>

        <nav className="hidden flex-1 items-center justify-center gap-5 md:flex">
          {sectionLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="group relative text-sm whitespace-nowrap transition-opacity hover:opacity-100"
              style={{ color: linkColor }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-coral transition-all group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center">
          <motion.a
            href="#early-access"
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap md:px-5 md:text-sm"
            style={{
              backgroundColor: ctaBackground,
              color: ctaColor,
            }}
          >
            Early access
          </motion.a>
        </div>
      </motion.div>
    </motion.header>
  );
}
