import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TAGS, TAG_ACCENT } from "@/components/ProductTagSheet";

export default function BulkTagSheet({ count, initialTags, onClose, onApply }) {
  const [tags, setTags] = useState(initialTags || []);

  const toggle = (t) => setTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  return (
    <AnimatePresence>
      <motion.div
        key="bt-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/22"
        style={{ backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <motion.div
        key="bt-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 290, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-4"
        style={{ background: "var(--color-bg)", borderTop: "1px solid rgba(200,176,106,0.2)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 88px)" }}
      >
        <div className="w-10 h-0.5 bg-[#C8B06A]/30 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] font-light">Bulk</p>
            <h3 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Tag {count} product{count !== 1 ? "s" : ""}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)]">
            <X size={15} color="var(--color-text-primary)" />
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] font-light mb-4">These tags will replace the current tags on all selected items.</p>

        <div className="space-y-2">
          {TAGS.map(tag => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className="w-full rounded-2xl px-4 py-3.5 flex items-center justify-between border transition-all text-left"
                style={{
                  borderColor: active ? TAG_ACCENT[tag] : "rgba(229,228,226,0.8)",
                  background: active ? `${TAG_ACCENT[tag]}12` : "var(--color-bg-surface)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: TAG_ACCENT[tag] }} />
                  <span className="text-sm text-[var(--color-text-primary)] font-light capitalize">{tag}</span>
                </div>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                  style={{
                    background: active ? TAG_ACCENT[tag] : "transparent",
                    color: active ? "#FDF5E6" : "transparent",
                    border: active ? "none" : "1px solid rgba(4,57,39,0.15)",
                  }}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onApply(tags)}
          className="w-full mt-5 py-3.5 rounded-xl text-[10px] tracking-[0.22em] uppercase font-light text-[#FDF5E6]"
          style={{ background: "#043927" }}
        >
          Apply tags
        </button>
      </motion.div>
    </AnimatePresence>
  );
}