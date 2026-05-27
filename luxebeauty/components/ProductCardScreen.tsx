"use client";

import { SwanLogo } from "./LandingScreen";

interface Props {
  onDupe: () => void;
  onBack: () => void;
}

export default function ProductCardScreen({ onDupe, onBack }: Props) {
  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Back */}
      <div className="px-6 pt-10 pb-2 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <SwanLogo size={28} />
      </div>

      {/* Brand tag */}
      <div className="text-center mt-2 mb-4">
        <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-[#0B3C26] opacity-60">
          L&apos;Élixir · Charlotte Tilbury
        </p>
        <div className="divider-gold w-16 mx-auto mt-3" />
      </div>

      {/* Product visual — glass dome */}
      <div className="flex-1 flex flex-col items-center px-6">
        <div className="relative flex items-center justify-center mb-6">
          {/* Glass dome circular background */}
          <div className="w-52 h-52 rounded-full flex items-center justify-center relative"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(255,253,248,0.98), rgba(240,232,210,0.9))",
              boxShadow: "0 20px 60px rgba(11,60,38,0.12), 0 8px 24px rgba(200,176,106,0.2), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 8px rgba(200,176,106,0.15)",
              border: "1px solid rgba(200,176,106,0.2)",
            }}>

            {/* Dome highlight */}
            <div className="absolute top-6 left-8 w-16 h-10 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)" }} />

            {/* Lipstick SVG */}
            <LipstickIllustration />
          </div>

          {/* Orbiting gold ring */}
          <div className="absolute inset-[-12px] rounded-full"
            style={{ border: "1px solid rgba(200,176,106,0.2)" }} />
          <div className="absolute inset-[-24px] rounded-full"
            style={{ border: "0.5px solid rgba(200,176,106,0.1)" }} />
        </div>

        {/* Product info */}
        <div className="text-center mb-6 max-w-xs w-full">
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#C8B06A] mb-2">
            Charlotte Tilbury
          </p>
          <h1 className="font-serif text-2xl font-normal text-[#1C1C1C] leading-tight mb-3">
            Matte Revolution<br />Matte Lip Colour
          </h1>
          <p className="font-cormorant text-base italic font-light text-[#8A8070] mb-4">
            58 Rouge Vin
          </p>

          {/* Price row */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="font-sans text-xs text-[#0B3C26]">€52.00</span>
            <span className="text-[#C8B06A] text-xs">·</span>
            <span className="font-sans text-xs text-[#0B3C26]">$58.00</span>
            <span className="text-[#C8B06A] text-xs">·</span>
            <span className="font-sans text-xs text-[#0B3C26]">¥9,000</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mb-6">
            <button className="btn-emerald flex-1 py-4 rounded-full cursor-pointer">
              Where to Buy
            </button>
            <button onClick={onDupe} className="btn-ghost flex-1 py-4 rounded-full cursor-pointer">
              Dupe Options
            </button>
          </div>

          {/* Tagline */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#C8B06A] text-sm">✦</span>
            <p className="font-cormorant text-sm italic font-light text-[#C8B06A]">
              Iconic shade &amp; creamy formula.
            </p>
            <span className="text-[#C8B06A] text-sm">✦</span>
          </div>
          <p className="font-sans text-[9px] text-[#8A8070] mt-1 tracking-wide">
            The Muse shimmer
          </p>
        </div>

        {/* Shade range dots */}
        <div className="flex gap-2 mb-6">
          {["#B07060","#8B3A3A","#C4968A","#7A3F3F","#D4956A","#9E6060"].map((c, i) => (
            <div key={i} className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200
              ${i === 1 ? "ring-2 ring-offset-2 ring-[#0B3C26] scale-110" : "hover:scale-110"}`}
              style={{ background: c, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LipstickIllustration() {
  return (
    <svg width="72" height="110" viewBox="0 0 72 110" fill="none">
      {/* Tube body */}
      <rect x="20" y="40" width="32" height="60" rx="3" fill="url(#tubeGold)" />
      {/* Tube label area */}
      <rect x="22" y="52" width="28" height="30" rx="1.5"
        fill="rgba(11,60,38,0.08)" stroke="rgba(200,176,106,0.3)" strokeWidth="0.5" />
      {/* Brand text on tube */}
      <text x="36" y="65" textAnchor="middle" fill="#0B3C26" fontSize="4.5" fontFamily="serif"
        letterSpacing="0.5" opacity="0.6">CHARLOTTE</text>
      <text x="36" y="72" textAnchor="middle" fill="#0B3C26" fontSize="4" fontFamily="serif"
        letterSpacing="0.3" opacity="0.5">TILBURY</text>
      {/* Tube bottom rim */}
      <rect x="18" y="96" width="36" height="6" rx="1.5" fill="#A89050" />
      {/* Tube shine */}
      <rect x="23" y="44" width="6" height="30" rx="3" fill="rgba(255,255,255,0.25)" />
      {/* Bullet lipstick */}
      <rect x="24" y="18" width="24" height="26" rx="1" fill="#8B3A3A" />
      <path d="M24 18 Q36 4 48 18" fill="#8B3A3A" />
      {/* Bullet shine */}
      <path d="M26 16 Q30 8 34 14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Gold ring connector */}
      <rect x="20" y="40" width="32" height="5" rx="1" fill="#C8B06A" />
      <defs>
        <linearGradient id="tubeGold" x1="20" y1="40" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4C07A" />
          <stop offset="40%" stopColor="#E8D898" />
          <stop offset="70%" stopColor="#C8B06A" />
          <stop offset="100%" stopColor="#A89050" />
        </linearGradient>
      </defs>
    </svg>
  );
}
