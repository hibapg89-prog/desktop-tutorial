import { useState, useEffect } from "react";
import { X, Sparkles, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function PollComposer({ onClose, onPosted }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const updateOption = (i, val) => setOptions(prev => prev.map((o, idx) => (idx === i ? val : o)));
  const addOption = () => setOptions(prev => [...prev, ""]);
  const removeOption = (i) => setOptions(prev => prev.filter((_, idx) => idx !== i));

  const validOptions = options.map(o => o.trim()).filter(Boolean);
  const canPost = question.trim().length > 0 && validOptions.length >= 2 && !submitting;

  const submit = async () => {
    if (!canPost) return;
    setSubmitting(true);
    try {
      await base44.entities.Poll.create({
        question: question.trim(),
        options: validOptions.map(text => ({ text, votes: 0 })),
        author_name: user?.full_name || user?.email || "A Muse Member",
        voter_ids: [],
      });
      onPosted && onPosted();
      onClose && onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#043927]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:max-w-md max-h-[88vh] overflow-y-auto bg-[var(--color-bg)] rounded-t-3xl sm:rounded-3xl pt-5 px-5 pb-28" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} color="#C8B06A" />
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light">Create a Poll</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#043927]/10">
            <X size={14} color="var(--color-text-primary)" />
          </button>
        </div>

        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">Question</p>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Which foundation finish do you prefer?"
          className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30 mb-4"
        />

        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">Options</p>
        <div className="space-y-2 mb-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-[#043927]/5 text-[var(--color-text-primary)]/40 hover:bg-[#043927]/10"
                  aria-label="Remove option"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {options.length < 6 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-primary)]/60 font-light mb-4 hover:text-[var(--color-text-primary)]"
          >
            <Plus size={13} /> Add option
          </button>
        )}

        <button
          onClick={submit}
          disabled={!canPost}
          className={`w-full py-3 rounded-2xl text-xs tracking-[0.2em] font-light transition-all ${canPost ? "muse-btn text-[var(--color-text-primary)]" : "bg-[var(--color-border)] text-[var(--color-text-primary)]/40 cursor-not-allowed"}`}
        >
          {submitting ? "Posting…" : "POST POLL"}
        </button>
      </div>
    </div>
  );
}
