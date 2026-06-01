"use client";

import { useState } from "react";

interface Props {
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

const skinTypes = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
const concerns  = ["Hydration", "Anti-aging", "Brightening", "Acne", "Pores", "Redness", "Dark spots", "Texture"];
const tiers = [
  { id: "luxury",   icon: "♛", label: "Luxury",   sub: "La Mer · Chanel · La Prairie" },
  { id: "prestige", icon: "✦", label: "Prestige",  sub: "Charlotte Tilbury · Clinique · Lancôme" },
  { id: "artisan",  icon: "◈", label: "Artisan",   sub: "Local & indie beauty brands" },
  { id: "all",      icon: "∞", label: "All Worlds",sub: "I love discovering everything" },
];

export default function BeautyProfileScreen({ onNext, onBack }: Props) {
  const [skin, setSkin]       = useState<string | null>(null);
  const [picks, setPicks]     = useState<string[]>([]);
  const [tier, setTier]       = useState<string | null>(null);

  const toggleConcern = (c: string) =>
    setPicks(p => p.includes(c) ? p.filter(x => x !== c) : p.length < 3 ? [...p, c] : p);

  const ready = skin && picks.length > 0 && tier;

  return (
    <div className="satin-bg min-h-screen overflow-y-auto no-scrollbar">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-6 pt-10 pb-5"
        style={{ background: "rgba(250,246,239,0.9)", backdropFilter: "blur(16px)" }}>
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity mb-4 cursor-pointer flex items-center gap-1.5">
          ← Back
        </button>
        {/* Moon phase progress — step 4 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {(["🌑", "🌒", "🌓", "🌔"] as const).map((phase, i) => (
            <span key={i} className="text-xl transition-all duration-500"
              style={{
                opacity:   i === 3 ? 1 : 0.28,
                transform: i === 3 ? "scale(1.3)" : "scale(1)",
                filter:    i < 3 ? "saturate(0.6)" : "none",
              }}>
              {phase}
            </span>
          ))}
        </div>
        <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#C8B06A] mb-2">
          Your Beauty Profile
        </p>
        <h2 className="font-serif text-4xl font-normal text-[#1C1C1C] leading-tight">
          Let The Muse<br />know you
        </h2>
      </div>

      <div className="px-6 pb-32 max-w-lg mx-auto space-y-8 mt-6">

        {/* Skin type */}
        <section>
          <p className="font-sans text-[9px] tracking-[0.24em] uppercase text-[#8A8070] mb-3">Skin Type</p>
          <div className="flex flex-wrap gap-2">
            {skinTypes.map(t => (
              <button key={t} onClick={() => setSkin(t)}
                className={`chip px-5 py-2.5 rounded-full ${skin === t ? "active" : ""}`}>
                {t}
              </button>
            ))}
          </div>
        </section>

        <div className="divider-gold" />

        {/* Concerns */}
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <p className="font-sans text-[9px] tracking-[0.24em] uppercase text-[#8A8070]">Skin Concerns</p>
            <p className="font-sans text-[9px] text-[#C4968A] tracking-wide">Choose up to 3</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {concerns.map(c => (
              <button key={c} onClick={() => toggleConcern(c)}
                className={`chip px-5 py-2.5 rounded-full ${picks.includes(c) ? "active" : ""}
                  ${picks.length >= 3 && !picks.includes(c) ? "opacity-30 pointer-events-none" : ""}`}>
                {c}
              </button>
            ))}
          </div>
        </section>

        <div className="divider-gold" />

        {/* Beauty World */}
        <section>
          <p className="font-sans text-[9px] tracking-[0.24em] uppercase text-[#8A8070] mb-3">Your Beauty World</p>
          <div className="flex flex-col gap-2.5">
            {tiers.map(t => (
              <button key={t.id} onClick={() => setTier(t.id)}
                className={`card-pearl rounded-2xl px-5 py-4 flex items-center gap-4 text-left cursor-pointer
                  ${tier === t.id ? "!border-[#0B3C26] !bg-[rgba(11,60,38,0.04)]" : ""}`}>
                <span className="text-xl text-[#0B3C26] opacity-60">{t.icon}</span>
                <div className="flex-1">
                  <p className="font-serif text-base text-[#1C1C1C]">{t.label}</p>
                  <p className="font-sans text-[10px] text-[#8A8070] mt-0.5 font-light">{t.sub}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                  ${tier === t.id ? "border-[#0B3C26] bg-[#0B3C26]" : "border-[rgba(11,60,38,0.2)]"}`}>
                  {tier === t.id && (
                    <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                      <path d="M1 2.5L2.8 4.2L6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed CTA */}
      <div className="panel-fade fixed bottom-0 left-0 right-0 px-6 pb-14 pt-8 z-20"
        style={{ background: "linear-gradient(to top, rgba(250,246,239,1) 55%, transparent)" }}>
        <button
          onClick={() => {
            if (!ready) return;
            try {
              localStorage.setItem("luxe-profile", JSON.stringify({ skin, picks, tier }));
            } catch {}
            onNext({ skin, picks, tier });
          }}
          disabled={!ready}
          className={`btn-emerald w-full py-4 rounded-full max-w-lg mx-auto block cursor-pointer
            ${!ready ? "opacity-30 cursor-not-allowed" : ""}`}>
          Continue ✦
        </button>
      </div>
    </div>
  );
}
