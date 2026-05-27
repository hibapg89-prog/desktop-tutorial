"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const RITUALS = [
  {
    id: "cleanse", label: "Cleanse", sub: "The first step",
    gradient: "linear-gradient(145deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A",
    desc: "Body washes, oils & bars that transform your shower into a spa moment.",
  },
  {
    id: "nourish", label: "Nourish", sub: "Drink it in",
    gradient: "linear-gradient(145deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A",
    desc: "Rich butters, lotions & serums that seal in softness all day long.",
  },
  {
    id: "exfoliate", label: "Exfoliate", sub: "Reveal the glow",
    gradient: "linear-gradient(145deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A",
    desc: "Gentle scrubs & acids that buff away dullness for luminous skin.",
  },
  {
    id: "bath", label: "Bath & Soak", sub: "Ritual immersion",
    gradient: "linear-gradient(145deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A",
    desc: "Salts, oils & botanicals that turn your bath into a luxury escape.",
  },
  {
    id: "sun", label: "Sun Care", sub: "Protect & glow",
    gradient: "linear-gradient(145deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060",
    desc: "SPF body fluids, mists & after-sun care for year-round protection.",
  },
  {
    id: "hands", label: "Hands & Feet", sub: "The finishing touch",
    gradient: "linear-gradient(145deg, #E8E0C8, #C0B080, #EAE0C0)",
    accent: "#A09070",
    desc: "Creams, masks & cuticle treatments for perfectly groomed extremities.",
  },
];

export default function BodyScreen({ onBack }: Props) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-5%] w-[50vw] h-[50vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.4), transparent 65%)" }} />
        <div className="absolute bottom-[15%] left-[-5%] w-[40vw] h-[40vw] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(11,60,38,0.2), transparent 65%)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Curated</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Body</h2>
        </div>
        <div className="opacity-20"><SwanLogo size={24} /></div>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Intro */}
      <div className="relative z-10 px-6 mb-5 flex-shrink-0">
        <p className="font-cormorant text-base italic font-light text-[#8A8070] tracking-wide">
          Head to toe, every ritual deserves intention
        </p>
      </div>

      {/* Ritual cards — full width stacked */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-8">
        <div className="flex flex-col gap-3 mb-6">
          {RITUALS.map(r => {
            const isActive = active === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setActive(isActive ? null : r.id)}
                className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-300 w-full">

                <div className="flex items-stretch">
                  {/* Left colour swatch */}
                  <div className="w-2 flex-shrink-0 rounded-l-2xl"
                    style={{ background: r.gradient }} />

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[7px] tracking-[0.2em] uppercase opacity-60 mb-0.5"
                          style={{ color: r.accent }}>{r.sub}</p>
                        <p className="font-serif text-base font-normal text-[#1C1C1C]">{r.label}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${r.accent}18`, border: `1px solid ${r.accent}30` }}>
                        <span className="text-xs transition-transform duration-300"
                          style={{ color: r.accent, transform: isActive ? "rotate(45deg)" : "none" }}>+</span>
                      </div>
                    </div>
                    {isActive && (
                      <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed mt-2.5 border-t border-[rgba(200,176,106,0.15)] pt-2.5">
                        {r.desc}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Seasonal ritual banner */}
        <div className="card-pearl rounded-2xl overflow-hidden cursor-pointer">
          <div className="relative h-44 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #0A2A1A, #1A4A2A, #2A6A3A)" }} />

            {/* Botanical illustration */}
            <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-12">
              <svg width="120" height="160" viewBox="0 0 120 160" fill="none">
                <path d="M60 160 L60 60" stroke="#C8B06A" strokeWidth="1.5" />
                <path d="M60 120 Q40 100 20 110" stroke="#C8B06A" strokeWidth="1" fill="none" />
                <path d="M60 100 Q80 80 100 90" stroke="#C8B06A" strokeWidth="1" fill="none" />
                <path d="M60 80 Q35 55 25 60" stroke="#C8B06A" strokeWidth="1" fill="none" />
                <ellipse cx="20" cy="110" rx="12" ry="8" fill="#C8B06A" opacity="0.3" />
                <ellipse cx="100" cy="88" rx="12" ry="8" fill="#C8B06A" opacity="0.3" />
                <ellipse cx="24" cy="59" rx="10" ry="7" fill="#C8B06A" opacity="0.25" />
              </svg>
            </div>

            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute bottom-5 left-5">
              <p className="font-sans text-[7px] tracking-[0.28em] uppercase text-[#C8B06A] mb-1">✦ Summer Edit</p>
              <p className="font-serif text-xl font-normal text-white leading-tight">The Body Ritual</p>
              <p className="font-sans text-[9px] text-white/60 mt-1">Cleanse · Nourish · Glow</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
