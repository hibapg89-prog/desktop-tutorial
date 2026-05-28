"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const COLLECTIONS = [
  {
    id: "oils", label: "Intimacy Oils & Lubes", sub: "Set the mood",
    gradient: "linear-gradient(145deg, #F0D0E0, #C87898, #E8B0C8)",
    accent: "#B06880",
    brands: "Maude · Good Clean Love · Fur",
    desc: "pH-balanced, skin-safe formulas in luxurious textures — silky, water-based, and botanical oils.",
  },
  {
    id: "cleanse", label: "Intimate Cleanse", sub: "Gentle daily care",
    gradient: "linear-gradient(145deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A",
    brands: "Nécessaire · The Honey Pot · Chiavaye",
    desc: "Dermatologist-tested, pH-balanced washes and mists that respect your body's natural microbiome.",
  },
  {
    id: "deodorant", label: "Intimate Deodorants", sub: "Confidence all day",
    gradient: "linear-gradient(145deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A",
    brands: "Lume · Fur · Megababe",
    desc: "Gentle deodorant creams, sprays and powders formulated for sensitive intimate zones.",
  },
  {
    id: "shaving", label: "Shaving & Hair Removal", sub: "Smooth & bare",
    gradient: "linear-gradient(145deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A",
    brands: "Fur · Billie · Flamingo",
    desc: "Pre-shave oils, soothing post-shave care, ingrown serum and pubic hair conditioner for bump-free results.",
  },
  {
    id: "massage", label: "Massage & Ritual Oils", sub: "Unwind deeply",
    gradient: "linear-gradient(145deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060",
    brands: "Maude · Cowshed · Elemis",
    desc: "Warming massage oils, aromatherapy candles and ritual sets that deepen connection and release tension.",
  },
  {
    id: "protection", label: "Protection", sub: "Mindful moments",
    gradient: "linear-gradient(145deg, #D8C0E0, #8A60A0, #C8A8D8)",
    accent: "#805090",
    brands: "Maude · Lelo HEX · Sustain",
    desc: "Ultra-thin, vegan and ethically sourced condoms from brands redefining intimacy with intention.",
  },
  {
    id: "devices", label: "Devices & Wellness", sub: "Personal pleasure",
    gradient: "linear-gradient(145deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A",
    brands: "Dame · Womanizer · Elvie",
    desc: "Award-winning personal devices for pleasure, pelvic floor health and intimate wellness — designed beautifully.",
  },
  {
    id: "moisturise", label: "Intimate Moisturisers", sub: "Nourish & restore",
    gradient: "linear-gradient(145deg, #F0ECE4, #D8CDB8, #EAE4D8)",
    accent: "#8A7A6A",
    brands: "Replens · Chiavaye · Bonafide",
    desc: "Long-lasting hydration and barrier-restoring formulas clinically developed for intimate skin.",
  },
];

export default function WellnessScreen({ onBack }: Props) {
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
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#B06880] mb-0.5">Curated</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Intimate Wellness</h2>
        </div>
        <div className="opacity-20"><SwanLogo size={24} /></div>
      </div>

      <div className="h-px mx-6 mb-4"
        style={{ background: "linear-gradient(90deg, transparent, rgba(176,104,128,0.35), transparent)" }} />

      {/* Intro */}
      <div className="px-6 mb-5 flex-shrink-0">
        <p className="font-cormorant text-base italic font-light text-[#8A8070] tracking-wide leading-relaxed">
          Your most intimate skin deserves the same luxury care as the rest of you
        </p>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex flex-col gap-2.5 mb-6">
          {COLLECTIONS.map(col => {
            const isOpen = expanded === col.id;
            return (
              <button key={col.id}
                onClick={() => setExpanded(isOpen ? null : col.id)}
                className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-300 w-full">
                <div className="flex items-stretch">
                  {/* Colour swatch */}
                  <div className="w-1.5 flex-shrink-0"
                    style={{ background: col.gradient }} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-sans text-[7px] tracking-[0.2em] uppercase opacity-60 mb-0.5"
                          style={{ color: col.accent }}>{col.sub}</p>
                        <p className="font-serif text-[15px] font-normal text-[#1C1C1C] leading-tight">{col.label}</p>
                        {!isOpen && (
                          <p className="font-sans text-[9px] font-light text-[#8A8070] mt-1">{col.brands}</p>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
                        style={{
                          background: isOpen ? `${col.accent}18` : "rgba(200,176,106,0.08)",
                          border: `1px solid ${isOpen ? col.accent + "40" : "rgba(200,176,106,0.2)"}`,
                        }}>
                        <span className="text-sm font-light leading-none transition-transform duration-300"
                          style={{ color: col.accent, transform: isOpen ? "rotate(45deg)" : "none", display: "block" }}>
                          +
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-[rgba(200,176,106,0.12)]">
                        <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed mb-2">
                          {col.desc}
                        </p>
                        <p className="font-sans text-[8px] tracking-[0.15em] uppercase"
                          style={{ color: col.accent }}>
                          {col.brands}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Editorial banner */}
        <div className="card-pearl rounded-2xl overflow-hidden cursor-pointer">
          <div className="relative h-44 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #2A0A1A, #5A1838, #8A3060)" }} />

            {/* Abstract floral */}
            <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-12">
              <svg width="110" height="130" viewBox="0 0 110 130" fill="none">
                <circle cx="55" cy="65" r="30" stroke="#F0D0E0" strokeWidth="0.8" />
                <circle cx="55" cy="65" r="20" stroke="#F0D0E0" strokeWidth="0.5" />
                <path d="M55 35 Q65 50 55 65 Q45 50 55 35" fill="#F0D0E0" opacity="0.3" />
                <path d="M85 65 Q70 75 55 65 Q70 55 85 65" fill="#F0D0E0" opacity="0.3" />
                <path d="M55 95 Q45 80 55 65 Q65 80 55 95" fill="#F0D0E0" opacity="0.3" />
                <path d="M25 65 Q40 55 55 65 Q40 75 25 65" fill="#F0D0E0" opacity="0.3" />
                <circle cx="55" cy="65" r="5" fill="#F0D0E0" opacity="0.4" />
              </svg>
            </div>

            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute bottom-5 left-5">
              <p className="font-sans text-[7px] tracking-[0.28em] uppercase mb-1" style={{ color: "#E8A8C0" }}>
                ✦ Wellness Edit
              </p>
              <p className="font-serif text-xl font-normal text-white leading-tight">The Intimacy Ritual</p>
              <p className="font-sans text-[9px] text-white/60 mt-1">Care · Pleasure · Wellbeing</p>
            </div>
          </div>
        </div>

        {/* Discreet note */}
        <p className="font-sans text-[8px] font-light text-[#8A8070] text-center mt-5 px-4 leading-relaxed tracking-wide">
          All products curated from certified, dermatologist-approved brands.
          Packaged with full discretion.
        </p>
      </div>
    </div>
  );
}
