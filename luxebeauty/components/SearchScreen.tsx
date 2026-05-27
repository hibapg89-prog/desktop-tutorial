"use client";

import { useEffect, useRef, useState } from "react";

interface Props { onBack: () => void; }

const ALL_RESULTS = [
  { id: "1",  name: "Lumière Foundation",     brand: "Dior Beauty",       cat: "Makeup",     price: "$120" },
  { id: "2",  name: "Micro Sérum Vitamin C",  brand: "Kiehl's",           cat: "Skincare",   price: "$95"  },
  { id: "3",  name: "Velvet Lip Liner",        brand: "Charlotte Tilbury", cat: "Makeup",     price: "$32"  },
  { id: "4",  name: "Vital Perfector",         brand: "La Prairie",        cat: "Skincare",   price: "$280" },
  { id: "5",  name: "Aurora Parfum",           brand: "The Muse",          cat: "Fragrance",  price: "$195" },
  { id: "6",  name: "Lumière Noire",           brand: "YSL Beauté",        cat: "Fragrance",  price: "$175" },
  { id: "7",  name: "Quad Eyeshadow Palette",  brand: "Charlotte Tilbury", cat: "Makeup",     price: "$85"  },
  { id: "8",  name: "Hyaluronic Toner",        brand: "Lancôme",           cat: "Skincare",   price: "$68"  },
  { id: "9",  name: "Silk Shampoo",            brand: "Kérastase",         cat: "Haircare",   price: "$55"  },
  { id: "10", name: "Body Velvet Lotion",      brand: "La Mer",            cat: "Body",       price: "$145" },
  { id: "11", name: "Scalp Serum",             brand: "Augustinus Bader",  cat: "Haircare",   price: "$98"  },
  { id: "12", name: "Exfoliating Body Scrub",  brand: "Nécessaire",        cat: "Body",       price: "$45"  },
  { id: "13", name: "Nail Gloss Top Coat",     brand: "Essie",             cat: "Nails",      price: "$14"  },
  { id: "14", name: "Sculpting Body Oil",      brand: "Sisley Paris",      cat: "Body",       price: "$220" },
];

const RECENT = ["Retinol serum", "Charlotte Tilbury", "Dupe for La Mer", "Best SPF moisturiser"];

const CAT_ACCENT: Record<string, string> = {
  Makeup: "#C4968A", Skincare: "#1A5C3A", Fragrance: "#C8B06A",
  Haircare: "#A08060", Body: "#5A7A9A", Nails: "#B07880",
};

export default function SearchScreen({ onBack }: Props) {
  const [query, setQuery]     = useState("");
  const [filter, setFilter]   = useState("All");
  const inputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const cats  = ["All", ...Array.from(new Set(ALL_RESULTS.map(r => r.cat)))];
  const q     = query.toLowerCase().trim();
  const shown = ALL_RESULTS.filter(r =>
    (filter === "All" || r.cat === filter) &&
    (!q || r.name.toLowerCase().includes(q) || r.brand.toLowerCase().includes(q) || r.cat.toLowerCase().includes(q))
  );

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Search header */}
      <div className="px-4 pt-10 pb-3 flex-shrink-0"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)" }}>

        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack}
            className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0">
            ← Back
          </button>

          {/* Search bar */}
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0B3C26" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="6" cy="6" r="4" />
              <path d="M9.5 9.5L12.5 12.5" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, brands, categories…"
              className="w-full pl-9 pr-8 py-2.5 rounded-full font-sans text-xs text-[#1C1C1C] placeholder:text-[#8A8070] outline-none"
              style={{ background: "rgba(11,60,38,0.05)", border: "1px solid rgba(11,60,38,0.12)" }}
            />
            {query && (
              <button onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8070] hover:text-[#0B3C26] transition-colors cursor-pointer text-sm leading-none">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full font-sans text-[9px] tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: filter === c ? "#0B3C26" : "transparent",
                color: filter === c ? "rgba(240,232,204,0.9)" : "#8A8070",
                border: filter === c ? "none" : "1px solid rgba(11,60,38,0.15)",
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="divider-gold mx-4" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">

        {/* Recent searches — only when empty query */}
        {!q && (
          <div className="mb-6">
            <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#8A8070] mb-3">Recent</p>
            <div className="flex flex-wrap gap-2">
              {RECENT.map(r => (
                <button key={r} onClick={() => setQuery(r)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full cursor-pointer transition-all hover:border-[#0B3C26] hover:text-[#0B3C26]"
                  style={{ background: "rgba(200,176,106,0.08)", border: "1px solid rgba(200,176,106,0.2)", color: "#8A8070" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
                    <path d="M5 1 A4 4 0 1 0 9 5" /><path d="M7 3 L9 5 L7 7" />
                  </svg>
                  <span className="font-sans text-[10px]">{r}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {q && shown.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-xl font-normal text-[#1C1C1C] mb-2">No results</p>
            <p className="font-sans text-xs font-light text-[#8A8070]">Try a different product or brand name</p>
          </div>
        )}

        {(q || filter !== "All") && shown.length > 0 && (
          <div>
            <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#8A8070] mb-3">
              {shown.length} result{shown.length !== 1 ? "s" : ""}
              {q ? ` for "${query}"` : ""}
            </p>
            <div className="space-y-2.5">
              {shown.map(r => {
                const accent = CAT_ACCENT[r.cat] ?? "#C8B06A";
                return (
                  <button key={r.id}
                    className="card-pearl rounded-2xl p-4 w-full text-left cursor-pointer group flex items-center gap-3.5 transition-all duration-200">

                    {/* Colour dot */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: accent, opacity: 0.7 }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight truncate">
                        {r.name}
                      </p>
                      <p className="font-sans text-[10px] font-light text-[#8A8070] mt-0.5">{r.brand}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-sans text-[9px] font-medium text-[#1C1C1C]">{r.price}</span>
                      <span className="font-sans text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${accent}15`, color: accent }}>
                        {r.cat}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Popular picks — show when no query and no filter */}
        {!q && filter === "All" && (
          <div>
            <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#8A8070] mb-3">Popular picks</p>
            <div className="space-y-2.5">
              {ALL_RESULTS.slice(0, 5).map(r => {
                const accent = CAT_ACCENT[r.cat] ?? "#C8B06A";
                return (
                  <button key={r.id}
                    className="card-pearl rounded-2xl p-4 w-full text-left cursor-pointer group flex items-center gap-3.5 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: accent, opacity: 0.7 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight truncate">{r.name}</p>
                      <p className="font-sans text-[10px] font-light text-[#8A8070] mt-0.5">{r.brand}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="font-sans text-[9px] font-medium text-[#1C1C1C]">{r.price}</span>
                      <span className="font-sans text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full"
                        style={{ background: `${accent}15`, color: accent }}>{r.cat}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
