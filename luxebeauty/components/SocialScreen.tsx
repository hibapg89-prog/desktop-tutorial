"use client";

import { useState, useRef } from "react";

interface Props { onBack: () => void; }

// ─── Types ────────────────────────────────────────────────────────────────────

type ReactionId = "iconic" | "obsessed" | "dreamy" | "natural" | "holy-grail";

// ─── Constants ────────────────────────────────────────────────────────────────

const REACTIONS: { id: ReactionId; emoji: string; label: string; scarce?: boolean }[] = [
  { id: "iconic",     emoji: "💎", label: "Iconic"     },
  { id: "obsessed",   emoji: "🔥", label: "Obsessed"   },
  { id: "dreamy",     emoji: "✨", label: "Dreamy"     },
  { id: "natural",    emoji: "🌿", label: "Natural"    },
  { id: "holy-grail", emoji: "💛", label: "Holy Grail", scarce: true },
];

const DISTINCTIONS = [
  { icon: "💎", label: "Gem Collector",  earned: true },
  { icon: "✦",  label: "Glow Authority", earned: true },
  { icon: "🔥", label: "Trendsetter",    earned: true },
  { icon: "◈",  label: "Beauty Pioneer", earned: true },
  { icon: "🌿", label: "Ritual Expert",  earned: false },
  { icon: "◯",  label: "Local Advocate", earned: false },
  { icon: "○",  label: "The Sage",       earned: false },
  { icon: "✦",  label: "Little Muse",    earned: true },
];

const CIRCLES = [
  { id: "1", name: "The Minimalist Edit",   members: 1248, muse: true,  hex: "#E8D8A8", accent: "#C8B06A", lastPost: "2h" },
  { id: "2", name: "My Skincare Squad",     members: 12,   muse: false, hex: "#C0D8B0", accent: "#3A7A5A", lastPost: "1d" },
  { id: "3", name: "Rare Fragrance Lovers", members: 843,  muse: true,  hex: "#EAD0D8", accent: "#B06880", lastPost: "5h" },
  { id: "4", name: "Weekend Glow Seekers",  members: 7,    muse: false, hex: "#D8E8D0", accent: "#2A6A3A", lastPost: "3d" },
  { id: "5", name: "Clean Skincare Lab",    members: 2103, muse: true,  hex: "#D8EEE8", accent: "#0B5A40", lastPost: "30m" },
];

const ACTIVITY = [
  { id: "1", initials: "IR", avatarHex: "#A07850", reaction: "💎", label: "Iconic",     author: "Isabelle R.", target: "your La Mer Crème review",        timeAgo: "1h" },
  { id: "2", initials: "SM", avatarHex: "#C8A080", reaction: "🔥", label: "Obsessed",   author: "Sophie M.",   target: "your Spring Shelfie",             timeAgo: "2h" },
  { id: "3", initials: "✦",  avatarHex: "#C8B06A", reaction: "💛", label: "Holy Grail", author: "3 members",   target: "Tatcha Dewy Skin Cream review",    timeAgo: "5h" },
  { id: "4", initials: "AD", avatarHex: "#D4A888", reaction: "✨", label: "Dreamy",     author: "Amélie D.",   target: "your Morning Ritual Diary",        timeAgo: "8h" },
  { id: "5", initials: "PS", avatarHex: "#9B6E4A", reaction: "🌿", label: "Natural",    author: "Priya S.",    target: "your Sulwhasoo First Care review", timeAgo: "1d" },
];

const POLL = {
  name: "NARS Radiant Creamy Concealer",
  brand: "NARS",
  productHex: "#C4968A",
  yesCount: 847,
  total: 1024,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SocialScreen({ onBack }: Props) {
  const [selected,     setSelected]     = useState<ReactionId | null>(null);
  const [holyGrailN,   setHolyGrailN]   = useState(0);
  const [floats,       setFloats]       = useState<{ id: number; emoji: string; x: number }[]>([]);
  const floatId  = useRef(0);
  const reactionRef = useRef<HTMLDivElement>(null);

  const pct = Math.round(POLL.yesCount / POLL.total * 100);

  const fireReaction = (r: typeof REACTIONS[0], btn: HTMLElement) => {
    if (r.scarce && holyGrailN >= 3) return;
    setSelected(r.id);
    if (r.scarce) setHolyGrailN(n => n + 1);

    let x = 0;
    if (reactionRef.current) {
      const cRect = reactionRef.current.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();
      x = bRect.left - cRect.left + bRect.width / 2 - 14;
    }
    const id = ++floatId.current;
    setFloats(f => [...f, { id, emoji: r.emoji, x }]);
    setTimeout(() => setFloats(f => f.filter(fl => fl.id !== id)), 900);
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0)     scale(1);   }
          40%  { opacity: 1; transform: translateY(-28px) scale(1.5); }
          100% { opacity: 0; transform: translateY(-68px) scale(0.7); }
        }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">Community</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">My Circle</h2>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-[rgba(11,60,38,0.05)] transition-colors"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0B3C26" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="7" cy="4.5" r="2.5" />
            <path d="M1 13C1 10.2 3.7 8 7 8S13 10.2 13 13" />
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-4" />

      <div className="flex-1 overflow-y-auto pb-10">

        {/* ── Profile Card ────────────────────────────────────────────────── */}
        <div className="mx-5 mb-5 card-pearl rounded-2xl px-5 py-4">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar with top Distinction badge */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl"
                style={{ background: "linear-gradient(135deg, #D4A888, #C8907A)", color: "rgba(250,246,239,0.95)" }}>
                H
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#FAF7F2", border: "1.5px solid rgba(200,176,106,0.45)", fontSize: "9px" }}>
                💎
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-xl font-normal text-[#1C1C1C]">Hiba</h3>
              <p className="font-sans text-[9px] text-[#8A8070] tracking-wide mb-2">@hibapg · Paris</p>
              <div className="flex gap-5">
                {[["284","Admirers"],["142","Admiring"],["47","Reviews"]].map(([n, lbl]) => (
                  <div key={lbl} className="text-center">
                    <p className="font-serif text-base font-normal text-[#1C1C1C] leading-none">{n}</p>
                    <p className="font-sans text-[7px] tracking-[0.08em] uppercase text-[#8A8070] mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distinctions tray */}
          <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#8A8070] mb-2.5">Distinctions</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {DISTINCTIONS.map((d, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1"
                style={{ opacity: d.earned ? 1 : 0.22 }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: d.earned ? "rgba(200,176,106,0.12)" : "rgba(11,60,38,0.03)",
                    border: d.earned ? "1.5px solid rgba(200,176,106,0.4)" : "1px solid rgba(11,60,38,0.07)",
                  }}>
                  <span className="text-lg">{d.icon}</span>
                </div>
                <span className="font-sans text-[6.5px] tracking-[0.04em] text-[#8A8070] text-center leading-tight"
                  style={{ width: "44px" }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Beauty Circles ──────────────────────────────────────────────── */}
        <div className="mb-5">
          <div className="px-5 mb-3 flex items-center justify-between">
            <div>
              <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-0.5">Your Communities</p>
              <h3 className="font-serif text-base font-normal text-[#1C1C1C]">Beauty Circles</h3>
            </div>
            <button className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] opacity-40 hover:opacity-80 transition-opacity cursor-pointer">
              + Create
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto px-5 pb-2" style={{ scrollbarWidth: "none" }}>
            {CIRCLES.map(circle => (
              <div key={circle.id}
                className="flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer card-pearl"
                style={{ border: `1px solid ${circle.accent}22` }}>
                {/* Gradient band */}
                <div className="h-14 relative"
                  style={{ background: `linear-gradient(135deg, ${circle.hex}, ${circle.accent}28)` }}>
                  {circle.muse && (
                    <div className="absolute top-1.5 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(250,246,239,0.92)", border: "1px solid rgba(200,176,106,0.3)" }}>
                      <span className="text-[7px] text-[#C8B06A]">✦</span>
                      <span className="font-sans text-[6px] tracking-[0.1em] uppercase text-[#C8B06A]">Muse</span>
                    </div>
                  )}
                  {/* Stacked avatars */}
                  <div className="absolute bottom-1.5 left-2.5 flex">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-5 h-5 rounded-full border-2 border-white/50 -ml-1 first:ml-0"
                        style={{ background: `hsl(${j * 50 + 15}deg 38% 62%)` }} />
                    ))}
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="font-serif text-[11px] font-normal text-[#1C1C1C] leading-tight mb-1">{circle.name}</p>
                  <p className="font-sans text-[8px] text-[#8A8070]">
                    {circle.members >= 1000 ? `${(circle.members / 1000).toFixed(1)}k` : circle.members} members · {circle.lastPost}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Vanity Poll + Reaction Picker ───────────────────────────────── */}
        <div className="mx-5 mb-5">
          <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-0.5">Circle Pulse</p>
          <h3 className="font-serif text-base font-normal text-[#1C1C1C] mb-3">
            Would you add this to your Vanity?
          </h3>

          <div className="card-pearl rounded-2xl overflow-hidden">
            {/* Product strip */}
            <div className="h-14 relative"
              style={{ background: `linear-gradient(145deg, ${POLL.productHex}, rgba(200,176,106,0.35))` }}>
              <div className="absolute bottom-2.5 left-4">
                <p className="font-sans text-[7px] text-white/60 tracking-[0.12em] uppercase">{POLL.brand}</p>
                <p className="font-sans text-[10px] text-white/90 font-medium">{POLL.name}</p>
              </div>
            </div>

            <div className="px-4 pt-4 pb-4">
              <p className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#8A8070] mb-3">
                React with your feeling
              </p>

              {/* Reaction picker with float container */}
              <div ref={reactionRef} className="relative mb-4">
                {/* Floating emojis */}
                {floats.map(fl => (
                  <div key={fl.id}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: fl.x,
                      bottom: "100%",
                      fontSize: "24px",
                      lineHeight: 1,
                      animation: "floatUp 0.9s ease-out forwards",
                    }}>
                    {fl.emoji}
                  </div>
                ))}

                <div className="flex justify-between">
                  {REACTIONS.map(r => {
                    const isSelected  = selected === r.id;
                    const isExhausted = r.scarce && holyGrailN >= 3;
                    const remaining   = 3 - holyGrailN;
                    return (
                      <button key={r.id}
                        disabled={isExhausted}
                        onClick={e => fireReaction(r, e.currentTarget as HTMLElement)}
                        className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-90"
                        style={{ opacity: isExhausted ? 0.28 : 1 }}>
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200"
                          style={{
                            background: isSelected ? "rgba(200,176,106,0.2)" : "rgba(11,60,38,0.04)",
                            border: isSelected ? "1.5px solid rgba(200,176,106,0.55)" : "1px solid rgba(11,60,38,0.07)",
                            transform: isSelected ? "scale(1.12)" : "scale(1)",
                            boxShadow: isSelected ? "0 2px 10px rgba(200,176,106,0.25)" : "none",
                          }}>
                          <span className="text-xl">{r.emoji}</span>
                        </div>
                        <span className="font-sans text-[7px] tracking-[0.04em] text-[#8A8070] text-center leading-tight"
                          style={{ width: "44px" }}>
                          {r.label}
                          {r.scarce && (
                            <span className={`block mt-0.5 ${remaining <= 0 ? "text-[#C4968A]" : "text-[#C8B06A]"}`}>
                              {remaining > 0 ? `${remaining} left` : "used up"}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Poll progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-sans text-[9px] text-[#8A8070]">
                    {POLL.yesCount.toLocaleString()} of {POLL.total.toLocaleString()} would add this
                  </p>
                  <p className="font-sans text-[9px] font-medium text-[#C8B06A]">{pct}%</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(200,176,106,0.15)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C8B06A, #E8D898)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Circle Reactions (Activity) ─────────────────────────────────── */}
        <div className="mx-5">
          <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-0.5">Lately</p>
          <h3 className="font-serif text-base font-normal text-[#1C1C1C] mb-3">Circle Reactions</h3>

          <div className="flex flex-col gap-3">
            {ACTIVITY.map(event => (
              <div key={event.id} className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-sans text-[9px] font-medium text-white"
                  style={{ background: event.avatarHex, border: "1.5px solid rgba(200,176,106,0.2)" }}>
                  {event.initials}
                </div>
                {/* Description */}
                <p className="flex-1 font-sans text-[9px] text-[#5A5040] leading-snug min-w-0">
                  <span className="font-medium text-[#1C1C1C]">{event.author} </span>
                  found {event.target}
                </p>
                {/* Reaction pill + time */}
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(200,176,106,0.1)", border: "1px solid rgba(200,176,106,0.2)" }}>
                    <span className="text-[11px]">{event.reaction}</span>
                    <span className="font-sans text-[7px] tracking-[0.06em] text-[#C8B06A]">{event.label}</span>
                  </div>
                  <p className="font-sans text-[7.5px] text-[#8A8070] opacity-70">{event.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
