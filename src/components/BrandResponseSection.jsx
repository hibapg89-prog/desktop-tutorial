import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const TONE_NOTE =
  "Value and support only — no promotional language, no offers, no pitch. One response per review.";

export default function BrandResponseSection({ post, user }) {
  const [response, setResponse]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [composing, setComposing] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [text, setText]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 400;

  useEffect(() => {
    base44.entities.BrandResponse.filter({ post_id: post.id })
      .then((rs) => setResponse(rs[0] || null))
      .catch(() => setResponse(null))
      .finally(() => setLoading(false));
  }, [post.id]);

  const handleTextChange = (val) => {
    if (val.length <= MAX_CHARS) { setText(val); setCharCount(val.length); }
  };

  const submit = async () => {
    if (!text.trim() || !brandName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const created = await base44.entities.BrandResponse.create({
        post_id: post.id,
        brand_name: brandName.trim(),
        response_text: text.trim(),
        responder_name: user?.full_name || user?.email || brandName.trim(),
      });
      setResponse(created);
      setComposing(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  // ── existing response ──
  if (response) {
    return (
      <div className="bg-[#043927]/[0.04] border border-[#043927]/10 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-light bg-[#043927]/8 px-2 py-0.5 rounded-full">
            ✦ Brand Response
          </span>
          <span className="text-[9px] text-[var(--color-text-muted)] font-light">{response.brand_name}</span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] font-light leading-relaxed">{response.response_text}</p>
      </div>
    );
  }

  // ── compose form ──
  if (!user) return null; // not signed in

  if (composing) {
    return (
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-4 mb-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-light mb-1">
          ✦ Brand or Service Response
        </p>
        <p className="text-[10px] text-[var(--color-text-muted)] font-light italic mb-4 leading-relaxed">{TONE_NOTE}</p>

        <input
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Brand or service name"
          className="w-full mb-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-muted)]"
        />

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Thank the reviewer and offer genuine support or context. No promotions."
            rows={4}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-muted)] resize-none"
          />
          <span className={`absolute bottom-2 right-3 text-[9px] font-light ${charCount > MAX_CHARS * 0.9 ? "text-[#BC8F8F]" : "text-[var(--color-text-muted)]"}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setComposing(false)}
            className="flex-1 py-2.5 rounded-xl text-xs font-light text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || !brandName.trim() || submitting}
            className={`flex-1 py-2.5 rounded-xl text-xs font-light tracking-wide transition-all ${
              text.trim() && brandName.trim() && !submitting
                ? "bg-[#043927] text-[#FDF5E6]"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed"
            }`}
          >
            {submitting ? "Posting…" : "POST RESPONSE"}
          </button>
        </div>
      </div>
    );
  }

  // ── prompt ──
  return (
    <button
      onClick={() => setComposing(true)}
      className="mb-5 text-[10px] tracking-[0.15em] text-[var(--color-text-muted)] font-light hover:text-[var(--color-text-secondary)] transition-colors"
    >
      ✦ Respond as brand or service →
    </button>
  );
}