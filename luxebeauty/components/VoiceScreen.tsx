"use client";

import { useState, useEffect } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

export default function VoiceScreen({ onBack }: Props) {
  const [listening, setListening] = useState(false);
  const [bars] = useState(() => Array.from({ length: 24 }, (_, i) => i));

  useEffect(() => {
    if (listening) {
      const t = setTimeout(() => setListening(false), 4000);
      return () => clearTimeout(t);
    }
  }, [listening]);

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.6), transparent 65%)" }} />
      </div>

      {/* Swan watermark top-right */}
      <div className="absolute top-6 right-6 opacity-20">
        <SwanLogo size={28} />
      </div>

      {/* Back */}
      <button onClick={onBack}
        className="absolute top-10 left-6 font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
        ← Back
      </button>

      {/* Waveform */}
      <div className="flex items-center gap-1 mb-10" style={{ height: "64px" }}>
        {bars.map((i) => {
          const isCenter = Math.abs(i - 11) <= 1;
          const baseH = isCenter ? 48 : Math.max(6, 36 - Math.abs(i - 11) * 5);
          return (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: isCenter ? "4px" : "2.5px",
                height: listening
                  ? `${baseH * (0.5 + Math.random() * 0.5)}px`
                  : `${baseH * 0.35}px`,
                background: isCenter
                  ? "linear-gradient(180deg, #0B3C26, #1A5C3A)"
                  : `rgba(${isCenter ? "11,60,38" : "200,176,106"},${0.4 + (1 - Math.abs(i - 11) / 12) * 0.4})`,
                animation: listening ? `waveBar ${0.4 + (i % 5) * 0.12}s ease-in-out infinite alternate` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Mic button */}
      <button
        onClick={() => setListening(l => !l)}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center mb-8 cursor-pointer transition-all duration-300
          ${listening ? "anim-pulse" : ""}`}
        style={{
          background: "linear-gradient(145deg, #C8B06A, #A09050)",
          boxShadow: listening
            ? "0 0 0 8px rgba(200,176,106,0.15), 0 8px 32px rgba(200,176,106,0.35)"
            : "0 4px 24px rgba(200,176,106,0.3)",
        }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <rect x="8" y="2" width="12" height="16" rx="6" />
          <path d="M4 14C4 20 8.7 24 14 24C19.3 24 24 20 24 14" />
          <line x1="14" y1="24" x2="14" y2="26" />
          <line x1="10" y1="26" x2="18" y2="26" />
        </svg>
      </button>

      {/* Copy */}
      <div className="text-center">
        <p className="font-cormorant text-2xl italic font-light text-[#5A4A2A] mb-2">
          {listening ? "Listening..." : "Voice Search"}
        </p>
        <p className="font-sans text-sm font-light text-[#8A8070] tracking-wide">
          {listening ? "Say the product name" : "Tap the mic to begin"}
        </p>
      </div>

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
