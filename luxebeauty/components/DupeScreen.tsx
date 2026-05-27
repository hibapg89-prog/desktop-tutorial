"use client";

import { useState } from "react";

interface Props {
  onBack: () => void;
}

export default function DupeScreen({ onBack }: Props) {
  const [view, setView] = useState<"split" | "compare">("split");

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Dupe Finder</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Side by Side</h2>
        </div>
        <div className="flex gap-1">
          {["split","compare"].map(v => (
            <button key={v} onClick={() => setView(v as "split"|"compare")}
              className={`font-sans text-[8px] tracking-[0.15em] uppercase px-2 py-1 rounded-full transition-all cursor-pointer
                ${view === v ? "bg-[#0B3C26] text-[rgba(240,232,204,0.95)]" : "text-[#0B3C26] opacity-40"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {view === "split" ? <SplitView /> : <CompareView />}

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20"
        style={{ background: "rgba(250,246,239,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <button className="btn-rose w-full py-4 rounded-full cursor-pointer">
          {view === "split" ? "Discover the Dupe" : "Compare & Decide"}
        </button>
      </div>
    </div>
  );
}

function SplitView() {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32">
      {/* Section header */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#0B3C26] text-center">Parisian Luxury</p>
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#8A8070] text-center">Local Artisan</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Luxury */}
        <div className="card-pearl rounded-3xl overflow-hidden p-4 flex flex-col items-center text-center">
          {/* Product visual */}
          <div className="w-full h-36 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #FAF0E0, #EDE5CC)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 60% 30%, #C8B06A, transparent 60%)" }} />
            <LuxuryCreamJar />
          </div>

          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A] mb-1">La Mer</p>
          <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-2">
            Crème de la Mer
          </p>
          <p className="font-cormorant text-xs italic text-[#8A8070] mb-3 leading-tight">
            "Iconic, rich,<br />anti-aging formula"
          </p>

          <div className="font-serif text-base text-[#0B3C26] font-normal mb-3">$320</div>

          <div className="w-full space-y-1.5">
            {["Hydration", "Anti-aging", "Radiance"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8B06A]" />
                <span className="font-sans text-[9px] text-[#8A8070]">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Local artisan */}
        <div className="iridescent-card rounded-3xl overflow-hidden p-4 flex flex-col items-center text-center">
          {/* Product visual */}
          <div className="w-full h-36 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #EAF0E8, #D8E8D0)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 40% 40%, #1A5C3A, transparent 60%)" }} />
            <LocalCreamJar />
          </div>

          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#1A5C3A] mb-1">Maison Verte</p>
          <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-2">
            Botanical Reserve Crème
          </p>
          <p className="font-cormorant text-xs italic text-[#8A8070] mb-3 leading-tight">
            "Sustainable,<br />hand-crafted, potent"
          </p>

          <div className="font-serif text-base text-[#0B3C26] font-normal mb-3">$85</div>

          <div className="w-full space-y-1.5">
            {["Natural", "Eco-certified", "Potent"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A5C3A]" />
                <span className="font-sans text-[9px] text-[#8A8070]">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareView() {
  const metrics = [
    { label: "Scent Profile", luxury: "Subtle florals", local: "Earthy botanicals", luxVal: 80, locVal: 90 },
    { label: "Longevity", luxury: "12+ hours", local: "8–10 hours", luxVal: 92, locVal: 75 },
    { label: "Sustainability", luxury: "Mixed", local: "100% natural", luxVal: 45, locVal: 96 },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-32">
      {/* Header */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-center">
        <div className="card-pearl rounded-2xl py-3 px-4">
          <p className="font-sans text-[7px] tracking-[0.2em] uppercase text-[#C8B06A] mb-0.5">Sephora Luxury</p>
          <p className="font-serif text-sm text-[#1C1C1C]">Guerlain Abeille</p>
        </div>
        <div className="iridescent-card rounded-2xl py-3 px-4">
          <p className="font-sans text-[7px] tracking-[0.2em] uppercase text-[#1A5C3A] mb-0.5">Independent Alt</p>
          <p className="font-serif text-sm text-[#1C1C1C]">Maison Verte</p>
        </div>
      </div>

      {/* Comparison bars */}
      {metrics.map((m) => (
        <div key={m.label} className="card-pearl rounded-2xl p-4 mb-3">
          <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] mb-3">{m.label}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-sans text-[9px] text-[#8A8070] mb-1.5">{m.luxury}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(200,176,106,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.luxVal}%`, background: "linear-gradient(90deg, #C8B06A, #E8D8A8)" }} />
              </div>
              <p className="font-sans text-[8px] text-[#C8B06A] mt-1 text-right">{m.luxVal}%</p>
            </div>
            <div>
              <p className="font-sans text-[9px] text-[#8A8070] mb-1.5">{m.local}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(11,60,38,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.locVal}%`, background: "linear-gradient(90deg, #0B3C26, #2D7A52)" }} />
              </div>
              <p className="font-sans text-[8px] text-[#0B3C26] mt-1 text-right">{m.locVal}%</p>
            </div>
          </div>
        </div>
      ))}

      {/* Price comparison */}
      <div className="card-pearl rounded-2xl p-4 mb-3">
        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] mb-3">Price Comparison</p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-serif text-xl text-[#C8B06A]">$320</p>
            <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">Guerlain Abeille</p>
          </div>
          <div>
            <p className="font-serif text-xl text-[#0B3C26]">$85</p>
            <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">Save $235</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LuxuryCreamJar() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none">
      <ellipse cx="32" cy="48" rx="28" ry="6" fill="#C8B06A" opacity="0.3" />
      <rect x="6" y="20" width="52" height="28" rx="4" fill="url(#luxGold)" />
      <ellipse cx="32" cy="20" rx="26" ry="7" fill="#F0E8CC" />
      <ellipse cx="32" cy="20" rx="20" ry="5" fill="rgba(255,255,255,0.5)" />
      <rect x="14" y="26" width="36" height="16" rx="2" fill="rgba(11,60,38,0.06)" />
      <text x="32" y="37" textAnchor="middle" fill="#0B3C26" fontSize="5" fontFamily="serif" opacity="0.5" letterSpacing="0.5">LA MER</text>
      <defs>
        <linearGradient id="luxGold" x1="6" y1="20" x2="58" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8D8A8" />
          <stop offset="100%" stopColor="#C8B06A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LocalCreamJar() {
  return (
    <svg width="64" height="56" viewBox="0 0 64 56" fill="none">
      <ellipse cx="32" cy="48" rx="28" ry="6" fill="#1A5C3A" opacity="0.2" />
      <rect x="6" y="20" width="52" height="28" rx="4" fill="url(#localGreen)" />
      <ellipse cx="32" cy="20" rx="26" ry="7" fill="#E8F0E4" />
      <ellipse cx="32" cy="20" rx="20" ry="5" fill="rgba(255,255,255,0.5)" />
      <rect x="14" y="26" width="36" height="16" rx="2" fill="rgba(11,60,38,0.06)" />
      <text x="32" y="37" textAnchor="middle" fill="#0B3C26" fontSize="4.5" fontFamily="serif" opacity="0.5" letterSpacing="0.3">MAISON</text>
      {/* Leaf decoration */}
      <path d="M10 32 Q14 28 14 34 Q14 34 10 32Z" fill="#1A5C3A" opacity="0.4" />
      <path d="M54 28 Q50 24 50 30 Q50 30 54 28Z" fill="#1A5C3A" opacity="0.4" />
      <defs>
        <linearGradient id="localGreen" x1="6" y1="20" x2="58" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D0E8C8" />
          <stop offset="100%" stopColor="#A8C8A0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
