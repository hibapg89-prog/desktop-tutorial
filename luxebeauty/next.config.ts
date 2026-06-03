import type { NextConfig } from "next";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline for hydration scripts
  "script-src 'self' 'unsafe-inline'",
  // Tailwind inline styles + Google Fonts CSS
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Google Fonts files
  "font-src 'self' https://fonts.gstatic.com",
  // Local images, data URIs (icons), blob URLs (camera/canvas), Google Stitch + Nano Banana AI images
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://static.prod-images.emergentagent.com",
  // API calls stay on same origin
  "connect-src 'self'",
  // Audio/video stay local
  "media-src 'self' blob:",
  // Service worker
  "worker-src 'self' blob:",
  // PWA manifest
  "manifest-src 'self'",
  // No embedding in iframes anywhere (stronger than X-Frame-Options)
  "frame-ancestors 'none'",
  // Prevent base-tag hijacking
  "base-uri 'self'",
  // Forms only submit to same origin
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy",  value: ContentSecurityPolicy },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security",value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
