"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onBack: () => void;
  onScan?: () => void;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ALL_RESULTS = [
  { id: "1",  name: "Lumière Foundation",      brand: "Dior Beauty",         cat: "Makeup",     price: "120€", emoji: "🌟" },
  { id: "2",  name: "Micro Sérum Vitamine C",  brand: "Kiehl's",             cat: "Skincare",   price: "95€",  emoji: "🍋" },
  { id: "3",  name: "Velvet Lip Liner",         brand: "Charlotte Tilbury",   cat: "Makeup",     price: "32€",  emoji: "💄" },
  { id: "4",  name: "Vital Perfector",          brand: "La Prairie",          cat: "Skincare",   price: "280€", emoji: "✨" },
  { id: "5",  name: "Aurora Parfum",            brand: "The Muse",            cat: "Fragrance",  price: "195€", emoji: "🌸" },
  { id: "6",  name: "Lumière Noire",            brand: "YSL Beauté",          cat: "Fragrance",  price: "175€", emoji: "🖤" },
  { id: "7",  name: "Quad Eyeshadow Palette",   brand: "Charlotte Tilbury",   cat: "Makeup",     price: "85€",  emoji: "🎨" },
  { id: "8",  name: "Hyaluronic Toner",         brand: "Lancôme",             cat: "Skincare",   price: "68€",  emoji: "💧" },
  { id: "9",  name: "Silk Shampoo",             brand: "Kérastase",           cat: "Haircare",   price: "55€",  emoji: "💫" },
  { id: "10", name: "Body Velvet Lotion",       brand: "La Mer",              cat: "Body",       price: "145€", emoji: "🌊" },
  { id: "11", name: "Scalp Serum",              brand: "Augustinus Bader",    cat: "Haircare",   price: "98€",  emoji: "🌿" },
  { id: "12", name: "Exfoliating Body Scrub",   brand: "Nécessaire",          cat: "Body",       price: "45€",  emoji: "🧖" },
  { id: "13", name: "Nail Gloss Top Coat",      brand: "Essie",               cat: "Nails",      price: "14€",  emoji: "💅" },
  { id: "14", name: "Sculpting Body Oil",       brand: "Sisley Paris",        cat: "Body",       price: "220€", emoji: "✦"  },
  { id: "15", name: "Sérum Rétinol 0.3%",      brand: "Paula's Choice",      cat: "Skincare",   price: "52€",  emoji: "⭐" },
  { id: "16", name: "Soft Glow Blush",          brand: "NARS",                cat: "Makeup",     price: "38€",  emoji: "🌺" },
  { id: "17", name: "Perfecting Primer",        brand: "Hourglass",           cat: "Makeup",     price: "72€",  emoji: "🪞" },
  { id: "18", name: "Rose de Mai Oil",          brand: "Chanel",              cat: "Skincare",   price: "310€", emoji: "🌹" },
  { id: "19", name: "Moonlit Highlighter",      brand: "Pat McGrath",         cat: "Makeup",     price: "48€",  emoji: "🌙" },
  { id: "20", name: "Bain Satin Shampoo",       brand: "Kérastase",           cat: "Haircare",   price: "32€",  emoji: "🛁" },
];

const TRENDING = [
  { label: "Rétinol débutantes",    icon: "🌟" },
  { label: "Dupe Charlotte Tilbury",icon: "✦"  },
  { label: "Meilleur SPF invisible",icon: "☀️" },
  { label: "Routine anti-âge 30s",  icon: "⭐" },
  { label: "Parfum boisé féminin",  icon: "🌿" },
  { label: "Masque cheveux abîmés", icon: "💫" },
  { label: "Fond de teint peau sèche", icon: "🌸" },
  { label: "Nettoyant double action",  icon: "💧" },
];

const RECENT = [
  "Retinol sérum",
  "Charlotte Tilbury",
  "Dupe pour La Mer",
  "Meilleur SPF hydratant",
];

const COUPS_DE_COEUR = [
  { id: "cc1", name: "Vital Perfector",   brand: "La Prairie",        price: "280€", emoji: "✨", gradient: "linear-gradient(145deg, #FFF8E8 0%, #EDE8C0 100%)", accent: "#C8A840", note: "Soin d'exception" },
  { id: "cc2", name: "Aurora Parfum",     brand: "The Muse",          price: "195€", emoji: "🌸", gradient: "linear-gradient(145deg, #F8E8EE 0%, #EDD8E5 100%)", accent: "#C4968A", note: "Création Muse"    },
  { id: "cc3", name: "Rose de Mai Oil",   brand: "Chanel",            price: "310€", emoji: "🌹", gradient: "linear-gradient(145deg, #F8EEF0 0%, #EAD8DC 100%)", accent: "#B87880", note: "Édition Limitée"  },
  { id: "cc4", name: "Moonlit Highlighter", brand: "Pat McGrath",     price: "48€",  emoji: "🌙", gradient: "linear-gradient(145deg, #EEEAF8 0%, #D8D0F0 100%)", accent: "#8870C8", note: "Bestseller Muse"  },
];

const CAT_META: Record<string, { accent: string; gradient: string; emoji: string }> = {
  Makeup:    { accent: "#C4968A", gradient: "linear-gradient(145deg, #F5E8EC, #EDE0E5)", emoji: "💄" },
  Skincare:  { accent: "#1A5C3A", gradient: "linear-gradient(145deg, #E8F5EE, #D0EDD8)", emoji: "✨" },
  Fragrance: { accent: "#C8B06A", gradient: "linear-gradient(145deg, #F5F0E8, #EDE8D0)", emoji: "🌸" },
  Haircare:  { accent: "#A08060", gradient: "linear-gradient(145deg, #F0EDE8, #E8E0D8)", emoji: "💫" },
  Body:      { accent: "#5A7A9A", gradient: "linear-gradient(145deg, #E8ECF5, #D8E0ED)", emoji: "🌊" },
  Nails:     { accent: "#B07880", gradient: "linear-gradient(145deg, #F5E8E8, #EDD8D8)", emoji: "💅" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SearchScreen({ onBack, onScan }: Props) {
  const [query, setQuery]     = useState("");
  const [filter, setFilter]   = useState("All");
  const [focused, setFocused] = useState(false);
  const [voice, setVoice]     = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const cats  = ["All", ...Array.from(new Set(ALL_RESULTS.map(r => r.cat)))];
  const q     = query.toLowerCase().trim();
  const shown = ALL_RESULTS.filter(r =>
    (filter === "All" || r.cat === filter) &&
    (!q || r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q))
  );

  const hasQuery = q.length > 0;
  const hasFilter = filter !== "All";

  return (
    <div className="min-h-screen flex flex-col no-scrollbar overflow-hidden" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes searchFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .search-fade { animation: searchFade 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        @keyframes resultSlide { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        .result-slide { animation: resultSlide 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 1.2s ease-in-out infinite; }
        @keyframes shimmerG {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .input-glow {
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .input-glow.focused {
          box-shadow: 0 0 0 3px rgba(200,176,106,0.15), 0 2px 12px rgba(200,176,106,0.12);
        }
      `}</style>

      {/* ── Sticky header ── */}
      <div
        className="flex-shrink-0 px-4 pb-3"
        style={{
          background: "rgba(250,250,248,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: focused || hasQuery ? "1px solid rgba(200,176,106,0.2)" : "1px solid rgba(200,176,106,0.08)",
          paddingTop: "max(40px, env(safe-area-inset-top))",
          transition: "border-color 0.3s ease",
        }}
      >
        {/* Search row */}
        <div className="flex items-center gap-3 mb-3">
          {/* Back */}
          <button
            onClick={onBack}
            className="w-8 h-8 flex-none flex items-center justify-center rounded-full press-scale"
            style={{ background: "rgba(11,60,38,0.07)" }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="#0B3C26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Search input */}
          <div className={`flex-1 relative input-glow rounded-2xl ${focused ? "focused" : ""}`}
            style={{ background: focused ? "white" : "rgba(11,60,38,0.04)", border: `1.5px solid ${focused ? "rgba(200,176,106,0.4)" : "rgba(11,60,38,0.08)"}` }}>
            {/* Search icon */}
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.2" stroke={focused ? "#C8B06A" : "#8A8070"} strokeWidth="1.4"/>
              <path d="M9.5 9.5L12.5 12.5" stroke={focused ? "#C8B06A" : "#8A8070"} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>

            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Produits, marques, actifs…"
              className="w-full pl-9 pr-16 py-3 font-sans text-[13px] outline-none bg-transparent"
              style={{ color: "#1A1A1A" }}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button onClick={() => setQuery("")} className="w-6 h-6 flex items-center justify-center rounded-full press-scale" style={{ background: "rgba(11,60,38,0.08)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A8070" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
              {/* Voice button */}
              <button
                onClick={() => setVoice(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-full press-scale transition-all"
                style={{ background: voice ? "#0B3C26" : "transparent" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={voice ? "#FAF7F2" : "#8A8070"} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Visual search */}
          <button
            onClick={() => onScan?.()}
            className="w-10 h-10 flex-none flex items-center justify-center rounded-2xl press-scale"
            style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A)", boxShadow: "0 2px 8px rgba(11,60,38,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF7F2" strokeWidth="1.8" strokeLinecap="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
        </div>

        {/* Voice listening indicator */}
        {voice && (
          <div className="flex items-center gap-2 px-1 mb-2 search-fade">
            <div className="flex gap-0.5 items-end">
              {[3,6,4,7,5,8,4,6].map((h, i) => (
                <div key={i} className="w-0.5 rounded-full pulse" style={{ height: `${h * 2}px`, background: "#C8B06A", animationDelay: `${i * 0.1}s` }}/>
              ))}
            </div>
            <span className="font-sans text-[10px]" style={{ color: "#C8B06A" }}>En écoute...</span>
          </div>
        )}

        {/* Category filter chips — nacre pearl style */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="flex-none px-3.5 py-1.5 rounded-full font-sans text-[10px] whitespace-nowrap press-scale transition-all duration-200"
              style={{
                background: filter === c
                  ? "#0B3C26"
                  : "radial-gradient(circle at 30% 30%, rgba(255,252,248,0.98), rgba(240,232,210,0.85))",
                color: filter === c ? "#FAF7F2" : "#5A4A38",
                border: filter === c ? "none" : "1px solid rgba(200,176,106,0.25)",
                boxShadow: filter === c ? "0 2px 8px rgba(11,60,38,0.2)" : "0 1px 3px rgba(200,176,106,0.1)",
              }}
            >
              {c === "All" ? "✦ Tout" : `${CAT_META[c]?.emoji ?? ""} ${c}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-24">

        {/* ─── EMPTY STATE ─── */}
        {!hasQuery && !hasFilter && (
          <div className="space-y-7 search-fade">

            {/* Trending searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 opacity-15" style={{ background: "#C8B06A" }}/>
                <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>Tendances</span>
                <div className="h-px flex-1 opacity-15" style={{ background: "#C8B06A" }}/>
              </div>

              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => setQuery(t.label)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full press-scale search-fade"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      background: "white",
                      border: "1px solid rgba(200,176,106,0.25)",
                      boxShadow: "0 1px 4px rgba(200,176,106,0.08)",
                    }}
                  >
                    <span className="text-xs">{t.icon}</span>
                    <span className="font-sans text-[10px]" style={{ color: "#4A3A2A" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coups de Cœur Muse */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 opacity-15" style={{ background: "#C8B06A" }}/>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>Coups de Cœur Muse</span>
                </div>
                <span className="font-sans text-[9px]" style={{ color: "#8A7A6A" }}>Voir tout →</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {COUPS_DE_COEUR.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex-none w-44 rounded-2xl overflow-hidden press-scale cursor-pointer search-fade"
                    style={{ animationDelay: `${0.1 + i * 0.07}s`, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
                  >
                    {/* Visual */}
                    <div className="relative h-28 flex items-center justify-center" style={{ background: item.gradient }}>
                      <div className="text-5xl">{item.emoji}</div>
                      <div
                        className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full font-sans text-[8px]"
                        style={{ background: "rgba(255,255,255,0.85)", color: item.accent }}
                      >
                        ✦ {item.note}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3" style={{ background: "white" }}>
                      <div className="font-sans text-[8px] tracking-widest uppercase mb-0.5" style={{ color: item.accent }}>{item.brand}</div>
                      <div className="font-serif text-sm leading-tight mb-1" style={{ color: "#1A1A1A" }}>{item.name}</div>
                      <div className="font-serif text-sm font-semibold" style={{ color: item.accent }}>{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category discovery grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 opacity-15" style={{ background: "#C8B06A" }}/>
                <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>Explorer</span>
                <div className="h-px flex-1 opacity-15" style={{ background: "#C8B06A" }}/>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CAT_META).map(([name, meta], i) => (
                  <button
                    key={name}
                    onClick={() => setFilter(name)}
                    className="rounded-xl p-3 flex flex-col items-center gap-1.5 press-scale search-fade"
                    style={{ animationDelay: `${0.15 + i * 0.05}s`, background: meta.gradient, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
                  >
                    <div className="text-2xl">{meta.emoji}</div>
                    <div className="font-sans text-[9px] font-medium text-center" style={{ color: meta.accent }}>{name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent searches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 opacity-15" style={{ background: "#C8B06A" }}/>
                  <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>Récents</span>
                </div>
                <button className="font-sans text-[9px]" style={{ color: "#B0A090" }}>Effacer</button>
              </div>

              <div className="space-y-1">
                {RECENT.map((r, i) => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl press-scale search-fade"
                    style={{ animationDelay: `${0.2 + i * 0.05}s`, background: "rgba(11,60,38,0.03)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B0A090" strokeWidth="1.6" strokeLinecap="round">
                      <polyline points="12 2 12 12 17 12"/><circle cx="12" cy="12" r="10"/>
                    </svg>
                    <span className="font-sans text-[12px] flex-1 text-left" style={{ color: "#5A4A38" }}>{r}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8B06A" strokeWidth="2" strokeLinecap="round">
                      <path d="M7 17L17 7M7 7h10v10"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── RESULTS ─── */}
        {(hasQuery || hasFilter) && (
          <div className="search-fade">
            {/* Count + context */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-sans text-[9px] tracking-[0.25em] uppercase" style={{ color: "#8A7A6A" }}>
                  {shown.length} résultat{shown.length !== 1 ? "s" : ""}
                </span>
                {q && (
                  <span className="font-sans text-[9px] ml-1" style={{ color: "#C8B06A" }}>
                    pour « {query} »
                  </span>
                )}
              </div>
              {filter !== "All" && (
                <button onClick={() => setFilter("All")} className="flex items-center gap-1 press-scale">
                  <span className="font-sans text-[9px]" style={{ color: "#C8B06A" }}>{CAT_META[filter]?.emoji} {filter}</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C8B06A" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {shown.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center gap-3">
                <div className="text-4xl opacity-30">🔍</div>
                <div className="font-serif text-xl" style={{ color: "#3A2A1A" }}>Aucun résultat</div>
                <p className="font-sans text-xs" style={{ color: "#8A7A6A" }}>
                  Essaie un autre terme, une marque ou une catégorie
                </p>
                <button
                  onClick={() => { setQuery(""); setFilter("All"); }}
                  className="mt-2 px-5 py-2 rounded-full font-sans text-xs press-scale"
                  style={{ background: "#0B3C26", color: "#FAF7F2" }}
                >
                  Tout voir
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {shown.map((r, idx) => {
                  const meta = CAT_META[r.cat] ?? { accent: "#C8B06A", gradient: "linear-gradient(135deg, #F5F0E8, #EDE8D0)", emoji: "✦" };
                  return (
                    <button
                      key={r.id}
                      className="w-full flex items-center gap-3 rounded-2xl p-3 text-left press-scale result-slide"
                      style={{
                        animationDelay: `${idx * 0.04}s`,
                        background: "white",
                        border: "1px solid rgba(200,176,106,0.1)",
                        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Product visual swatch */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-none text-2xl"
                        style={{ background: meta.gradient }}
                      >
                        {r.emoji}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-[14px] leading-tight mb-0.5 truncate" style={{ color: "#1A1A1A" }}>
                          {r.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[10px]" style={{ color: "#8A7A6A" }}>{r.brand}</span>
                          <span className="w-0.5 h-0.5 rounded-full" style={{ background: "#C8B06A", opacity: 0.5 }}/>
                          <span
                            className="font-sans text-[8px] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${meta.accent}12`, color: meta.accent }}
                          >
                            {meta.emoji} {r.cat}
                          </span>
                        </div>
                      </div>

                      {/* Price + arrow */}
                      <div className="flex-none flex flex-col items-end gap-1">
                        <span className="font-serif text-sm font-semibold" style={{ color: "#1A1A1A" }}>{r.price}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8B06A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
