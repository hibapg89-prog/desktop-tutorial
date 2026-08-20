import { useState } from "react";
import { BarChart3, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const OPTION_COLORS = ["#BC8F8F", "#C8B06A", "#6B9E6B", "#8F8FAA", "#A89B6B", "#7A9BA8"];

export default function PollCard({ poll, user, onVoted }) {
  const [voting, setVoting] = useState(false);
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

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={13} color="#C8B06A" />
          <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8B06A] font-light">Poll</span>
        </div>
        <p className="font-serif text-lg text-[var(--color-text-primary)] font-light leading-snug mb-1">{poll.question}</p>
        <p className="text-[10px] text-[var(--color-text-muted)] font-light mb-3">by {poll.author_name || "A Muse Member"} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>

        <div className="space-y-2">
          {poll.options.map((opt, i) => {
            const votes = opt.votes || 0;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const color = OPTION_COLORS[i % OPTION_COLORS.length];
            const myChoice = hasVoted && user && (poll.voter_ids || []).includes(user.id);

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