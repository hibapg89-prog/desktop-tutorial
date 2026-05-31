"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const PILLARS = [
  {
    id: "supplements", label: "Inner Beauty", sub: "Beauty from within",
    gradient: "linear-gradient(145deg, #D8E8D0, #70A860, #B8D8A8)",
    accent: "#2A6A3A",
    brands: "HUM Nutrition · Vitalibis · Moon Juice",
    desc: "Collagen peptides, biotin, hyaluronic acid and adaptogen blends that nourish skin, hair and nails from the inside out.",
    icon: "✦",
  },
  {
    id: "adaptogens", label: "Adaptogens", sub: "Stress & balance",
    gradient: "linear-gradient(145deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060",
    brands: "Moon Juice · Apothékary · Four Sigmatic",
    desc: "Ashwagandha, reishi, maca and tulsi to help your body adapt, your cortisol balance and your glow return.",
    icon: "◈",
  },
  {
    id: "sleep", label: "Sleep Rituals", sub: "The original beauty sleep",
    gradient: "linear-gradient(145deg, #1A1A3A, #2A2A5A, #3A3A6A)",
    accent: "#A0A8D0",
    brands: "Olly · Calm · Elemis Sleep+",
    desc: "Magnesium glycinate, melatonin, valerian and adaptogenic sleep blends — because no serum works like 8 hours.",
    icon: "○",
  },
  {
    id: "gut", label: "Gut & Glow", sub: "Microbiome beauty",
    gradient: "linear-gradient(145deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A",
    brands: "Seed · Ritual · Garden of Life",
    desc: "Targeted probiotics, prebiotics and digestive enzymes — the gut–skin axis is real, and these brands understand it.",
    icon: "◇",
  },
  {
    id: "collagen", label: "Collagen & Glow", sub: "The liquid gold ritual",
    gradient: "linear-gradient(145deg, #F0E0C0, #D4A870, #F8EDD8)",
    accent: "#C8A050",
    brands: "Vital Proteins · Reserveage · Beauty Pie",
    desc: "Marine, bovine and plant-based collagen peptides in powders, drinks and capsules. The 30-day glow-up is real.",
    icon: "✦",
  },
  {
    id: "mindfulness", label: "Mind & Spirit", sub: "Outer calm, inner glow",
    gradient: "linear-gradient(145deg, #E8D0F0, #9A70C0, #D8B8E8)",
    accent: "#9070B8",
    brands: "Headspace · Calm · Alo Moves",
    desc: "Breathwork tools, guided meditation subscriptions and yoga accessories for a daily ritual that centres and restores.",
    icon: "◯",
  },
  {
    id: "detox", label: "Detox & Cleanse", sub: "Gentle reset",
    gradient: "linear-gradient(145deg, #D8E8D0, #88B890, #C0D8B8)",
    accent: "#3A7A5A",
    brands: "Sakara · Pressed Juicery · Sunwink",
    desc: "Gentle liver support, chlorophyll drops, herbal teas and plant-based cleanses to reset and restore from within.",
    icon: "◈",
  },
  {
    id: "energy", label: "Energy & Focus", sub: "Your daily power",
    gradient: "linear-gradient(145deg, #F0E098, #C8A840, #F8F0C0)",
    accent: "#C8A040",
    brands: "Onnit · Care/of · AG1",
    desc: "Nootropic blends, B-complex vitamins, lion's mane and morning greens for sustained energy without the crash.",
    icon: "⊞",
  },
];

const MUSE_PICKS = [
  { name: "HUM Collagen Love", sub: "Skin glow booster", accent: "#2A6A3A", hex: "#A8D8A8" },
  { name: "Moon Juice SuperYou", sub: "Adaptogen blend", accent: "#A08060", hex: "#E8D8A8" },
  { name: "Vital Proteins Collagen", sub: "Marine peptides", accent: "#C8A050", hex: "#F0E8C8" },
];

export default function WellnessScreen({ onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#2A6A3A] mb-0.5 opacity-70">Holistic Beauty</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Wellness</h2>
        </div>
        <div className="opacity-20"><SwanLogo size={24} /></div>
      </div>

      <div className="h-px mx-6 mb-4"
        style={{ background: "linear-gradient(90deg, transparent, rgba(42,106,58,0.3), transparent)" }} />

      {/* Intro */}
      <div className="px-6 mb-4 flex-shrink-0">
        <p className="font-cormorant text-base italic font-light text-[#8A8070] tracking-wide leading-relaxed">
          True beauty is an inside job — nourish the body, calm the mind, illuminate the skin.
        </p>
      </div>

      {/* Muse Picks strip */}
      <div className="px-6 mb-5 flex-shrink-0">
        <p className="font-sans text-[7px] tracking-[0.25em] uppercase text-[#C8B06A] mb-2.5">✦ Muse Picks</p>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {MUSE_PICKS.map(p => (
            <div key={p.name}
              className="flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer press-scale"
              style={{
                background: "rgba(255,253,248,0.8)",
                border: "1px solid rgba(200,176,106,0.2)",
                boxShadow: "0 2px 8px rgba(11,60,38,0.05)",
              }}>
              <div className="w-7 h-7 rounded-full flex-shrink-0"
                style={{ background: p.hex, border: "1px solid rgba(200,176,106,0.2)" }} />
              <div>
                <p className="font-serif text-[11px] text-[#1C1C1C] leading-tight whitespace-nowrap">{p.name}</p>
                <p className="font-sans text-[8px] text-[#8A8070] whitespace-nowrap">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pillars accordion */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8">
        <div className="flex flex-col gap-2">
          {PILLARS.map(col => {
            const isOpen = expanded === col.id;
            const isSaved = saved.has(col.id);
            return (
              <button key={col.id}
                onClick={() => setExpanded(isOpen ? null : col.id)}
                className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-300 w-full press-scale">
                <div className="flex items-stretch">
                  <div className="w-1.5 flex-shrink-0" style={{ background: col.gradient }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-sans text-[7px] tracking-[0.2em] uppercase opacity-60 mb-0.5"
                          style={{ color: col.accent }}>{col.sub}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="font-serif text-[15px] font-normal text-[#1C1C1C] leading-tight">{col.label}</p>
                          <span className="text-[#C8B06A] text-[8px]">{col.icon}</span>
                        </div>
                        {!isOpen && (
                          <p className="font-sans text-[9px] font-light text-[#8A8070] mt-0.5">{col.brands}</p>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300"
                        style={{
                          background: isOpen ? `${col.accent}18` : "rgba(200,176,106,0.08)",
                          border: `1px solid ${isOpen ? col.accent + "40" : "rgba(200,176,106,0.2)"}`,
                        }}>
                        <span className="text-sm font-light leading-none transition-all duration-300 block"
                          style={{ color: col.accent, transform: isOpen ? "rotate(45deg)" : "none" }}>
                          +
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-[rgba(200,176,106,0.12)]">
                        <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed mb-3">
                          {col.desc}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-sans text-[8px] tracking-[0.15em] uppercase" style={{ color: col.accent }}>
                            {col.brands}
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); setSaved(s => { const n = new Set(s); isSaved ? n.delete(col.id) : n.add(col.id); return n; }); }}
                            className="font-sans text-[8px] tracking-[0.12em] uppercase cursor-pointer transition-all"
                            style={{ color: isSaved ? col.accent : "rgba(11,60,38,0.35)" }}>
                            {isSaved ? "✦ Saved" : "+ Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Editorial banner */}
        <div className="mt-4 card-pearl rounded-2xl overflow-hidden cursor-pointer press-scale">
          <div className="relative h-40 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #0A1A0A, #1A3A1A, #2A6A3A)" }} />
            <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-15">
              <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                <circle cx="50" cy="60" r="35" stroke="#C8E8C0" strokeWidth="0.8" />
                <path d="M50 25 Q62 42 50 60 Q38 42 50 25" fill="#C8E8C0" opacity="0.35" />
                <path d="M85 60 Q68 72 50 60 Q68 48 85 60" fill="#C8E8C0" opacity="0.35" />
                <path d="M50 95 Q38 78 50 60 Q62 78 50 95" fill="#C8E8C0" opacity="0.35" />
                <path d="M15 60 Q32 48 50 60 Q32 72 15 60" fill="#C8E8C0" opacity="0.35" />
                <circle cx="50" cy="60" r="8" fill="#C8E8C0" opacity="0.3" />
              </svg>
            </div>
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />
            <div className="absolute bottom-5 left-5">
              <p className="font-sans text-[7px] tracking-[0.28em] uppercase mb-1 text-[#A8D8A8]">
                ✦ The Muse Edit
              </p>
              <p className="font-serif text-lg font-normal text-white leading-tight">The 30-Day Glow Protocol</p>
              <p className="font-sans text-[9px] text-white/55 mt-0.5">Supplements · Rituals · Inner Beauty</p>
            </div>
          </div>
        </div>

        <p className="font-sans text-[8px] font-light text-[#8A8070] text-center mt-4 px-4 leading-relaxed tracking-wide">
          All supplements curated with dermatologist input. Individual results vary. Consult your physician.
        </p>
      </div>
    </div>
  );
}
