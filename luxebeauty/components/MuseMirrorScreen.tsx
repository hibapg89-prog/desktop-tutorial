"use client";

import { useState, useEffect } from "react";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; }

// ─── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: "pillow-talk",
    brand: "Charlotte Tilbury",
    name: "Matte Revolution",
    type: "lip" as const,
    accent: "#C4968A",
    shades: [
      { name: "Pillow Talk",      hex: "#C4968A" },
      { name: "Walk of No Shame", hex: "#A85850" },
      { name: "Bond Girl",        hex: "#8A3040" },
      { name: "The Queen",        hex: "#602030" },
      { name: "First Dance",      hex: "#D4B0A8" },
    ],
  },
  {
    id: "soft-pinch",
    brand: "Rare Beauty",
    name: "Soft Pinch Liquid Blush",
    type: "blush" as const,
    accent: "#E890A0",
    shades: [
      { name: "Joy",      hex: "#E890A0" },
      { name: "Bliss",    hex: "#C86878" },
      { name: "Hope",     hex: "#F0A8A0" },
      { name: "Serenity", hex: "#D4A0B0" },
      { name: "Peaceful", hex: "#F0C8C0" },
    ],
  },
  {
    id: "la-mer-glow",
    brand: "La Mer",
    name: "Crème de la Mer",
    type: "glow" as const,
    accent: "#C8B06A",
    shades: [
      { name: "Moonlit Glow",     hex: "#F8E8C8" },
      { name: "Pearl Radiance",   hex: "#F4ECD8" },
      { name: "Golden Dew",       hex: "#F0D8A8" },
    ],
  },
];

type Intensity = "subtle" | "medium" | "bold";

const INTENSITY_OPACITY: Record<Intensity, number> = {
  subtle: 0.35,
  medium: 0.6,
  bold:   0.82,
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MuseMirrorScreen({ onBack }: Props) {
  const { showToast } = useToast();
  const [phase,      setPhase]      = useState<"scanning" | "ready">("scanning");
  const [productIdx, setProductIdx] = useState(0);
  const [shadeIdx,   setShadeIdx]   = useState(0);
  const [intensity,  setIntensity]  = useState<Intensity>("medium");
  const [flash,      setFlash]      = useState(false);
  const [saved,      setSaved]      = useState(false);

  const product = PRODUCTS[productIdx];
  const shade   = product.shades[shadeIdx];

  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setShadeIdx(0);
  }, [productIdx]);

  const handleCapture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    showToast("Look captured ✦", "📸");
  };

  const handleSave = () => {
    setSaved(true);
    showToast(`${product.name} added to Vanity ✦`, "✦");
  };

  const opacity = INTENSITY_OPACITY[intensity];

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Camera flash overlay */}
      {flash && (
        <div className="fixed inset-0 z-[300] bg-white pointer-events-none"
          style={{ animation: "flashFade 0.35s ease forwards" }} />
      )}

      <style>{`
        @keyframes flashFade {
          0%   { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes scanReveal {
          0%   { top: 5%; }
          100% { top: 90%; }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .scan-reveal { animation: scanReveal 1.5s ease-in-out; }
        .overlay-in  { animation: overlayIn 0.6s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">The Muse</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Muse Mirror</h2>
        </div>
        <button onClick={handleCapture}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(11,60,38,0.06)]"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <svg width="15" height="13" viewBox="0 0 15 13" fill="none" stroke="#0B3C26" strokeWidth="1.1" strokeLinecap="round">
            <rect x="1" y="3" width="13" height="9" rx="1.5" />
            <circle cx="7.5" cy="7.5" r="2.3" />
            <path d="M5 1H10" />
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-4" />

      {/* ── Face Viewport ── */}
      <div className="mx-5 mb-4 relative" style={{ aspectRatio: "3/4", maxHeight: "48vh" }}>
        <div className="absolute inset-0 rounded-[44%_44%_38%_38%_/_52%_52%_40%_40%] overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #F6EDE4 0%, #EDD8C0 45%, #D9B894 100%)",
            boxShadow: "0 8px 40px rgba(11,60,38,0.12), 0 2px 12px rgba(200,176,106,0.15)",
            border: "1px solid rgba(200,176,106,0.22)",
          }}>

          {/* Subtle facial features */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Eyes */}
            <div className="absolute" style={{ top: "30%", left: "27%", width: "13%", height: "4.5%",
              borderRadius: "50%", background: "rgba(60,35,20,0.55)" }} />
            <div className="absolute" style={{ top: "30%", right: "27%", width: "13%", height: "4.5%",
              borderRadius: "50%", background: "rgba(60,35,20,0.55)" }} />
            {/* Nose hint */}
            <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: "3%", height: "4%", borderRadius: "50%", background: "rgba(180,130,90,0.25)" }} />
          </div>

          {/* Glow overlay (La Mer) */}
          {product.type === "glow" && (
            <div className="absolute inset-0 overlay-in" style={{
              background: `radial-gradient(ellipse at 50% 40%, ${shade.hex}${Math.round(opacity * 180).toString(16).padStart(2,"0")} 0%, transparent 70%)`,
              mixBlendMode: "overlay",
            }} />
          )}

          {/* Blush overlay (Rare Beauty) */}
          {product.type === "blush" && (
            <>
              <div className="absolute overlay-in" style={{
                top: "40%", left: "8%", width: "26%", height: "18%",
                borderRadius: "50%",
                background: shade.hex,
                opacity,
                filter: "blur(10px)",
              }} />
              <div className="absolute overlay-in" style={{
                top: "40%", right: "8%", width: "26%", height: "18%",
                borderRadius: "50%",
                background: shade.hex,
                opacity,
                filter: "blur(10px)",
              }} />
            </>
          )}

          {/* Lip overlay (Charlotte Tilbury) */}
          {product.type === "lip" && (
            <div className="absolute overlay-in" style={{
              bottom: "20%", left: "50%", transform: "translateX(-50%)",
              width: "30%", height: "10%",
              borderRadius: "50%",
              background: shade.hex,
              opacity,
              filter: "blur(3px)",
            }} />
          )}

          {/* Scan line (scanning phase) */}
          {phase === "scanning" && (
            <div className="absolute left-0 right-0 h-[2px] scan-reveal"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(200,176,106,0.8), transparent)",
                boxShadow: "0 0 8px rgba(200,176,106,0.5)",
              }} />
          )}

          {/* Scanning overlay text */}
          {phase === "scanning" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(250,246,239,0.15)", backdropFilter: "blur(2px)" }}>
              <p className="font-cormorant italic text-[15px] text-[#8A8070]">The Muse is seeing you</p>
              <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A] mt-1">Analysing your beauty...</p>
            </div>
          )}

          {/* Corner brackets */}
          {[["top-3 left-3","border-t border-l"],["top-3 right-3","border-t border-r"],
            ["bottom-3 left-3","border-b border-l"],["bottom-3 right-3","border-b border-r"]].map(([pos,brd]) => (
            <div key={pos} className={`absolute ${pos} w-5 h-5 ${brd}`}
              style={{ borderColor: "rgba(200,176,106,0.5)", borderRadius: "2px" }} />
          ))}

          {/* Ready: shade name badge */}
          {phase === "ready" && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: "rgba(11,60,38,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(200,176,106,0.2)" }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: shade.hex }} />
                <span className="font-sans text-[8px] tracking-[0.1em] text-[rgba(240,232,204,0.9)]">{shade.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Product Carousel ── */}
      {phase === "ready" && (
        <div className="px-5 mb-3">
          <div className="card-pearl rounded-2xl px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setProductIdx(i => (i - 1 + PRODUCTS.length) % PRODUCTS.length)}
              className="flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity press-scale">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#0B3C26" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1L1 7L7 13" />
              </svg>
            </button>
            <div className="flex-1 text-center">
              <p className="font-sans text-[7px] tracking-[0.15em] uppercase text-[#8A8070]">{product.brand}</p>
              <p className="font-serif text-[13px] text-[#1C1C1C] leading-tight mt-0.5">{product.name}</p>
            </div>
            <button
              onClick={() => setProductIdx(i => (i + 1) % PRODUCTS.length)}
              className="flex-shrink-0 cursor-pointer opacity-50 hover:opacity-100 transition-opacity press-scale">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#0B3C26" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L7 7L1 13" />
              </svg>
            </button>
          </div>

          {/* Shade Picker */}
          <div className="mt-2.5 flex items-center gap-2 justify-center">
            {product.shades.map((s, i) => (
              <button key={s.name}
                onClick={() => setShadeIdx(i)}
                className="rounded-full cursor-pointer transition-all duration-200 press-scale"
                style={{
                  width: "22px", height: "22px",
                  background: s.hex,
                  border: shadeIdx === i ? "2.5px solid #0B3C26" : "1.5px solid rgba(11,60,38,0.12)",
                  transform: shadeIdx === i ? "scale(1.25)" : "scale(1)",
                  boxShadow: shadeIdx === i ? `0 2px 8px ${s.hex}80` : "none",
                }} />
            ))}
          </div>

          {/* Intensity */}
          <div className="mt-3 flex gap-2 justify-center">
            {(["subtle","medium","bold"] as Intensity[]).map(lvl => (
              <button key={lvl}
                onClick={() => setIntensity(lvl)}
                className="px-3 py-1 rounded-full cursor-pointer transition-all duration-200 press-scale font-sans text-[8px] tracking-[0.08em] uppercase"
                style={{
                  background: intensity === lvl ? "rgba(11,60,38,0.1)" : "transparent",
                  border: intensity === lvl ? "1px solid rgba(11,60,38,0.25)" : "1px solid rgba(11,60,38,0.1)",
                  color: intensity === lvl ? "#0B3C26" : "rgba(11,60,38,0.4)",
                }}>
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      {phase === "ready" && (
        <div className="px-5 flex gap-2.5 mb-4">
          <button onClick={handleCapture}
            className="flex-1 py-3 rounded-full cursor-pointer btn-ghost press-scale font-sans text-[9px] tracking-[0.15em] uppercase">
            ◈ Capture
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.12em] uppercase text-[rgba(240,232,204,0.95)]"
            style={{
              background: saved ? "#0B3C26" : `linear-gradient(135deg, ${product.accent}, #C8B06A)`,
              boxShadow: saved ? "0 4px 20px rgba(11,60,38,0.3)" : `0 4px 20px ${product.accent}50`,
              transition: "all 0.3s ease",
            }}>
            {saved ? "In Vanity ✦" : "Save to Vanity ✦"}
          </button>
        </div>
      )}

      {/* Product dots */}
      {phase === "ready" && (
        <div className="flex justify-center gap-1.5 mb-4">
          {PRODUCTS.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === productIdx ? "16px" : "5px",
                height: "5px",
                background: i === productIdx ? "#C8B06A" : "rgba(200,176,106,0.3)",
              }} />
          ))}
        </div>
      )}
    </div>
  );
}
