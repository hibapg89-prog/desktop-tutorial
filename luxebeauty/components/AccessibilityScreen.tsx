"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const COLLECTIONS = [
  {
    id: "bags", label: "Vanity Bags", sub: "Carry your glow",
    gradient: "linear-gradient(145deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A", items: ["Satin Clutch", "Monogram Pouch", "Travel Roll"],
  },
  {
    id: "brushes", label: "Brush Sets", sub: "Artisan tools",
    gradient: "linear-gradient(145deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A", items: ["Foundation Fan", "Contour Set", "Eye Detail"],
  },
  {
    id: "mirrors", label: "Mirrors", sub: "Your reflection",
    gradient: "linear-gradient(145deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A", items: ["Vanity Lighted", "Travel Compact", "Magnifying"],
  },
  {
    id: "cases", label: "Jewel Cases", sub: "Store in style",
    gradient: "linear-gradient(145deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060", items: ["Ring Holder", "Bracelet Box", "Full Set"],
  },
  {
    id: "headbands", label: "Headbands", sub: "Spa chic",
    gradient: "linear-gradient(145deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A", items: ["Velvet Band", "Bow Detail", "Textured Terry"],
  },
  {
    id: "trays", label: "Vanity Trays", sub: "Display beautifully",
    gradient: "linear-gradient(145deg, #F0ECE4, #D8CDB8, #EAE4D8)",
    accent: "#8A7A6A", items: ["Marble Tray", "Gold Rim", "Acrylic Display"],
  },
];

export default function AccessibilityScreen({ onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Curated</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Accessories</h2>
        </div>
        <div className="opacity-20">
          <SwanLogo size={24} />
        </div>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Intro copy */}
      <div className="px-6 mb-5 flex-shrink-0">
        <p className="font-cormorant text-base italic font-light text-[#8A8070] tracking-wide">
          The finishing details that elevate every ritual
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelected(selected === col.id ? null : col.id)}
              className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-300"
              style={{ minHeight: selected === col.id ? "180px" : "140px" }}
            >
              {/* Gradient header */}
              <div className="relative h-20 overflow-hidden">
                <div className="absolute inset-0" style={{ background: col.gradient, opacity: 0.7 }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <AccessoryIcon id={col.id} accent={col.accent} />
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${col.accent}30, transparent 70%)` }} />
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-sans text-[7px] tracking-[0.18em] uppercase mb-0.5 opacity-60"
                  style={{ color: col.accent }}>{col.sub}</p>
                <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight">{col.label}</p>

                {/* Expanded items */}
                {selected === col.id && (
                  <div className="mt-2 space-y-1">
                    {col.items.map(item => (
                      <div key={item} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: col.accent }} />
                        <span className="font-sans text-[9px] text-[#8A8070]">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent, ${col.accent}60, transparent)` }} />
            </button>
          ))}
        </div>

        {/* Featured banner */}
        <div className="mt-6 card-pearl rounded-2xl overflow-hidden cursor-pointer group">
          <div className="relative h-36 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #2A1A0E, #5A3A1A, #C8B06A)" }} />
            <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-20">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" stroke="#C8B06A" strokeWidth="1" />
                <circle cx="40" cy="40" r="28" stroke="#C8B06A" strokeWidth="0.5" />
                <path d="M20 40 H60 M40 20 V60" stroke="#C8B06A" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.5) 100%)" }} />
            <div className="absolute bottom-4 left-5">
              <p className="font-sans text-[7px] tracking-[0.25em] uppercase text-[#C8B06A] mb-1">
                ✦ New Arrivals
              </p>
              <p className="font-serif text-lg font-normal text-white">The Vanity Edit</p>
              <p className="font-sans text-[9px] text-white/60 mt-0.5">Curated this season</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessoryIcon({ id, accent }: { id: string; accent: string }) {
  if (id === "bags") return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <path d="M6 12 Q6 8 16 8 Q26 8 26 12 L28 26 Q28 28 26 28 H6 Q4 28 4 26Z" />
      <path d="M11 12 Q11 6 16 6 Q21 6 21 12" />
      <path d="M10 18 H22" strokeOpacity="0.5" />
    </svg>
  );
  if (id === "brushes") return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="14" y="2" width="4" height="18" rx="1" />
      <ellipse cx="16" cy="26" rx="5" ry="4" />
      <rect x="15" y="18" width="2" height="4" />
    </svg>
  );
  if (id === "mirrors") return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <ellipse cx="16" cy="13" rx="10" ry="11" />
      <path d="M13 24 L12 30 M19 24 L20 30 M12 30 H20" />
      <ellipse cx="16" cy="13" rx="7" ry="8" strokeOpacity="0.4" />
    </svg>
  );
  if (id === "cases") return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="4" y="10" width="24" height="18" rx="2" />
      <path d="M4 16 H28" strokeOpacity="0.5" />
      <path d="M11 10 L11 6 Q11 4 16 4 Q21 4 21 6 L21 10" />
    </svg>
  );
  if (id === "headbands") return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <path d="M4 20 Q4 8 16 6 Q28 8 28 20" />
      <path d="M4 20 Q4 26 16 28 Q28 26 28 20" strokeOpacity="0.4" />
    </svg>
  );
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="2" y="8" width="28" height="20" rx="2" />
      <path d="M2 14 H30" strokeOpacity="0.5" />
      <path d="M8 8 L8 5 M16 8 L16 4 M24 8 L24 5" strokeOpacity="0.5" />
    </svg>
  );
}
