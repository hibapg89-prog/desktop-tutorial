"use client";

import { useState } from "react";

interface Props { onBack: () => void; }

const products = [
  { id:"1",  name:"Lumière Foundation",  brand:"Dior Beauty",  price:"$120", rating:4.8, dupe:true,  cat:"Makeup",    shimmer: false },
  { id:"2",  name:"Balm Essentiel",       brand:"Clinique",     price:"$95",  rating:4.7, dupe:true,  cat:"Skincare",  shimmer: false },
  { id:"3",  name:"Micro Sérum",          brand:"Kiehl's",      price:"$120", rating:4.9, dupe:false, cat:"Skincare",  shimmer: false },
  { id:"4",  name:"Quad Eyeshadow",       brand:"Charlotte T.", price:"$85",  rating:4.6, dupe:true,  cat:"Makeup",    shimmer: false },
  { id:"5",  name:"Vital Perfector",      brand:"La Prairie",   price:"$280", rating:4.9, dupe:false, cat:"Skincare",  shimmer: false },
  { id:"6",  name:"Aurora Parfum",        brand:"The Muse",     price:"$195", rating:4.8, dupe:false, cat:"Fragrance", shimmer: true  },
  { id:"7",  name:"Lumière Parfum",       brand:"The Muse",     price:"$195", rating:4.9, dupe:false, cat:"Fragrance", shimmer: true  },
  { id:"8",  name:"Velvet Lipstick",      brand:"YSL",          price:"$55",  rating:4.8, dupe:true,  cat:"Makeup",    shimmer: false },
];

const filters = ["All", "Makeup", "Skincare", "Fragrance"];

export default function ProductGridScreen({ onBack }: Props) {
  const [filter, setFilter] = useState("All");
  const [added, setAdded] = useState<string[]>([]);

  const shown = filter === "All" ? products : products.filter(p => p.cat === filter);

  return (
    <div className="satin-bg min-h-screen overflow-y-auto">

      {/* Header */}
      <div className="sticky top-0 z-20 px-5 pt-10 pb-4"
        style={{ background: "rgba(250,246,239,0.92)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack}
            className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1">
            ← Home
          </button>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Luxury Shopping</h2>
          <span className="font-sans text-[9px] text-[#C8B06A] tracking-wide">{shown.length} items</span>
        </div>
        {/* Filter row */}
        <div className="flex gap-2 pb-1 overflow-x-auto">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-[9px] tracking-[0.14em] uppercase transition-all duration-250 cursor-pointer
                ${filter === f
                  ? "bg-[#0B3C26] text-[rgba(240,232,204,0.9)]"
                  : "border border-[rgba(11,60,38,0.15)] text-[#8A8070] hover:border-[#0B3C26] hover:text-[#0B3C26]"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-20 grid grid-cols-2 gap-3 mt-2">
        {shown.map(p => (
          <div key={p.id}
            className={`rounded-2xl overflow-hidden relative ${p.shimmer ? "iridescent-card" : "card-pearl"}`}>

            {/* Visual zone */}
            <div className="h-36 relative flex items-center justify-center"
              style={p.shimmer
                ? {}
                : { background: "linear-gradient(145deg, rgba(240,235,220,0.7), rgba(225,218,200,0.5))" }}>

              {/* Abstract product visual */}
              <div className="w-14 h-14 rounded-full opacity-50"
                style={{ background: p.shimmer
                  ? "radial-gradient(circle, rgba(196,150,138,0.8), rgba(200,176,106,0.4))"
                  : "radial-gradient(circle, rgba(11,60,38,0.15), rgba(200,176,106,0.2))" }} />

              {/* Price */}
              <div className="absolute top-2.5 right-2.5">
                <span className="font-sans text-[9px] font-medium px-2 py-1 rounded-full"
                  style={{ background: "rgba(255,253,248,0.88)", color: "#1C1C1C", border: "1px solid rgba(200,176,106,0.2)" }}>
                  {p.price}
                </span>
              </div>

              {/* Dupe badge */}
              {p.dupe && (
                <div className="absolute top-2.5 left-2.5">
                  <span className="font-sans text-[8px] tracking-[0.06em] px-2 py-1 rounded-full"
                    style={{ background: "rgba(11,60,38,0.08)", color: "#0B3C26", border: "1px solid rgba(11,60,38,0.2)" }}>
                    Alternative ✓
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3.5">
              <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#C8B06A] mb-0.5 font-light">{p.brand}</p>
              <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-2">{p.name}</p>

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="w-2 h-2 rounded-sm"
                    style={{ background: n <= Math.floor(p.rating) ? "#0B3C26" : "rgba(11,60,38,0.15)" }} />
                ))}
                <span className="font-sans text-[8px] text-[#8A8070] ml-1">{p.rating}</span>
              </div>

              {/* CTAs */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAdded(prev => prev.includes(p.id) ? prev : [...prev, p.id])}
                  className={`flex-1 py-2 rounded-full font-sans text-[8px] tracking-[0.12em] uppercase transition-all cursor-pointer
                    ${added.includes(p.id)
                      ? "bg-[rgba(11,60,38,0.06)] text-[#0B3C26] border border-[rgba(11,60,38,0.25)]"
                      : "btn-ghost"}`}>
                  {added.includes(p.id) ? "✓ Added" : "+ Vanity"}
                </button>
                <button className="btn-emerald px-3 py-2 rounded-full text-[8px] tracking-[0.1em] cursor-pointer">
                  Shop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-14 right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-xl"
        style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A)", boxShadow: "0 4px 20px rgba(11,60,38,0.35)" }}
        title="The Muse Helper">
        <span className="text-[#C8B06A] text-lg">✦</span>
      </button>
    </div>
  );
}
