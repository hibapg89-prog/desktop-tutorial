"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Shelf   = "vanity" | "wishlist";
export type ViewMode = "drawer" | "grid" | "list";
export type Sticker  = "sparkle" | "watercolor" | "botanical";

export interface VanityItem {
  id: string;
  type: "lipstick" | "palette" | "compact" | "brush" | "perfume" | "serum" | "moisturizer" | "toner";
  name: string;
  brand: string;
  hex?: string;
  shades?: string[];
  shelf: Shelf;
  sticker?: Sticker | null;
  featured?: boolean; // Swan Shimmer
  category?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const INITIAL_VANITY_ITEMS: VanityItem[] = [
  { id: "1",  type: "lipstick",    name: "Rouge Allure 99",  brand: "Chanel",      hex: "#C47070", shelf: "vanity",   featured: true },
  { id: "2",  type: "lipstick",    name: "Velvet Red",       brand: "MAC",         hex: "#8B3A3A", shelf: "vanity" },
  { id: "3",  type: "lipstick",    name: "Peach Glam",       brand: "NARS",        hex: "#D4956A", shelf: "vanity" },
  { id: "4",  type: "lipstick",    name: "Mauve Dream",      brand: "Dior",        hex: "#9E6060", shelf: "vanity",   sticker: "botanical" },
  { id: "5",  type: "palette",     name: "Nude Shimmer",     brand: "Too Faced",   shades: ["#E8C9A0","#C4A882","#8B6B4A","#3C2820"], shelf: "vanity", sticker: "sparkle" },
  { id: "6",  type: "palette",     name: "Rose Gold",        brand: "Urban Decay", shades: ["#F0D4C0","#D4A890","#B07860","#6C3020"], shelf: "vanity" },
  { id: "7",  type: "compact",     name: "Shimmer HL",       brand: "BECCA",       hex: "#F0D89A", shelf: "vanity" },
  { id: "8",  type: "perfume",     name: "Lumière Noire",    brand: "YSL",                         shelf: "vanity",   featured: true },
  { id: "9",  type: "serum",       name: "Vitamin C Sérum",  brand: "SkinCeuticals",               shelf: "vanity",   sticker: "watercolor" },
  { id: "10", type: "moisturizer", name: "Crème de la Nuit", brand: "Sisley",                      shelf: "wishlist" },
  { id: "11", type: "lipstick",    name: "Berry Wine",       brand: "YSL",         hex: "#7A3F3F", shelf: "wishlist" },
  { id: "12", type: "palette",     name: "Soft Glam",        brand: "ABH",         shades: ["#F5E8D8","#DEC4A8","#A07858","#5A3828"], shelf: "wishlist" },
  { id: "13", type: "perfume",     name: "Mon Précieux",     brand: "Guerlain",                    shelf: "wishlist", featured: true },
  { id: "14", type: "serum",       name: "Hyaluronic Booster", brand: "Drunk Elephant",            shelf: "wishlist" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
  items: VanityItem[];
  onReorder: (items: VanityItem[]) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VanityScreen({ onBack, items, onReorder }: Props) {
  const [shelf,        setShelf]        = useState<Shelf>("vanity");
  const [view,         setView]         = useState<ViewMode>("drawer");
  const [selected,     setSelected]     = useState<string | null>(null);
  const [stickerOpen,  setStickerOpen]  = useState<string | null>(null);
  const [dragging,     setDragging]     = useState<string | null>(null);

  const visible  = items.filter(x => x.shelf === shelf);
  const sel      = items.find(x => x.id === selected);

  // Move between shelves
  const moveToOtherShelf = (id: string) => {
    onReorder(items.map(x =>
      x.id === id ? { ...x, shelf: x.shelf === "vanity" ? "wishlist" : "vanity" } : x
    ));
  };

  // Apply or remove a sticker
  const applySticker = (id: string, sticker: Sticker | null) => {
    onReorder(items.map(x => x.id === id ? { ...x, sticker } : x));
    setStickerOpen(null);
  };

  // Drag within shelf
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

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative"
      style={{
        background: "#F8F5F0",
        backgroundImage: `
          repeating-linear-gradient(105deg, transparent, transparent 60px, rgba(180,165,145,0.05) 60px, rgba(180,165,145,0.05) 61px),
          repeating-linear-gradient(165deg, transparent, transparent 80px, rgba(200,185,165,0.04) 80px, rgba(200,185,165,0.04) 81px),
          linear-gradient(160deg, #F5F0EA, #EDE5D5, #F0EBE0)
        `,
      }}>

      {/* Marble vein overlay */}
      <MarbleVeins />

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-3 flex-shrink-0 relative z-10"
        style={{ background: "rgba(245,240,234,0.9)", backdropFilter: "blur(14px)" }}>

        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack}
            className="font-sans text-[9px] tracking-[0.22em] uppercase opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: "#0B3C26" }}>
            ← Back
          </button>
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>
            My Collection
          </p>
          <button onClick={() => setStickerOpen(selected)}
            className="font-sans text-[8px] tracking-[0.18em] uppercase opacity-40 hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: "#0B3C26", display: selected ? "block" : "none" }}>
            ✦ Decorate
          </button>
        </div>

        {/* Shelf tabs */}
        <div className="flex gap-1 mb-3">
          {(["vanity", "wishlist"] as Shelf[]).map(s => (
            <button key={s} onClick={() => { setShelf(s); setSelected(null); }}
              className="flex-1 py-2 rounded-xl font-sans text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-all duration-300"
              style={{
                background: shelf === s ? "#0B3C26" : "rgba(11,60,38,0.06)",
                color:      shelf === s ? "#F0E8D0" : "#0B3C26",
                border:     shelf === s ? "none" : "1px solid rgba(11,60,38,0.12)",
              }}>
              {s === "vanity" ? "✦ My Vanity" : "◇ Wishlist"}
              <span className="ml-1.5 opacity-50">
                {items.filter(x => x.shelf === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex justify-center gap-1">
          {([
            { mode: "drawer" as ViewMode, icon: "⊡", label: "Drawer" },
            { mode: "grid"   as ViewMode, icon: "⊞", label: "Grid"   },
            { mode: "list"   as ViewMode, icon: "≡",  label: "List"   },
          ]).map(({ mode, icon, label }) => (
            <button key={mode} onClick={() => setView(mode)}
              title={label}
              className="px-3 py-1 rounded-full font-sans text-[10px] cursor-pointer transition-all duration-200"
              style={{
                background: view === mode ? "rgba(200,176,106,0.2)" : "transparent",
                color:      view === mode ? "#C8B06A"               : "rgba(11,60,38,0.35)",
                border:     view === mode ? "1px solid rgba(200,176,106,0.4)" : "1px solid transparent",
              }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto relative z-10 pb-28">

        {view === "drawer" && (
          <DrawerView
            items={visible}
            selected={selected}
            dragging={dragging}
            onSelect={id => setSelected(selected === id ? null : id)}
            onDragStart={setDragging}
            onDragEnd={() => setDragging(null)}
            onDragOver={handleDragOver}
          />
        )}

        {view === "grid" && (
          <GridView
            items={visible}
            selected={selected}
            onSelect={id => setSelected(selected === id ? null : id)}
          />
        )}

        {view === "list" && (
          <ListView
            items={visible}
            selected={selected}
            onSelect={id => setSelected(selected === id ? null : id)}
          />
        )}

        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <p className="font-serif text-2xl text-[#1C1C1C] opacity-20 mb-2">
              {shelf === "vanity" ? "Your vanity awaits" : "Start dreaming"}
            </p>
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase opacity-20" style={{ color: "#0B3C26" }}>
              {shelf === "vanity" ? "Scan or add products to begin" : "Save products you desire here"}
            </p>
          </div>
        )}
      </div>

      {/* ── Selected item card ── */}
      {sel && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-2"
          style={{ background: "rgba(245,240,234,0.96)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
          <div className="flex items-center gap-3 max-w-sm mx-auto">

            {/* Swan Shimmer indicator */}
            {sel.featured && (
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0B3C26, #1A5C3A)",
                    boxShadow: "0 0 18px rgba(200,176,106,0.45), 0 0 6px rgba(200,176,106,0.3)",
                    animation: "swanPulse 2.5s ease-in-out infinite",
                  }}>
                  <span className="text-[#E8D898] text-sm">✦</span>
                </div>
              </div>
            )}

            {!sel.featured && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A)" }}>
                <span className="text-white text-[11px] font-sans font-light">
                  {sel.brand?.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm text-[#1C1C1C] truncate">{sel.name}</p>
              <p className="font-sans text-[10px] opacity-50 font-light" style={{ color: "#0B3C26" }}>{sel.brand}</p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Move to other shelf */}
              <button onClick={() => moveToOtherShelf(sel.id)}
                className="px-2.5 py-1.5 rounded-full font-sans text-[8px] tracking-[0.1em] uppercase cursor-pointer transition-all"
                style={{ border: "1px solid rgba(11,60,38,0.2)", color: "#0B3C26" }}>
                {shelf === "vanity" ? "→ Wish" : "→ Own it"}
              </button>
              {/* Sticker */}
              <button onClick={() => setStickerOpen(sel.id)}
                className="px-2.5 py-1.5 rounded-full font-sans text-[8px] tracking-[0.1em] uppercase cursor-pointer transition-all"
                style={{ border: "1px solid rgba(200,176,106,0.3)", color: "#C8B06A" }}>
                ✦
              </button>
              {/* Shop */}
              <button className="px-3 py-1.5 rounded-full font-sans text-[8px] tracking-[0.1em] uppercase cursor-pointer"
                style={{ background: "#0B3C26", color: "#F0E8D0" }}>
                Shop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Editorial Sticker Picker ── */}
      {stickerOpen && (
        <StickerPicker
          currentSticker={items.find(x => x.id === stickerOpen)?.sticker ?? null}
          onApply={s => applySticker(stickerOpen, s)}
          onClose={() => setStickerOpen(null)}
        />
      )}

      <style>{`
        @keyframes swanPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(200,176,106,0.3); }
          50%       { box-shadow: 0 0 28px rgba(200,176,106,0.6), 0 0 8px rgba(200,176,106,0.4); }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── Drawer View (marble surface with SVG product illustrations) ──────────────

function DrawerView({ items, selected, dragging, onSelect, onDragStart, onDragEnd, onDragOver }: {
  items: VanityItem[];
  selected: string | null;
  dragging: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div className="mx-4 mt-2">
      {/* Marble rim top */}
      <div className="rounded-t-2xl" style={{
        height: "8px",
        background: "linear-gradient(180deg, rgba(210,196,176,0.9), rgba(190,176,156,0.8))",
        boxShadow: "0 -2px 8px rgba(80,60,30,0.08)",
      }} />

      {/* Surface */}
      <div className="pb-2" style={{
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
            <div key={item.id}
              draggable
              onDragStart={() => onDragStart(item.id)}
              onDragEnd={onDragEnd}
              onDragOver={e => onDragOver(e, item.id)}
              onClick={() => onSelect(item.id)}
              className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none relative"
              style={{
                opacity: dragging === item.id ? 0.3 : 1,
                transform: selected === item.id ? "translateY(-10px)" : "none",
                transition: "all 0.2s ease",
                filter: item.featured
                  ? "drop-shadow(0 6px 16px rgba(200,176,106,0.4))"
                  : "drop-shadow(0 4px 10px rgba(80,60,30,0.18))",
              }}>

              {/* Swan Shimmer ring on featured */}
              {item.featured && (
                <div className="absolute -inset-2 rounded-2xl pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse, rgba(200,176,106,0.18) 0%, transparent 70%)",
                    animation: "swanPulse 2.5s ease-in-out infinite",
                  }} />
              )}

              {/* Product SVG */}
              <div className="relative">
                {item.type === "lipstick"    && <LipstickSVG    color={item.hex!} />}
                {item.type === "palette"     && <PaletteSVG     shades={item.shades!} />}
                {item.type === "compact"     && <CompactSVG     color={item.hex!} />}
                {item.type === "brush"       && <BrushSVG />}
                {item.type === "perfume"     && <PerfumeSVG />}
                {item.type === "serum"       && <SerumSVG />}
                {item.type === "moisturizer" && <MoisturizerSVG />}
                {item.type === "toner"       && <TonerSVG />}

                {/* Editorial Sticker overlay */}
                {item.sticker === "sparkle"    && <SparkleSticker />}
                {item.sticker === "watercolor" && <WatercolorSticker />}
                {item.sticker === "botanical"  && <BotanicalSticker />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marble rim bottom */}
      <div className="rounded-b-2xl" style={{
        height: "12px",
        background: "linear-gradient(180deg, rgba(190,176,156,0.8), rgba(170,156,136,0.7))",
        boxShadow: "0 4px 12px rgba(80,60,30,0.14)",
      }} />

      <p className="text-center font-sans text-[7px] tracking-[0.3em] uppercase mt-3 opacity-20" style={{ color: "#0B3C26" }}>
        Drag to rearrange · Tap to inspect
      </p>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────────────

function GridView({ items, selected, onSelect }: {
  items: VanityItem[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-4 pt-4 grid grid-cols-3 gap-2.5">
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          className="rounded-2xl p-3 flex flex-col items-center gap-1.5 text-left relative overflow-hidden cursor-pointer transition-all duration-200"
          style={{
            background: selected === item.id ? "rgba(11,60,38,0.06)" : "rgba(245,240,232,0.8)",
            border: selected === item.id ? "1px solid rgba(200,176,106,0.5)" : "1px solid rgba(200,176,106,0.12)",
            boxShadow: item.featured ? "0 0 18px rgba(200,176,106,0.25)" : "0 2px 8px rgba(80,60,30,0.06)",
          }}>

          {/* Swan Shimmer slide */}
          {item.featured && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(105deg, transparent 30%, rgba(200,176,106,0.12) 50%, transparent 70%)",
                animation: "shimmerSlide 2.5s ease-in-out infinite",
              }} />
            </div>
          )}

          {/* Sticker badge */}
          {item.sticker && (
            <div className="absolute top-1.5 right-1.5">
              {item.sticker === "sparkle"    && <span className="text-[10px]">✦</span>}
              {item.sticker === "watercolor" && <span className="text-[10px]">◇</span>}
              {item.sticker === "botanical"  && <span className="text-[10px]">🌿</span>}
            </div>
          )}

          {/* Mini color swatch / icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: item.hex ? `${item.hex}30` : "rgba(200,176,106,0.12)" }}>
            {item.hex && <div className="w-5 h-5 rounded-full" style={{ background: item.hex }} />}
            {item.shades && (
              <div className="flex gap-0.5">
                {item.shades.slice(0, 3).map((s, i) => (
                  <div key={i} className="w-1.5 h-5 rounded-sm" style={{ background: s }} />
                ))}
              </div>
            )}
            {!item.hex && !item.shades && (
              <span className="text-[#C8B06A] text-sm">◈</span>
            )}
          </div>

          <p className="font-serif text-[10px] text-[#1C1C1C] text-center leading-tight line-clamp-2">{item.name}</p>
          <p className="font-sans text-[8px] opacity-40 tracking-wide" style={{ color: "#0B3C26" }}>{item.brand}</p>
        </button>
      ))}
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ items, selected, onSelect }: {
  items: VanityItem[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="px-4 pt-4 flex flex-col gap-2">
      {items.map(item => (
        <button key={item.id} onClick={() => onSelect(item.id)}
          className="rounded-xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer transition-all duration-200 relative overflow-hidden"
          style={{
            background: selected === item.id ? "rgba(11,60,38,0.06)" : "rgba(245,240,232,0.8)",
            border: selected === item.id ? "1px solid rgba(200,176,106,0.4)" : "1px solid rgba(200,176,106,0.1)",
            boxShadow: item.featured ? "0 0 14px rgba(200,176,106,0.2)" : "0 1px 4px rgba(80,60,30,0.05)",
          }}>

          {/* Swan Shimmer slide on featured */}
          {item.featured && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(105deg, transparent 30%, rgba(200,176,106,0.1) 50%, transparent 70%)",
                animation: "shimmerSlide 3s ease-in-out infinite",
              }} />
            </div>
          )}

          {/* Color dot */}
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center relative z-10"
            style={{ background: item.hex ? `${item.hex}25` : "rgba(200,176,106,0.12)" }}>
            {item.hex   && <div className="w-4 h-4 rounded-full" style={{ background: item.hex }} />}
            {!item.hex  && <span className="text-[#C8B06A] text-xs">◈</span>}
          </div>

          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-1.5">
              <p className="font-serif text-sm text-[#1C1C1C] truncate">{item.name}</p>
              {item.sticker === "sparkle"    && <span className="text-[9px] opacity-60">✦</span>}
              {item.sticker === "watercolor" && <span className="text-[9px] opacity-60">◇</span>}
              {item.sticker === "botanical"  && <span className="text-[9px] opacity-60">🌿</span>}
            </div>
            <p className="font-sans text-[9px] font-light opacity-40 tracking-wide" style={{ color: "#0B3C26" }}>{item.brand}</p>
          </div>

          {item.featured && (
            <div className="flex-shrink-0 relative z-10"
              style={{ animation: "swanPulse 2.5s ease-in-out infinite" }}>
              <span className="text-[10px]" style={{ color: "#C8B06A" }}>✦</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Sticker Picker ───────────────────────────────────────────────────────────

const STICKERS: { id: Sticker; label: string; preview: string; sub: string }[] = [
  { id: "sparkle",    label: "Silver Sparkle",  preview: "✦",  sub: "Hand-drawn outline in silver" },
  { id: "watercolor", label: "Watercolor",       preview: "◇",  sub: "Soft shimmer accent" },
  { id: "botanical",  label: "Botanical",        preview: "🌿", sub: "Minimal line art flourish" },
];

function StickerPicker({ currentSticker, onApply, onClose }: {
  currentSticker: Sticker | null;
  onApply: (s: Sticker | null) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full px-4 pb-8 pt-4" onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(245,240,232,0.97)",
          backdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(200,176,106,0.2)",
          borderRadius: "24px 24px 0 0",
        }}>

        {/* Handle */}
        <div className="w-8 h-0.5 rounded-full mx-auto mb-5" style={{ background: "rgba(11,60,38,0.15)" }} />

        <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-center mb-1" style={{ color: "#C8B06A" }}>
          Editorial Decoration
        </p>
        <p className="font-serif text-base text-[#1C1C1C] text-center mb-5">
          Choose a distinction
        </p>

        <div className="flex gap-3 mb-4">
          {STICKERS.map(s => (
            <button key={s.id} onClick={() => onApply(s.id)}
              className="flex-1 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
              style={{
                background: currentSticker === s.id ? "rgba(11,60,38,0.08)" : "rgba(200,176,106,0.06)",
                border: currentSticker === s.id ? "1px solid rgba(200,176,106,0.5)" : "1px solid rgba(200,176,106,0.15)",
              }}>
              <span className="text-2xl">{s.preview}</span>
              <p className="font-sans text-[8px] tracking-[0.1em] uppercase text-center" style={{ color: "#0B3C26" }}>
                {s.label}
              </p>
              <p className="font-sans text-[7px] text-center opacity-40" style={{ color: "#0B3C26" }}>
                {s.sub}
              </p>
            </button>
          ))}
        </div>

        {currentSticker && (
          <button onClick={() => onApply(null)}
            className="w-full py-2.5 rounded-xl font-sans text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-all"
            style={{ border: "1px solid rgba(11,60,38,0.12)", color: "rgba(11,60,38,0.4)" }}>
            Remove decoration
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SVG Product Illustrations ────────────────────────────────────────────────

function LipstickSVG({ color }: { color: string }) {
  return (
    <svg width="26" height="62" viewBox="0 0 26 62">
      <rect x="5" y="28" width="16" height="30" rx="1.5" fill="url(#lipGold)" />
      <rect x="7" y="16" width="12" height="16" fill={color} />
      <path d="M7 16 Q13 6 19 16" fill={color} />
      <rect x="5" y="28" width="16" height="4" rx="0.5" fill="#C8B06A" />
      <rect x="4" y="54" width="18" height="6" rx="1.5" fill="#A89050" />
      <rect x="7" y="30" width="4" height="20" rx="2" fill="rgba(255,255,255,0.18)" />
      <defs>
        <linearGradient id="lipGold" x1="5" y1="0" x2="21" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4C07A" />
          <stop offset="50%"  stopColor="#E8D898" />
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
      <rect x="24" y="22" width="8" height="2" rx="1" fill="#C8B06A" opacity="0.4" />
    </svg>
  );
}

function BrushSVG() {
  return (
    <svg width="16" height="72" viewBox="0 0 16 72">
      <rect x="5" y="0" width="6" height="48" rx="1" fill="url(#bGold)" />
      <rect x="4" y="44" width="8" height="6" rx="0.5" fill="#C8B06A" />
      <ellipse cx="8" cy="62" rx="5" ry="12" fill="#8A7A5A" opacity="0.7" />
      <ellipse cx="8" cy="56" rx="3.5" ry="4" fill="#9A8A6A" opacity="0.5" />
      <defs>
        <linearGradient id="bGold" x1="5" y1="0" x2="11" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D0C080" />
          <stop offset="50%"  stopColor="#E8D898" />
          <stop offset="100%" stopColor="#A89050" />
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
      <rect x="9" y="20" width="5" height="28" rx="2.5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

function SerumSVG() {
  return (
    <svg width="22" height="68" viewBox="0 0 22 68">
      {/* Dropper top */}
      <rect x="8" y="0" width="6" height="12" rx="3" fill="#C8B06A" opacity="0.8" />
      <rect x="9" y="10" width="4" height="6" rx="1" fill="#A89050" />
      {/* Bottle */}
      <rect x="4" y="16" width="14" height="46" rx="5" fill="rgba(240,232,204,0.5)" stroke="#C8B06A" strokeWidth="0.6" />
      <rect x="6" y="18" width="10" height="42" rx="4" fill="rgba(240,248,240,0.3)" />
      {/* Label */}
      <rect x="6" y="28" width="10" height="18" rx="2" fill="rgba(11,60,38,0.06)" />
      <text x="11" y="40" textAnchor="middle" fill="#0B3C26" fontSize="3.5" fontFamily="serif" opacity="0.4" letterSpacing="0.3">SÉRUM</text>
      {/* Shine */}
      <rect x="5" y="18" width="3" height="36" rx="1.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

function MoisturizerSVG() {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40">
      {/* Jar base */}
      <rect x="2" y="14" width="52" height="24" rx="4" fill="rgba(240,232,204,0.5)" stroke="#C8B06A" strokeWidth="0.6" />
      {/* Lid */}
      <rect x="1" y="4" width="54" height="12" rx="5" fill="#EDE5D5" stroke="#C8B06A" strokeWidth="0.5" />
      <ellipse cx="28" cy="4" rx="27" ry="4" fill="#F0E8D8" />
      {/* Label area */}
      <rect x="6" y="18" width="44" height="14" rx="2" fill="rgba(11,60,38,0.04)" />
      <text x="28" y="28" textAnchor="middle" fill="#0B3C26" fontSize="4" fontFamily="serif" opacity="0.4" letterSpacing="0.3">CRÈME</text>
      {/* Shine on lid */}
      <rect x="4" y="5" width="12" height="8" rx="3" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function TonerSVG() {
  return (
    <svg width="28" height="72" viewBox="0 0 28 72">
      {/* Cap */}
      <rect x="8" y="0" width="12" height="10" rx="3" fill="#C8B06A" opacity="0.7" />
      {/* Bottle */}
      <rect x="3" y="10" width="22" height="56" rx="4" fill="rgba(200,220,240,0.3)" stroke="#C8B06A" strokeWidth="0.5" />
      <rect x="5" y="12" width="18" height="52" rx="3" fill="rgba(200,220,240,0.2)" />
      {/* Label */}
      <rect x="5" y="24" width="18" height="24" rx="2" fill="rgba(11,60,38,0.04)" />
      <text x="14" y="38" textAnchor="middle" fill="#0B3C26" fontSize="3.5" fontFamily="serif" opacity="0.4" letterSpacing="0.2">TONER</text>
      {/* Shine */}
      <rect x="4" y="12" width="4" height="46" rx="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

function BrushHolderSVG() {
  return (
    <svg width="52" height="80" viewBox="0 0 52 80">
      <ellipse cx="26" cy="72" rx="22" ry="6" fill="#C8B06A" opacity="0.3" />
      <rect x="4" y="30" width="44" height="44" rx="4" fill="url(#hGold)" />
      <ellipse cx="26" cy="30" rx="22" ry="6" fill="#E8D898" />
      <ellipse cx="26" cy="30" rx="18" ry="5" fill="rgba(255,255,255,0.4)" />
      {[10, 18, 26, 34, 42].map((x, i) => (
        <g key={i}>
          <rect x={x+1} y={i%2===0?4:10} width="3.5" height="28" rx="1"
            fill={["#C8B06A","#D4C07A","#A89050","#C8B06A","#E0C880"][i]} />
          <ellipse cx={x+2.75} cy={i%2===0?16:22} rx="3.5" ry={10-i}
            fill={["#8A7A5A","#6A5A3A","#9A8A6A","#7A6A4A","#8A7850"][i]} opacity="0.65" />
        </g>
      ))}
      <rect x="4" y="56" width="44" height="4" fill="#C8B06A" opacity="0.5" />
      <defs>
        <linearGradient id="hGold" x1="4" y1="30" x2="48" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E8DCC8" />
          <stop offset="100%" stopColor="#D0C0A0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Editorial Sticker SVG overlays ──────────────────────────────────────────

function SparkleSticker() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32"
      className="absolute -top-3 -right-3 pointer-events-none">
      {/* Central star */}
      <path d="M16 4 L17.2 13 L26 12 L18.8 18 L22 27 L16 21 L10 27 L13.2 18 L6 12 L14.8 13 Z"
        fill="none" stroke="rgba(200,190,160,0.9)" strokeWidth="0.8" />
      {/* Small dots */}
      <circle cx="8" cy="8" r="1" fill="rgba(200,190,160,0.6)" />
      <circle cx="24" cy="6" r="0.8" fill="rgba(200,190,160,0.5)" />
      <circle cx="26" cy="22" r="0.7" fill="rgba(200,190,160,0.4)" />
      {/* Fine lines */}
      <line x1="16" y1="1" x2="16" y2="5" stroke="rgba(200,190,160,0.5)" strokeWidth="0.6" />
      <line x1="28" y1="16" x2="24" y2="16" stroke="rgba(200,190,160,0.4)" strokeWidth="0.6" />
    </svg>
  );
}

function WatercolorSticker() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28"
      className="absolute -top-2 -right-2 pointer-events-none">
      {/* Soft watercolor blob */}
      <ellipse cx="14" cy="14" rx="11" ry="9"
        fill="rgba(188,143,143,0.18)" />
      <ellipse cx="16" cy="12" rx="7" ry="5"
        fill="rgba(188,143,143,0.12)" />
      <ellipse cx="11" cy="16" rx="5" ry="4"
        fill="rgba(139,168,139,0.12)" />
      {/* Shimmer accent dot */}
      <circle cx="18" cy="10" r="1.5" fill="rgba(200,176,106,0.25)" />
    </svg>
  );
}

function BotanicalSticker() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30"
      className="absolute -bottom-2 -right-2 pointer-events-none">
      {/* Stem */}
      <path d="M8 28 Q12 20 15 14" stroke="rgba(80,120,80,0.5)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M15 14 Q20 10 22 14 Q18 16 15 14" fill="rgba(80,120,80,0.18)" stroke="rgba(80,120,80,0.35)" strokeWidth="0.6" />
      <path d="M12 19 Q8 14 12 12 Q14 16 12 19" fill="rgba(80,120,80,0.15)" stroke="rgba(80,120,80,0.3)" strokeWidth="0.6" />
      {/* Small flower */}
      <circle cx="15" cy="13" r="2" fill="rgba(188,143,143,0.25)" stroke="rgba(188,143,143,0.4)" strokeWidth="0.6" />
      <circle cx="15" cy="13" r="0.8" fill="rgba(200,176,106,0.4)" />
    </svg>
  );
}

// ─── Marble veins background ──────────────────────────────────────────────────

function MarbleVeins() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <path d="M20 0 Q60 80 40 200 Q20 320 80 400 Q140 480 100 600 Q60 720 120 800"
          stroke="#8A7A6A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M80 0 Q110 120 90 250 Q70 380 130 460 Q190 540 160 680 Q130 780 180 800"
          stroke="#9A8A78" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M200 0 Q160 100 180 220 Q200 340 160 440 Q120 540 170 680"
          stroke="#8A7A6A" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M300 100 Q260 220 290 360 Q320 500 280 620"
          stroke="#A09080" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
