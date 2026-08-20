import { useState, useEffect } from "react";
import { Sparkles, X, Check, Wand2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function SmartMatchSheet({ onClose, onAddShade }) {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    base44.entities.TryOnLook.list("-created_date", 50)
      .then((list) => setLooks(Array.isArray(list) ? list : []))
      .catch(() => setLooks([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const suggest = async () => {
    if (selected.size === 0) return;
    setSuggesting(true);
    setSuggestions([]);
    try {
      const chosen = looks.filter((l) => selected.has(l.id));
      const context = chosen
        .map((l) => `${l.shade_name} (${l.category}, hex ${l.shade_hex})`)
        .join("; ");
      const prompt = `You are a luxury beauty stylist. Based on these shades the user has previously tried on: ${context}. Suggest 4 complementary shades — a mix of lipstick and eyeshadow — that would pair beautifully with these looks. For each, provide a creative shade name, a hex color code, and whether it is a lipstick or eyeshadow.`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  hex: { type: "string" },
                  category: { type: "string", enum: ["lipstick", "eyeshadow"] },
                },
                required: ["name", "hex", "category"],
              },
            },
          },
        },
      });
      setSuggestions(res.suggestions || []);
    } catch (e) {
    }
    setSuggesting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wand2 size={18} color="var(--color-accent-gold)" strokeWidth={1.5} />
            <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
              Smart Match
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
          </button>
        </div>

        <p className="text-[0.625rem] text-primary-45 font-light leading-relaxed mb-4">
          Select one or more of your tried-on looks, and The Muse will suggest complementary shades.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="swan-float">
              <SwanLogo size={32} color="var(--color-accent-gold)" />
            </div>
          </div>
        ) : looks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-5 py-8 text-center bg-[var(--color-bg-surface)]">
            <Sparkles size={24} color="var(--color-accent-gold)" className="mx-auto mb-3 opacity-60" />
            <p className="text-[0.6875rem] text-primary-40 font-light italic">
              No try-on looks yet. Visit The Muse Studio to try shades first.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-5">
              {looks.map((look) => (
                <button
                  key={look.id}
                  onClick={() => toggle(look.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    selected.has(look.id)
                      ? "bg-[#043927]/5 border-[var(--color-accent-gold)]"
                      : "bg-[var(--color-bg-surface)] border-[var(--color-border)]"
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex-shrink-0 border border-white/30"
                    style={{ background: look.shade_hex }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate">
                      {look.shade_name}
                    </p>
                    <p className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-40 font-light">
                      {look.category}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected.has(look.id)
                        ? "bg-[#043927]"
                        : "border border-[var(--color-border)]"
                    }`}
                  >
                    {selected.has(look.id) && <Check size={11} color="#FDF5E6" />}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={suggest}
              disabled={selected.size === 0 || suggesting}
              className="w-full py-3.5 bg-[#043927] text-[#FDF5E6] text-[0.5625rem] tracking-[0.25em] uppercase rounded-full font-light disabled:opacity-40 flex items-center justify-center gap-2 mb-5"
            >
              {suggesting ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#FDF5E6]/40 border-t-[#FDF5E6] rounded-full animate-spin" />
                  Suggesting…
                </>
              ) : (
                <>
                  <Sparkles size={12} strokeWidth={2} />
                  Suggest Shades
                </>
              )}
            </button>

            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-2">
                    Complementary Shades
                  </p>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 border border-white/30"
                        style={{ background: s.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate">
                          {s.name}
                        </p>
                        <p className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-40 font-light">
                          {s.category} · {s.hex}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onAddShade({
                            name: s.name,
                            hex: s.hex,
                            category: s.category,
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.12em] uppercase font-light bg-[var(--color-accent-gold)] text-white flex-shrink-0"
                      >
                        <Plus size={10} strokeWidth={2} />
                        Add
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}