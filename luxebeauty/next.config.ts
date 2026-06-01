import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent the app from being embedded inside another website (clickjacking)
  { key: "X-Frame-Options",        value: "DENY" },
  // Prevent browsers guessing file types (MIME sniffing attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full URL when users click links to other sites
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  // Only load the app over HTTPS once it's deployed
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Disable browser features the app doesn't use
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
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
