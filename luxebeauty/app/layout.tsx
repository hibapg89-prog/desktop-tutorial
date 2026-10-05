import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "LuxeBeauty — Elevating Your Beauty Journey",
  description: "Votre compagnon beauté de luxe — découvrez, curez, sublimez.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LuxeBeauty",
  },
  openGraph: {
    title: "LuxeBeauty — Elevating Your Beauty Journey",
    description: "Votre compagnon beauté de luxe — découvrez, curez, sublimez.",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "LuxeBeauty",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "LuxeBeauty — Elevating Your Beauty Journey",
    description: "Votre compagnon beauté de luxe — découvrez, curez, sublimez.",
    images: ["/icons/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B3C26",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full">
        <ServiceWorkerRegistrar />
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  );
}
