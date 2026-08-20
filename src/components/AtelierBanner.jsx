import { Link } from "react-router-dom";

const BANNER_IMAGE =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/815685766_IMG_5270.jpeg";

const NAV_LINKS = [
  { label: "Alerts",   to: "/ingredient-alerts" },
  { label: "Shopping", to: "/shopping-list"      },
  { label: "Insights", to: "/vanity/insights"    },
  { label: "Badges",   to: "/distinctions"       },
];

export default function AtelierBanner({ onScan }) {
  return (
    <div className="px-5 pt-14 pb-5">
      <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "3 / 4" }}>
        <img
          src={BANNER_IMAGE}
          alt="L'Atelier — The Muse"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* Profile badge — top right */}
        <Link
          to="/profile"
          aria-label="View profile"
          className="absolute rounded-full"
          style={{ top: "3%", right: "4%", width: "15%", aspectRatio: "1 / 1" }}
        />

        {/* Nav buttons row */}
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

        {/* Scan & Discover CTA */}
        <button
          type="button"
          onClick={onScan}
          aria-label="Scan & Discover – Identify any beauty product"
          className="absolute rounded-2xl"
          style={{ top: "56%", left: "4%", right: "4%", bottom: "6%" }}
        />
      </div>
    </div>
  );
}