import { useState, useEffect } from "react";
import { LayoutTemplate, X, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function PaletteTemplates({ onClose, onLoadTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const list = await base44.entities.PaletteTemplate.list("-created_date", 50);
      setTemplates(Array.isArray(list) ? list : []);
    } catch {
      setTemplates([]);
    }
    setLoading(false);
  };

  const personal = templates.filter((t) => !t.is_starter);
  const starters = templates.filter((t) => t.is_starter);

  const loadTemplate = (template) => {
    onLoadTemplate({
      name: template.name,
      category: "mixed",
      notes: template.season_tag || "",
      shades: template.shades || [],
    });
    onClose();
  };

  const deleteTemplate = async (id) => {
    try {
      await base44.entities.PaletteTemplate.delete(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
    }
    setConfirmDelete(null);
  };

  const TemplateCard = ({ template, canDelete }) => (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden">
      <button onClick={() => loadTemplate(template)} className="w-full text-left">
        <div className="flex h-10">
          {(template.shades || []).slice(0, 6).map((shade, i) => (
            <div key={i} className="flex-1" style={{ background: shade.hex }} />
          ))}
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate">
            {template.name}
          </p>
          <p className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-40 font-light mt-0.5">
            {template.season_tag ? `${template.season_tag} · ` : ""}
            {(template.shades || []).length} shades
          </p>
        </div>
      </button>
      {canDelete && (
        <button
          onClick={() => setConfirmDelete(template.id)}
          className="w-full py-1.5 text-[0.5rem] tracking-[0.15em] uppercase text-primary-30 font-light border-t border-[var(--color-border)] hover:text-red-400"
        >
          Delete
        </button>
      )}
      {confirmDelete === template.id && (
        <div className="px-3 py-2 bg-red-50/60 border-t border-red-100 flex items-center justify-between">
          <span className="text-[0.5625rem] text-primary-60 font-light">Delete?</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-[0.5rem] px-2 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] font-light"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTemplate(template.id)}
              className="text-[0.5rem] px-2 py-1 rounded-full bg-red-500 text-white font-light"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} color="var(--color-accent-gold)" strokeWidth={1.5} />
            <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
              Templates
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="swan-float">
              <SwanLogo size={32} color="var(--color-accent-gold)" />
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-5 py-8 text-center bg-[var(--color-bg-surface)]">
            <LayoutTemplate size={24} color="var(--color-accent-gold)" className="mx-auto mb-3 opacity-60" />
            <p className="text-[0.6875rem] text-primary-40 font-light italic">
              No templates yet. Save a palette as a template to reuse it.
            </p>
          </div>
        ) : (
          <>
            {starters.length > 0 && (
              <div className="mb-5">
                <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-3 flex items-center gap-1.5">
                  <Sparkles size={10} color="var(--color-accent-gold)" />
                  Starter Collection
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {starters.map((t) => (
                    <TemplateCard key={t.id} template={t} canDelete={false} />
                  ))}
                </div>
              </div>
            )}
            {personal.length > 0 && (
              <div>
                <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-45 font-light mb-3">
                  My Templates
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {personal.map((t) => (
                    <TemplateCard key={t.id} template={t} canDelete={true} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}