import { useState, useEffect } from "react";
import { X, ArrowLeftRight, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function SwapComposer({ onClose, onPosted }) {
  const [vanity, setVanity] = useState([]);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      base44.entities.Product.filter({ in_vanity: true }, "-updated_date", 100),
    ]).then(([u, list]) => {
      setUser(u);
      setVanity(list || []);
      setLoading(false);
    });
  }, []);

  const canSubmit = selected && lookingFor.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await base44.entities.Swap.create({
        offered_product_name: selected.name,
        offered_brand: selected.brand || "",
        offered_shade: selected.shade || "",
        offered_category: selected.category || "",
        offered_image_url: selected.image_url || "",
        looking_for: lookingFor.trim(),
        author_name: user?.full_name || "A Muse Member",
        status: "open",
      });
      onPosted();
      onClose();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#043927]/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md bg-[var(--color-bg)] rounded-t-3xl sm:rounded-3xl border border-[var(--color-border)] p-5 max-h-[88vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={16} color="#C8B06A" />
              <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light">Propose a Swap</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
              <X size={15} color="var(--color-text-primary)" />
            </button>
          </div>

          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">Offering from your vanity</p>
          {loading ? (
            <div className="flex justify-center py-8"><SwanLogo size={32} color="#C8B06A" className="animate-pulse" /></div>
          ) : vanity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-primary)]/50 font-light italic">Add products to your vanity first to offer a swap.</p>
            </div>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 mb-4">
              {vanity.map((p) => {
                const active = selected?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`flex-shrink-0 w-20 text-left rounded-2xl overflow-hidden border-2 transition-all ${active ? "border-[#C8B06A] shadow-md" : "border-transparent bg-[var(--color-bg-elevated)]"}`}
                  >
                    <div className="w-20 h-20 bg-[var(--color-bg-elevated)]">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><SwanLogo size={18} color="var(--color-text-primary)" /></div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[8px] tracking-wide uppercase text-[#BC8F8F] truncate">{p.brand}</p>
                      <p className="text-[10px] text-[var(--color-text-primary)] font-light truncate">{p.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">Looking for in return</p>
          <textarea
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder="e.g. A warm-toned blush, Charlotte Tilbury Pillow Talk, open to similar nude lipsticks…"
            rows={3}
            className="w-full bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] p-3.5 text-sm text-[var(--color-text-primary)] font-light outline-none resize-none placeholder:text-[var(--color-text-primary)]/30 focus:border-[#C8B06A]"
          />

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs tracking-[0.15em] uppercase font-light transition-all ${canSubmit ? "muse-btn text-[var(--color-text-primary)]" : "bg-[var(--color-border)] text-[var(--color-text-primary)]/40 cursor-not-allowed"}`}
          >
            <Send size={13} /> {submitting ? "Posting…" : "Post Swap"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}