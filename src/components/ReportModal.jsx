import { useState } from "react";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const REASONS = [
  "Misinformation or inaccurate claim",
  "Spam or self-promotion",
  "Harmful or offensive content",
  "Fake or incentivised review",
  "Other",
];

export default function ReportModal({ postId, onClose }) {
  const [reason, setReason]       = useState("");
  const [detail, setDetail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await base44.entities.Report.create({
        post_id: postId,
        reason,
        detail: detail.trim() || undefined,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#043927]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-[var(--color-bg)] rounded-t-3xl sm:rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Report this post</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)]"
          >
            <X size={14} color="var(--color-text-primary)" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-serif text-base text-[var(--color-text-secondary)] italic leading-relaxed">
              Thank you — your report is being reviewed.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] font-light mt-2">
              The post remains visible while under review.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-xs text-[#BC8F8F] underline font-light"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-light mb-3">
              Why are you reporting this?
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-sm font-light transition-all ${
                    reason === r
                      ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-border)]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {reason === "Other" && (
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Tell us more…"
                rows={2}
                className="w-full mb-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-muted)] resize-none"
              />
            )}

            <button
              onClick={submit}
              disabled={!reason || submitting}
              className={`w-full py-3 rounded-2xl text-xs tracking-[0.2em] font-light transition-all ${
                reason && !submitting
                  ? "bg-[#BC8F8F] text-white"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting…" : "SUBMIT REPORT"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
