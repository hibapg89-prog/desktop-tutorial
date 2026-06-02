"use client";

import { useEffect, useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onEnter: () => void; }

const CURATED = [
  { name: "Charlotte Tilbury Pillow Talk",   type: "Lip Liner",    hex: "#BC8F8F" },
  { name: "La Mer Moisturizing Soft Cream",  type: "Moisturizer",  hex: "#A8C890" },
  { name: "Maison Margiela Replica",         type: "Fragrance",    hex: "#E8D8A8" },
];

export default function FirstMuseRevealScreen({ onEnter }: Props) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 950);
    const t3 = setTimeout(() => setStage(3), 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 py-16">

      {/* Expanding gold halo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] rounded-full transition-all duration-1500"
          style={{
            background: "radial-gradient(circle, rgba(200,176,106,0.1), transparent 55%)",
            opacity: stage >= 1 ? 1 : 0,
          }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.4), transparent 65%)" }} />
      </div>

      {/* Swan + label */}
      <div className="relative z-10 flex flex-col items-center mb-8 transition-all duration-1000"
        style={{ opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? "scale(1) translateY(0)" : "scale(0.7) translateY(20px)" }}>
        <SwanLogo size={90} glow />
        <p className="font-sans text-[7px] tracking-[0.45em] uppercase text-[#C8B06A] mt-4">
          Your First Muse
        </p>
      </div>

      {/* Greeting */}
      <div className="relative z-10 text-center mb-8 transition-all duration-700"
        style={{ opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? "translateY(0)" : "translateY(14px)" }}>
        <h2 className="font-serif text-4xl font-normal text-[#0B3C26] leading-tight mb-3">
          Bonjour, chérie
        </h2>
        <div className="divider-gold mx-10 mb-3" />
        <p className="font-cormorant text-xl italic font-light text-[#8A8070] tracking-wide">
          Your curated world is ready
        </p>
      </div>

      {/* Curated picks */}
      <div className="relative z-10 w-full max-w-xs mb-8 transition-all duration-700"
        style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(18px)" }}>
        <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#8A8070] mb-3 text-center">
          The Muse selected for you
        </p>
        <div className="flex flex-col gap-2">
          {CURATED.map((product, i) => (
            <div key={product.name}
              className="card-pearl rounded-xl px-4 py-3 flex items-center gap-3 transition-all duration-500"
              style={{ transitionDelay: `${i * 0.1}s`, opacity: stage >= 3 ? 1 : 0 }}>
              <div className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: product.hex, border: "1px solid rgba(200,176,106,0.25)" }} />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm text-[#1C1C1C] leading-tight truncate">{product.name}</p>
                <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">{product.type}</p>
              </div>
              <span className="text-[#C8B06A] text-xs flex-shrink-0">✦</span>
            </div>
          ))}
        </div>
        <p className="font-sans text-[9px] text-center text-[#C8B06A] mt-3 tracking-wide">
          + many more await inside ✦
        </p>
      </div>

      {/* CTA */}
      <div className="relative z-10 w-full max-w-xs transition-all duration-700"
        style={{ opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? "translateY(0)" : "translateY(14px)" }}>
        <button onClick={onEnter}
          className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:opacity-90"
          style={{
            background: "linear-gradient(145deg, #0B3C26, #1A5C3A)",
            color: "rgba(240,232,204,0.95)",
            boxShadow: "0 6px 32px rgba(11,60,38,0.28)",
          }}>
          Enter My World ✦
        </button>
      </div>
    </div>
  );
}
