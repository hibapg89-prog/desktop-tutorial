"use client";

import { useState, useEffect, useRef } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; onMuseMirror?: () => void; onAnalysis?: () => void; }

type Phase = "idle" | "scanning" | "found";

const PRODUCT = {
  name: "Matte Revolution",
  brand: "Charlotte Tilbury",
  shade: "Pillow Talk",
  category: "Rouge à Lèvres",
  match: "94%",
};

export default function ScanScreen({ onBack, onMuseMirror, onAnalysis }: Props) {
  const { showToast } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startScan = () => {
    setPhase("scanning");
    timerRef.current = setTimeout(() => setPhase("found"), 2200);
  };

  const resetScan = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Accueil
        </button>
        <SwanLogo size={28} glow />
        <div className="font-sans text-[9px] tracking-[0.15em] uppercase transition-all"
          style={{ color: phase === "found" ? "#C8B06A" : "rgba(11,60,38,0.3)" }}>
          {phase === "found" ? "✦ Identifié" : "Scanner"}
        </div>
      </div>

      <div className="divider-gold mx-6 mb-5" />

      {/* Scan viewport */}
      <div className="mx-5 relative rounded-3xl overflow-hidden flex-shrink-0" style={{ height: 320 }}>

        {/* Background */}
        <div className="absolute inset-0 transition-all duration-700" style={{
          background: phase === "found"
            ? "linear-gradient(145deg, rgba(200,176,106,0.14), rgba(240,235,220,0.92))"
            : "linear-gradient(145deg, rgba(240,235,220,0.85), rgba(220,215,200,0.65))",
        }} />

        {/* Corner brackets */}
        {[["top-3 left-3", "border-t border-l"], ["top-3 right-3", "border-t border-r"],
          ["bottom-3 left-3", "border-b border-l"], ["bottom-3 right-3", "border-b border-r"]].map(([pos, borders], i) => (
          <div key={i} className={`absolute ${pos} w-7 h-7 ${borders} transition-all duration-500`}
            style={{
              borderColor: phase === "found" ? "#C8B06A" : "#0B3C26",
              opacity: phase === "scanning" ? 1 : 0.45,
              borderWidth: "1.5px",
              borderRadius: "2px",
            }} />
        ))}

        {/* Scan line */}
        {phase === "scanning" && <div className="scan-line" />}

        {/* Waveform bars */}
        {phase === "scanning" && (
          <div className="absolute bottom-12 left-0 right-0 flex items-end justify-center gap-[3px] px-10">
            {Array.from({ length: 26 }).map((_, i) => {
              const h = 8 + Math.abs(Math.sin(i * 0.62)) * 18;
              return (
                <div key={i} className="rounded-full flex-shrink-0"
                  style={{
                    width: 3,
                    height: h,
                    background: `rgba(11,60,38,${0.25 + Math.sin(i * 0.4) * 0.2})`,
                    animation: "waveform 0.8s ease-in-out infinite",
                    animationDelay: `${i * 0.04}s`,
                    transformOrigin: "bottom",
                  }} />
              );
            })}
          </div>
        )}

        {/* Gold pulse overlay when found */}
        {phase === "found" && (
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 45%, rgba(200,176,106,0.2), transparent 65%)",
            animation: "pulse 2s ease-in-out infinite",
          }} />
        )}

        {/* Lipstick illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{
            transform: phase === "found" ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <svg width="68" height="136" viewBox="0 0 68 136" fill="none">
              <defs>
                <linearGradient id="scanGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EAE0B0" />
                  <stop offset="50%" stopColor="#C8B06A" />
                  <stop offset="100%" stopColor="#A89050" />
                </linearGradient>
                <linearGradient id="scanRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C44860" />
                  <stop offset="100%" stopColor="#8B3A3A" />
                </linearGradient>
              </defs>
              {/* Bullet tip */}
              <path d="M34 6 C34 6 21 17 21 27 L47 27 C47 17 34 6 34 6Z" fill="url(#scanRed)" />
              {/* Bullet body */}
              <rect x="21" y="27" width="26" height="29" rx="1" fill="url(#scanRed)" />
              {/* Collar */}
              <rect x="19" y="54" width="30" height="6" rx="1" fill="url(#scanGold)" />
              {/* Tube body */}
              <rect x="17" y="60" width="34" height="52" rx="3" fill="url(#scanGold)" />
              {/* Label panel */}
              <rect x="21" y="68" width="26" height="36" rx="2" fill="rgba(11,60,38,0.85)" />
              {/* CT brand label lines */}
              <rect x="25" y="74" width="18" height="1.5" rx="0.75" fill="#C8B06A" opacity="0.85" />
              <rect x="26" y="79" width="16" height="1" rx="0.5" fill="#C8B06A" opacity="0.5" />
              <rect x="25" y="86" width="18" height="1" rx="0.5" fill="#C8B06A" opacity="0.4" />
              <rect x="26" y="90" width="13" height="1" rx="0.5" fill="#C8B06A" opacity="0.3" />
              {/* Bottom cap */}
              <rect x="17" y="112" width="34" height="10" rx="3" fill="url(#scanGold)" opacity="0.65" />
              {/* Specular highlight */}
              <rect x="43" y="63" width="2.5" height="44" rx="1.25" fill="rgba(255,255,255,0.18)" />
            </svg>

            {/* Identification ring */}
            {phase === "found" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{
                  position: "absolute",
                  width: 108, height: 108,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(200,176,106,0.5)",
                  animation: "pulse 1.6s ease-in-out infinite",
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Scanning label pill */}
        {phase === "scanning" && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="px-3.5 py-1.5 rounded-full"
              style={{ background: "rgba(11,60,38,0.78)", backdropFilter: "blur(8px)" }}>
              <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A]">
                Analyse en cours...
              </p>
            </div>
          </div>
        )}

        {/* Found identification card */}
        {phase === "found" && (
          <div className="absolute bottom-4 left-4 right-4 sheet-enter">
            <div className="card-pearl rounded-2xl px-4 py-3 text-center"
              style={{ border: "1px solid rgba(200,176,106,0.3)" }}>
              <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#C8B06A] mb-1">✦ Produit Identifié</p>
              <p className="font-serif text-[15px] text-[#1C1C1C]">{PRODUCT.name} — {PRODUCT.shade}</p>
              <p className="font-sans text-[9px] text-[#8A8070] font-light">{PRODUCT.brand} · {PRODUCT.category}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTAs — phase-specific */}
      <div className="mx-5 mt-5 flex-1 flex flex-col">

        {phase === "idle" && (
          <>
            <div className="text-center mb-6">
              <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#8A8070] mb-1.5">
                Scanner un produit
              </p>
              <h3 className="font-serif text-xl text-[#1C1C1C] font-normal">
                Pointez vers votre produit
              </h3>
              <p className="font-sans text-[10px] text-[#8A8070] font-light mt-1">
                L'analyse ADN beauté démarre instantanément
              </p>
            </div>
            <button onClick={startScan}
              className="w-full py-4 rounded-full cursor-pointer btn-emerald press-scale">
              Lancer le Scan
            </button>
          </>
        )}

        {phase === "scanning" && (
          <>
            <div className="text-center mb-6">
              <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#C8B06A] mb-1.5 anim-up">
                Identification en cours
              </p>
              <h3 className="font-serif text-xl text-[#1C1C1C] font-normal">
                Analyse ADN beauté...
              </h3>
              <p className="font-sans text-[10px] text-[#8A8070] font-light mt-1">
                Lecture des pigments et de la formule
              </p>
            </div>
            <button onClick={resetScan}
              className="w-full py-3.5 rounded-full cursor-pointer btn-ghost press-scale">
              Annuler
            </button>
          </>
        )}

        {phase === "found" && (
          <>
            {/* Match score badge */}
            <div className="flex items-center gap-3 card-pearl rounded-2xl px-4 py-3 mb-4 anim-up"
              style={{ border: "1px solid rgba(200,176,106,0.25)" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(200,176,106,0.25), rgba(200,176,106,0.08))",
                  border: "1.5px solid rgba(200,176,106,0.4)",
                }}>
                <span className="font-serif text-sm font-medium" style={{ color: "#C8B06A" }}>
                  {PRODUCT.match}
                </span>
              </div>
              <div>
                <p className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#C8B06A] mb-0.5">Score Muse</p>
                <p className="font-serif text-sm text-[#1C1C1C]">Correspondance exceptionnelle</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 mb-2.5">
              <button
                onClick={() => { showToast("Ajoutée à ta Vanity ✦", "♡"); resetScan(); }}
                className="flex-1 py-3.5 rounded-full cursor-pointer btn-ghost press-scale font-sans text-[9px] tracking-[0.18em] uppercase">
                + Vanity
              </button>
              <button onClick={onAnalysis ?? (() => {})}
                className="flex-1 py-3.5 rounded-full cursor-pointer btn-gold press-scale font-sans text-[9px] tracking-[0.18em] uppercase">
                Voir l'Analyse ✦
              </button>
            </div>

            <button onClick={resetScan}
              className="w-full py-2.5 rounded-full cursor-pointer font-sans text-[8px] tracking-[0.15em] uppercase text-center transition-opacity hover:opacity-60"
              style={{ color: "rgba(11,60,38,0.38)" }}>
              ↺ Scanner un autre produit
            </button>

            {onMuseMirror && (
              <button onClick={onMuseMirror}
                className="w-full mt-2.5 py-3 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.18em] uppercase flex items-center justify-center gap-2"
                style={{ border: "1px solid rgba(200,176,106,0.3)", color: "#C8B06A", background: "rgba(200,176,106,0.06)" }}>
                <span>◈</span> Essayer virtuellement — Muse Mirror
              </button>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {["Accueil", "Scanner", "Routine", "Profil"].map((t, i) => (
            <button key={t} onClick={i !== 1 ? onBack : undefined}
              className={`nav-tab ${i === 1 ? "active" : ""} cursor-pointer`}>
              <div className="nav-line" />
              <span className="text-base">{["⌂", "⊞", "☰", "◯"][i]}</span>
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
