"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  actif: string;
  badge: string;
  accent: string;
  emoji: string;
  spf?: number;
}

interface Actif {
  id: string;
  name: string;
  emoji: string;
  benefit: string;
  color: string;
}

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "dermato", label: "Dermocosmétique" },
  { id: "suncare", label: "Suncare" },
  { id: "nutri", label: "Nutricosmétique" },
  { id: "targeted", label: "Soins Ciblés" },
  { id: "firstaid", label: "First Aid" },
];

const ACTIFS: Actif[] = [
  { id: "spf", name: "SPF", emoji: "☀️", benefit: "Protection n°1", color: "#D4A844" },
  { id: "retinol", name: "Rétinol", emoji: "🔬", benefit: "Anti-âge prouvé", color: "#0B3C26" },
  { id: "niacin", name: "Niacinamide", emoji: "⚗️", benefit: "Éclat & Pores", color: "#4A7C5F" },
  { id: "aha", name: "AHA/BHA", emoji: "✦", benefit: "Exfoliation", color: "#8A6A8A" },
  { id: "vit", name: "Vitamine C", emoji: "🍋", benefit: "Antioxydant", color: "#C8A84A" },
  { id: "hyal", name: "Ac. Hyalur.", emoji: "💧", benefit: "Hydratation", color: "#5A8AAA" },
];

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Anthelios UV Mune 400",
    brand: "La Roche-Posay",
    price: "22€",
    category: "suncare",
    description: "Protection UVA/UVB ultra-légère. Texture fondante, fini invisible. Le référence dermato.",
    actif: "Mexoryl 400",
    badge: "Dermato recommandé",
    accent: "#0B3C26",
    emoji: "☀️",
    spf: 50,
  },
  {
    id: "p2",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    price: "16€",
    category: "dermato",
    description: "3 Céramides essentielles + Acide Hyaluronique. Barrière cutanée renforcée, 24h d'hydratation.",
    actif: "Céramides NP/AP/EOP",
    badge: "Formulé avec dermatos",
    accent: "#2D5E8A",
    emoji: "🧬",
  },
  {
    id: "p3",
    name: "Cicalfate+ Restorative",
    brand: "Avène",
    price: "18€",
    category: "firstaid",
    description: "Crème réparatrice multi-usage. Cicatrisation accélérée, peau sensible & irritée.",
    actif: "Sucralfate de cuivre",
    badge: "Eau thermale d'Avène",
    accent: "#4A7CAA",
    emoji: "🕊️",
  },
  {
    id: "p4",
    name: "Sensibio H2O",
    brand: "Bioderma",
    price: "12€",
    category: "dermato",
    description: "Eau micellaire référence mondiale. Tolérée par les peaux les plus réactives. Ophtalmo-testé.",
    actif: "Complexe Sensibio",
    badge: "N°1 Mondial",
    accent: "#8A5A7A",
    emoji: "💜",
  },
  {
    id: "p5",
    name: "Anaphase+ Complément",
    brand: "Ducray",
    price: "28€",
    category: "nutri",
    description: "Biotine, Cystine & Méthionine. Renforcement du cheveu fragilisé en 3 mois de cure.",
    actif: "Biotine 150%",
    badge: "Testé cliniquement",
    accent: "#6A8A5A",
    emoji: "🌿",
  },
  {
    id: "p6",
    name: "Marine Collagen",
    brand: "Biocyte",
    price: "42€",
    category: "nutri",
    description: "Collagène marin 10 000 mg + Vitamine C. Fermeté visible à 4 semaines.",
    actif: "Collagène Marin",
    badge: "Études cliniques",
    accent: "#4A6A8A",
    emoji: "✦",
  },
  {
    id: "p7",
    name: "Effaclar Duo+",
    brand: "La Roche-Posay",
    price: "20€",
    category: "targeted",
    description: "Soin anti-imperfections double action. Niacinamide 5% + Salicylique. Résultats en 24h.",
    actif: "Niacinamide 5% + BHA",
    badge: "Acné recommandé",
    accent: "#0B3C26",
    emoji: "⚗️",
  },
  {
    id: "p8",
    name: "A-Oxitive Sérum",
    brand: "Eau Thermale Avène",
    price: "34€",
    category: "targeted",
    description: "Vitamine C stabilisée 10% + Eau thermale. Éclat immédiat, anti-oxydation 24h.",
    actif: "Ascorbyl Glucoside",
    badge: "Hypoallergénique",
    accent: "#9A7050",
    emoji: "🍋",
  },
];

const EXPERT_TIPS = [
  {
    icon: "🔬",
    title: "La Règle d'Or : SPF",
    body: "Le secret de beauté n°1 des dermatologues : SPF 50+ chaque matin, sans exception. 80% du vieillissement cutané visible est dû aux UV. Un geste, une vie de peau protégée.",
  },
  {
    icon: "⚗️",
    title: "Layering des Actifs",
    body: "Rétinol et Vitamine C ne se mélangent pas : le premier le soir, le second le matin. La Muse analyse tes produits pour t'éviter tout conflit d'actifs.",
  },
  {
    icon: "💧",
    title: "La Barrière Cutanée",
    body: "Une peau saine = une barrière intacte. Céramides, Niacinamide et Acide Hyaluronique sont tes alliés pour une hydratation profonde et durable.",
  },
  {
    icon: "✦",
    title: "L'Art de la Cure",
    body: "Les compléments alimentaires agissent en profondeur mais demandent de la patience : minimum 3 mois pour des résultats visibles sur la peau et les cheveux.",
  },
];

interface Props {
  onBack: () => void;
}

export default function ParapharmacyScreen({ onBack }: Props) {
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [tipIdx, setTipIdx] = useState(0);
  const [activeActif, setActiveActif] = useState<string | null>(null);

  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      className="min-h-screen no-scrollbar overflow-y-auto"
      style={{ background: "#F8FAFA" }}
    >
      <style>{`
        @keyframes labSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lab-slide { animation: labSlide 0.55s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .scan-line { animation: scanLine 2.5s ease-in-out infinite; }
      `}</style>

      {/* ── Hero header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #FFFFFF 0%, #F0F8F4 50%, #E8F5EE 100%)",
          paddingTop: "env(safe-area-inset-top)",
          borderBottom: "1px solid rgba(11,60,38,0.08)",
        }}
      >
        {/* Emerald accent bar top */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #0B3C26, transparent)" }} />

        {/* Decorative molecule motifs */}
        <div className="absolute top-6 right-6 opacity-[0.06]">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="6" fill="#0B3C26" />
            <circle cx="10" cy="10" r="4" fill="#0B3C26" />
            <circle cx="50" cy="10" r="4" fill="#0B3C26" />
            <circle cx="10" cy="50" r="4" fill="#0B3C26" />
            <circle cx="50" cy="50" r="4" fill="#0B3C26" />
            <line x1="30" y1="30" x2="10" y2="10" stroke="#0B3C26" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="50" y2="10" stroke="#0B3C26" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="10" y2="50" stroke="#0B3C26" strokeWidth="1.5" />
            <line x1="30" y1="30" x2="50" y2="50" stroke="#0B3C26" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="px-5 pt-4 pb-7">
          <button
            onClick={onBack}
            className="mb-5 w-8 h-8 flex items-center justify-center rounded-full press-scale"
            style={{ background: "rgba(11,60,38,0.08)" }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#0B3C26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="text-center">
            <div className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: "#4A7C5F" }}>
              The Muse · Expertise
            </div>
            <h1 className="font-serif text-[32px] font-light leading-tight mb-2" style={{ color: "#0B1F14", letterSpacing: "0.02em" }}>
              The Expert Atelier
            </h1>
            <p className="font-sans text-xs leading-relaxed" style={{ color: "#4A7060" }}>
              La science au service de ta beauté.
              <br />Actifs prouvés, formules rigoureuses, résultats visibles.
            </p>
          </div>

          {/* Emerald rule divider */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, rgba(11,60,38,0.3))" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0B3C26", opacity: 0.4 }} />
            <div className="font-sans text-[8px] tracking-widest uppercase" style={{ color: "#4A7C5F", opacity: 0.7 }}>
              Certifié · Prouvé · Luxueux
            </div>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#0B3C26", opacity: 0.4 }} />
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, rgba(11,60,38,0.3), transparent)" }} />
          </div>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-5 mt-5">

        {/* ── Expert statement ── */}
        <div
          className="lab-slide rounded-xl p-4 flex gap-3"
          style={{
            background: "linear-gradient(135deg, #0B3C26 0%, #1A5C3A 100%)",
            boxShadow: "0 4px 20px rgba(11,60,38,0.2)",
          }}
        >
          <div className="text-xl flex-none mt-0.5">🔬</div>
          <div>
            <div className="font-sans text-[9px] tracking-widest uppercase mb-1" style={{ color: "rgba(200,176,106,0.8)" }}>
              La Promesse Muse
            </div>
            <p className="font-serif italic text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
              "Chaque produit sélectionné ici est validé par la science. Zéro greenwashing. Zéro compromis."
            </p>
          </div>
        </div>

        {/* ── Actifs du Moment ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 opacity-20" style={{ background: "#0B3C26" }} />
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#4A7C5F" }}>
              Actifs du Moment
            </span>
            <div className="h-px flex-1 opacity-20" style={{ background: "#0B3C26" }} />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {ACTIFS.map(actif => (
              <button
                key={actif.id}
                onClick={() => setActiveActif(activeActif === actif.id ? null : actif.id)}
                className="flex-none flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl press-scale transition-all duration-200"
                style={{
                  background: activeActif === actif.id ? actif.color : "white",
                  border: `1.5px solid ${activeActif === actif.id ? actif.color : "rgba(11,60,38,0.08)"}`,
                  minWidth: "60px",
                  boxShadow: activeActif === actif.id ? `0 4px 12px ${actif.color}40` : "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div className="text-lg">{actif.emoji}</div>
                <div
                  className="font-sans text-[9px] font-medium text-center"
                  style={{ color: activeActif === actif.id ? "white" : "#2A4A38" }}
                >
                  {actif.name}
                </div>
                <div
                  className="font-sans text-[8px] text-center opacity-80"
                  style={{ color: activeActif === actif.id ? "rgba(255,255,255,0.8)" : "#6A8A78" }}
                >
                  {actif.benefit}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Filter chips ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className="flex-none px-3.5 py-1.5 rounded-full font-sans text-[11px] whitespace-nowrap press-scale transition-all duration-200"
              style={{
                background: filter === c.id ? "#0B3C26" : "white",
                color: filter === c.id ? "#FAF7F2" : "#2A4A38",
                border: filter === c.id ? "none" : "1px solid rgba(11,60,38,0.12)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Products grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((product, idx) => (
            <div
              key={product.id}
              className="rounded-xl overflow-hidden press-scale cursor-pointer grid-item-anim"
              style={{
                animationDelay: `${idx * 0.07}s`,
                background: "white",
                border: "1px solid rgba(11,60,38,0.06)",
                boxShadow: "0 1px 8px rgba(11,60,38,0.06)",
              }}
            >
              {/* Visual */}
              <div
                className="relative h-[100px] flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(145deg, #F0F8F4 0%, #E8F5EE 100%)" }}
              >
                {/* Scan line effect */}
                <div
                  className="absolute left-0 right-0 h-8 scan-line pointer-events-none"
                  style={{ background: "linear-gradient(transparent, rgba(11,60,38,0.04), transparent)", animationDelay: `${idx * 0.4}s` }}
                />

                <div className="text-4xl">{product.emoji}</div>

                {/* SPF badge */}
                {product.spf && (
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded font-sans text-[9px] font-bold"
                    style={{ background: "#0B3C26", color: "#C8B06A" }}
                  >
                    SPF {product.spf}+
                  </div>
                )}

                {/* Save */}
                <button
                  onClick={e => toggleSave(product.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full press-scale"
                  style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(11,60,38,0.08)" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill={saved.has(product.id) ? product.accent : "none"} stroke={product.accent} strokeWidth="2.2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="font-sans text-[8px] tracking-widest uppercase mb-0.5" style={{ color: product.accent }}>
                  {product.brand}
                </div>
                <div className="font-serif text-[13px] font-medium leading-tight mb-1" style={{ color: "#0B1F14" }}>
                  {product.name}
                </div>
                <div className="font-sans text-[9px] leading-relaxed mb-2" style={{ color: "#6A8A78" }}>
                  {product.description}
                </div>

                {/* Actif chip */}
                <div className="flex items-center justify-between">
                  <div
                    className="px-2 py-0.5 rounded font-sans text-[8px]"
                    style={{ background: "rgba(11,60,38,0.07)", color: "#0B3C26" }}
                  >
                    ⚗️ {product.actif}
                  </div>
                  <div className="font-serif text-sm font-semibold" style={{ color: product.accent }}>
                    {product.price}
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-2 font-sans text-[8px]" style={{ color: "#8AAA98" }}>
                  ✓ {product.badge}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Expert Tips ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 opacity-20" style={{ background: "#0B3C26" }} />
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#4A7C5F" }}>
              L'Expertise Dermato
            </span>
            <div className="h-px flex-1 opacity-20" style={{ background: "#0B3C26" }} />
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "white",
              border: "1px solid rgba(11,60,38,0.08)",
              boxShadow: "0 1px 8px rgba(11,60,38,0.05)",
            }}
          >
            <div className="text-xl mb-2">{EXPERT_TIPS[tipIdx].icon}</div>
            <div className="font-serif text-[15px] mb-2" style={{ color: "#0B1F14" }}>
              {EXPERT_TIPS[tipIdx].title}
            </div>
            <p className="font-sans text-[11px] leading-relaxed" style={{ color: "#5A7A68" }}>
              {EXPERT_TIPS[tipIdx].body}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                {EXPERT_TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTipIdx(i)}
                    className="rounded-full press-scale transition-all duration-200"
                    style={{
                      width: i === tipIdx ? "16px" : "6px",
                      height: "6px",
                      background: i === tipIdx ? "#0B3C26" : "rgba(11,60,38,0.2)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setTipIdx(n => (n + 1) % EXPERT_TIPS.length)}
                className="font-sans text-[10px] press-scale"
                style={{ color: "#4A7C5F" }}
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div
          className="rounded-xl p-4 grid grid-cols-3 gap-3"
          style={{ background: "white", border: "1px solid rgba(11,60,38,0.06)" }}
        >
          {[
            { icon: "🔬", label: "Actifs validés" },
            { icon: "🌿", label: "Clean Beauty" },
            { icon: "✓", label: "Dermato approuvé" },
          ].map(b => (
            <div key={b.label} className="flex flex-col items-center gap-1 text-center">
              <div className="text-xl">{b.icon}</div>
              <div className="font-sans text-[9px]" style={{ color: "#4A7060" }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
