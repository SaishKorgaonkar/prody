import { hashicorpSans } from "@hashicorp/mds-next/fonts";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prody Dashboard | Deploy from GitHub",
  description: "Start a Prody session, watch agents work, and ship to production.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hashicorpSans.variable} h-full antialiased`}>
      <body className={`${hashicorpSans.className} min-h-full`}>{children}</body>
    </html>
  );
}
