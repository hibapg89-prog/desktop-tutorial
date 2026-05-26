"use client";

import { useState } from "react";

interface Props { onNext: () => void; }

const welcomeWords = ["Bienvenue", "Welcome", "Willkommen", "Bienvenida", "Benvenuto"];

export default function LandingScreen({ onNext }: Props) {
  const [referral, setReferral] = useState("");

  return (
    <div className="marble-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #E8D5A3, transparent)" }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #C9A96E, transparent)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #F0E8D5, transparent)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">

        {/* Logo */}
        <div className="anim-fade-up mb-8">
          <div className="anim-float inline-block">
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <circle cx="36" cy="46" r="22" fill="none" stroke="#C9A96E" strokeWidth="1.5" />
              <circle cx="36" cy="46" r="14" fill="none" stroke="#C9A96E" strokeWidth="0.8" opacity="0.5" />
              <path d="M36 24 Q32 10 36 4 Q40 10 36 24" fill="#C9A96E" opacity="0.8" />
              <circle cx="36" cy="6" r="3" fill="#E8D5A3" />
              <path d="M28 38 Q36 32 44 38" stroke="#C9A96E" strokeWidth="1" fill="none" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="anim-fade-up-d1 font-display text-5xl font-normal text-[#2C2C2C] tracking-wide mb-2">
          LuxeBeauty
        </h1>

        {/* Tagline */}
        <p className="anim-fade-up-d2 font-cormorant text-xl italic text-[#8A7F74] tracking-wide mb-6">
          Elevating Your Beauty Journey
        </p>

        {/* Divider */}
        <div className="anim-fade-up-d2 w-48 divider-gold mb-5" />

        {/* Welcome in multiple languages */}
        <div className="anim-fade-up-d2 flex flex-wrap justify-center gap-x-3 gap-y-1 mb-10">
          {welcomeWords.map((w, i) => (
            <span key={i} className="font-jost text-xs tracking-[0.12em] text-[#C9A96E] opacity-80">
              {i > 0 && <span className="mr-3 opacity-40">·</span>}
              {w}
            </span>
          ))}
        </div>

        {/* Referral input */}
        <div className="anim-fade-up-d3 w-full mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Were you invited by a Muse Member?"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="w-full px-5 py-3.5 rounded-full text-center text-xs tracking-[0.08em] placeholder:text-[#B5A898] text-[#5A4A3A] outline-none transition-all duration-300 font-jost"
              style={{
                background: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(201,169,110,0.25)",
                backdropFilter: "blur(8px)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.6)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,110,0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.25)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {referral && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C9A96E]" />
            )}
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={onNext}
          className="anim-fade-up-d3 btn-gold w-full py-4 rounded-full mb-5 cursor-pointer"
        >
          Begin My Journey
        </button>

        {/* Guest link */}
        <button
          onClick={onNext}
          className="anim-fade-up-d4 font-jost text-xs tracking-[0.1em] text-[#8A7F74] hover:text-[#C9A96E] transition-colors duration-200 flex items-center gap-2 cursor-pointer"
        >
          Explore as a Guest
          <span className="text-base">→</span>
        </button>
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px shimmer-line opacity-60" />
    </div>
  );
}
