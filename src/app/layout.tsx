import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazon Blink — Urgent shopping, first & guaranteed right",
  description:
    "Predictive, near-instant urgent commerce with a trust layer. HackOn with Amazon Season 6.0 · Theme 2.",
};

export const viewport: Viewport = {
  themeColor: "#131A22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
