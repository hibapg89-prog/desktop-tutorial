"use client";

import { useEffect, useState } from "react";

interface Props {
  onBack:      () => void;
  onVanity?:   () => void;
  onSocial?:   () => void;
  onSettings?: () => void;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BeautyProfile {
  skin:  string;
  picks: string[];
  tier:  string;
}

const TIER_META: Record<string, { icon: string; label: string }> = {
  luxury:   { icon: "♛", label: "Luxury"     },
  prestige: { icon: "✦", label: "Prestige"   },
  artisan:  { icon: "◈", label: "Artisan"    },
  all:      { icon: "∞", label: "All Worlds" },
};

interface Distinction {
  icon:     string;
  label:    string;
  desc:     string;
  earned:   boolean;
  earnedAt?: string;
  accent:   string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const DISTINCTIONS: Distinction[] = [
  { icon: "💎", label: "Gem Collector",    desc: "50 reviews written",        earned: true,  earnedAt: "Jan 2025", accent: "#C8B06A" },
  { icon: "✦",  label: "Glow Authority",   desc: "Trusted by 200+ admirers",  earned: true,  earnedAt: "Mar 2025", accent: "#C8B06A" },
  { icon: "🔥", label: "Trendsetter",      desc: "3 reviews went Iconic",     earned: true,  earnedAt: "Apr 2025", accent: "#C4968A" },
  { icon: "◈",  label: "Beauty Pioneer",   desc: "First to review 10 launches", earned: false, accent: "#5A7A9A" },
  { icon: "🌿", label: "Ritual Expert",    desc: "Complete 5 ritual posts",   earned: false, accent: "#3A7A5A" },
  { icon: "◯",  label: "Local Advocate",   desc: "Tag 5 local boutiques",     earned: false, accent: "#A07850" },
];

const CIRCLES = [
  { label: "Clean Beauty",     accent: "#3A7A5A", icon: "🌿", members: 847  },
  { label: "Fragrance Lovers", accent: "#C8B06A", icon: "○",  members: 2104 },
  { label: "Slow Beauty",      accent: "#C4968A", icon: "◇",  members: 512  },
];

const RECENT_REVIEWS = [
  {
    product: "La Mer Crème de la Mer",
    rating: 5,
    text: "A ritual, not a moisturiser. My skin has never looked more luminous.",
    adores: 24, timeAgo: "3d", accent: "#C8B06A",
  },
  {
    product: "Charlotte Tilbury Pillow Talk",
    rating: 5,
    text: "The perfect your-lips-but-better. I've repurchased four times.",
    adores: 18, timeAgo: "1w", accent: "#C4968A",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProfileScreen({ onBack, onVanity, onSocial, onSettings }: Props) {
  const [tab, setTab] = useState<"distinctions" | "reviews" | "circles">("distinctions");
  const [profile, setProfile] = useState<BeautyProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("luxe-profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, []);

  const tierInfo = profile ? (TIER_META[profile.tier] ?? TIER_META.prestige) : TIER_META.prestige;
  const earned = DISTINCTIONS.filter(d => d.earned).length;

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer press-scale">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">Mon Monde</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Profile</h2>
        </div>
        <button
          onClick={onSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70 press-scale"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}
          aria-label="Paramètres">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="#C8B06A" strokeWidth="1.2"/>
            <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="#C8B06A" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-0" />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-10">

        {/* ── Profile Hero ── */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #E8D898, #C8A840, #F0E8CC)",
                  boxShadow: "0 0 22px rgba(200,176,106,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}>
                <span className="font-serif text-[28px] text-[#1C1C1C] font-normal leading-none">H</span>
              </div>
              {/* Tier badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: "linear-gradient(90deg, #C8B06A, #E8D070)",
                  border: "1.5px solid #FAF7F2",
                  boxShadow: "0 2px 8px rgba(200,176,106,0.3)",
                }}>
                <span className="font-sans text-[6px] tracking-[0.12em] uppercase font-semibold text-[#FAF7F2]">
                  {tierInfo.icon} {tierInfo.label}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-serif text-xl font-normal text-[#1C1C1C] leading-tight">Hiba</h3>
              <p className="font-sans text-[9px] tracking-wide mt-0.5" style={{ color: "#C8B06A" }}>@hiba_beauté</p>
              <p className="font-cormorant italic text-[12.5px] text-[#8A8070] mt-2 leading-relaxed">
                "Beauty is the most honest form of self-care."
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { value: "47",  label: "Reviews"  },
              { value: "124", label: "Adores"   },
              { value: "38",  label: "Admirers" },
              { value: "3",   label: "Circles"  },
            ].map(s => (
              <div key={s.label}
                className="card-pearl rounded-xl py-3 text-center">
                <p className="font-serif text-[17px] text-[#1C1C1C] font-normal leading-none">{s.value}</p>
                <p className="font-sans text-[6.5px] tracking-[0.1em] uppercase text-[#8A8070] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Beauty profile chips — only if onboarding was completed */}
          {profile && (
            <div className="mt-4 px-5 pb-1">
              <p className="font-sans text-[7.5px] tracking-[0.22em] uppercase text-[#8A8070] mb-2">
                Votre Profil Beauté
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="px-3 py-1 rounded-full font-sans text-[8px] tracking-[0.05em]"
                  style={{
                    background: "rgba(11,60,38,0.07)",
                    border: "1px solid rgba(11,60,38,0.15)",
                    color: "#0B3C26",
                  }}>
                  {profile.skin}
                </span>
                {profile.picks.map(p => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-full font-sans text-[8px] tracking-[0.05em]"
                    style={{
                      background: "rgba(200,176,106,0.1)",
                      border: "1px solid rgba(200,176,106,0.25)",
                      color: "#8A7048",
                    }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="divider-gold mx-5" />

        {/* ── Tab Selector ── */}
        <div className="mx-5 mt-4 mb-4 flex rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(200,176,106,0.2)", background: "rgba(200,176,106,0.04)" }}>
          {([
            { id: "distinctions", label: `Distinctions (${earned}/${DISTINCTIONS.length})` },
            { id: "reviews",      label: "Reviews"    },
            { id: "circles",      label: "Circles"    },
          ] as const).map((t, i) => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 cursor-pointer transition-all duration-200 press-scale"
              style={{
                background:  tab === t.id ? "rgba(11,60,38,0.08)" : "transparent",
                borderRight: i < 2 ? "1px solid rgba(200,176,106,0.15)" : "none",
              }}>
              <span className="font-sans text-[7px] tracking-[0.06em] uppercase"
                style={{ color: tab === t.id ? "#0B3C26" : "rgba(11,60,38,0.38)", fontWeight: tab === t.id ? 500 : 400 }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Distinctions ── */}
        {tab === "distinctions" && (
          <div className="px-5">
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {DISTINCTIONS.map(d => (
                <DistinctionCard key={d.label} d={d} />
              ))}
            </div>
            <p className="font-cormorant italic text-[11px] text-[#8A8070] text-center pb-1">
              {earned} of {DISTINCTIONS.length} distinctions earned ✦
            </p>
          </div>
        )}

        {/* ── Reviews ── */}
        {tab === "reviews" && (
          <div className="px-5 space-y-2.5">
            {RECENT_REVIEWS.map((r, i) => (
              <div key={i} className="card-pearl rounded-2xl px-4 py-3.5">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-sans text-[8.5px] font-medium tracking-[0.05em] leading-tight"
                    style={{ color: r.accent }}>
                    {r.product}
                  </p>
                  <div className="flex gap-0.5 flex-shrink-0 pt-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <span key={j} className="text-[7px] leading-none" style={{ color: r.accent }}>✦</span>
                    ))}
                  </div>
                </div>
                <p className="font-cormorant italic text-[13px] text-[#5A5040] leading-snug">{r.text}</p>
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="font-sans text-[8px] text-[#8A8070]">💎 {r.adores} Iconic</span>
                  <span className="font-sans text-[8px] text-[#8A8070] opacity-60">{r.timeAgo} ago</span>
                </div>
              </div>
            ))}
            <button className="w-full text-center font-sans text-[8px] text-[#C8B06A] tracking-wide py-2 cursor-pointer hover:opacity-70 transition-opacity press-scale">
              View all 47 reviews →
            </button>
          </div>
        )}

        {/* ── Circles ── */}
        {tab === "circles" && (
          <div className="px-5 space-y-2.5">
            {CIRCLES.map(c => (
              <button key={c.label}
                onClick={onSocial}
                className="w-full card-pearl rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer press-scale text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.accent}14`, border: `1px solid ${c.accent}28` }}>
                  <span className="text-base leading-none">{c.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[10px] font-medium text-[#1C1C1C]">{c.label}</p>
                  <p className="font-sans text-[7.5px] text-[#8A8070] mt-0.5">{c.members.toLocaleString()} members · Active</p>
                </div>
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#C8B06A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1L5 5L1 9" />
                </svg>
              </button>
            ))}

            {/* Vanity quick-link */}
            <button onClick={onVanity}
              className="w-full card-pearl rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer press-scale text-left mt-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #E8D898, #C8A840, #F0E8CC)",
                  border: "1px solid rgba(200,176,106,0.3)",
                }}>
                <span className="text-base leading-none">✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[10px] font-medium text-[#1C1C1C]">My Vanity</p>
                <p className="font-sans text-[7.5px] text-[#8A8070] mt-0.5">14 products curated · Open drawer</p>
              </div>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="#C8B06A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1L5 5L1 9" />
              </svg>
            </button>

            <p className="font-cormorant italic text-[11px] text-[#8A8070] text-center pt-1 pb-1">
              Member of {CIRCLES.length} Beauty Circles ✦
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Distinction Card ──────────────────────────────────────────────────────────

function DistinctionCard({ d }: { d: Distinction }) {
  return (
    <div className="card-pearl rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center"
      style={{ opacity: d.earned ? 1 : 0.42 }}>

      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{
          background: d.earned ? `${d.accent}18` : "rgba(138,128,112,0.08)",
          border:     d.earned ? `1px solid ${d.accent}38` : "1px solid rgba(138,128,112,0.15)",
          boxShadow:  d.earned ? `0 0 12px ${d.accent}25` : "none",
        }}>
        {d.earned
          ? <span className="text-xl leading-none">{d.icon}</span>
          : (
            <svg width="11" height="13" viewBox="0 0 11 13" fill="none" stroke="#8A8070" strokeWidth="1.1" strokeLinecap="round">
              <rect x="1" y="5.5" width="9" height="6.5" rx="1.5" />
              <path d="M3.5 5.5V3.5C3.5 2.1 4.1 1 5.5 1C6.9 1 7.5 2.1 7.5 3.5V5.5" />
            </svg>
          )
        }
      </div>

      <p className="font-sans text-[7px] font-medium leading-tight"
        style={{ color: d.earned ? "#1C1C1C" : "#8A8070" }}>
        {d.label}
      </p>

      {d.earned && d.earnedAt && (
        <p className="font-sans text-[6px] tracking-wide" style={{ color: d.accent }}>{d.earnedAt}</p>
      )}
      {!d.earned && (
        <p className="font-sans text-[6px] text-[#8A8070] leading-snug opacity-80">{d.desc}</p>
      )}
    </div>
  );
}
