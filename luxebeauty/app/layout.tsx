import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuxeBeauty — Elevating Your Beauty Journey",
  description: "The ultimate luxury beauty platform. Discover, curate, and shop the finest beauty products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
