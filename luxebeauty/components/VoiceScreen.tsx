"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

const VOICE_IMG = "https://static.prod-images.emergentagent.com/jobs/0924067f-38ed-47a3-b0af-39a4c7e30618/images/129b9017c22f76befaea0e1b9cb0747e9a4a8859443bd483cd2a72e649a5a49d.png";

interface Props { onBack: () => void; }

export default function VoiceScreen({ onBack }: Props) {
  const [listening, setListening] = useState(false);

  const leftBars = Array.from({ length: 18 }, (_, i) => i);
  const rightBars = Array.from({ length: 18 }, (_, i) => i);

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.5), transparent 60%)" }} />
        <div className="absolute top-[30%] left-[10%] w-[30vw] h-[30vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(11,60,38,0.2), transparent 65%)" }} />
        <div className="absolute bottom-[30%] right-[8%] w-[25vw] h-[25vw] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.3), transparent 65%)" }} />
      </div>

      {/* Swan watermark */}
      <div className="absolute top-6 right-6 opacity-20">
        <SwanLogo size={28} />
      </div>

      {/* Back */}
      <button onClick={onBack}
        className="absolute top-10 left-6 font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
        ← Back
      </button>

      {/* Phone mockup preview */}
      <div className="relative z-10 mx-auto mb-5 rounded-2xl overflow-hidden flex-shrink-0"
        style={{ width: 220, height: 138 }}>
        <img src={VOICE_IMG} alt="" aria-hidden
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 20%" }} />
        <div className="absolute inset-0 rounded-2xl"
          style={{ border: "1px solid rgba(200,176,106,0.25)" }} />
      </div>

      {/* Main layout: waveform + mic + waveform in a row */}
      <div className="relative z-10 flex items-center gap-0 w-full px-4" style={{ height: "180px" }}>

        {/* Left waveform */}
        <div className="flex-1 flex items-center justify-end gap-[2px]" style={{ height: "120px" }}>
          {leftBars.map((i) => {
            const dist = 17 - i; // distance from center
            const baseH = Math.max(8, 80 - dist * 4.5);
            return (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: dist < 2 ? "4px" : "2.5px",
                  height: `${baseH * (listening ? 0.5 + Math.sin(i * 0.8) * 0.5 : 0.3)}px`,
                  background: i > 12
                    ? `linear-gradient(180deg, #0B3C26, #1A5C3A)`
                    : `rgba(200,176,106,${0.3 + (i / 18) * 0.5})`,
                  animation: listening ? `waveBarL${i % 5} ${0.3 + (i % 7) * 0.12}s ease-in-out infinite alternate` : "none",
                  minHeight: "4px",
                }}
              />
            );
          })}
        </div>

        {/* Central mic button */}
        <div className="mx-4 flex-shrink-0">
          <button
            onClick={() => setListening(l => !l)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300
              ${listening ? "anim-pulse" : ""}`}
            style={{
              background: "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)",
              boxShadow: listening
                ? "0 0 0 8px rgba(200,176,106,0.12), 0 0 0 16px rgba(200,176,106,0.06), 0 8px 40px rgba(200,176,106,0.4)"
                : "0 4px 32px rgba(200,176,106,0.35), 0 2px 8px rgba(200,176,106,0.2)",
            }}>
            {/* Retro-elegant mic SVG */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              {/* Capsule body */}
              <rect x="12" y="3" width="12" height="18" rx="6" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="1.8" />
              {/* Horizontal detail lines */}
              <line x1="12" y1="10" x2="24" y2="10" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="12" y1="14" x2="24" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Stand arm */}
              <path d="M7 18C7 24 11 29 18 29C25 29 29 24 29 18" strokeWidth="1.8" />
              {/* Stand base */}
              <line x1="18" y1="29" x2="18" y2="33" />
              <line x1="12" y1="33" x2="24" y2="33" />
            </svg>

            {/* Listening pulse rings */}
            {listening && (
              <>
                <div className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid rgba(200,176,106,0.4)", transform: "scale(1.3)", animation: "ping 1.5s ease-out infinite" }} />
                <div className="absolute inset-0 rounded-full"
                  style={{ border: "1px solid rgba(200,176,106,0.2)", transform: "scale(1.6)", animation: "ping 1.5s ease-out 0.5s infinite" }} />
              </>
            )}
          </button>
        </div>

        {/* Right waveform */}
        <div className="flex-1 flex items-center justify-start gap-[2px]" style={{ height: "120px" }}>
          {rightBars.map((i) => {
            const dist = i;
            const baseH = Math.max(8, 80 - dist * 4.5);
            return (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: dist < 2 ? "4px" : "2.5px",
                  height: `${baseH * (listening ? 0.5 + Math.sin(i * 0.9 + 1) * 0.5 : 0.3)}px`,
                  background: i < 5
                    ? `linear-gradient(180deg, #0B3C26, #1A5C3A)`
                    : `rgba(200,176,106,${0.3 + ((17 - i) / 18) * 0.5})`,
                  animation: listening ? `waveBarR${i % 5} ${0.3 + ((i + 2) % 7) * 0.12}s ease-in-out infinite alternate` : "none",
                  minHeight: "4px",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 text-center mt-8 px-8">
        <p className="font-cormorant text-2xl italic font-light text-[#3A3020] mb-2">
          {listening ? "Listening..." : "Voice Search"}
        </p>
        <p className="font-sans text-sm font-light text-[#8A8070] tracking-wide">
          {listening ? "Say the product name" : "Tap the microphone to begin"}
        </p>
      </div>

      <style>{`
        @keyframes waveBarL0 { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
        @keyframes waveBarL1 { from { transform: scaleY(0.4); } to { transform: scaleY(0.9); } }
        @keyframes waveBarL2 { from { transform: scaleY(0.2); } to { transform: scaleY(1.1); } }
        @keyframes waveBarL3 { from { transform: scaleY(0.5); } to { transform: scaleY(0.8); } }
        @keyframes waveBarL4 { from { transform: scaleY(0.3); } to { transform: scaleY(0.95); } }
        @keyframes waveBarR0 { from { transform: scaleY(0.35); } to { transform: scaleY(1.05); } }
        @keyframes waveBarR1 { from { transform: scaleY(0.25); } to { transform: scaleY(0.9); } }
        @keyframes waveBarR2 { from { transform: scaleY(0.4); } to { transform: scaleY(1.1); } }
        @keyframes waveBarR3 { from { transform: scaleY(0.3); } to { transform: scaleY(0.85); } }
        @keyframes waveBarR4 { from { transform: scaleY(0.45); } to { transform: scaleY(1); } }
        @keyframes ping {
          0% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
