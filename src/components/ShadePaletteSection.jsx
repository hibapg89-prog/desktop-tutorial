import { useState, useEffect } from "react";
import { Plus, X, Trash2, Palette, Check, Edit2, GripVertical, ArrowDownAZ, ArrowLeftRight, Wand2, Pipette, LayoutTemplate, Share2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import ShadePaletteCompare from "@/components/ShadePaletteCompare";
import SmartMatchSheet from "@/components/palettes/SmartMatchSheet";
import ColorSamplerSheet from "@/components/palettes/ColorSamplerSheet";
import PaletteTemplates from "@/components/palettes/PaletteTemplates";
import PaletteExportShare from "@/components/palettes/PaletteExportShare";

const CATEGORY_LABELS = {
  lipstick: "Lipstick",
  eyeshadow: "Eyeshadow",
  mixed: "Mixed",
};

const PRESET_LIPSTICKS = [
  { name: "Pillow Talk", hex: "#C9806E" },
  { name: "Velvet Cherry", hex: "#8B2C3A" },
  { name: "Nude Rose", hex: "#C08A82" },
  { name: "Mauve Whisper", hex: "#9B6A7A" },
  { name: "Coral Bloom", hex: "#E26D5C" },
  { name: "Plum Noir", hex: "#5C2A3B" },
];

const PRESET_EYESHADOWS = [
  { name: "Champagne Shimmer", hex: "#E8D4A0" },
  { name: "Bronze Aura", hex: "#8B6F47" },
  { name: "Rose Gold", hex: "#C08A82" },
  { name: "Emerald Smoke", hex: "#1F4A3A" },
  { name: "Dusty Lilac", hex: "#A890A0" },
  { name: "Midnight Copper", hex: "#5C3A2E" },
];

export default function ShadePaletteSection({ isAtelier = true }) {
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPalette, setEditingPalette] = useState(null);
  const [paletteName, setPaletteName] = useState("");
  const [paletteCategory, setPaletteCategory] = useState("mixed");
  const [paletteNotes, setPaletteNotes] = useState("");
  const [shades, setShades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortByCategory, setSortByCategory] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [colorSamplerOpen, setColorSamplerOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [exportPalette, setExportPalette] = useState(null);
  const [paletteOrder, setPaletteOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem("muse_palette_order") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    loadPalettes();
  }, []);

  const loadPalettes = async () => {
    try {
      const list = await base44.entities.ShadePalette.list("-created_date", 50);
      setPalettes(Array.isArray(list) ? list : []);
    } catch {
      setPalettes([]);
    }
    setLoading(false);
  };

  const openNewPalette = () => {
    setEditingPalette(null);
    setPaletteName("");
    setPaletteCategory("mixed");
    setPaletteNotes("");
    setShades([]);
    setEditorOpen(true);
  };

  const openEditPalette = (palette) => {
    setEditingPalette(palette);
    setPaletteName(palette.name);
    setPaletteCategory(palette.category || "mixed");
    setPaletteNotes(palette.notes || "");
    setShades(Array.isArray(palette.shades) ? palette.shades : []);
    setEditorOpen(true);
  };

  const addShade = (preset) => {
    setShades(prev => [...prev, {
      name: preset.name,
      hex: preset.hex,
      category: paletteCategory === "mixed" ? "lipstick" : paletteCategory,
    }]);
  };

  const addCustomShade = () => {
    setShades(prev => [...prev, {
      name: `Shade ${prev.length + 1}`,
      hex: "#C08A82",
      category: paletteCategory === "mixed" ? "lipstick" : paletteCategory,
    }]);
  };

  const updateShade = (index, field, value) => {
    setShades(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeShade = (index) => {
    setShades(prev => prev.filter((_, i) => i !== index));
  };

  const savePalette = async () => {
    if (!paletteName.trim() || shades.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        name: paletteName.trim(),
        category: paletteCategory,
        notes: paletteNotes.trim(),
        shades: shades.filter(s => s.name && s.hex),
      };
      if (editingPalette) {
        await base44.entities.ShadePalette.update(editingPalette.id, payload);
        setPalettes(prev => prev.map(p => p.id === editingPalette.id ? { ...p, ...payload } : p));
      } else {
        const created = await base44.entities.ShadePalette.create(payload);
        setPalettes(prev => [created, ...prev]);
      }
      setEditorOpen(false);
    } catch (e) {
      console.error("[ShadePalette] save failed:", e);
    }
    setSaving(false);
  };

  const deletePalette = async (id) => {
    try {
      await base44.entities.ShadePalette.delete(id);
      setPalettes(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("[ShadePalette] delete failed:", e);
    }
    setConfirmDelete(null);
  };

  const addShadeFromTool = (shade) => {
    setShades(prev => [...prev, shade]);
  };

  const loadTemplate = (template) => {
    setEditingPalette(null);
    setPaletteName(template.name);
    setPaletteCategory(template.category || "mixed");
    setPaletteNotes(template.notes || "");
    setShades(template.shades || []);
    setEditorOpen(true);
  };

  const saveAsTemplate = async () => {
    if (shades.length === 0) return;
    try {
      await base44.entities.PaletteTemplate.create({
        name: paletteName.trim() || "Untitled Template",
        season_tag: paletteNotes.trim(),
        shades: shades.filter(s => s.name && s.hex),
        is_starter: false,
      });
      setEditorOpen(false);
    } catch (e) {
      console.error("[ShadePalette] save template failed:", e);
    }
  };

  const presets = paletteCategory === "eyeshadow" ? PRESET_EYESHADOWS
    : paletteCategory === "lipstick" ? PRESET_LIPSTICKS
    : [...PRESET_LIPSTICKS.slice(0, 3), ...PRESET_EYESHADOWS.slice(0, 3)];

  const orderedPalettes = sortByCategory
    ? [...palettes].sort((a, b) => {
        const catOrder = { lipstick: 0, eyeshadow: 1, mixed: 2 };
        return (catOrder[a.category] ?? 3) - (catOrder[b.category] ?? 3) || (a.name || "").localeCompare(b.name || "");
      })
    : (() => {
        const orderMap = new Map(paletteOrder.map((id, i) => [id, i]));
        return [...palettes].sort((a, b) => {
          const ai = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
          const bi = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
          if (ai === Infinity && bi === Infinity) return 0;
          return ai - bi;
        });
      })();

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...orderedPalettes];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const newOrder = reordered.map(p => p.id);
    setPaletteOrder(newOrder);
    try { localStorage.setItem("muse_palette_order", JSON.stringify(newOrder)); } catch {}
  };

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
          Shade Palettes
        </h2>
        {isAtelier && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTemplatesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light text-primary-50 bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-gold)] transition-colors"
            >
              <LayoutTemplate size={10} strokeWidth={2} />
              Templates
            </button>
            <button
              onClick={() => setSortByCategory(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light transition-all ${
                sortByCategory
                  ? "bg-[var(--color-accent-gold)] text-white"
                  : "bg-[var(--color-bg-surface)] text-primary-50 border border-[var(--color-border)]"
              }`}
            >
              <ArrowDownAZ size={10} strokeWidth={2} />
              Sort
            </button>
            {palettes.length >= 2 && (
              <button
                onClick={() => setCompareOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light text-primary-50 bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent-gold)] transition-colors"
              >
                <ArrowLeftRight size={10} strokeWidth={2} />
                Compare
              </button>
            )}
            <button
              onClick={openNewPalette}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light text-[#FDF5E6] bg-[#043927]"
            >
              <Plus size={10} strokeWidth={2} />
              New Palette
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="swan-float"><SwanLogo size={32} color="var(--color-accent-gold)" /></div>
        </div>
      ) : palettes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-5 py-8 text-center bg-[var(--color-bg-surface)]">
          <Palette size={24} color="var(--color-accent-gold)" className="mx-auto mb-3 opacity-60" />
          <p className="text-[0.6875rem] text-primary-40 font-light italic">No palettes saved yet.</p>
          {isAtelier && (
            <p className="text-[0.5625rem] text-primary-30 font-light mt-1 tracking-wide">
              Create a palette to store your favourite shade combinations.
            </p>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="palettes">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {orderedPalettes.map((palette, index) => (
                  <Draggable
                    key={palette.id}
                    draggableId={palette.id}
                    index={index}
                    isDragDisabled={sortByCategory || !isAtelier}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{ ...provided.draggableProps.style }}
                        className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden ${snapshot.isDragging ? "shadow-lg ring-1 ring-[var(--color-accent-gold)]/30" : ""}`}
                      >
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isAtelier && !sortByCategory && (
                              <span {...provided.dragHandleProps} className="flex-shrink-0 cursor-grab active:cursor-grabbing text-primary-30 touch-none">
                                <GripVertical size={14} strokeWidth={1.5} />
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.8125rem] text-[var(--color-text-primary)] font-light truncate">
                                {palette.name}
                              </p>
                              <p className="text-[0.5rem] tracking-[0.18em] uppercase text-primary-40 font-light mt-0.5">
                                {CATEGORY_LABELS[palette.category] || "Mixed"} · {(palette.shades || []).length} shades
                              </p>
                            </div>
                          </div>
                          {isAtelier && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setExportPalette(palette)}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-primary-30 hover:bg-[var(--color-bg-elevated)] transition-colors"
                                aria-label="Export or share palette"
                              >
                                <Share2 size={11} strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => openEditPalette(palette)}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-primary-40 hover:bg-[var(--color-bg-elevated)] transition-colors"
                                aria-label="Edit palette"
                              >
                                <Edit2 size={11} strokeWidth={1.5} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(palette.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-full text-primary-30 hover:bg-red-50 hover:text-red-400 transition-colors"
                                aria-label="Delete palette"
                              >
                                <Trash2 size={11} strokeWidth={1.5} />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Shade swatches */}
                        <div className="flex h-12 border-t border-[var(--color-border)]">
                          {(palette.shades || []).map((shade, i) => (
                            <div
                              key={i}
                              className="flex-1 relative group"
                              style={{ background: shade.hex }}
                              title={shade.name}
                            >
                              <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-[0.4375rem] text-white font-light tracking-wide px-1 py-0.5 rounded bg-black/30 truncate max-w-full">
                                  {shade.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Inspiration notes */}
                        {palette.notes && (
                          <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/50">
                            <p className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-35 font-light mb-1">
                              Inspiration
                            </p>
                            <p className="text-[0.6875rem] text-primary-60 font-light italic leading-relaxed">
                              {palette.notes}
                            </p>
                          </div>
                        )}

                        {/* Delete confirmation */}
                        <AnimatePresence>
                          {confirmDelete === palette.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-red-50/60 border-t border-red-100"
                            >
                              <div className="px-4 py-3 flex items-center justify-between">
                                <span className="text-[0.625rem] text-primary-60 font-light">
                                  Delete this palette?
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="text-[0.5625rem] px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] font-light"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => deletePalette(palette.id)}
                                    className="text-[0.5625rem] px-3 py-1.5 rounded-full bg-red-500 text-white font-light"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* ── PALETTE EDITOR ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {editorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end"
            onClick={() => setEditorOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
                  {editingPalette ? "Edit Palette" : "New Palette"}
                </h3>
                <button onClick={() => setEditorOpen(false)} aria-label="Close">
                  <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
                </button>
              </div>

              {/* Name input */}
              <div className="mb-4">
                <label className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-2 block">
                  Palette Name
                </label>
                <input
                  value={paletteName}
                  onChange={e => setPaletteName(e.target.value)}
                  placeholder="e.g. Evening Glam, Everyday Nudes…"
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30"
                  autoFocus
                />
              </div>

              {/* Category selector */}
              <div className="mb-5">
                <label className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-2 block">
                  Category
                </label>
                <div className="flex gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setPaletteCategory(key)}
                      className={`flex-1 py-2.5 rounded-xl text-[0.5625rem] tracking-[0.15em] uppercase font-light transition-all ${
                        paletteCategory === key
                          ? "bg-[#043927] text-[#FDF5E6]"
                          : "bg-[var(--color-bg-surface)] text-primary-50 border border-[var(--color-border)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspiration notes */}
              <div className="mb-5">
                <label className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-2 block">
                  Inspiration Notes
                </label>
                <textarea
                  value={paletteNotes}
                  onChange={e => setPaletteNotes(e.target.value)}
                  placeholder="Event, mood, or season that inspired this combination…"
                  rows={3}
                  className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 resize-none"
                />
              </div>

              {/* Shade list */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light">
                    Shades ({shades.length})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSmartMatchOpen(true)}
                      className="flex items-center gap-1 text-[0.5625rem] tracking-[0.12em] uppercase text-[var(--color-accent-gold)] font-light"
                    >
                      <Wand2 size={10} strokeWidth={2} />
                      Smart Match
                    </button>
                    <button
                      onClick={() => setColorSamplerOpen(true)}
                      className="flex items-center gap-1 text-[0.5625rem] tracking-[0.12em] uppercase text-[var(--color-accent-gold)] font-light"
                    >
                      <Pipette size={10} strokeWidth={2} />
                      Sample
                    </button>
                    <button
                      onClick={addCustomShade}
                      className="flex items-center gap-1 text-[0.5625rem] tracking-[0.12em] uppercase text-[var(--color-accent-gold)] font-light"
                    >
                      <Plus size={10} strokeWidth={2} />
                      Custom
                    </button>
                  </div>
                </div>

                {/* Preset swatches */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {presets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => addShade(preset)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:border-[var(--color-accent-gold)] transition-colors"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30"
                        style={{ background: preset.hex }}
                      />
                      <span className="text-[0.5rem] text-primary-60 font-light tracking-wide">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Shade rows */}
                {shades.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--color-border)] py-6 text-center bg-[var(--color-bg-surface)]">
                    <p className="text-[0.625rem] text-primary-40 font-light italic">
                      Tap a preset above or add a custom shade.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shades.map((shade, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-2"
                      >
                        <input
                          type="color"
                          value={shade.hex}
                          onChange={e => updateShade(i, "hex", e.target.value)}
                          className="w-10 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer flex-shrink-0"
                          style={{ background: shade.hex }}
                        />
                        <input
                          value={shade.name}
                          onChange={e => updateShade(i, "name", e.target.value)}
                          placeholder="Shade name"
                          className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 min-w-0"
                        />
                        {paletteCategory === "mixed" && (
                          <select
                            value={shade.category || "lipstick"}
                            onChange={e => updateShade(i, "category", e.target.value)}
                            className="text-[0.5625rem] text-primary-60 font-light bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 outline-none"
                          >
                            <option value="lipstick">Lip</option>
                            <option value="eyeshadow">Eye</option>
                          </select>
                        )}
                        <button
                          onClick={() => removeShade(i)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-primary-30 hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0"
                          aria-label="Remove shade"
                        >
                          <X size={12} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save as Template */}
              {shades.length > 0 && (
                <button
                  onClick={saveAsTemplate}
                  className="w-full py-3 mb-2 rounded-full text-[0.5625rem] tracking-[0.25em] uppercase font-light text-[var(--color-accent-gold)] border border-[var(--color-accent-gold)]/40 flex items-center justify-center gap-2"
                >
                  <Save size={12} strokeWidth={2} />
                  Save as Template
                </button>
              )}

              {/* Save button */}
              <button
                onClick={savePalette}
                disabled={!paletteName.trim() || shades.length === 0 || saving}
                className="w-full py-3.5 bg-[#043927] text-[#FDF5E6] text-[0.5625rem] tracking-[0.25em] uppercase rounded-full font-light disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <Check size={12} strokeWidth={2} />
                    {editingPalette ? "Save Changes" : "Save Palette"}
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPARE VIEW ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {compareOpen && (
          <ShadePaletteCompare
            palettes={orderedPalettes}
            onClose={() => setCompareOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SMART MATCH ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {smartMatchOpen && (
          <SmartMatchSheet
            onClose={() => setSmartMatchOpen(false)}
            onAddShade={addShadeFromTool}
          />
        )}
      </AnimatePresence>

      {/* ── COLOR SAMPLER ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {colorSamplerOpen && (
          <ColorSamplerSheet
            onClose={() => setColorSamplerOpen(false)}
            onAddShade={addShadeFromTool}
            paletteCategory={paletteCategory}
          />
        )}
      </AnimatePresence>

      {/* ── TEMPLATES ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {templatesOpen && (
          <PaletteTemplates
            onClose={() => setTemplatesOpen(false)}
            onLoadTemplate={loadTemplate}
          />
        )}
      </AnimatePresence>

      {/* ── EXPORT & SHARE ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {exportPalette && (
          <PaletteExportShare
            palette={exportPalette}
            onClose={() => setExportPalette(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}