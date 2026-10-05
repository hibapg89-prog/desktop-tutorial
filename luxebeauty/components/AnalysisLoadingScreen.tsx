"use client";

import { useEffect, useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onDone: () => void; }

const PHASES = [
  {
    icon: "◈",
    headline: "Identification en cours…",
    sub: "Lecture de la formule & des pigments",
    chips: ["Charlotte Tilbury", "Matte Revolution", "58 Rouge Vin"],
    color: "#C8B06A",
  },
  {
    icon: "◇",
    headline: "Correspondance ADN Muse…",
    sub: "Croisement de 40 000 formules dans notre base",
    chips: ["Pigments haute couture", "Huile de ricin bio", "Sans parabène"],
    color: "#2D7A52",
  },
  {
    icon: "✦",
    headline: "Curation de votre édition…",
    sub: "Rédaction de votre verdict personnalisé",
    chips: ["Score Muse : 94 %", "3 alternatives trouvées", "Accord teint parfait"],
    color: "#C4968A",
  },
];

const TOTAL_MS = 3400;
const PHASE_MS  = Math.floor(TOTAL_MS / PHASES.length);

export default function AnalysisLoadingScreen({ onDone }: Props) {
  const [progress,     setProgress]     = useState(0);
  const [phaseIdx,     setPhaseIdx]     = useState(0);
  const [chipsVisible, setChipsVisible] = useState<number[]>([]);

  // Exit after TOTAL_MS
  useEffect(() => {
    const t = setTimeout(onDone, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  // Smooth progress 0 → 100
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => (p >= 100 ? (clearInterval(id), 100) : p + 1));
    }, TOTAL_MS / 100);
    return () => clearInterval(id);
  }, []);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhaseIdx(1), PHASE_MS);
    const t2 = setTimeout(() => setPhaseIdx(2), PHASE_MS * 2);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Chips staggered within each phase
  useEffect(() => {
    setChipsVisible([]);
    PHASES[phaseIdx].chips.forEach((_, i) => {
      setTimeout(() => setChipsVisible(c => [...c, i]), i * 220 + 100);
    });
  }, [phaseIdx]);

  const phase      = PHASES[phaseIdx];
  const TOTAL_ORBS = 14;
  const filledOrbs = Math.round((progress / 100) * TOTAL_ORBS);

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[-10%] w-[50vw] h-[50vw] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${phase.color}30, transparent 65%)`, filter: "blur(40px)" }} />
        <div className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.2), transparent 65%)", filter: "blur(35px)" }} />
        {/* Ghost product silhouettes */}
        <div className="absolute top-[18%] left-[6%] opacity-10 anim-float" style={{ filter: "blur(8px)", transform: "rotate(-10deg)", animationDelay: "0.4s" }}>
          <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
            <rect x="10" y="20" width="20" height="50" rx="10" fill="#C8B06A" />
            <ellipse cx="20" cy="12" rx="12" ry="14" fill="#C8B06A" />
          </svg>
        </div>
        <div className="absolute bottom-[22%] right-[8%] opacity-10 anim-float" style={{ filter: "blur(6px)", transform: "rotate(8deg)", animationDelay: "1s" }}>
          <svg width="30" height="70" viewBox="0 0 30 70" fill="none">
            <rect x="8" y="30" width="14" height="35" rx="2" fill="#0B3C26" />
            <path d="M8 30 Q15 18 22 30" fill="#0B3C26" />
          </svg>
        </div>
        <div className="absolute top-[55%] left-[72%] opacity-8 anim-float" style={{ filter: "blur(10px)", animationDelay: "1.8s" }}>
          <svg width="50" height="38" viewBox="0 0 50 38" fill="none">
            <rect x="2" y="10" width="46" height="24" rx="4" fill="#C8B06A" />
            <ellipse cx="25" cy="10" rx="20" ry="6" fill="#E8D8A8" />
          </svg>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xs w-full">

        {/* Swan */}
        <div className="anim-float mb-5">
          <SwanLogo size={78} glow />
        </div>

        {/* Phase — key re-mounts on phaseIdx for CSS transition */}
        <div key={phaseIdx} className="anim-up mb-1">
          <p className="font-sans text-[8px] tracking-[0.4em] uppercase mb-2 transition-colors duration-700"
            style={{ color: phase.color, opacity: 0.75 }}>
            {phase.icon} &nbsp;Analyse The Muse
          </p>
          <h2 className="font-cormorant text-[1.3rem] italic font-light text-[#0B3C26] leading-snug mb-1">
            {phase.headline}
          </h2>
          <p className="font-sans text-[10px] font-light text-[#8A8070]">
            {phase.sub}
          </p>
        </div>

        <div className="divider-gold w-20 my-4 mx-auto" />

        {/* Analysis chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[52px]">
          {phase.chips.map((chip, i) => (
            <span key={`${phaseIdx}-${i}`}
              className="px-3 py-1.5 rounded-full font-sans text-[9px] tracking-[0.06em]"
              style={{
                background: `${phase.color}14`,
                border: `1px solid ${phase.color}45`,
                color: "#5A4A2A",
                opacity:   chipsVisible.includes(i) ? 1 : 0,
                transform: chipsVisible.includes(i) ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}>
              {chip}
            </span>
          ))}
        </div>

        {/* Moon-phase progress */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="moon-progress">
            {Array.from({ length: TOTAL_ORBS }).map((_, i) => (
              <div key={i} className="moon-phase"
                style={{
                  background:  i < filledOrbs ? "#0B3C26" : "transparent",
                  border:      i < filledOrbs ? "none" : "1.5px solid rgba(11,60,38,0.28)",
                  transform:   i < filledOrbs
                    ? `scaleX(${0.55 + Math.min(i + 1, filledOrbs - i, 1) * 0.45})`
                    : "scaleX(0.55)",
                  opacity:     i < filledOrbs ? 0.35 + (i / Math.max(filledOrbs, 1)) * 0.65 : 0.18,
                  transition:  "all 0.25s ease",
                }} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="divider-gold w-8" />
            <span className="font-sans text-[10px] font-light text-[#0B3C26] tracking-widest tabular-nums w-8 text-center">
              {progress}%
            </span>
            <div className="divider-gold w-8" />
          </div>
        </div>

        {/* Soundscape whisper */}
        <p className="font-cormorant text-[11px] italic mt-6 tracking-wide"
          style={{ color: "rgba(11,60,38,0.32)" }}>
          Laissez-vous porter par l&apos;ambiance Muse ♫
        </p>
      </div>
    </div>
  );
}
