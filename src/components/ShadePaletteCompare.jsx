import { useState } from "react";
import { X, GitCompare } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_LABELS = {
  lipstick: "Lipstick",
  eyeshadow: "Eyeshadow",
  mixed: "Mixed",
};

export default function ShadePaletteCompare({ palettes, onClose }) {
  const [leftId, setLeftId] = useState(palettes[0]?.id || "");
  const [rightId, setRightId] = useState(palettes[1]?.id || "");

  const left = palettes.find(p => p.id === leftId);
  const right = palettes.find(p => p.id === rightId);

  const maxShades = Math.max(
    (left?.shades || []).length,
    (right?.shades || []).length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <GitCompare size={18} color="var(--color-accent-gold)" strokeWidth={1.5} />
            <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
              Compare Palettes
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
          </button>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[0.5rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-1.5 block">
              Palette A
            </label>
            <select
              value={leftId}
              onChange={e => setLeftId(e.target.value)}
              className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none"
            >
              {palettes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[0.5rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-1.5 block">
              Palette B
            </label>
            <select
              value={rightId}
              onChange={e => setRightId(e.target.value)}
              className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none"
            >
              {palettes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* LEFT PALETTE */}
          <PaletteColumn palette={left} maxShades={maxShades} side="A" />

          {/* RIGHT PALETTE */}
          <PaletteColumn palette={right} maxShades={maxShades} side="B" />
        </div>

        {/* Shade count comparison summary */}
        {left && right && (
          <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3">
            <p className="text-[0.5625rem] tracking-[0.18em] uppercase text-primary-45 font-light text-center">
              {(left.shades || []).length} shades
              <span className="text-primary-25 mx-2">vs</span>
              {(right.shades || []).length} shades
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function PaletteColumn({ palette, maxShades, side }) {
  if (!palette) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center py-12">
        <p className="text-[0.625rem] text-primary-30 font-light italic">Select a palette</p>
      </div>
    );
  }

  const shades = palette.shades || [];
  const labelColor = side === "A" ? "var(--color-accent-gold)" : "#BC8F8F";

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
      {/* Label badge */}
      <div className="px-3 py-2 border-b border-[var(--color-border)] flex items-center justify-between">
        <span
          className="text-[0.5rem] tracking-[0.22em] uppercase font-light px-2 py-0.5 rounded-full"
          style={{ color: labelColor, border: `1px solid ${labelColor}40`, background: `${labelColor}10` }}
        >
          {side}
        </span>
        <span className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-40 font-light">
          {CATEGORY_LABELS[palette.category] || "Mixed"}
        </span>
      </div>

      {/* Palette name */}
      <div className="px-3 py-2.5">
        <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light leading-tight">
          {palette.name}
        </p>
      </div>

      {/* Shade swatches stacked */}
      <div className="flex flex-col">
        {Array.from({ length: maxShades }).map((_, i) => {
          const shade = shades[i];
          if (!shade) {
            return <div key={i} className="h-9 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg)]/40" />;
          }
          return (
            <div
              key={i}
              className="h-9 border-t border-[var(--color-border-subtle)] flex items-center px-3"
              style={{ background: shade.hex }}
            >
              <span
                className="text-[0.5rem] font-light tracking-wide truncate"
                style={{ color: isLightColor(shade.hex) ? "#1A2E2A" : "#FFFFFF" }}
              >
                {shade.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Determine if a hex color is light (for text contrast)
function isLightColor(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const c = hex.length === 4
    ? hex.slice(1).split("").map(ch => parseInt(ch + ch, 16))
    : [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  const [r, g, b] = c;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}