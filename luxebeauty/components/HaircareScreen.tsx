"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const COLLECTIONS = [
  {
    id: "shampoo", label: "Shampoo", sub: "Cleanse & revive",
    gradient: "linear-gradient(145deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060",
    items: ["Scalp Detox", "Colour Protect", "Repair & Restore"],
  },
  {
    id: "conditioner", label: "Conditioner", sub: "Silk & strength",
    gradient: "linear-gradient(145deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A",
    items: ["Deep Hydration", "Bond Builder", "Leave-in Mist"],
  },
  {
    id: "masks", label: "Hair Masks", sub: "Weekly ritual",
    gradient: "linear-gradient(145deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A",
    items: ["Keratin Gloss", "Moisture Surge", "Protein Fix"],
  },
  {
    id: "styling", label: "Styling", sub: "Finish & define",
    gradient: "linear-gradient(145deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A",
    items: ["Velvet Serum", "Texture Spray", "Gloss Drops"],
  },
  {
    id: "scalp", label: "Scalp Care", sub: "The root of it all",
    gradient: "linear-gradient(145deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A",
    items: ["Exfoliant Scrub", "Balancing Toner", "Growth Serum"],
  },
  {
    id: "tools", label: "Tools", sub: "Salon at home",
    gradient: "linear-gradient(145deg, #E8E0C8, #C0B080, #EAE0C0)",
    accent: "#A09070",
    items: ["Ionic Diffuser", "Cushion Brush", "Wide Tooth Comb"],
  },
];

const HAIR_TYPES = ["Fine", "Thick", "Curly", "Wavy", "Coily", "Colour-treated"];

export default function HaircareScreen({ onBack }: Props) {
  const [hairType, setHairType] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Haircare</h2>
        </div>
        <div className="opacity-20"><SwanLogo size={24} /></div>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Hair type selector */}
      <div className="px-5 mb-5 flex-shrink-0">
        <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#8A8070] mb-2.5">Your hair type</p>
        <div className="flex flex-wrap gap-2">
          {HAIR_TYPES.map(t => (
            <button key={t} onClick={() => setHairType(hairType === t ? null : t)}
              className={`chip px-4 py-2 rounded-full text-[10px] ${hairType === t ? "active" : ""}`}>
              {t}
            </button>
          ))}
        </div>
        {hairType && (
          <p className="font-cormorant text-sm italic font-light text-[#C8B06A] mt-2">
            Showing picks for {hairType} hair ✦
          </p>
        )}
      </div>

      {/* Collections grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {COLLECTIONS.map(col => (
            <button key={col.id}
              onClick={() => setExpanded(expanded === col.id ? null : col.id)}
              className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-300"
              style={{ minHeight: expanded === col.id ? "175px" : "138px" }}>

              <div className="relative h-20 overflow-hidden">
                <div className="absolute inset-0" style={{ background: col.gradient, opacity: 0.65 }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <HairIcon id={col.id} accent={col.accent} />
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${col.accent}25, transparent 70%)` }} />
              </div>

              <div className="p-3">
                <p className="font-sans text-[7px] tracking-[0.18em] uppercase mb-0.5 opacity-60"
                  style={{ color: col.accent }}>{col.sub}</p>
                <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight">{col.label}</p>
                {expanded === col.id && (
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
            </button>
          ))}
        </div>

        {/* Featured banner */}
        <div className="card-pearl rounded-2xl overflow-hidden cursor-pointer group">
          <div className="relative h-40 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #1A2A10, #2A4A18, #C8B06A)" }} />
            <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-15">
              <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <path d="M20 70 Q30 20 45 10 Q60 20 70 70" stroke="#C8B06A" strokeWidth="1.5" fill="none" />
                <path d="M25 70 Q32 30 45 18 Q58 30 65 70" stroke="#C8B06A" strokeWidth="1" fill="none" opacity="0.5" />
                <path d="M30 70 Q38 40 45 28 Q52 40 60 70" stroke="#C8B06A" strokeWidth="0.8" fill="none" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />
            <div className="absolute bottom-4 left-5">
              <p className="font-sans text-[7px] tracking-[0.25em] uppercase text-[#C8B06A] mb-1">✦ Seasonal Edit</p>
              <p className="font-serif text-xl font-normal text-white">The Hair Ritual</p>
              <p className="font-sans text-[9px] text-white/60 mt-0.5">Curated for your hair type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HairIcon({ id, accent }: { id: string; accent: string }) {
  if (id === "shampoo") return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="9" y="4" width="12" height="22" rx="4" />
      <path d="M9 10 Q7 10 7 13 Q7 16 9 16" />
      <path d="M14 4 L14 2 Q15 0 16 2 L16 4" />
    </svg>
  );
  if (id === "conditioner") return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="8" y="6" width="14" height="20" rx="3" />
      <path d="M12 6 L12 3 Q15 1 18 3 L18 6" />
      <path d="M11 14 H19" strokeOpacity="0.5" />
    </svg>
  );
  if (id === "masks") return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <rect x="6" y="8" width="18" height="16" rx="3" />
      <path d="M10 8 L10 5 Q15 3 20 5 L20 8" />
      <path d="M10 16 Q15 20 20 16" strokeOpacity="0.6" />
    </svg>
  );
  if (id === "styling") return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <path d="M8 26 L8 6 Q8 4 10 4 L12 4 Q14 4 14 6 L14 18" />
      <path d="M14 18 Q18 18 20 14 Q22 10 20 8 Q18 6 16 8" />
    </svg>
  );
  if (id === "scalp") return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <path d="M8 22 Q8 10 15 8 Q22 10 22 22" />
      <path d="M11 22 Q11 14 15 12 Q19 14 19 22" strokeOpacity="0.5" />
      <path d="M7 22 H23" />
    </svg>
  );
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round">
      <path d="M8 4 L8 22 Q8 26 12 26 Q16 26 16 22 L16 4" />
      <path d="M6 8 Q5 10 5 14 Q5 18 8 18" />
      <path d="M6 4 H18" />
    </svg>
  );
}
