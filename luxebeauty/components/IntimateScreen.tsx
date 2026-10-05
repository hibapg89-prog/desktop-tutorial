"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  gradient: string;
  accent: string;
  emoji: string;
  tag: string;
}

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "cleansing", label: "Soins Lavants" },
  { id: "cycle", label: "Rituel Cycle" },
  { id: "serums", label: "Huiles & Sérums" },
  { id: "supplements", label: "Suppléments" },
  { id: "comfort", label: "Confort" },
];

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "The Body Wash",
    brand: "Nécessaire",
    price: "28€",
    category: "cleansing",
    description: "Gel pH équilibré au Niacinamide & AHA. Microbiome-safe.",
    gradient: "linear-gradient(145deg, #F5EEF0 0%, #EDE0E5 100%)",
    accent: "#C4968A",
    emoji: "🌸",
    tag: "pH Équilibré",
  },
  {
    id: "p2",
    name: "The Fur Oil",
    brand: "Fur",
    price: "46€",
    category: "serums",
    description: "Huile de soin à la graine de raisin & arbre à thé. Apaisante.",
    gradient: "linear-gradient(145deg, #F0EDE8 0%, #E8DDD5 100%)",
    accent: "#B8A090",
    emoji: "🕊️",
    tag: "Clean Formula",
  },
  {
    id: "p3",
    name: "Lily Cup",
    brand: "Intimina",
    price: "32€",
    category: "cycle",
    description: "Coupe menstruelle silicone médical ultra-doux. 12h de protection.",
    gradient: "linear-gradient(145deg, #EEE8F0 0%, #E2D8ED 100%)",
    accent: "#A090C4",
    emoji: "🌙",
    tag: "Zéro Déchet",
  },
  {
    id: "p4",
    name: "Hormone Support",
    brand: "HUM Nutrition",
    price: "36€",
    category: "supplements",
    description: "B6, Magnésium & Vitex pour l'équilibre hormonal naturel.",
    gradient: "linear-gradient(145deg, #F0EDE5 0%, #EDE5D8 100%)",
    accent: "#C4B090",
    emoji: "✨",
    tag: "Cliniquement testé",
  },
  {
    id: "p5",
    name: "Calming Wash",
    brand: "The Honey Pot",
    price: "14€",
    category: "cleansing",
    description: "Gel à base de plantes, calendula & aloe vera. Doux, sans parfum.",
    gradient: "linear-gradient(145deg, #F5F0E8 0%, #EDE8D8 100%)",
    accent: "#C8B87A",
    emoji: "🍯",
    tag: "100% Botanique",
  },
  {
    id: "p6",
    name: "Period Underwear",
    brand: "LOLA",
    price: "42€",
    category: "cycle",
    description: "Coton biologique certifié. Absorption 4 tampons, lavable.",
    gradient: "linear-gradient(145deg, #F0E8EC 0%, #EDE0E5 100%)",
    accent: "#C49AAA",
    emoji: "🌹",
    tag: "Éco-responsable",
  },
  {
    id: "p7",
    name: "Wild Feminine Oil",
    brand: "Wild Feminine",
    price: "38€",
    category: "serums",
    description: "Complexe d'huiles sacrées: rose, ylang-ylang & jojoba doré.",
    gradient: "linear-gradient(145deg, #F2EAE8 0%, #EAE0D8 100%)",
    accent: "#C0A090",
    emoji: "🌺",
    tag: "Rituel Sacré",
  },
  {
    id: "p8",
    name: "Cycle Balance",
    brand: "Intimina",
    price: "24€",
    category: "comfort",
    description: "Coussin chauffant intelligent avec infusions apaisantes incluses.",
    gradient: "linear-gradient(145deg, #EEEAF0 0%, #E5E0ED 100%)",
    accent: "#9888B8",
    emoji: "💜",
    tag: "Anti-crampes",
  },
];

const TIPS = [
  {
    icon: "💧",
    title: "Le pH Intime",
    body: "Le pH idéal se situe entre 3.5 et 4.5. Des soins spécialement formulés préservent cet équilibre naturel délicat — jamais de gel douche classique.",
  },
  {
    icon: "🌙",
    title: "Soins & Cycle",
    body: "Phase folliculaire : soins légers et éclatants. Phase lutéale : masques nourrissants et rituels apaisants. Ton corps parle — apprends à l'écouter.",
  },
  {
    icon: "🌿",
    title: "Ingrédients à Éviter",
    body: "Parfums synthétiques, SLS et perturbateurs endocriniens sont bannis de cette sélection. The Muse vérifie chaque formule pour toi.",
  },
  {
    icon: "✦",
    title: "Le Rituel du Soir",
    body: "Quelques gouttes d'huile intime après la douche, massées doucement. Un geste simple qui transforme un soin en véritable rituel de bienveillance.",
  },
];

interface Props {
  onBack: () => void;
}

export default function IntimateScreen({ onBack }: Props) {
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [tipIdx, setTipIdx] = useState(0);

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
      style={{ background: "linear-gradient(180deg, #FAF5F5 0%, #F5EEF0 40%, #FAF7F2 100%)" }}
    >
      <style>{`
        @keyframes silkFade {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .silk-fade { animation: silkFade 0.65s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        @keyframes petalFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-7px) rotate(4deg); }
        }
        .petal-float { animation: petalFloat 4s ease-in-out infinite; }
      `}</style>

      {/* ── Hero header ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #F5E8EC 0%, #EDE0E5 55%, #F2E8F0 100%)",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Floating petals */}
        <div className="absolute top-5 right-8 text-3xl opacity-[0.18] petal-float" style={{ animationDelay: "0s" }}>🌸</div>
        <div className="absolute top-14 right-3 text-xl opacity-[0.12] petal-float" style={{ animationDelay: "1.2s" }}>🌷</div>
        <div className="absolute top-7 left-5 text-2xl opacity-[0.10] petal-float" style={{ animationDelay: "2.4s" }}>🌺</div>

        <div className="px-5 pt-4 pb-7">
          {/* Back */}
          <button
            onClick={onBack}
            className="mb-5 w-8 h-8 flex items-center justify-center rounded-full press-scale"
            style={{ background: "rgba(196,150,138,0.15)" }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#C4968A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="text-center">
            <div className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: "#C4968A" }}>
              The Muse · Sanctuaire
            </div>
            <h1 className="font-serif text-[32px] font-light leading-tight mb-2" style={{ color: "#3D2030", letterSpacing: "0.02em" }}>
              The Silk Sanctuary
            </h1>
            <p className="font-sans text-xs leading-relaxed" style={{ color: "#9A7585" }}>
              Des soins pensés pour ton équilibre le plus précieux,
              <br />avec toute la discrétion et l'élégance que tu mérites.
            </p>
          </div>

          {/* Pearl divider */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="h-px w-14 opacity-25" style={{ background: "linear-gradient(90deg, transparent, #C4968A)" }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: "#C4968A" }} />
            <div className="w-1 h-1 rounded-full opacity-30" style={{ background: "#C4968A" }} />
            <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: "#C4968A" }} />
            <div className="h-px w-14 opacity-25" style={{ background: "linear-gradient(90deg, #C4968A, transparent)" }} />
          </div>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-5 mt-5">

        {/* ── Manifesto card ── */}
        <div
          className="silk-fade rounded-2xl p-4"
          style={{ background: "rgba(242,232,240,0.6)", border: "1px solid rgba(196,150,138,0.18)" }}
        >
          <p className="font-serif italic text-sm leading-relaxed text-center" style={{ color: "#8A6070" }}>
            "Ton sanctuaire personnel. Ici, chaque soin est une lettre d'amour à toi-même."
          </p>
          <div className="text-center mt-2 font-sans text-[10px] tracking-widest" style={{ color: "#C4968A" }}>
            — The Muse ✦
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
                background: filter === c.id
                  ? "linear-gradient(135deg, #C4968A, #B8848A)"
                  : "rgba(242,232,240,0.85)",
                color: filter === c.id ? "#FAF5F5" : "#8A6070",
                border: filter === c.id ? "none" : "1px solid rgba(196,150,138,0.22)",
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
              className="rounded-2xl overflow-hidden press-scale cursor-pointer grid-item-anim"
              style={{
                animationDelay: `${idx * 0.07}s`,
                background: "white",
                boxShadow: "0 2px 14px rgba(196,150,138,0.1)",
              }}
            >
              {/* Visual */}
              <div className="relative h-[112px] flex items-center justify-center" style={{ background: product.gradient }}>
                <div className="text-4xl petal-float" style={{ animationDelay: `${idx * 0.25}s` }}>
                  {product.emoji}
                </div>

                {/* Tag */}
                <div
                  className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full font-sans text-[8px] font-medium"
                  style={{ background: "rgba(255,255,255,0.85)", color: product.accent }}
                >
                  {product.tag}
                </div>

                {/* Save */}
                <button
                  onClick={e => toggleSave(product.id, e)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full press-scale"
                  style={{ background: "rgba(255,255,255,0.8)" }}
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
                <div className="font-serif text-[13px] font-medium leading-tight mb-1" style={{ color: "#3D2030" }}>
                  {product.name}
                </div>
                <div className="font-sans text-[9px] leading-relaxed mb-2" style={{ color: "#9A7585" }}>
                  {product.description}
                </div>
                <div className="font-serif text-sm font-semibold" style={{ color: product.accent }}>
                  {product.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Muse Tips carousel ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 opacity-20" style={{ background: "#C4968A" }} />
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C4968A" }}>
              Conseils Muse
            </span>
            <div className="h-px flex-1 opacity-20" style={{ background: "#C4968A" }} />
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, #F5EEF0, #EDE8F0)",
              border: "1px solid rgba(196,150,138,0.15)",
            }}
          >
            <div className="text-2xl mb-2">{TIPS[tipIdx].icon}</div>
            <div className="font-serif text-[15px] mb-2" style={{ color: "#3D2030" }}>
              {TIPS[tipIdx].title}
            </div>
            <p className="font-sans text-[11px] leading-relaxed" style={{ color: "#8A6070" }}>
              {TIPS[tipIdx].body}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1.5">
                {TIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTipIdx(i)}
                    className="rounded-full press-scale transition-all duration-200"
                    style={{
                      width: i === tipIdx ? "16px" : "6px",
                      height: "6px",
                      background: i === tipIdx ? "#C4968A" : "rgba(196,150,138,0.3)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setTipIdx(n => (n + 1) % TIPS.length)}
                className="font-sans text-[10px] press-scale"
                style={{ color: "#C4968A" }}
              >
                Suivant →
              </button>
            </div>
          </div>
        </div>

        {/* ── Privacy promise ── */}
        <div
          className="rounded-xl p-3 flex items-center gap-2"
          style={{ background: "rgba(242,232,240,0.45)", border: "1px solid rgba(196,150,138,0.12)" }}
        >
          <div className="text-base flex-none">🔒</div>
          <p className="font-sans text-[9px] leading-relaxed" style={{ color: "#B09098" }}>
            The Muse traite tes données de santé intime avec la plus stricte confidentialité. Jamais partagées, toujours respectées.
          </p>
        </div>
      </div>
    </div>
  );
}
