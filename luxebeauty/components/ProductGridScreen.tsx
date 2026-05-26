"use client";

import { useState } from "react";

interface Props { onBack: () => void; }

const products = [
  { id: "1", name: "Lumière Foundation", brand: "Dior Beauty", price: "$120", rating: 4.8, hasDupe: true, category: "Makeup", color: "#E8D5C0" },
  { id: "2", name: "Balm Essentiel", brand: "Clinique", price: "$95", rating: 4.7, hasDupe: true, category: "Skincare", color: "#D4C0A8" },
  { id: "3", name: "Micro Sérum", brand: "Kiehl's", price: "$120", rating: 4.9, hasDupe: false, category: "Skincare", color: "#C8D8C8" },
  { id: "4", name: "Quad Eyeshadow", brand: "Charlotte Tilbury", price: "$85", rating: 4.6, hasDupe: true, category: "Makeup", color: "#D4B8A0" },
  { id: "5", name: "Vital Perfector", brand: "La Prairie", price: "$280", rating: 4.9, hasDupe: false, category: "Skincare", color: "#E0D0B8" },
  { id: "6", name: "Shimmer Compact", brand: "BECCA", price: "$44", rating: 4.8, hasDupe: true, category: "Makeup", color: "#F0D890" },
  { id: "7", name: "Mon Guerlain", brand: "Guerlain", price: "$150", rating: 4.7, hasDupe: false, category: "Fragrance", color: "#E8C8D0" },
  { id: "8", name: "Velvet Lipstick", brand: "YSL", price: "$55", rating: 4.8, hasDupe: true, category: "Makeup", color: "#C09090" },
];

const filters = ["All", "Makeup", "Skincare", "Fragrance", "Haircare"];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill={filled ? "#C9A96E" : "none"} stroke="#C9A96E" strokeWidth="0.8">
      <path d="M5 1L6.2 3.6L9 4L7 5.9L7.6 8.8L5 7.3L2.4 8.8L3 5.9L1 4L3.8 3.6L5 1Z" />
    </svg>
  );
}

export default function ProductGridScreen({ onBack }: Props) {
  const [filter, setFilter] = useState("All");
  const [added, setAdded] = useState<string[]>([]);

  const filtered = filter === "All" ? products : products.filter(p => p.category === filter);

  const addToVanity = (id: string) => {
    setAdded(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  return (
    <div className="marble-bg min-h-screen overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 pt-10 pb-4"
        style={{ background: "rgba(250,247,242,0.92)", backdropFilter: "blur(14px)" }}>
        <div className="flex items-center justify-between mb-5">
          <button onClick={onBack}
            className="font-jost text-[10px] tracking-[0.15em] uppercase text-[#8A7F74] hover:text-[#C9A96E] transition-colors flex items-center gap-1.5 cursor-pointer">
            ← Home
          </button>
          <h2 className="font-display text-xl font-normal text-[#2C2C2C]">Luxury Shopping</h2>
          <span className="font-jost text-[10px] text-[#C9A96E] tracking-[0.1em]">{filtered.length} items</span>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] tracking-[0.1em] uppercase transition-all duration-250 cursor-pointer font-jost
                ${filter === f
                  ? "bg-[#C9A96E] text-white shadow-md"
                  : "border border-[rgba(201,169,110,0.3)] text-[#8A7F74] hover:border-[#C9A96E] hover:text-[#7A5A30]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-20 grid grid-cols-2 gap-3 mt-4">
        {filtered.map((product, i) => (
          <div
            key={product.id}
            className="card-luxury rounded-2xl overflow-hidden relative group"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            {/* Product visual */}
            <div className="h-36 relative flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${product.color}40, ${product.color}20)` }}>

              {/* Abstract product shape */}
              <div className="w-16 h-16 rounded-full opacity-60"
                style={{ background: `radial-gradient(circle, ${product.color}, ${product.color}80)` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                {product.hasDupe && (
                  <span className="badge"
                    style={{ background: "rgba(201,169,110,0.15)", color: "#8A6030", border: "1px solid rgba(201,169,110,0.4)" }}>
                    Dupe ✓
                  </span>
                )}
              </div>

              {/* Price badge */}
              <div className="absolute top-2.5 right-2.5">
                <span className="badge font-semibold"
                  style={{ background: "rgba(255,255,255,0.85)", color: "#2C2C2C" }}>
                  {product.price}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="font-jost text-[9px] tracking-[0.12em] uppercase text-[#C9A96E] mb-0.5">{product.brand}</p>
              <p className="font-display text-sm font-normal text-[#2C2C2C] leading-tight mb-2">{product.name}</p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                  <StarIcon key={n} filled={n <= Math.floor(product.rating)} />
                ))}
                <span className="font-jost text-[9px] text-[#8A7F74] ml-1">{product.rating}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => addToVanity(product.id)}
                  className={`flex-1 py-2 rounded-full text-[9px] tracking-[0.1em] uppercase font-jost transition-all duration-250 cursor-pointer
                    ${added.includes(product.id)
                      ? "bg-[rgba(201,169,110,0.15)] text-[#8A6030] border border-[#C9A96E]"
                      : "btn-outline-gold"}`}
                >
                  {added.includes(product.id) ? "✓ In Vanity" : "+ Vanity"}
                </button>
                <button className="btn-gold px-3 py-2 rounded-full text-[9px] tracking-[0.08em] cursor-pointer">
                  Shop
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Luxury helper CTA */}
      <div className="fixed bottom-12 right-4 z-20">
        <button className="btn-gold w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-xl cursor-pointer"
          title="Luxury Shopping Helper">
          ✦
        </button>
      </div>
    </div>
  );
}
