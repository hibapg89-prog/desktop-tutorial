"use client";

import { useEffect } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props {
  onDone: () => void;
}

const TOTAL_PHASES = 14;
const FILLED = 7; // 50%

export default function AnalysisLoadingScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Blurred product background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.3), transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.25), transparent 65%)", filter: "blur(35px)" }} />
        <div className="absolute top-[50%] left-[60%] w-[30vw] h-[30vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(11,60,38,0.1), transparent 65%)", filter: "blur(30px)" }} />
        {/* Blurred product silhouettes */}
        <div className="absolute top-[20%] left-[8%] opacity-10" style={{ filter: "blur(8px)", transform: "rotate(-10deg)" }}>
          <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
            <rect x="10" y="20" width="20" height="50" rx="10" fill="#C8B06A" />
            <ellipse cx="20" cy="12" rx="12" ry="14" fill="#C8B06A" />
          </svg>
        </div>
        <div className="absolute bottom-[25%] right-[10%] opacity-10" style={{ filter: "blur(6px)", transform: "rotate(8deg)" }}>
          <svg width="30" height="70" viewBox="0 0 30 70" fill="none">
            <rect x="8" y="30" width="14" height="35" rx="2" fill="#0B3C26" />
            <path d="M8 30 Q15 18 22 30" fill="#0B3C26" />
          </svg>
        </div>
        <div className="absolute top-[60%] left-[75%] opacity-8" style={{ filter: "blur(10px)" }}>
          <svg width="50" height="38" viewBox="0 0 50 38" fill="none">
            <rect x="2" y="10" width="46" height="24" rx="4" fill="#C8B06A" />
            <ellipse cx="25" cy="10" rx="20" ry="6" fill="#E8D8A8" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full">

        {/* Swan logo */}
        <div className="anim-float mb-6">
          <SwanLogo size={80} glow />
        </div>

        {/* Brand name */}
        <p className="font-sans text-[9px] tracking-[0.45em] uppercase text-[#0B3C26] opacity-50 mb-1">
          The Muse
        </p>
        <h2 className="font-serif text-2xl font-normal text-[#0B3C26] tracking-widest mb-2">
          THE MUSE
        </h2>

        <div className="divider-gold w-20 my-4 mx-auto" />

        {/* Italic serif copy */}
        <p className="font-cormorant text-lg italic font-light text-[#5A4A2A] mb-1 leading-snug">
          The Muse is identifying your<br />beauty treasures...
        </p>
        <p className="font-sans text-xs font-light text-[#8A8070] mb-10">
          Please wait while we curate your results
        </p>

        {/* Moon-phase progress bar */}
        <div className="flex flex-col items-center gap-3">
          <div className="moon-progress">
            {Array.from({ length: TOTAL_PHASES }).map((_, i) => (
              <div
                key={i}
                className="moon-phase"
                style={{
                  background: i < FILLED ? "#0B3C26" : "transparent",
                  border: i < FILLED ? "none" : "1.5px solid rgba(11,60,38,0.35)",
                  // Simulate moon phase crescent shapes
                  transform: i < FILLED
                    ? `scaleX(${0.6 + Math.min(i, FILLED - 1 - i + 1, 1) * 0.4})`
                    : `scaleX(${0.6 + Math.min(i - FILLED, TOTAL_PHASES - 1 - i, 1) * 0.4})`,
                  opacity: i < FILLED
                    ? 0.4 + (i / FILLED) * 0.6
                    : 0.2 + ((i - FILLED) / (TOTAL_PHASES - FILLED)) * 0.3,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="divider-gold w-8" />
            <span className="font-sans text-xs font-light text-[#0B3C26] tracking-widest">50%</span>
            <div className="divider-gold w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
