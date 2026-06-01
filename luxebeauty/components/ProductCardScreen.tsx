"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";
import { useCurrency } from "./CurrencyContext";
import type { VanityItem } from "./VanityScreen";

interface Props {
  onDupe: () => void;
  onBack: () => void;
  onSave?: (item: VanityItem) => void;
}

const RETAILERS = [
  { name: "Charlotte Tilbury", sub: "Site officiel · Livraison offerte", eur: 52, badge: "Official",  accent: "#C8B06A" },
  { name: "Sephora",           sub: "Click & Collect disponible",        eur: 52, badge: "Bestseller", accent: "#D4547A" },
  { name: "Net-a-Porter",      sub: "Livraison express 24h",             eur: 55, badge: "Luxe",       accent: "#0B3C26" },
  { name: "SpaceNK",           sub: "Points beauté cumulables",          eur: 52, badge: "Member",     accent: "#6B5B8A" },
];

const INGREDIENTS = [
  { name: "Huile de Ricin", role: "Hydratation intense", color: "#C8B06A" },
  { name: "Complexe Vitamine E", role: "Antioxydant protecteur", color: "#2D7A52" },
  { name: "Pigments Haute Couture", role: "Couleur ultra-intense", color: "#8B3A3A" },
  { name: "Cire d'Abeille", role: "Tenue & confort", color: "#A89050" },
];

const BADGES = ["Clean Beauty", "Vegan", "12h de tenue", "Pigments haute couture"];

export default function ProductCardScreen({ onDupe, onBack, onSave }: Props) {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [boutiqueOpen, setBoutiqueOpen] = useState(false);

  const handleSave = () => {
    setSaved(true);
    showToast("Ajoutée à ta Vanity ✦", "♡");
    onSave?.({
      id: `ct-matte-${Date.now()}`,
      type: "lipstick",
      name: "Matte Revolution",
      brand: "Charlotte Tilbury",
      hex: "#8B3A3A",
      shelf: "vanity",
    });
  };

  return (
    <>
      <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-10 pb-2 flex items-center justify-between flex-shrink-0">
          <button onClick={onBack}
            className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            ← Back
          </button>
          <SwanLogo size={28} />
          <button onClick={handleSave}
            className="font-sans text-[9px] tracking-[0.15em] uppercase transition-all cursor-pointer"
            style={{ color: saved ? "#C8B06A" : "rgba(11,60,38,0.35)" }}>
            {saved ? "✦ Saved" : "+ Save"}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-36">

          {/* Brand tag */}
          <div className="text-center mt-2 mb-5 px-6">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-[#0B3C26] opacity-60">
              L&apos;Élixir · Charlotte Tilbury
            </p>
            <div className="divider-gold w-16 mx-auto mt-3" />
          </div>

          {/* Product dome + Muse score */}
          <div className="flex items-center justify-center px-6 mb-7">
            <div className="relative">
              <div className="w-52 h-52 rounded-full flex items-center justify-center relative"
                style={{
                  background: "radial-gradient(circle at 35% 35%, rgba(255,253,248,0.98), rgba(240,232,210,0.9))",
                  boxShadow: "0 20px 60px rgba(11,60,38,0.12), 0 8px 24px rgba(200,176,106,0.2), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -2px 8px rgba(200,176,106,0.15)",
                  border: "1px solid rgba(200,176,106,0.2)",
                }}>
                <div className="absolute top-6 left-8 w-16 h-10 rounded-full opacity-40"
                  style={{ background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent)" }} />
                <LipstickIllustration />
              </div>

              {/* Orbiting rings */}
              <div className="absolute inset-[-12px] rounded-full pointer-events-none"
                style={{ border: "1px solid rgba(200,176,106,0.2)" }} />
              <div className="absolute inset-[-24px] rounded-full pointer-events-none"
                style={{ border: "0.5px solid rgba(200,176,106,0.1)" }} />

              {/* Muse Match Score badge */}
              <div className="absolute bottom-0 right-0 w-[58px] h-[58px] rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, #0B3C26, #1A5C3A)",
                  boxShadow: "0 4px 16px rgba(11,60,38,0.35)",
                  border: "2px solid rgba(200,176,106,0.4)",
                }}>
                <span className="font-serif text-base leading-none" style={{ color: "rgba(240,232,204,0.95)" }}>94</span>
                <span className="font-sans text-[8px]" style={{ color: "#C8B06A" }}>%</span>
                <span className="font-sans text-[6px] tracking-[0.06em] uppercase" style={{ color: "rgba(240,232,204,0.55)" }}>Accord</span>
              </div>
            </div>
          </div>

          {/* Product name & price */}
          <div className="px-6 text-center mb-5">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#C8B06A] mb-1.5">Charlotte Tilbury</p>
            <h1 className="font-serif text-2xl font-normal text-[#1C1C1C] leading-tight mb-2">
              Matte Revolution<br />Matte Lip Colour
            </h1>
            <p className="font-cormorant text-base italic font-light text-[#8A8070] mb-3">
              58 Rouge Vin
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-serif text-lg text-[#0B3C26]">€52</span>
              <span className="text-[#C8B06A] text-xs">·</span>
              <span className="font-sans text-xs text-[#8A8070]">$58 · ¥9 000</span>
            </div>
          </div>

          {/* Shade dots */}
          <div className="flex justify-center gap-2 mb-5">
            {["#B07060","#8B3A3A","#C4968A","#7A3F3F","#D4956A","#9E6060"].map((c, i) => (
              <div key={i}
                className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200
                  ${i === 1 ? "ring-2 ring-offset-2 ring-[#0B3C26] scale-110" : "hover:scale-110"}`}
                style={{ background: c, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            ))}
          </div>

          {/* Quality badges */}
          <div className="px-6 mb-5">
            <div className="flex flex-wrap justify-center gap-1.5">
              {BADGES.map(b => (
                <span key={b}
                  className="px-3 py-1.5 rounded-full font-sans text-[8px] tracking-[0.06em]"
                  style={{
                    background: "rgba(200,176,106,0.1)",
                    border: "1px solid rgba(200,176,106,0.28)",
                    color: "#5A4A2A",
                  }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          <div className="divider-gold w-20 mx-auto mb-5" />

          {/* The Muse Verdict */}
          <div className="px-6 mb-5">
            <div className="card-pearl rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm" style={{ color: "#C8B06A" }}>✦</span>
                <p className="font-sans text-[8px] tracking-[0.25em] uppercase" style={{ color: "#C8B06A" }}>
                  Le Verdict The Muse
                </p>
              </div>
              <p className="font-cormorant text-[15px] italic font-light text-[#0B3C26] leading-relaxed mb-4">
                &ldquo;Un rouge à lèvres qui s&apos;impose comme une référence absolue. Sa formule mate révolutionne le soin labial — tenue de 12 heures, confort exceptionnel, pigmentation haute couture.&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="divider-gold w-8" />
                <span className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#8A8070]">
                  Adored by 847 Muses
                </span>
                <div className="divider-gold w-8" />
              </div>
            </div>
          </div>

          {/* Key Ingredients */}
          <div className="px-6 mb-5">
            <p className="font-sans text-[8px] tracking-[0.28em] uppercase text-[#0B3C26] mb-3 opacity-60">
              Ingrédients Clés
            </p>
            <div className="card-pearl rounded-2xl p-4 space-y-3">
              {INGREDIENTS.map(ing => (
                <div key={ing.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ing.color }} />
                  <span className="font-sans text-[10px] text-[#1C1C1C] flex-1">{ing.name}</span>
                  <span className="font-sans text-[9px] text-[#8A8070]">{ing.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Whisper */}
          <div className="text-center px-6 py-2">
            <span className="text-[#C8B06A] text-xs">✦</span>
            <span className="font-cormorant text-[12px] italic font-light tracking-wide ml-2"
              style={{ color: "rgba(11,60,38,0.45)" }}>
              Iconic shade &amp; creamy formula.
            </span>
          </div>
        </div>

        {/* Fixed bottom CTAs */}
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-30"
          style={{
            background: "rgba(250,246,239,0.97)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(200,176,106,0.15)",
          }}>
          <div className="flex gap-3">
            <button
              onClick={() => setBoutiqueOpen(true)}
              className="btn-gold flex-1 py-4 rounded-full cursor-pointer">
              Où Acheter
            </button>
            <button onClick={onDupe}
              className="btn-ghost flex-1 py-4 rounded-full cursor-pointer">
              Alternative Artisanale
            </button>
          </div>
        </div>
      </div>

      {/* Boutique Sheet */}
      {boutiqueOpen && (
        <BoutiqueSheet onClose={() => setBoutiqueOpen(false)} />
      )}
    </>
  );
}

function BoutiqueSheet({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 cursor-pointer"
        style={{ background: "rgba(11,30,20,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden sheet-enter"
        style={{
          background: "rgba(250,246,239,0.98)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -8px 40px rgba(11,60,38,0.15)",
          border: "1px solid rgba(200,176,106,0.2)",
        }}>

        {/* Handle */}
        <div className="flex justify-center pt-4 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(11,60,38,0.14)" }} />
        </div>

        <div className="px-6 pb-12">
          {/* Sheet header */}
          <div className="flex items-center justify-between mb-5 pt-2">
            <div>
              <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">
                ✦ Boutiques
              </p>
              <h3 className="font-serif text-lg font-normal text-[#1C1C1C]">Où Trouver</h3>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "rgba(11,60,38,0.08)", color: "#0B3C26", fontSize: "18px", lineHeight: 1 }}>
              ×
            </button>
          </div>

          {/* Retailer list */}
          <div className="space-y-2.5">
            {RETAILERS.map(r => (
              <button key={r.name}
                onClick={() => { showToast(`Redirection vers ${r.name}…`, "✦"); onClose(); }}
                className="w-full flex items-center justify-between p-4 rounded-2xl cursor-pointer press-scale text-left"
                style={{
                  background: "rgba(255,253,248,0.85)",
                  border: "1px solid rgba(200,176,106,0.2)",
                  boxShadow: "0 2px 8px rgba(11,60,38,0.04)",
                }}>
                <div className="flex items-center gap-3">
                  {/* Brand avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${r.accent}1A`, border: `1px solid ${r.accent}40` }}>
                    <span className="font-sans text-[9px] font-medium" style={{ color: r.accent }}>
                      {r.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] text-[#1C1C1C] font-medium leading-tight">{r.name}</p>
                    <p className="font-sans text-[9px] text-[#8A8070]">{r.sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-serif text-sm text-[#0B3C26]">{formatPrice(r.eur)}</span>
                  <span className="font-sans text-[7px] tracking-wide px-2 py-0.5 rounded-full"
                    style={{ background: `${r.accent}18`, color: r.accent }}>
                    {r.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LipstickIllustration() {
  return (
    <svg width="72" height="110" viewBox="0 0 72 110" fill="none">
      <rect x="20" y="40" width="32" height="60" rx="3" fill="url(#pcTubeGold)" />
      <rect x="22" y="52" width="28" height="30" rx="1.5"
        fill="rgba(11,60,38,0.08)" stroke="rgba(200,176,106,0.3)" strokeWidth="0.5" />
      <text x="36" y="65" textAnchor="middle" fill="#0B3C26" fontSize="4.5" fontFamily="serif"
        letterSpacing="0.5" opacity="0.6">CHARLOTTE</text>
      <text x="36" y="72" textAnchor="middle" fill="#0B3C26" fontSize="4" fontFamily="serif"
        letterSpacing="0.3" opacity="0.5">TILBURY</text>
      <rect x="18" y="96" width="36" height="6" rx="1.5" fill="#A89050" />
      <rect x="23" y="44" width="6" height="30" rx="3" fill="rgba(255,255,255,0.25)" />
      <rect x="24" y="18" width="24" height="26" rx="1" fill="#8B3A3A" />
      <path d="M24 18 Q36 4 48 18" fill="#8B3A3A" />
      <path d="M26 16 Q30 8 34 14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="20" y="40" width="32" height="5" rx="1" fill="#C8B06A" />
      <defs>
        <linearGradient id="pcTubeGold" x1="20" y1="40" x2="52" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4C07A" />
          <stop offset="40%" stopColor="#E8D898" />
          <stop offset="70%" stopColor="#C8B06A" />
          <stop offset="100%" stopColor="#A89050" />
        </linearGradient>
      </defs>
    </svg>
  );
}
