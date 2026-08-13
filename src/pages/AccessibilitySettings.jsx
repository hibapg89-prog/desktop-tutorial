import { useState, useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "muse_accessibility";

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function Toggle({ enabled, onToggle, disabled = false }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300"
      style={{
        background: enabled ? "var(--color-text-primary)" : "rgba(var(--color-text-gold-rgb), 0.25)",
        border: `1.5px solid ${enabled ? "var(--color-text-primary)" : "rgba(var(--color-text-gold-rgb), 0.40)"}`,
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

export default function AccessibilitySettings() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const prefs = loadPrefs();
  const [calmMode,         setCalmMode]         = useState(prefs.calmMode         ?? false);
  const [largeTypography,  setLargeTypography]  = useState(prefs.largeTypography  ?? false);
  const [darkMode,         setDarkMode]         = useState(prefs.darkMode         ?? false);

  // Apply large typography globally when toggled
  useEffect(() => {
    document.documentElement.style.fontSize = largeTypography ? "20px" : "";
  }, [largeTypography]);

  // Apply reduced motion globally when calm mode toggled
  useEffect(() => {
    if (calmMode) {
      document.documentElement.style.setProperty("--motion-duration", "0ms");
    } else {
      document.documentElement.style.removeProperty("--motion-duration");
    }
  }, [calmMode]);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const handleSave = async () => {
    const data = { darkMode, calmMode, largeTypography };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    try {
      await base44.auth.updateMe({ accessibility_prefs: JSON.stringify(data) });
    } catch {}
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate(-1); }, 800);
  };

  return (
    <div
      className="min-h-screen pb-24 bg-[var(--color-bg)]"
      style={{ fontSize: largeTypography ? "20px" : undefined }}
    >
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
          <h1
            className="text-[var(--color-text-primary)] font-light font-serif"
            style={{ fontSize: largeTypography ? "22px" : "18px" }}
          >
            Accessibility Settings
          </h1>
          <p className="text-xs text-primary-40 font-light mt-0.5 tracking-wide">
            Your Muse, your way
          </p>
        </div>
        <SwanLogo size={28} color="var(--color-text-primary)" />
      </div>

      <div className="px-5 space-y-5">

        {/* ── CALM MODE ── */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2
                  className="text-[var(--color-text-primary)] font-light font-serif"
                  style={{ fontSize: largeTypography ? "17px" : "15px" }}
                >
                  Calm Mode
                </h2>
                <p className="text-xs text-primary-50 font-light mt-1 leading-relaxed max-w-[220px]">
                  Reduce visual and auditory stimuli for a tranquil experience. Includes reduced motion.
                </p>
              </div>
              <Toggle enabled={calmMode} onToggle={() => setCalmMode(v => !v)} />
            </div>
          </div>
          <button
            onClick={() => setCalmMode(true)}
            className={`w-full py-3.5 border-t border-[var(--color-border)] text-xs tracking-[0.22em] uppercase font-light transition-colors ${calmMode ? "text-[var(--color-text-primary)]" : "text-primary-60"}`}
          >
            {calmMode ? "Calm Mode Active" : "Activate Calm Mode"}
          </button>
        </div>

        {/* ── DISPLAY & SOUND ── */}
        <div>
          <p className="text-[10px] tracking-[0.25em] text-primary-40 uppercase font-light mb-3 px-1">
            Display &amp; Sound
          </p>
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">

            {/* Row: Large Typography */}
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[var(--color-text-primary)] font-light"
                  style={{ fontSize: largeTypography ? "15px" : "13px" }}
                >
                  Large Typography
                </p>
                <p className="text-[10px] text-primary-45 font-light mt-0.5 leading-relaxed">
                  Increases text size throughout the app.
                </p>
              </div>
              <Toggle enabled={largeTypography} onToggle={() => setLargeTypography(v => !v)} />
            </div>


          </div>
        </div>

        {/* ── APPEARANCE ── */}
        <div>
          <p className="text-[10px] tracking-[0.25em] text-primary-40 uppercase font-light mb-3 px-1">
            Appearance
          </p>
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[var(--color-text-primary)] font-light"
                  style={{ fontSize: largeTypography ? "15px" : "13px" }}
                >
                  Dark Mode
                </p>
                <p className="text-[10px] text-primary-45 font-light mt-0.5 leading-relaxed">
                  Force dark appearance, overrides your system setting.
                </p>
              </div>
              <Toggle enabled={darkMode} onToggle={() => setDarkMode(v => !v)} />
            </div>
          </div>
        </div>

        {/* ── SAVE ── */}
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-2xl text-xs tracking-[0.3em] uppercase font-light flex items-center justify-center gap-2 transition-all text-[#FDF5E6] ${saved ? "bg-[var(--color-accent-gold)]" : "bg-[#043927]"}`}
        >
          {saved ? (
            <>
              <Check size={14} strokeWidth={1.5} />
              Saved
            </>
          ) : (
            "Save Settings"
          )}
        </motion.button>

        <p className="text-center text-[10px] text-primary-30 font-light italic">
          Your preferences are saved to your Sanctuary.
        </p>

      </div>
    </div>
  );
}
