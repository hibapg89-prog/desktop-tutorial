"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; onSocial?: () => void; }

// ─── Types & Data ──────────────────────────────────────────────────────────────

type Tier  = "elite" | "prestige" | "lumiere";
type Phase = "tier-select" | "sealed" | "opening" | "reveal" | "complete";

const TIERS = {
  elite: {
    label: "Élite", tagline: "L'essentiel du luxe",
    accentA: "#B8B8C8", accentB: "#C4968A",
    bg: "linear-gradient(135deg, #F4F2F6, #E8D8D4, #F0ECF0)",
    count: "4 pièces", icon: "○",
    perks: ["3 produits essentiels", "1 échantillon luxe", "Accès Early Bird"],
  },
  prestige: {
    label: "Prestige", tagline: "La curation Muse",
    accentA: "#C8B06A", accentB: "#0B3C26",
    bg: "linear-gradient(135deg, #FAF4E4, #F0E4B8, #E8D898)",
    count: "5 pièces", icon: "✦",
    perks: ["5 produits full-size", "Accès prioritaire aux nouveautés", "Réductions Cercle"],
  },
  lumiere: {
    label: "Lumière", tagline: "L'exception absolue",
    accentA: "#C0A8E0", accentB: "#8868C0",
    bg: "linear-gradient(135deg, #F8F4FF, #EDE4FF, #E4D4F8)",
    count: "7 + Golden Ticket", icon: "◈",
    perks: ["7 produits d'exception", "Consultation personnalisée avec The Muse", "Éditions limitées en avant-première"],
  },
};

const LUMIERE_PRODUCTS = [
  { id: "fragrance", icon: "○", label: "L'Heure d'Or",         sub: "Eau de Parfum · 30ml",     accent: "#E8C870", bg: "linear-gradient(135deg, #FDF0D0, #F8D898, #F0C060)", desc: "Flacon en cristal. Une ode au soleil." },
  { id: "serum",     icon: "✦", label: "Sérum Éclat Infini",   sub: "Skincare · 30ml",           accent: "#88C0A0", bg: "linear-gradient(135deg, #E0F4E8, #A8D8B8, #70B890)", desc: "Aux particules de nacre. Teint Muse." },
  { id: "lipstick",  icon: "◈", label: "Rouge Signature",      sub: "Makeup · The Muse",         accent: "#C4968A", bg: "linear-gradient(135deg, #F0D0C8, #D0A898, #B87868)", desc: "Étui doré gravé. Une couleur intemporelle." },
  { id: "roller",    icon: "◇", label: "Roller Quartz Rose",   sub: "Devices · Sculptant",       accent: "#E098C0", bg: "linear-gradient(135deg, #FCE8F4, #F0C0D8, #D89AB8)", desc: "Sculpte, raffermit, éclaire." },
  { id: "bodyoil",   icon: "◯", label: "Huile de Soie",        sub: "Body · Scintillante",       accent: "#D8C878", bg: "linear-gradient(135deg, #FDF4D8, #EAD898, #D4C070)", desc: "La peau comme un voile de lumière." },
  { id: "mask",      icon: "〜", label: "Masque Soie & Cachemire", sub: "Haircare · Soin profond", accent: "#B898D8", bg: "linear-gradient(135deg, #EEE4FC, #D0B8EC, #B090D0)", desc: "Brillance miroir. Des cheveux parfaits." },
  { id: "scrunchie", icon: "✚", label: "Scrunchie en Soie",    sub: "Accessories · Champagne",   accent: "#D8C0A0", bg: "linear-gradient(135deg, #FDF0E0, #ECCDB8, #D8B098)", desc: "Soie naturelle. L'élégance dans chaque geste." },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MuseBoxScreen({ onBack, onSocial }: Props) {
  const { showToast } = useToast();
  const [tier,     setTier]     = useState<Tier>("lumiere");
  const [phase,    setPhase]    = useState<Phase>("tier-select");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [confetti, setConfetti] = useState(false);

  const t = TIERS[tier];

  const handleReveal = (id: string) => {
    if (revealed.has(id)) return;
    setRevealed(s => {
      const n = new Set(s);
      n.add(id);
      if (n.size === LUMIERE_PRODUCTS.length) {
        setTimeout(() => { setPhase("complete"); setConfetti(true); }, 500);
        showToast("Ta Muse Box est révélée ✦", "🎁");
      }
      return n;
    });
  };

  const handleOpen = () => {
    setPhase("opening");
    setTimeout(() => setPhase("reveal"), 900);
  };

  const reset = () => {
    setPhase("tier-select");
    setRevealed(new Set());
    setConfetti(false);
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      <style>{`
        @keyframes confettiDrop {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(600deg); opacity: 0; }
        }
        @keyframes lidLift {
          0%   { transform: translateY(0) rotateX(0deg); opacity: 1; }
          100% { transform: translateY(-80px) rotateX(-50deg); opacity: 0; }
        }
        @keyframes boxGlow {
          0%, 100% { box-shadow: 0 8px 40px rgba(200,176,106,0.2), 0 2px 10px rgba(200,176,106,0.1); }
          50%       { box-shadow: 0 12px 56px rgba(200,176,106,0.45), 0 4px 16px rgba(200,176,106,0.2); }
        }
        @keyframes productReveal {
          from { opacity: 0; transform: scale(0.86) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ribbonShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes ticketSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .box-glow    { animation: boxGlow 2.5s ease-in-out infinite; }
        .ribbon-anim {
          background: linear-gradient(90deg, #C8B06A 0%, #F0E090 40%, #C8B06A 60%, #F0E090 100%);
          background-size: 200% auto;
          animation: ribbonShimmer 2s linear infinite;
        }
        .product-in  { animation: productReveal 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .ticket-in   { animation: ticketSlide 0.5s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; opacity: 0; }
        .lid-lift    { animation: lidLift 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="absolute"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `-${8 + (i * 7) % 20}px`,
                width:  `${5 + (i * 3) % 7}px`,
                height: `${5 + (i * 3) % 7}px`,
                borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "1px",
                background: ["#C8B06A","#C4968A","#B0C8D8","#E0D4F8","#F0D898","#FFFFFF","#A8D8B8"][i % 7],
                animation: `confettiDrop ${1.4 + (i % 5) * 0.35}s ${(i % 7) * 0.1}s ease-in forwards`,
              }} />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={phase === "tier-select" ? onBack : reset}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← {phase === "tier-select" ? "Back" : "Choisir"}
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">The Muse</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Muse Box</h2>
        </div>
        <div className="w-14 text-right">
          {phase !== "tier-select" && (
            <span className="font-sans text-[7px] tracking-[0.1em] uppercase" style={{ color: t.accentA }}>{t.label}</span>
          )}
        </div>
      </div>

      <div className="divider-gold mx-5 mb-4" />

      {/* ── TIER SELECT ── */}
      {phase === "tier-select" && (
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          <p className="font-cormorant italic text-[15px] text-[#8A8070] text-center mb-5">
            Choisissez votre curation ✦
          </p>
          <div className="space-y-3">
            {(Object.entries(TIERS) as [Tier, (typeof TIERS)[Tier]][]).map(([id, cfg]) => (
              <button key={id}
                onClick={() => { setTier(id); setPhase("sealed"); }}
                className="w-full rounded-2xl overflow-hidden text-left cursor-pointer press-scale card-pearl"
                style={{ background: cfg.bg }}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-sans text-[7px] tracking-[0.2em] uppercase mb-1 opacity-60"
                        style={{ color: cfg.accentA }}>
                        The Muse · Mai 2026
                      </p>
                      <h3 className="font-serif text-[22px] font-normal text-[#1C1C1C]">{cfg.label}</h3>
                      <p className="font-cormorant italic text-[12px] text-[#8A8070] mt-0.5">{cfg.tagline}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.accentA}28`, border: `1px solid ${cfg.accentA}45` }}>
                      <span className="text-sm" style={{ color: cfg.accentA }}>{cfg.icon}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {cfg.perks.map(p => (
                      <div key={p} className="flex items-start gap-1.5">
                        <span className="text-[8px] mt-px flex-shrink-0" style={{ color: cfg.accentA }}>✦</span>
                        <span className="font-sans text-[9px] text-[#5A5040] leading-snug">{p}</span>
                      </div>
                    ))}
                  </div>
                  <p className="font-sans text-[7.5px] text-[#C8B06A] tracking-wide mt-3">{cfg.count} →</p>
                </div>
                <div className="h-0.5 ribbon-anim opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SEALED / OPENING BOX ── */}
      {(phase === "sealed" || phase === "opening") && (
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10 gap-0">

          {/* Box */}
          <div className="relative" style={{ width: "210px", perspective: "800px" }}>

            {/* Lid */}
            <div className={`relative h-[52px] rounded-t-2xl overflow-hidden ${phase === "opening" ? "lid-lift" : "box-glow"}`}
              style={{
                background: t.bg,
                border: "1px solid rgba(200,176,106,0.28)",
                borderBottom: "none",
              }}>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3.5 ribbon-anim opacity-70" />
            </div>

            {/* Body */}
            <div className={`rounded-b-2xl overflow-hidden relative ${phase !== "opening" ? "box-glow" : ""}`}
              style={{
                background: t.bg,
                border: "1px solid rgba(200,176,106,0.28)",
                borderTop: "none",
                minHeight: "168px",
              }}>
              {/* Ribbon vertical */}
              <div className="absolute top-0 bottom-0 ribbon-anim opacity-55"
                style={{ left: "50%", transform: "translateX(-50%)", width: "14px" }} />

              <div className="relative z-10 flex flex-col items-center pt-5 pb-6 gap-1.5">
                <p className="font-sans text-[6.5px] tracking-[0.25em] uppercase text-[#8A8070]">The Muse · Mai 2026</p>
                <p className="font-serif text-xl font-normal text-[#1C1C1C]">Muse Box</p>
                <p className="font-cormorant italic text-[13px]" style={{ color: t.accentA }}>{t.label}</p>
                <div className="mt-1.5 w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: `${t.accentA}20`, border: `1px solid ${t.accentA}40` }}>
                  <span className="text-lg" style={{ color: t.accentA }}>{t.icon}</span>
                </div>
              </div>
            </div>

            {/* Bow */}
            <div className="absolute left-1/2 z-20"
              style={{ top: "38px", transform: "translateX(-50%) translateY(-50%)" }}>
              <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
                <ellipse cx="17" cy="17" rx="16" ry="9.5" fill="#C8B06A" opacity="0.88" />
                <ellipse cx="17" cy="17" rx="10" ry="5.5" fill="#E8D070" opacity="0.65" />
                <ellipse cx="39" cy="17" rx="16" ry="9.5" fill="#C8B06A" opacity="0.88" />
                <ellipse cx="39" cy="17" rx="10" ry="5.5" fill="#E8D070" opacity="0.65" />
                <ellipse cx="28" cy="17" rx="6.5" ry="6.5" fill="#C8B06A" />
                <ellipse cx="28" cy="17" rx="3.5" ry="3.5" fill="#F0E090" opacity="0.75" />
              </svg>
            </div>
          </div>

          {/* Copy */}
          <p className="font-cormorant italic text-[15px] text-[#8A8070] text-center mt-7 mb-1">
            {phase === "opening" ? "La magie opère..." : "Ta sélection t'attend ✦"}
          </p>
          <p className="font-sans text-[7.5px] tracking-[0.18em] uppercase text-[#C8B06A] mb-8">
            {t.count} · Édition Collector
          </p>

          {phase === "sealed" && (
            <button onClick={handleOpen}
              className="px-10 py-3.5 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.18em] uppercase"
              style={{
                background: "linear-gradient(135deg, #C8B06A, #E8D070, #C8B06A)",
                color: "rgba(11,60,38,0.9)",
                boxShadow: "0 6px 28px rgba(200,176,106,0.45)",
              }}>
              Découvrir ma Box ✦
            </button>
          )}
        </div>
      )}

      {/* ── REVEAL GRID ── */}
      {(phase === "reveal" || phase === "complete") && (
        <div className="flex-1 overflow-y-auto px-4 pb-28">

          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            {phase === "complete" ? (
              <p className="font-cormorant italic text-[15px] text-[#1C1C1C]">Ta sélection Lumière est arrivée ✦</p>
            ) : (
              <p className="font-cormorant italic text-[13px] text-[#8A8070]">Tapez pour révéler ✦</p>
            )}
            {phase === "reveal" && (
              <span className="font-sans text-[8px] text-[#C8B06A] tracking-wide flex-shrink-0 ml-2">
                {revealed.size}/{LUMIERE_PRODUCTS.length}
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {LUMIERE_PRODUCTS.map((p, i) => {
              const isRevealed = revealed.has(p.id);
              return (
                <button key={p.id}
                  onClick={() => handleReveal(p.id)}
                  className="rounded-2xl overflow-hidden cursor-pointer relative text-left"
                  style={{ aspectRatio: "1/1", animationDelay: `${i * 0.05}s` }}>

                  {/* Tissue paper */}
                  {!isRevealed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
                      style={{
                        background: "linear-gradient(145deg, #F8F4EE, #F0E8DC, #EDE0D0)",
                        border: "1px solid rgba(200,176,106,0.18)",
                      }}>
                      <span className="text-[28px] opacity-20">✦</span>
                      <p className="font-sans text-[6.5px] tracking-[0.15em] uppercase text-[#8A8070] opacity-45">
                        Touchez
                      </p>
                    </div>
                  )}

                  {/* Product card */}
                  {isRevealed && (
                    <div className="absolute inset-0 flex flex-col justify-between p-3 rounded-2xl product-in"
                      style={{ background: p.bg, border: `1px solid ${p.accent}35` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${p.accent}28`, border: `1px solid ${p.accent}45` }}>
                        <span className="text-base leading-none">{p.icon}</span>
                      </div>
                      <div>
                        <p className="font-sans text-[6.5px] uppercase tracking-[0.08em] mb-0.5 opacity-70"
                          style={{ color: p.accent }}>
                          {p.sub.split("·")[0].trim()}
                        </p>
                        <p className="font-serif text-[11.5px] text-[#1C1C1C] leading-tight">{p.label}</p>
                        <p className="font-sans text-[7px] text-[#8A8070] mt-1 leading-snug opacity-80">{p.desc}</p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Golden Ticket */}
          {phase === "complete" && (
            <>
              <div className="mt-4 rounded-2xl overflow-hidden ticket-in"
                style={{
                  background: "linear-gradient(135deg, #C8B06A, #E8D070 50%, #C8B06A)",
                  boxShadow: "0 6px 28px rgba(200,176,106,0.4)",
                }}>
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <span className="text-2xl">🎟️</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-sans text-[6.5px] tracking-[0.18em] uppercase text-[rgba(11,60,38,0.55)] mb-0.5">
                      Bonus Lumière · Exclusif
                    </p>
                    <p className="font-serif text-[15px] text-[#0B3C26]">Carte de Consultation</p>
                    <p className="font-sans text-[8px] text-[rgba(11,60,38,0.75)] mt-0.5">
                      Session 15 min en visio avec une experte The Muse
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="border-t border-dashed border-[rgba(11,60,38,0.15)] pt-2.5 flex items-center justify-between">
                    <span className="font-sans text-[7px] text-[rgba(11,60,38,0.5)] tracking-wide">Golden Ticket · Nº 0001</span>
                    <span className="font-cormorant italic text-[11px] text-[rgba(11,60,38,0.7)]">The Muse ✦</span>
                  </div>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={() => {
                  showToast("Partagé dans ton Cercle ✦", "○");
                  onSocial?.();
                }}
                className="w-full mt-3.5 py-3.5 rounded-full cursor-pointer press-scale btn-emerald font-sans text-[9px] tracking-[0.18em] uppercase">
                Partager dans mon Cercle ✦
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
