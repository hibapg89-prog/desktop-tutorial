"use client";

import { useState } from "react";

export interface VanityItem {
  id: string;
  type: "lipstick" | "palette" | "compact" | "brush" | "perfume";
  name: string;
  brand: string;
  hex?: string;
  shades?: string[];
}

export const INITIAL_VANITY_ITEMS: VanityItem[] = [
  { id: "1",  type: "lipstick", name: "Rouge Allure", brand: "Chanel",     hex: "#C47070" },
  { id: "2",  type: "lipstick", name: "Velvet Red",   brand: "MAC",        hex: "#8B3A3A" },
  { id: "3",  type: "lipstick", name: "Peach Glam",   brand: "NARS",       hex: "#D4956A" },
  { id: "4",  type: "lipstick", name: "Mauve Dream",  brand: "Dior",       hex: "#9E6060" },
  { id: "5",  type: "lipstick", name: "Blush Kiss",   brand: "Chanel",     hex: "#C49090" },
  { id: "6",  type: "lipstick", name: "Berry Wine",   brand: "YSL",        hex: "#7A3F3F" },
  { id: "7",  type: "palette",  name: "Nude Shimmer", brand: "Too Faced",  shades: ["#E8C9A0","#C4A882","#8B6B4A","#3C2820"] },
  { id: "8",  type: "palette",  name: "Rose Gold",    brand: "Urban Decay",shades: ["#F0D4C0","#D4A890","#B07860","#6C3020"] },
  { id: "9",  type: "palette",  name: "Soft Glam",    brand: "ABH",        shades: ["#F5E8D8","#DEC4A8","#A07858","#5A3828"] },
  { id: "10", type: "compact",  name: "Shimmer HL",   brand: "BECCA",      hex: "#F0D89A" },
  { id: "11", type: "compact",  name: "Warm Blush",   brand: "CT",         hex: "#E8C0B0" },
  { id: "12", type: "brush",    name: "Foundation",   brand: "Sigma" },
  { id: "13", type: "perfume",  name: "Lumière Noire",brand: "YSL" },
];

interface Props {
  onBack: () => void;
  items: VanityItem[];
  onReorder: (items: VanityItem[]) => void;
}

export default function VanityScreen({ onBack, items, onReorder }: Props) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, toId: string) => {
    e.preventDefault();
    if (!dragging || dragging === toId) return;
    const fi = items.findIndex(x => x.id === dragging);
    const ti = items.findIndex(x => x.id === toId);
    const n = [...items];
    const [m] = n.splice(fi, 1);
    n.splice(ti, 0, m);
    onReorder(n);
  };

  const sel = items.find(x => x.id === selected);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        background: "#F8F5F0",
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"),
          repeating-linear-gradient(
            105deg,
            transparent,
            transparent 60px,
            rgba(180,165,145,0.06) 60px,
            rgba(180,165,145,0.06) 61px
          ),
          repeating-linear-gradient(
            165deg,
            transparent,
            transparent 80px,
            rgba(200,185,165,0.05) 80px,
            rgba(200,185,165,0.05) 81px
          ),
          linear-gradient(160deg, #F5F0EA, #EDE5D5, #F0EBE0)
        `,
      }}>

      {/* Marble veins overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <path d="M20 0 Q60 80 40 200 Q20 320 80 400 Q140 480 100 600 Q60 720 120 800"
            stroke="#8A7A6A" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M80 0 Q110 120 90 250 Q70 380 130 460 Q190 540 160 680 Q130 780 180 800"
            stroke="#9A8A78" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M200 0 Q160 100 180 220 Q200 340 160 440 Q120 540 170 680"
            stroke="#8A7A6A" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M300 100 Q260 220 290 360 Q320 500 280 620 Q240 740 300 800"
            stroke="#A09080" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M360 0 Q380 150 350 280 Q320 410 370 520 Q400 620 380 800"
            stroke="#8A7A6A" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Fine veins */}
          <path d="M50 200 Q90 230 70 280" stroke="#8A7A6A" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M180 400 Q220 420 200 470" stroke="#9A8878" strokeWidth="0.6" fill="none" opacity="0.6" />
          <path d="M300 300 Q340 340 320 390" stroke="#8A7A6A" strokeWidth="0.7" fill="none" opacity="0.5" />
        </svg>
      </div>

      {/* Back button (minimal) */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0 relative z-10"
        style={{ background: "rgba(245,240,234,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A]">My Vanity</p>
        <button className="btn-ghost px-3 py-1.5 rounded-full text-[9px] cursor-pointer">+ Add</button>
      </div>

      {/* Marble surface rim */}
      <div className="mx-4 rounded-t-2xl relative z-10" style={{
        height: "8px",
        background: "linear-gradient(180deg, rgba(210,196,176,0.9), rgba(190,176,156,0.8))",
        boxShadow: "0 -2px 8px rgba(80,60,30,0.08)",
      }} />

      {/* Vanity surface */}
      <div className="mx-4 flex-1 overflow-auto relative z-10 pb-2"
        style={{
          background: "linear-gradient(160deg, rgba(252,248,242,0.95), rgba(242,236,226,0.9))",
          boxShadow: "inset 0 4px 20px rgba(80,60,30,0.06)",
        }}>

        {/* Brush holder */}
        <div className="flex justify-end pr-6 pt-4 pb-2">
          <BrushHolderSVG />
        </div>

        {/* Items */}
        <div className="px-4 pb-4 flex flex-wrap gap-3 justify-start">
          {items.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={e => handleDragOver(e, item.id)}
              onClick={() => setSelected(selected === item.id ? null : item.id)}
              className={`flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none transition-all duration-200
                ${dragging === item.id ? "opacity-30 scale-90" : ""}
                ${selected === item.id ? "translate-y-[-8px]" : ""}`}
              style={{ filter: "drop-shadow(0 6px 12px rgba(80,60,30,0.18))" }}
            >
              {item.type === "lipstick" && <LipstickSVG color={item.hex!} />}
              {item.type === "palette"  && <PaletteSVG shades={item.shades!} />}
              {item.type === "compact"  && <CompactSVG color={item.hex!} />}
              {item.type === "brush"    && <BrushSVG />}
              {item.type === "perfume"  && <PerfumeSVG />}
            </div>
          ))}
        </div>
      </div>

      {/* Marble rim bottom */}
      <div className="mx-4 rounded-b-2xl flex-shrink-0 relative z-10" style={{
        height: "12px",
        background: "linear-gradient(180deg, rgba(190,176,156,0.8), rgba(170,156,136,0.7))",
        boxShadow: "0 4px 12px rgba(80,60,30,0.14)",
      }} />

      {/* Bottom watermark */}
      <div className="py-3 text-center relative z-10">
        <p className="font-sans text-[7px] tracking-[0.35em] uppercase text-[#0B3C26] opacity-25">
          Drag to Rearrange · My Vanity
        </p>
      </div>

      {/* Selected item card */}
      {sel && (
        <div className="fixed bottom-14 left-0 right-0 px-6 z-30">
          <div className="card-pearl rounded-2xl p-4 max-w-sm mx-auto flex items-center gap-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white font-sans font-light"
              style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A)" }}>
              {sel.brand?.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-serif text-sm text-[#1C1C1C]">{sel.name}</p>
              <p className="font-sans text-[10px] text-[#8A8070] font-light">{sel.brand}</p>
            </div>
            <button className="btn-emerald px-3 py-1.5 rounded-full text-[9px] cursor-pointer">Shop</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LipstickSVG({ color }: { color: string }) {
  return (
    <svg width="26" height="62" viewBox="0 0 26 62">
      {/* Gold tube */}
      <rect x="5" y="28" width="16" height="30" rx="1.5" fill="url(#lipGold)" />
      {/* Bullet */}
      <rect x="7" y="16" width="12" height="16" fill={color} />
      <path d="M7 16 Q13 6 19 16" fill={color} />
      {/* Gold connector */}
      <rect x="5" y="28" width="16" height="4" rx="0.5" fill="#C8B06A" />
      {/* Bottom cap */}
      <rect x="4" y="54" width="18" height="6" rx="1.5" fill="#A89050" />
      {/* Shine */}
      <rect x="7" y="30" width="4" height="20" rx="2" fill="rgba(255,255,255,0.18)" />
      <defs>
        <linearGradient id="lipGold" x1="5" y1="0" x2="21" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4C07A" />
          <stop offset="50%" stopColor="#E8D898" />
          <stop offset="100%" stopColor="#A89050" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PaletteSVG({ shades }: { shades: string[] }) {
  return (
    <svg width="68" height="52" viewBox="0 0 68 52">
      <rect x="1" y="1" width="66" height="50" rx="4" fill="#EDE5D5" stroke="#C8B06A" strokeWidth="0.5" />
      <rect x="3" y="3" width="62" height="22" rx="2.5" fill="white" opacity="0.7" />
      {shades.map((c, i) => <rect key={i} x={5+i*15.5} y={5} width="13" height="17" rx="1.5" fill={c} />)}
      <line x1="3" y1="27" x2="65" y2="27" stroke="#C8B06A" strokeWidth="0.4" opacity="0.5" />
      <rect x="3" y="28" width="62" height="20" rx="2.5" fill="white" opacity="0.5" />
      <rect x="5" y="30" width="58" height="16" rx="2" fill={shades[1]} opacity="0.3" />
      {/* Mirror shimmer */}
      <rect x="5" y="30" width="14" height="14" rx="1" fill="rgba(240,235,210,0.5)" />
    </svg>
  );
}

function CompactSVG({ color }: { color: string }) {
  return (
    <svg width="56" height="44" viewBox="0 0 56 44">
      <rect x="1" y="1" width="54" height="42" rx="5" fill="#EDE5D5" stroke="#C8B06A" strokeWidth="0.6" />
      <rect x="2" y="2" width="52" height="19" rx="4" fill="white" opacity="0.8" />
      <circle cx="28" cy="11" r="9" fill={color} opacity="0.8" />
      <circle cx="28" cy="11" r="6" fill={color} />
      <ellipse cx="24" cy="8.5" rx="2.5" ry="1.8" fill="white" opacity="0.35" />
      <rect x="2" y="23" width="52" height="17" rx="4" fill="#F0E8D8" opacity="0.9" />
      {/* Hinge */}
      <rect x="24" y="22" width="8" height="2" rx="1" fill="#C8B06A" opacity="0.4" />
    </svg>
  );
}

function BrushSVG() {
  return (
    <svg width="16" height="72" viewBox="0 0 16 72">
      {/* Handle */}
      <rect x="5" y="0" width="6" height="48" rx="1" fill="url(#brushGold)" />
      {/* Ferrule */}
      <rect x="4" y="44" width="8" height="6" rx="0.5" fill="#C8B06A" />
      {/* Bristles */}
      <ellipse cx="8" cy="62" rx="5" ry="12" fill="#8A7A5A" opacity="0.7" />
      <ellipse cx="8" cy="56" rx="3.5" ry="4" fill="#9A8A6A" opacity="0.5" />
      <defs>
        <linearGradient id="brushGold" x1="5" y1="0" x2="11" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D0C080" />
          <stop offset="50%" stopColor="#E8D898" />
          <stop offset="100%" stopColor="#A89050" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BrushHolderSVG() {
  return (
    <svg width="52" height="80" viewBox="0 0 52 80">
      {/* Cylinder body */}
      <ellipse cx="26" cy="72" rx="22" ry="6" fill="#C8B06A" opacity="0.3" />
      <rect x="4" y="30" width="44" height="44" rx="4" fill="url(#holderGold)" />
      <ellipse cx="26" cy="30" rx="22" ry="6" fill="#E8D898" />
      <ellipse cx="26" cy="30" rx="18" ry="5" fill="rgba(255,255,255,0.4)" />
      {/* Brushes sticking out */}
      {[10, 18, 26, 34, 42].map((x, i) => (
        <g key={i}>
          <rect x={x + 1} y={i % 2 === 0 ? 4 : 10} width="3.5" height="28" rx="1"
            fill={["#C8B06A","#D4C07A","#A89050","#C8B06A","#E0C880"][i]} />
          <ellipse cx={x + 2.75} cy={i % 2 === 0 ? 16 : 22} rx="3.5" ry={10 - i}
            fill={["#8A7A5A","#6A5A3A","#9A8A6A","#7A6A4A","#8A7850"][i]} opacity="0.65" />
        </g>
      ))}
      {/* Gold band */}
      <rect x="4" y="56" width="44" height="4" rx="0" fill="#C8B06A" opacity="0.5" />
      <defs>
        <linearGradient id="holderGold" x1="4" y1="30" x2="48" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8DCC8" />
          <stop offset="100%" stopColor="#D0C0A0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PerfumeSVG() {
  return (
    <svg width="38" height="62" viewBox="0 0 38 62">
      <rect x="7" y="18" width="24" height="40" rx="3.5" fill="rgba(240,232,204,0.4)" stroke="#C8B06A" strokeWidth="0.7" />
      <rect x="9" y="20" width="20" height="36" rx="3" fill="rgba(240,232,204,0.2)" />
      <rect x="11" y="13" width="16" height="7" rx="1.5" fill="#C8B06A" opacity="0.75" />
      <rect x="15" y="9" width="8" height="5" rx="1" fill="#A89050" />
      <circle cx="19" cy="8" r="2.5" fill="#C8B06A" />
      <rect x="11" y="26" width="16" height="18" rx="2" fill="rgba(11,60,38,0.06)" />
      <text x="19" y="38" textAnchor="middle" fill="#0B3C26" fontSize="4.5" fontFamily="serif" opacity="0.5" letterSpacing="0.4">THE MUSE</text>
      {/* Shine */}
      <rect x="9" y="20" width="5" height="28" rx="2.5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}
