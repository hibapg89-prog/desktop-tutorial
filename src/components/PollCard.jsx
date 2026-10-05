import { useState } from "react";
import { BarChart3, Check, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const OPTION_COLORS = ["#BC8F8F", "#C8B06A", "#6B9E6B", "#8F8FAA", "#A89B6B", "#7A9BA8"];

export default function PollCard({ poll, user, onVoted, onDelete }) {
  const [voting, setVoting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const voterIds = poll.voter_ids || [];
  const hasVoted = user ? voterIds.includes(user.id) : false;
  const isAuthor = user && poll.created_by_id === user.id;
  const showResults = hasVoted || isAuthor;

  const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);

  const vote = async (idx) => {
    if (hasVoted || voting || !user) return;
    setVoting(true);
    try {
      const updatedOptions = poll.options.map((o, i) => (i === idx ? { ...o, votes: (o.votes || 0) + 1 } : o));
      const updatedVoterIds = [...voterIds, user.id];
      await base44.entities.Poll.update(poll.id, { options: updatedOptions, voter_ids: updatedVoterIds });
      onVoted && onVoted();
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.Poll.delete(poll.id);
      onDelete?.();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={13} color="#C8B06A" />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8B06A] font-light">Poll</span>
          </div>
          {isAuthor && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete poll"
              className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] font-light hover:text-[#BC8F8F] transition-colors"
            >
              <Trash2 size={11} />
            </button>
          )}
          {isAuthor && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--color-text-muted)] font-light">Remove poll?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-[10px] text-[#BC8F8F] font-light disabled:opacity-50"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="text-[10px] text-[var(--color-text-muted)] font-light disabled:opacity-50"
              >
                No
              </button>
            </div>
          )}
        </div>
        <p className="font-serif text-lg text-[var(--color-text-primary)] font-light leading-snug mb-1">{poll.question}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] font-light mb-3">by {poll.author_name || "A Muse Member"} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>

        <div className="space-y-2">
          {poll.options.map((opt, i) => {
            const votes = opt.votes || 0;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const color = OPTION_COLORS[i % OPTION_COLORS.length];

            if (!showResults) {
              return (
                <button
                  key={i}
                  onClick={() => vote(i)}
                  disabled={voting || !user}
                  className="w-full text-left bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] font-light hover:border-[#C8B06A] hover:bg-[var(--color-bg-surface)] transition-colors disabled:opacity-50"
                >
                  {opt.text}
                </button>
              );
            }

            return (
              <div key={i} className="relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
                <div className="absolute inset-y-0 left-0 rounded-xl" style={{ width: `${pct}%`, background: `${color}33` }} />
                <div className="relative flex items-center justify-between px-3.5 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-sm text-[var(--color-text-primary)] font-light truncate">{opt.text}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs text-[var(--color-text-secondary)] font-light">{pct}%</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-light">{votes}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showResults && !hasVoted && isAuthor && (
          <p className="text-[10px] text-[var(--color-text-muted)] font-light italic mt-2">You're the author — results preview.</p>
        )}
        {showResults && hasVoted && (
          <p className="text-[10px] text-[var(--color-text-muted)] font-light italic mt-2 flex items-center gap-1">
            <Check size={11} color="#6B9E6B" /> Your vote is counted.
          </p>
        )}
      </div>
    </div>
  );
}
