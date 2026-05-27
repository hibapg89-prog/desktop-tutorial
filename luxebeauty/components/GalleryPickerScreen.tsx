"use client";

import { useState } from "react";

interface Props {
  onNext: () => void;
  onCancel: () => void;
}

const PRODUCTS = [
  { id: "1", gradient: "linear-gradient(145deg, #E8A830, #C87820)", label: "Serum" },
  { id: "2", gradient: "linear-gradient(145deg, #C84858, #8B2030)", label: "Lipstick" },
  { id: "3", gradient: "linear-gradient(145deg, #C8A880, #9A7850)", label: "Brush" },
  { id: "4", gradient: "linear-gradient(145deg, #E8C0A0, #C09078)", label: "Foundation" },
  { id: "5", gradient: "linear-gradient(145deg, #D4A8C0, #B07890)", label: "Blush" },
  { id: "6", gradient: "linear-gradient(145deg, #E8D890, #C0A840)", label: "Perfume" },
  { id: "7", gradient: "linear-gradient(145deg, #A8C8B0, #608870)", label: "Toner" },
  { id: "8", gradient: "linear-gradient(145deg, #B8A8D8, #7860A8)", label: "Eye Shadow" },
  { id: "9", gradient: "linear-gradient(145deg, #E8C0B0, #C09080)", label: "Moisturiser" },
  { id: "10", gradient: "linear-gradient(145deg, #C8D8E8, #8098B0)", label: "Eye Cream" },
  { id: "11", gradient: "linear-gradient(145deg, #E0B8C0, #B07880)", label: "Highlighter" },
  { id: "12", gradient: "linear-gradient(145deg, #F0E0A0, #D0B060)", label: "SPF" },
];

export default function GalleryPickerScreen({ onNext, onCancel }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(["1", "6"]));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex-shrink-0">
        <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-50 mb-1">
          Gallery
        </p>
        <h2 className="font-serif text-2xl font-normal text-[#1C1C1C]">Select from Gallery</h2>
        {selected.size > 0 && (
          <p className="font-sans text-[10px] text-[#C4968A] mt-1">
            {selected.size} item{selected.size > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="grid grid-cols-3 gap-2">
          {PRODUCTS.map((p) => {
            const isSel = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`relative rounded-xl overflow-hidden aspect-square cursor-pointer transition-all duration-200
                  ${isSel ? "iridescent-card ring-1 ring-[rgba(196,150,138,0.5)]" : "card-pearl"}`}
              >
                {/* Product image placeholder */}
                <div className="absolute inset-0" style={{ background: p.gradient, opacity: 0.85 }} />

                {/* Product SVG silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <ProductSilhouette type={p.id} />
                </div>

                {/* Label */}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="font-sans text-[8px] tracking-wider text-white font-medium drop-shadow">
                    {p.label}
                  </span>
                </div>

                {/* Checkmark badge */}
                {isSel && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "#0B3C26" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Selection overlay */}
                {isSel && (
                  <div className="absolute inset-0 rounded-xl"
                    style={{ border: "2px solid rgba(11,60,38,0.4)" }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20"
        style={{ background: "rgba(250,246,239,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-ghost flex-1 py-4 rounded-full cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onNext}
            disabled={selected.size === 0}
            className={`flex-1 py-4 rounded-full cursor-pointer ${selected.size > 0 ? "btn-rose" : "btn-ghost opacity-40"}`}>
            Next {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductSilhouette({ type }: { type: string }) {
  const n = parseInt(type);
  if (n % 4 === 1) return (
    <svg width="32" height="56" viewBox="0 0 32 56" fill="none" opacity="0.4">
      <rect x="10" y="18" width="12" height="32" rx="6" fill="white" />
      <ellipse cx="16" cy="10" rx="8" ry="10" fill="white" />
    </svg>
  );
  if (n % 4 === 2) return (
    <svg width="20" height="52" viewBox="0 0 20 52" fill="none" opacity="0.4">
      <rect x="5" y="24" width="10" height="24" rx="1" fill="white" />
      <path d="M5 24 Q10 14 15 24" fill="white" />
      <rect x="4" y="42" width="12" height="8" rx="1" fill="rgba(255,255,255,0.6)" />
    </svg>
  );
  if (n % 4 === 3) return (
    <svg width="48" height="44" viewBox="0 0 48 44" fill="none" opacity="0.4">
      <rect x="2" y="10" width="44" height="30" rx="4" fill="white" />
      <ellipse cx="24" cy="10" rx="18" ry="5" fill="white" />
    </svg>
  );
  return (
    <svg width="36" height="52" viewBox="0 0 36 52" fill="none" opacity="0.4">
      <rect x="8" y="14" width="20" height="34" rx="3" fill="white" />
      <rect x="12" y="8" width="12" height="8" rx="1.5" fill="rgba(255,255,255,0.8)" />
    </svg>
  );
}
