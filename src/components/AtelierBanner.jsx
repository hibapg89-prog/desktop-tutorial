import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const BANNER_IMAGE =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/3d2fb00ac_IMG_5270.jpeg";

const NAV_LINKS = [
  { label: "Alerts",   to: "/ingredient-alerts" },
  { label: "Shopping", to: "/shopping-list"      },
  { label: "Insights", to: "/vanity/insights"    },
  { label: "Badges",   to: "/distinctions"       },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export default function AtelierBanner({ onScan }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const initial = user?.full_name?.trim()?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || "";

  return (
    <div className="px-5 pt-14 pb-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
        <img
          src={BANNER_IMAGE}
          alt="L'Atelier — The Muse"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Dynamic greeting — clean area in image, no baked text to conflict with */}
        <div
          className="absolute pointer-events-none select-none"
          style={{ top: "16%", left: "5%" }}
        >
          <p
            className="text-[0.75rem] tracking-[0.22em] uppercase font-light"
            style={{ color: "#C8B06A" }}
          >
            {getGreeting()}
          </p>
          <p
            className="font-serif font-light leading-none mt-1"
            style={{ fontSize: "clamp(2.75rem,12vw,4rem)", color: "#C8B06A" }}
          >
            {initial}
          </p>
        </div>

        {/* Profile badge — dark green circle with live user initial */}
        <Link
          to="/profile"
          aria-label="View profile"
          className="absolute rounded-full flex items-center justify-center"
          style={{
            top: "16%", right: "5%",
            width: "15%", aspectRatio: "1 / 1",
            background: "#043927",
            border: "1.5px solid #C8B06A",
          }}
        >
          {initial && (
            <span
              className="font-serif font-light"
              style={{ color: "#C8B06A", fontSize: "clamp(0.875rem,4vw,1.375rem)" }}
            >
              {initial}
            </span>
          )}
        </Link>

        {/* Nav buttons row — invisible overlays over baked image buttons */}
        <div
          className="absolute flex gap-2"
          style={{ top: "28%", left: "3%", right: "3%", bottom: "37%" }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="flex-1 rounded-2xl"
            />
          ))}
        </div>

        {/* Scan & Discover CTA — invisible overlay over the dark green velvet card */}
        <button
          type="button"
          onClick={onScan}
          aria-label="Scan & Discover – Identify any beauty product"
          className="absolute rounded-2xl"
          style={{ top: "63%", left: "3%", right: "3%", bottom: "3%" }}
        />
      </div>
    </div>
  );
}
