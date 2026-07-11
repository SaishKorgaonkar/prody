import type { Metadata } from "next";
import { hashicorpSans } from "@hashicorp/mds-next/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prody | Stuck here? We're here to help",
  description:
    "Introducing Prody. You built the app; we help you ship it. Security, deploy, and ops from your IDE or a GitHub link.",
  openGraph: {
    title: "Introducing Prody",
    description:
      "Stuck on the last mile? Prody helps you get from code to production.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${hashicorpSans.variable} h-full antialiased`}
    >
      <body className={`${hashicorpSans.className} min-h-full bg-canvas text-ink`}>
        {children}
      </body>
    </html>
  );
}
