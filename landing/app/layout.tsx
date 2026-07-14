import type { Metadata } from "next";
import { hashicorpSans } from "@hashicorp/mds-next/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prody | Ship secure apps to any cloud",
  description:
    "Five security checks, multi-cloud deploy, and one deployment registry. Ship from your IDE, dashboard, or terminal.",
  openGraph: {
    title: "Prody | Ship secure apps to any cloud",
    description:
      "Five security checks, multi-cloud deploy, and one deployment registry.",
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
