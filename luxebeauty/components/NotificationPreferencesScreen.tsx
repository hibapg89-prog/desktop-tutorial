"use client";

import { useEffect, useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const STORAGE_KEY = "luxe-notifications";

const CATEGORIES: { key: string; label: string; desc: string }[] = [
  { key: "Muse du Matin",     label: "Muse du Matin",     desc: "Édition beauté quotidienne à 8h" },
  { key: "Nouveautés",        label: "Nouveautés",        desc: "Lancements et collections exclusifs" },
  { key: "Rappels de Rituel", label: "Rappels de Rituel", desc: "Vos soins programmés" },
  { key: "Offres Privées",    label: "Offres Privées",    desc: "Accès anticipé et remises curées" },
];

const DEFAULTS: Record<string, boolean> = {
  "Muse du Matin":    true,
  "Nouveautés":       true,
  "Rappels de Rituel": false,
  "Offres Privées":   false,
};

export default function NotificationPreferencesScreen({ onBack }: Props) {
  const [notifs, setNotifs] = useState<Record<string, boolean>>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setNotifs(JSON.parse(stored));
    } catch {}
  }, []);

  function toggleNotif(key: string) {
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs)); } catch {}
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 800);
  }

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onBack}
          aria-label="Retour à l'écran précédent"
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer press-scale">
          ← Retour
        </button>
        <div className="opacity-25" aria-hidden="true">
          <SwanLogo size={26} />
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pb-5 flex-shrink-0">
        <h1 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight">
          Notifications
        </h1>
        <p className="font-sans text-[11px] text-[#8A8070] mt-1 font-light">
          Choisissez vos alertes beauté
        </p>
      </div>

      <div className="divider-gold mx-6 mb-6" role="separator" />

      {/* Category toggles */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 space-y-3">
        {CATEGORIES.map(cat => (
          <div
            key={cat.key}
            className="card-pearl rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-sans text-[11px] text-[#1C1C1C] leading-tight">{cat.label}</p>
              <p className="font-sans text-[9px] text-[#8A8070] mt-0.5 font-light">{cat.desc}</p>
            </div>
            <Toggle
              on={notifs[cat.key] ?? false}
              onToggle={() => toggleNotif(cat.key)}
              label={cat.label}
            />
          </div>
        ))}
      </div>

      {/* Fixed save button */}
      <div
        className="panel-bottom fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20"
        style={{
          background: "rgba(250,246,239,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(200,176,106,0.15)",
        }}>
        <button
          onClick={save}
          aria-label="Sauvegarder les préférences de notifications"
          className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 press-scale"
          style={{
            border: `1.5px solid ${saved ? "#C8B06A" : "#0B3C26"}`,
            background: saved ? "rgba(200,176,106,0.10)" : "transparent",
            color: saved ? "#C8B06A" : "#0B3C26",
          }}>
          {saved ? "Sauvegardé ✦" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  on, onToggle, label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="flex-shrink-0 cursor-pointer press-scale focus-visible:outline-2"
      style={{ outline: "none" }}>
      <div
        className="relative transition-all duration-300"
        style={{
          width: "46px",
          height: "26px",
          borderRadius: "13px",
          background: on
            ? "linear-gradient(145deg, #2D7A52, #0B3C26)"
            : "rgba(200,176,106,0.15)",
          border: on ? "none" : "1px solid rgba(200,176,106,0.3)",
          boxShadow: on ? "0 2px 8px rgba(11,60,38,0.3)" : "none",
        }}>
        <div
          className="absolute top-[3px] rounded-full transition-all duration-300"
          style={{
            width: "20px",
            height: "20px",
            background: on ? "white" : "rgba(200,176,106,0.5)",
            left: on ? "23px" : "3px",
            boxShadow: on ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
          }}
        />
      </div>
    </button>
  );
}
