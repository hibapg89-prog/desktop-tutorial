import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "muse_notifications";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function Toggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300"
      style={{
        background: enabled ? "#043927" : "rgba(200,176,106,0.25)",
        border: `1.5px solid ${enabled ? "#043927" : "rgba(200,176,106,0.4)"}`,
      }}
      aria-pressed={enabled}
      role="switch"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        style={{ left: enabled ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

const CATEGORIES = [
  {
    key: "museDuMatin",
    label: "Muse du Matin",
    desc: "Your daily beauty dispatch, delivered at 8h",
  },
  {
    key: "nouveautes",
    label: "Nouveautés",
    desc: "New launches, exclusives, and curated arrivals",
  },
  {
    key: "rappelsRituel",
    label: "Rappels de Rituel",
    desc: "Gentle reminders for your scheduled rituals",
  },
  {
    key: "offresPrivees",
    label: "Offres Privées",
    desc: "Early access, private drops, and patron perks",
  },
  {
    key: "productAlerts",
    label: "Product Alerts",
    desc: "Price changes and back-in-stock on your wishlist",
  },
  {
    key: "communityUpdates",
    label: "Community",
    desc: "Replies to your posts and new community dispatches",
  },
  {
    key: "messages",
    label: "Messages",
    desc: "Direct messages from your Muse connections",
  },
  {
    key: "ingredientAlerts",
    label: "Ingredient Alerts",
    desc: "Flagged ingredients detected in your routines",
  },
];

const DEFAULTS = {
  museDuMatin: true,
  nouveautes: true,
  rappelsRituel: false,
  offresPrivees: false,
  productAlerts: true,
  communityUpdates: true,
  messages: true,
  ingredientAlerts: true,
};

export default function NotificationsSettings() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const stored = loadPrefs();
    return { ...DEFAULTS, ...stored };
  });

  const toggle = (key) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    try {
      await base44.auth.updateMe({ notification_prefs: JSON.stringify(prefs) });
    } catch {}
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate(-1);
    }, 800);
  };

  const allOn = Object.values(prefs).every(Boolean);
  const allOff = Object.values(prefs).every((v) => !v);

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg)]">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft size={16} color="var(--color-text-primary)" />
        </button>
        <div className="flex-1">
          <h1 className="text-[var(--color-text-primary)] font-light font-serif text-[18px]">
            Notification Preferences
          </h1>
          <p className="text-xs text-primary-40 font-light mt-0.5 tracking-wide">
            Curate your dispatch
          </p>
        </div>
        <SwanLogo size={28} color="var(--color-text-primary)" />
      </div>

      <div className="px-5 space-y-5">

        {/* Quick actions */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setPrefs(Object.fromEntries(CATEGORIES.map((c) => [c.key, true])))
            }
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[10px] tracking-[0.2em] uppercase font-light text-primary-60 transition-colors active:bg-[#043927]/5"
          >
            Allow All
          </button>
          <button
            onClick={() =>
              setPrefs(Object.fromEntries(CATEGORIES.map((c) => [c.key, false])))
            }
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[10px] tracking-[0.2em] uppercase font-light text-primary-60 transition-colors active:bg-[#043927]/5"
          >
            Pause All
          </button>
        </div>

        {/* Category toggles */}
        <div>
          <p className="text-[10px] tracking-[0.25em] text-primary-40 uppercase font-light mb-3 px-1">
            Your Dispatch
          </p>
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {CATEGORIES.map((cat) => (
              <div key={cat.key} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[var(--color-text-primary)] font-light text-[13px]">
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-primary-45 font-light mt-0.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <Toggle enabled={prefs[cat.key]} onToggle={() => toggle(cat.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Quiet hours note */}
        <div className="rounded-2xl px-5 py-4 border border-[#C8B06A]/30 bg-[#C8B06A]/[0.08]">
          <p className="text-[var(--color-text-primary)] font-light mb-1 font-serif text-[13px]">
            Quiet Hours
          </p>
          <p className="text-[10px] text-primary-50 font-light leading-relaxed">
            The Muse respects your rest. Notifications are silenced from 22h to 8h,
            unless marked urgent by your Sanctuary settings.
          </p>
        </div>

        {/* Save */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-2xl text-xs tracking-[0.3em] uppercase font-light flex items-center justify-center gap-2 transition-all text-[#FDF5E6] ${saved ? "bg-[#C8B06A]" : "bg-[#043927]"}`}
        >
          {saved ? (
            <>
              <Check size={14} strokeWidth={1.5} />
              Saved
            </>
          ) : (
            "Save Preferences"
          )}
        </motion.button>

        <p className="text-center text-[10px] text-primary-30 font-light italic">
          Preferences are stored in your Sanctuary.
        </p>
      </div>
    </div>
  );
}