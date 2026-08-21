import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const BANNER_IMAGE =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/815685766_IMG_5270.jpeg";

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

export default function AtelierBanner({ onScan, guidedPath, onDismissGuide }) {
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
            className="text-[0.5rem] tracking-[0.28em] uppercase font-light"
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
          style={{ top: "29%", left: "4%", right: "4%" }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="flex-1 rounded-2xl"
              style={{ aspectRatio: "1 / 1" }}
            />
          ))}
        </div>

        {/* Guided Path tooltip */}
        {guidedPath && (
          <div
            className="absolute flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
            style={{
              top: "53%",
              left: "5%",
              right: "5%",
              zIndex: 20,
              background: "rgba(4,57,39,0.94)",
              border: "1px solid rgba(200,176,106,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p
              className="flex-1 text-[0.75rem] font-light leading-snug"
              style={{ color: "#C8B06A" }}
            >
              Start here — scan your first product.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onDismissGuide?.(); }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(200,176,106,0.2)" }}
              aria-label="Dismiss guide"
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 1l5 5M6 1L1 6" stroke="#C8B06A" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "7px solid rgba(4,57,39,0.94)",
              }}
            />
          </div>
        )}

        {/* Scan & Discover CTA — invisible overlay over the dark green velvet card */}
        <button
          type="button"
          onClick={() => { onDismissGuide?.(); onScan(); }}
          aria-label="Scan & Discover – Identify any beauty product"
          className="absolute rounded-2xl"
          style={{
            top: "56%", left: "4%", right: "4%", bottom: "6%",
            ...(guidedPath ? { boxShadow: "0 0 0 2.5px #C8B06A, 0 0 14px rgba(200,176,106,0.35)" } : {}),
          }}
        />
      </div>
    </div>
  );
}
