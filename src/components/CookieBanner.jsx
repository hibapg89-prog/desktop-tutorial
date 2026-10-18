import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "la_muse_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage blocked — don't show
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(CONSENT_KEY, "all"); } catch {}
    setVisible(false);
  };

  const essentialOnly = () => {
    try { localStorage.setItem(CONSENT_KEY, "essential"); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-5 py-4"
      style={{ backgroundColor: "#FFF9E8", borderTop: "1px solid #E8DFC8" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-xs font-light leading-relaxed flex-1" style={{ color: "#3a3530" }}>
          We use cookies to personalise your experience and improve our app.{" "}
          <Link
            to="/legal"
            className="underline underline-offset-2"
            style={{ color: "#C8B06A" }}
          >
            Cookie policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={essentialOnly}
            className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-light rounded-full border transition-colors"
            style={{ borderColor: "#C8B06A", color: "#0B3C26", backgroundColor: "transparent" }}
          >
            Essential only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-light rounded-full transition-colors"
            style={{ backgroundColor: "#0B3C26", color: "#FFF9E8" }}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
