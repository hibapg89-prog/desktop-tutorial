"use client";

import { useState } from "react";

interface Props { onBack: () => void; }

const INITIAL_ITEMS = [
  { id: "1", type: "lipstick", color: "#C47070", label: "Rose Nude", brand: "Charlotte Tilbury" },
  { id: "2", type: "lipstick", color: "#8B3A3A", label: "Velvet Red", brand: "MAC" },
  { id: "3", type: "lipstick", color: "#D4956A", label: "Peach Glam", brand: "NARS" },
  { id: "4", type: "lipstick", color: "#9E6060", label: "Mauve Dream", brand: "Dior Beauty" },
  { id: "5", type: "lipstick", color: "#C49090", label: "Blush Kiss", brand: "Chanel" },
  { id: "6", type: "lipstick", color: "#7A3F3F", label: "Berry Wine", brand: "YSL" },
  { id: "7", type: "palette", label: "Nude Shimmer", brand: "Too Faced", shades: ["#E8C9A0", "#C4A882", "#8B6B4A", "#3C2820"] },
  { id: "8", type: "palette", label: "Rose Gold", brand: "Urban Decay", shades: ["#F0D4C0", "#D4A890", "#B07860", "#6C3020"] },
  { id: "9", type: "palette", label: "Soft Glam", brand: "ABH", shades: ["#F5E8D8", "#DEC4A8", "#A07858", "#5A3828"] },
  { id: "10", type: "compact", label: "Shimmer Highlight", brand: "BECCA", color: "#F0D89A" },
  { id: "11", type: "compact", label: "Warm Blush", brand: "Charlotte Tilbury", color: "#E8C0B0" },
  { id: "12", type: "perfume", label: "Lumière Noire", brand: "YSL" },
  { id: "13", type: "perfume", label: "Mon Paris", brand: "YSL" },
];

type VanityItem = typeof INITIAL_ITEMS[number];

function LipstickSVG({ color }: { color: string }) {
  return (
    <svg width="32" height="72" viewBox="0 0 32 72" fill="none">
      <rect x="8" y="32" width="16" height="36" rx="2" fill="#D4AF70" />
      <rect x="10" y="34" width="12" height="20" fill={color} />
      <path d="M10 34 Q16 24 22 34" fill={color} />
      <rect x="6" y="60" width="20" height="10" rx="2" fill="#B89050" />
    </svg>
  );
}

function PaletteSVG({ shades }: { shades: string[] }) {
  return (
    <svg width="72" height="56" viewBox="0 0 72 56" fill="none">
      <rect x="1" y="1" width="70" height="54" rx="4" fill="#E8E0D0" stroke="#C9A96E" strokeWidth="0.5" />
      <rect x="3" y="3" width="66" height="22" rx="3" fill="white" opacity="0.8" />
      {shades.map((c, i) => (
        <rect key={i} x={5 + i * 16} y={5} width="13" height="18" rx="1.5" fill={c} />
      ))}
      <rect x="3" y="28" width="66" height="24" rx="3" fill="white" opacity="0.6" />
      <rect x="5" y="30" width="62" height="20" rx="2" fill={shades[1]} opacity="0.4" />
      <line x1="3" y1="27" x2="69" y2="27" stroke="#C9A96E" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

function CompactSVG({ color }: { color: string }) {
  return (
    <svg width="60" height="48" viewBox="0 0 60 48" fill="none">
      <rect x="1" y="1" width="58" height="46" rx="5" fill="#E8E0D0" stroke="#C9A96E" strokeWidth="0.8" />
      <rect x="2" y="2" width="56" height="22" rx="4" fill="white" opacity="0.9" />
      <circle cx="30" cy="13" r="10" fill={color} opacity="0.85" />
      <circle cx="30" cy="13" r="6" fill={color} />
      <ellipse cx="26" cy="10" rx="2" ry="1.5" fill="white" opacity="0.4" />
      <rect x="2" y="26" width="56" height="20" rx="4" fill="#F0E8D8" />
    </svg>
  );
}

function PerfumeSVG() {
  return (
    <svg width="44" height="68" viewBox="0 0 44 68" fill="none">
      <rect x="8" y="20" width="28" height="44" rx="4" fill="rgba(201,180,140,0.35)" stroke="#C9A96E" strokeWidth="0.8" />
      <rect x="10" y="22" width="24" height="40" rx="3" fill="rgba(232,213,163,0.25)" />
      <rect x="14" y="14" width="16" height="8" rx="2" fill="#C9A96E" opacity="0.8" />
      <rect x="18" y="10" width="8" height="6" rx="1" fill="#B89050" />
      <circle cx="22" cy="9" r="3" fill="#D4AF70" />
      <text x="22" y="46" textAnchor="middle" fill="#8A7050" fontSize="6" fontFamily="serif" opacity="0.7">YSL</text>
    </svg>
  );
}

export default function VanityScreen({ onBack }: Props) {
  const [items, setItems] = useState<VanityItem[]>(INITIAL_ITEMS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragEnd = () => setDragging(null);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    setItems(prev => {
      const from = prev.findIndex(x => x.id === dragging);
      const to = prev.findIndex(x => x.id === targetId);
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const sel = items.find(x => x.id === selected);

  return (
    <div className="marble-deep min-h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-jost text-[10px] tracking-[0.15em] uppercase text-[#8A7F74] hover:text-[#C9A96E] transition-colors flex items-center gap-1.5 cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-jost text-[9px] tracking-[0.2em] uppercase text-[#C9A96E]">Drag to Rearrange</p>
          <p className="font-display text-lg font-normal text-[#2C2C2C]">My Vanity</p>
        </div>
        <button className="btn-outline-gold px-3 py-1.5 rounded-full text-[9px] cursor-pointer">
          + Add
        </button>
      </div>

      {/* Drawer rim */}
      <div className="mx-4 rounded-t-2xl flex-shrink-0" style={{
        height: "12px",
        background: "linear-gradient(180deg, #C9B090, #D4BC98)",
        boxShadow: "0 -2px 8px rgba(100,80,40,0.15)",
      }} />

      {/* Drawer */}
      <div className="mx-4 flex-1 overflow-auto relative"
        style={{
          background: "linear-gradient(180deg, #F5EFE4 0%, #EDE5D8 100%)",
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 50%),
            repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(201,169,110,0.04) 80px, rgba(201,169,110,0.04) 82px),
            repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(201,169,110,0.03) 80px, rgba(201,169,110,0.03) 82px)
          `,
          boxShadow: "inset 0 4px 20px rgba(100,80,40,0.12), 0 8px 32px rgba(100,80,40,0.15)",
        }}>

        <div className="p-6 flex flex-wrap gap-5 justify-center min-h-full">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onClick={() => setSelected(selected === item.id ? null : item.id)}
              className={`vanity-item flex flex-col items-center gap-1 cursor-pointer select-none
                ${dragging === item.id ? "opacity-40 scale-95" : ""}
                ${selected === item.id ? "!translate-y-[-10px]" : ""}
              `}
            >
              {item.type === "lipstick" && <LipstickSVG color={item.color!} />}
              {item.type === "palette" && <PaletteSVG shades={item.shades!} />}
              {item.type === "compact" && <CompactSVG color={item.color!} />}
              {item.type === "perfume" && <PerfumeSVG />}

              {selected === item.id && (
                <div className="absolute mt-1 card-luxury rounded-xl px-3 py-2 text-center z-10 pointer-events-none"
                  style={{ minWidth: "100px", bottom: "-70px" }}>
                  <p className="font-display text-xs text-[#2C2C2C]">{item.label}</p>
                  <p className="font-jost text-[9px] text-[#C9A96E] mt-0.5">{item.brand}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Drawer bottom */}
      <div className="mx-4 rounded-b-2xl flex-shrink-0" style={{
        height: "16px",
        background: "linear-gradient(180deg, #C0A878, #B09060)",
        boxShadow: "0 4px 12px rgba(100,80,40,0.2)",
      }} />

      {/* Selected info */}
      {sel && (
        <div className="fixed bottom-12 left-0 right-0 px-6 z-20">
          <div className="card-luxury rounded-2xl p-4 max-w-sm mx-auto flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white text-xs font-jost">
              {sel.brand?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-display text-sm text-[#2C2C2C]">{sel.label}</p>
              <p className="font-jost text-[10px] text-[#8A7F74]">{sel.brand}</p>
            </div>
            <button className="btn-gold px-3 py-1.5 rounded-full text-[9px] cursor-pointer">Shop</button>
          </div>
        </div>
      )}
    </div>
  );
}
