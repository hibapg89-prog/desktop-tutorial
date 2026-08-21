import { useMemo } from "react";
import { Crown, PenLine, MessageCircle } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";

const RANK_COLOR = ["#C8B06A", "#9AA0A6", "#B08D57"];

export default function ReviewerLeaderboard({ posts }) {
  const leaders = useMemo(() => {
    const map = {};
    for (const p of posts) {
      const key = p.created_by_id || p.author_name || "unknown";
      if (!map[key]) {
        map[key] = { id: p.created_by_id, name: p.author_name || "Muse Member", posts: 0, engagement: 0 };
      }
      map[key].posts++;
      map[key].engagement += p.review_count || 0;
    }
    return Object.values(map)
      .sort((a, b) => b.posts - a.posts || b.engagement - a.engagement)
      .slice(0, 5);
  }, [posts]);

  if (leaders.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-[#E5E4E2]" style={{ background: "linear-gradient(135deg, #043927 0%, #0B3C26 100%)" }}>
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C8B06A] font-light">The Muse Circle</p>
          <h2 className="font-serif text-lg text-[#FDF5E6] font-light leading-tight">Top Reviewers</h2>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(200,176,106,0.15)" }}>
          <Crown size={16} color="#C8B06A" />
        </div>
      </div>

      <div className="px-3 pb-3 space-y-1.5">
        {leaders.map((l, i) => {
          const rank = i + 1;
          const accent = RANK_COLOR[i] || "#E5E4E2";
          return (
            <div
              key={l.id || l.name + i}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2"
              style={{ background: rank === 1 ? "rgba(200,176,106,0.12)" : "rgba(255,255,255,0.04)" }}
            >
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {rank === 1 ? (
                  <Crown size={15} color={accent} fill={accent} />
                ) : (
                  <span className="text-xs font-serif font-light" style={{ color: accent }}>{rank}</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,176,106,0.18)" }}>
                <span className="text-xs font-serif" style={{ color: "#C5A059" }}>{l.name[0]?.toUpperCase() || "M"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#FDF5E6] font-light truncate">{l.name}</p>
                <div className="flex items-center gap-3 text-[10px] text-[#FDF5E6]/55 font-light">
                  <span className="flex items-center gap-1"><PenLine size={9} /> {l.posts} review{l.posts !== 1 ? "s" : ""}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={9} /> {l.engagement}</span>
                </div>
              </div>
              {rank <= 3 && (
                <span className="text-[9px] tracking-[0.15em] uppercase font-light flex-shrink-0" style={{ color: accent }}>
                  {["Gold", "Silver", "Bronze"][rank - 1]}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-3 pt-1 flex items-center gap-1.5">
        <SwanLogo size={12} color="#C8B06A" />
        <p className="text-[9px] text-[#FDF5E6]/40 font-light italic">Share your finds to rise on the board</p>
      </div>
    </div>
  );
}