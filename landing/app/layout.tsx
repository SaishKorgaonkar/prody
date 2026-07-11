import type { Metadata } from "next";
import { hashicorpSans } from "@hashicorp/mds-next/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prody | Your autonomous engineering team",
  description:
    "Prody deploys, secures, monitors, and scales your app from your IDE or a GitHub link, without opening the cloud console.",
  openGraph: {
    title: "Prody | Your autonomous engineering team",
    description:
      "The autonomous engineering layer between code and production.",
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
