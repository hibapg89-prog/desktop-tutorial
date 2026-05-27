"use client";

import { useState, useEffect } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const ITEMS = [
  { id: "1", type: "lipstick", name: "Rouge Allure", brand: "Chanel",    hex: "#C47070" },
  { id: "2", type: "lipstick", name: "Velvet Red",   brand: "MAC",       hex: "#8B3A3A" },
  { id: "3", type: "lipstick", name: "Peach Glam",   brand: "NARS",      hex: "#D4956A" },
  { id: "4", type: "lipstick", name: "Mauve Dream",  brand: "Dior",      hex: "#9E6060" },
  { id: "5", type: "lipstick", name: "Blush Kiss",   brand: "Chanel",    hex: "#C49090" },
  { id: "6", type: "lipstick", name: "Berry Wine",   brand: "YSL",       hex: "#7A3F3F" },
  { id: "7", type: "palette",  name: "Nude Shimmer", brand: "Too Faced", shades: ["#E8C9A0","#C4A882","#8B6B4A","#3C2820"] },
  { id: "8", type: "palette",  name: "Rose Gold",    brand: "Urban Decay",shades: ["#F0D4C0","#D4A890","#B07860","#6C3020"] },
  { id: "9", type: "palette",  name: "Soft Glam",    brand: "ABH",       shades: ["#F5E8D8","#DEC4A8","#A07858","#5A3828"] },
  { id: "10",type: "compact",  name: "Shimmer HL",   brand: "BECCA",     hex: "#F0D89A" },
  { id: "11",type: "compact",  name: "Warm Blush",   brand: "CT",        hex: "#E8C0B0" },
  { id: "12",type: "perfume",  name: "Lumière Noire",brand: "YSL" },
  { id: "13",type: "perfume",  name: "Mon Paris",    brand: "YSL" },
];

type Item = typeof ITEMS[number];

export default function VanityScreen({ onBack }: Props) {
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, toId: string) => {
    e.preventDefault();
    if (!dragging || dragging === toId) return;
    setItems(prev => {
      const fi = prev.findIndex(x => x.id === dragging);
      const ti = prev.findIndex(x => x.id === toId);
      const n = [...prev];
      const [m] = n.splice(fi, 1);
      n.splice(ti, 0, m);
      return n;
    });
  };

  const sel = items.find(x => x.id === selected);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg, #EDE5D5, #E5DCCA)" }}>

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(237,229,213,0.9)", backdropFilter: "blur(12px)" }}>
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Drag to Rearrange</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">My Vanity</h2>
        </div>
        <button className="btn-ghost px-3 py-1.5 rounded-full text-[9px] cursor-pointer">+ Add</button>
      </div>

      {/* Marble drawer rim */}
      <div className="mx-5 rounded-t-2xl" style={{
        height: "10px",
        background: "linear-gradient(180deg, #D4C0A0, #C0AA88)",
        boxShadow: "0 -2px 8px rgba(80,60,30,0.12)",
      }} />

      {/* Drawer interior */}
      <div className="mx-5 flex-1 overflow-auto relative"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255,248,235,0.6) 0%, transparent 50%),
            linear-gradient(160deg, #F0E8D8, #E5DAC5)
          `,
          backgroundImage: `
            radial-gradient(ellipse at 25% 25%, rgba(255,248,235,0.7) 0%, transparent 45%),
            repeating-linear-gradient(88deg, transparent, transparent 90px, rgba(200,176,106,0.04) 90px, rgba(200,176,106,0.04) 92px),
            repeating-linear-gradient(0deg, transparent, transparent 90px, rgba(200,176,106,0.03) 90px, rgba(200,176,106,0.03) 92px)
          `,
          boxShadow: "inset 0 4px 24px rgba(80,60,30,0.1)",
        }}>
        <div className="p-5 flex flex-wrap gap-4 justify-center">
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
                ${selected === item.id ? "translate-y-[-8px]" : ""}
              `}
              style={{ filter: "drop-shadow(0 8px 14px rgba(80,60,30,0.22))" }}
            >
              {item.type === "lipstick" && <LipstickSVG color={item.hex!} />}
              {item.type === "palette" && <PaletteSVG shades={item.shades!} />}
              {item.type === "compact" && <CompactSVG color={item.hex!} />}
              {item.type === "perfume"  && <PerfumeSVG />}
            </div>
          ))}
        </div>
      </div>

      {/* Drawer bottom */}
      <div className="mx-5 rounded-b-2xl flex-shrink-0" style={{
        height: "14px",
        background: "linear-gradient(180deg, #C0AA88, #A89070)",
        boxShadow: "0 4px 12px rgba(80,60,30,0.18)",
      }} />

      {/* Selected item card */}
      {sel && (
        <div className="fixed bottom-14 left-0 right-0 px-6 z-30">
          <div className="card-pearl rounded-2xl p-4 max-w-sm mx-auto flex items-center gap-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] text-white font-sans"
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
    <svg width="28" height="64" viewBox="0 0 28 64">
      <rect x="6" y="28" width="16" height="32" rx="1.5" fill="#C8B06A" />
      <rect x="8" y="30" width="12" height="18" fill={color} />
      <path d="M8 30 Q14 20 20 30" fill={color} />
      <rect x="4" y="52" width="20" height="10" rx="1.5" fill="#A89050" />
      <rect x="6" y="53" width="16" height="4" rx="0.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

function PaletteSVG({ shades }: { shades: string[] }) {
  return (
    <svg width="70" height="54" viewBox="0 0 70 54">
      <rect x="1" y="1" width="68" height="52" rx="4" fill="#EDE5D5" stroke="#C8B06A" strokeWidth="0.5" />
      <rect x="3" y="3" width="64" height="22" rx="2.5" fill="white" opacity="0.7" />
      {shades.map((c, i) => <rect key={i} x={5+i*16} y={5} width="13" height="17" rx="1.5" fill={c} />)}
      <line x1="3" y1="27" x2="67" y2="27" stroke="#C8B06A" strokeWidth="0.4" opacity="0.6" />
      <rect x="3" y="28" width="64" height="22" rx="2.5" fill="white" opacity="0.5" />
      <rect x="5" y="30" width="60" height="18" rx="2" fill={shades[1]} opacity="0.35" />
    </svg>
  );
}

function CompactSVG({ color }: { color: string }) {
  return (
    <svg width="58" height="46" viewBox="0 0 58 46">
      <rect x="1" y="1" width="56" height="44" rx="5" fill="#EDE5D5" stroke="#C8B06A" strokeWidth="0.6" />
      <rect x="2" y="2" width="54" height="20" rx="4" fill="white" opacity="0.8" />
      <circle cx="29" cy="12" r="9" fill={color} opacity="0.8" />
      <circle cx="29" cy="12" r="5.5" fill={color} />
      <ellipse cx="25.5" cy="9.5" rx="2" ry="1.4" fill="white" opacity="0.35" />
      <rect x="2" y="24" width="54" height="18" rx="4" fill="#F0E8D8" opacity="0.9" />
    </svg>
  );
}

function PerfumeSVG() {
  return (
    <svg width="40" height="64" viewBox="0 0 40 64">
      <rect x="8" y="18" width="24" height="42" rx="3.5" fill="rgba(240,232,204,0.4)" stroke="#C8B06A" strokeWidth="0.7" />
      <rect x="10" y="20" width="20" height="38" rx="3" fill="rgba(240,232,204,0.2)" />
      <rect x="12" y="13" width="16" height="7" rx="1.5" fill="#C8B06A" opacity="0.75" />
      <rect x="16" y="9" width="8" height="5" rx="1" fill="#A89050" />
      <circle cx="20" cy="8" r="2.5" fill="#C8B06A" />
      <rect x="12" y="28" width="16" height="18" rx="2" fill="rgba(11,60,38,0.06)" />
      <text x="20" y="40" textAnchor="middle" fill="#0B3C26" fontSize="5" fontFamily="serif" opacity="0.5" letterSpacing="0.5">THE MUSE</text>
    </svg>
  );
}
