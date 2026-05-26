"use client";

import { useState } from "react";

interface Props {
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
}

const skinTypes = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
const skinConcerns = ["Hydration", "Anti-aging", "Brightening", "Acne", "Pores", "Redness", "Dark spots", "Texture"];
const tiers = [
  { id: "luxury", icon: "♛", label: "Luxury", sub: "La Mer, Chanel, La Prairie", color: "#C9A96E" },
  { id: "prestige", icon: "✦", label: "Prestige", sub: "Charlotte Tilbury, Clinique, Lancôme", color: "#A07840" },
  { id: "artisan", icon: "◈", label: "Artisan", sub: "Local & indie beauty brands", color: "#8A7060" },
  { id: "all", icon: "∞", label: "All Worlds", sub: "I love discovering everything", color: "#C9A96E" },
];

export default function BeautyProfileScreen({ onNext, onBack }: Props) {
  const [skinType, setSkinType] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [tier, setTier] = useState<string | null>(null);

  const toggleConcern = (c: string) => {
    setConcerns(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : prev.length < 3 ? [...prev, c] : prev
    );
  };

  const canContinue = skinType && concerns.length > 0 && tier;

  return (
    <div className="marble-bg min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 px-6 pt-10 pb-4"
        style={{ background: "rgba(250,247,242,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={onBack} className="text-[#8A7F74] text-xs tracking-[0.1em] uppercase font-jost hover:text-[#C9A96E] transition-colors flex items-center gap-1.5 mb-6">
          ← Back
        </button>
        <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] mb-2">Your Beauty Profile</p>
        <h2 className="font-display text-4xl font-normal text-[#2C2C2C] leading-tight">
          Let The Muse<br />know you
        </h2>
      </div>

      <div className="px-6 pb-32 max-w-lg mx-auto">
        {/* Skin Type */}
        <section className="mt-8">
          <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-[#8A7F74] mb-3">Skin Type</p>
          <div className="flex flex-wrap gap-2">
            {skinTypes.map(t => (
              <button
                key={t}
                onClick={() => setSkinType(t)}
                className={`tag-chip px-5 py-2.5 rounded-full ${skinType === t ? "selected" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <div className="divider-gold my-7" />

        {/* Skin Concerns */}
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-[#8A7F74]">Skin Concerns</p>
            <p className="font-jost text-[10px] text-[#C9A96E]">Choose up to 3</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {skinConcerns.map(c => (
              <button
                key={c}
                onClick={() => toggleConcern(c)}
                className={`tag-chip px-5 py-2.5 rounded-full ${concerns.includes(c) ? "selected" : ""}`}
                style={concerns.length >= 3 && !concerns.includes(c) ? { opacity: 0.4, pointerEvents: "none" } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <div className="divider-gold my-7" />

        {/* Beauty World */}
        <section>
          <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-[#8A7F74] mb-3">Your Beauty World</p>
          <div className="flex flex-col gap-3">
            {tiers.map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`beauty-tier-card rounded-2xl px-5 py-4 flex items-center gap-4 text-left ${tier === t.id ? "selected" : ""}`}
              >
                <span className="text-2xl" style={{ color: t.color }}>{t.icon}</span>
                <div>
                  <p className="font-display text-base font-normal text-[#2C2C2C]">{t.label}</p>
                  <p className="font-jost text-xs text-[#8A7F74] mt-0.5" style={{ color: t.color }}>{t.sub}</p>
                </div>
                {tier === t.id && (
                  <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: t.color }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-16 pt-6 z-20"
        style={{ background: "linear-gradient(to top, rgba(250,247,242,1) 60%, transparent)" }}>
        <button
          onClick={() => canContinue && onNext({ skinType, concerns, tier })}
          className={`btn-gold w-full py-4 rounded-full max-w-lg mx-auto block ${!canContinue ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={!canContinue}
        >
          Continue to My Vanity
        </button>
      </div>
    </div>
  );
}
