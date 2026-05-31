"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; }

// ─── Types ───────────────────────────────────────────────────────────────────

type PostType    = "review" | "before-after" | "shelfie" | "ritual" | "ask";
type FeedMode    = "muse" | "recent" | "circle";
type Distinction = "gem" | "glow" | "ritual" | "trend" | "local";

interface Post {
  id:           string;
  type:         PostType;
  author:       string;
  initials:     string;
  avatarHex:    string;
  distinction?: Distinction;
  mst:          number;
  adores:       number;
  whispers:     number;
  timeAgo:      string;
  brandReply?:  string;
  // review
  product?:     string;
  brand?:       string;
  rating?:      number;
  text?:        string;
  productHex?:  string;
  shadeHex?:    string;
  shadeName?:   string;
  // before-after
  beforeHex?:   string;
  afterHex?:    string;
  afterText?:   string;
  // shelfie
  productCount?: number;
  shelfHexes?:  string[];
  // ritual
  ritualType?:  "morning" | "evening";
  stepCount?:   number;
  steps?:       string[];
  // ask
  question?:    string;
  votes?:       number;
}

interface CardProps {
  post:      Post;
  adored:    boolean;
  collected: boolean;
  onAdore:   () => void;
  onCollect: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISTINCTIONS: Record<Distinction, { icon: string; label: string }> = {
  gem:    { icon: "💎", label: "Gem Collector" },
  glow:   { icon: "✦",  label: "Glow Authority" },
  ritual: { icon: "🌿", label: "Ritual Expert" },
  trend:  { icon: "🔥", label: "Trendsetter" },
  local:  { icon: "◯",  label: "Local Advocate" },
};

// Monk Skin Tone Scale (MST 1–10)
const MST = [
  "#F6EDE4", "#F3E0CF", "#F0D4B0", "#E8C89A",
  "#D4A870", "#B88A50", "#9B6E3C", "#7A4A28",
  "#5C3320", "#3B2010",
];

const FEED_MODES: { id: FeedMode; icon: string; label: string }[] = [
  { id: "muse",   icon: "✦", label: "Muse-Curated" },
  { id: "recent", icon: "◇", label: "Recent" },
  { id: "circle", icon: "○", label: "My Circle" },
];

const POST_TYPES = [
  { id: "review",       icon: "◈", label: "Product Review",  desc: "Share your experience" },
  { id: "before-after", icon: "◇", label: "Before & After",  desc: "Show your transformation" },
  { id: "shelfie",      icon: "⊞", label: "Shelfie",         desc: "Your vanity, unveiled" },
  { id: "ritual",       icon: "🌿", label: "Ritual Diary",    desc: "Your daily ritual" },
  { id: "ask",          icon: "✦", label: "Ask The Circle",  desc: "Ask for recommendations" },
];

// ─── Seed Data ────────────────────────────────────────────────────────────────

const POSTS: Post[] = [
  {
    id: "1", type: "review",
    author: "Amélie D.", initials: "AD", avatarHex: "#D4A888",
    distinction: "glow", mst: 4,
    product: "Charlotte Tilbury Pillow Talk Lipstick", brand: "Charlotte Tilbury",
    rating: 5, shadeHex: "#BC8F8F", shadeName: "Pillow Talk",
    productHex: "#C4968A",
    text: "My signature shade for three years. The formula whispers colour without drying. I adore this more every time I reach for it.",
    adores: 284, whispers: 42, timeAgo: "2h",
    brandReply: "Charlotte Tilbury",
  },
  {
    id: "2", type: "before-after",
    author: "Sophie M.", initials: "SM", avatarHex: "#C8A080",
    distinction: "ritual", mst: 5,
    product: "La Mer Crème de la Mer", brand: "La Mer",
    beforeHex: "#C8B4A0", afterHex: "#EAE0D4",
    afterText: "30 days · visibly plumped, deeply nourished",
    adores: 512, whispers: 88, timeAgo: "5h",
  },
  {
    id: "3", type: "shelfie",
    author: "Isabelle R.", initials: "IR", avatarHex: "#A07850",
    distinction: "gem", mst: 6,
    productCount: 9,
    shelfHexes: ["#C4968A","#E8D898","#A8C890","#C8B06A","#BC8F8F","#D4C0B0","#8A9070","#C0D8B0","#E0C8A8"],
    adores: 741, whispers: 63, timeAgo: "1d",
  },
  {
    id: "4", type: "ask",
    author: "Claire L.", initials: "CL", avatarHex: "#E0C0A0",
    mst: 3,
    question: "Which SPF doesn't pill under Charlotte Tilbury foundation? I've tried three and they all ball up 😭",
    votes: 34, whispers: 67, adores: 89, timeAgo: "3h",
  },
  {
    id: "5", type: "ritual",
    author: "Nadège T.", initials: "NT", avatarHex: "#825C43",
    distinction: "ritual", mst: 8,
    ritualType: "morning", stepCount: 6,
    steps: ["Tatcha Rice Wash", "Sulwhasoo First Care Serum", "La Mer Eye Concentrate", "Chanel UV Essentiel SPF 50", "Charlotte Tilbury Light Wonder", "Rare Beauty Blush"],
    adores: 198, whispers: 31, timeAgo: "8h",
  },
  {
    id: "6", type: "review",
    author: "Fatima A.", initials: "FA", avatarHex: "#604134",
    distinction: "local", mst: 9,
    product: "Tatcha The Dewy Skin Cream", brand: "Tatcha",
    rating: 5, shadeHex: "#A8C890", shadeName: "N/A",
    productHex: "#D8E8D0",
    text: "After one week, colleagues asked what I had done. The answer? Just this jar, faithfully, every morning.",
    adores: 367, whispers: 54, timeAgo: "1d",
  },
  {
    id: "7", type: "before-after",
    author: "Léa B.", initials: "LB", avatarHex: "#E8C0B0",
    mst: 2,
    product: "Sulwhasoo First Care Activating Serum", brand: "Sulwhasoo",
    beforeHex: "#C8B8A8", afterHex: "#EAE0D0",
    afterText: "14 days · texture refined, glow restored",
    adores: 423, whispers: 77, timeAgo: "2d",
  },
  {
    id: "8", type: "ask",
    author: "Priya S.", initials: "PS", avatarHex: "#9B6E4A",
    mst: 7,
    question: "Best dupe for La Mer? Willing to spend up to €80 but €900 is… a lot 😅",
    votes: 112, whispers: 203, adores: 445, timeAgo: "6h",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReviewsScreen({ onBack }: Props) {
  const [feedMode,    setFeedMode]    = useState<FeedMode>("muse");
  const [activeMST,   setActiveMST]   = useState<number | null>(null);
  const [adoredIds,   setAdoredIds]   = useState<Set<string>>(new Set());
  const [collectedIds,setCollectedIds]= useState<Set<string>>(new Set());
  const [writeOpen,   setWriteOpen]   = useState(false);

  const { showToast } = useToast();

  const toggleAdore = (id: string) => {
    setAdoredIds(s => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); }
      else           { n.add(id); showToast("Adored ✦", "💎"); }
      return n;
    });
  };
  const toggleCollect = (id: string) => {
    setCollectedIds(s => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); }
      else           { n.add(id); showToast("Added to Vanity ✦", "✦"); }
      return n;
    });
  };

  const filtered = activeMST
    ? POSTS.filter(p => Math.abs(p.mst - activeMST) <= 1)
    : POSTS;

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">Community</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">The Atelier</h2>
        </div>
        <button onClick={() => setWriteOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(11,60,38,0.06)]"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <span className="font-sans text-[10px] text-[#0B3C26]">✦</span>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-3" />

      {/* Feed Mode Tabs */}
      <div className="flex mx-5 mb-3 rounded-2xl overflow-hidden flex-shrink-0"
        style={{ border: "1px solid rgba(200,176,106,0.2)", background: "rgba(200,176,106,0.04)" }}>
        {FEED_MODES.map((mode, i) => (
          <button key={mode.id}
            onClick={() => setFeedMode(mode.id)}
            className="flex-1 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
            style={{
              background: feedMode === mode.id ? "rgba(11,60,38,0.08)" : "transparent",
              borderRight: i < 2 ? "1px solid rgba(200,176,106,0.15)" : "none",
            }}>
            <span className="text-[9px]" style={{ color: feedMode === mode.id ? "#0B3C26" : "#C8B06A" }}>
              {mode.icon}
            </span>
            <span className="font-sans text-[8px] tracking-[0.08em] uppercase"
              style={{ color: feedMode === mode.id ? "#0B3C26" : "rgba(11,60,38,0.4)" }}>
              {mode.label}
            </span>
          </button>
        ))}
      </div>

      {/* Monk Skin Tone Filter */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center gap-2 px-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <span className="font-sans text-[8px] uppercase tracking-[0.14em] text-[#8A8070] flex-shrink-0 opacity-60">
            Tone
          </span>
          {MST.map((hex, i) => (
            <button key={i}
              onClick={() => setActiveMST(activeMST === i + 1 ? null : i + 1)}
              className="flex-shrink-0 rounded-full cursor-pointer transition-all duration-200"
              style={{
                width: "22px", height: "22px",
                background: hex,
                border: activeMST === i + 1 ? "2.5px solid #0B3C26" : "1.5px solid rgba(11,60,38,0.1)",
                transform: activeMST === i + 1 ? "scale(1.22)" : "scale(1)",
                boxShadow: activeMST === i + 1 ? "0 2px 8px rgba(11,60,38,0.2)" : "none",
              }} />
          ))}
          {activeMST && (
            <button onClick={() => setActiveMST(null)}
              className="flex-shrink-0 font-sans text-[9px] text-[#C4968A] cursor-pointer ml-1 opacity-70 hover:opacity-100">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-cormorant text-xl italic text-[#8A8070]">No posts for this tone yet</p>
            <p className="font-sans text-[10px] text-[#C8B06A] mt-2 tracking-wide">Be the first to share ✦</p>
          </div>
        ) : filtered.map(post => {
          const props: CardProps = {
            post,
            adored:    adoredIds.has(post.id),
            collected: collectedIds.has(post.id),
            onAdore:   () => toggleAdore(post.id),
            onCollect: () => toggleCollect(post.id),
          };
          return (
            <div key={post.id}>
              {post.type === "review"       && <ReviewCard       {...props} />}
              {post.type === "before-after" && <BeforeAfterCard  {...props} />}
              {post.type === "shelfie"      && <ShelfieCard      {...props} />}
              {post.type === "ritual"       && <RitualCard       {...props} />}
              {post.type === "ask"          && <AskCard          {...props} />}
            </div>
          );
        })}
      </div>

      {/* Write Post Sheet */}
      {writeOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setWriteOpen(false)}>
          <div className="absolute inset-0"
            style={{ background: "rgba(11,60,38,0.28)", backdropFilter: "blur(4px)" }} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl px-5 pt-5 pb-10"
            style={{ background: "rgba(250,246,239,0.98)", border: "1px solid rgba(200,176,106,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">
                  Share with The Circle
                </p>
                <h3 className="font-serif text-xl font-normal text-[#1C1C1C]">What will you share?</h3>
              </div>
              <button onClick={() => setWriteOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
                <span className="text-[#0B3C26] text-sm opacity-40">✕</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {POST_TYPES.map(pt => (
                <button key={pt.id}
                  onClick={() => setWriteOpen(false)}
                  className="card-pearl rounded-2xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer group hover:border-[rgba(11,60,38,0.3)] transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(200,176,106,0.1)", border: "1px solid rgba(200,176,106,0.2)" }}>
                    <span className="text-sm text-[#C8B06A]">{pt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-serif text-base text-[#1C1C1C]">{pt.label}</p>
                    <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">{pt.desc}</p>
                  </div>
                  <span className="font-sans text-[10px] text-[#C8B06A] opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared: Author Row ───────────────────────────────────────────────────────

function AuthorRow({ post }: { post: Post }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-sans text-[9px] font-medium text-white"
          style={{ background: post.avatarHex, border: "1.5px solid rgba(200,176,106,0.3)" }}>
          {post.initials}
        </div>
        {post.distinction && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full flex items-center justify-center"
            style={{ background: "#FAF7F2", border: "1px solid rgba(200,176,106,0.35)", fontSize: "7px" }}>
            {DISTINCTIONS[post.distinction].icon}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-sans text-[10px] font-medium text-[#1C1C1C] truncate">{post.author}</p>
          {post.distinction && (
            <span className="font-sans text-[8px] text-[#8A8070] opacity-60 hidden">
              {DISTINCTIONS[post.distinction].label}
            </span>
          )}
        </div>
        <p className="font-sans text-[8px] text-[#8A8070]">{post.timeAgo} ago</p>
      </div>
    </div>
  );
}

// ─── Shared: Action Bar (Adore · Whisper · Collect) ──────────────────────────

function ActionBar({ post, adored, collected, onAdore, onCollect }: CardProps) {
  return (
    <div className="flex items-center gap-4 pt-3 mt-1"
      style={{ borderTop: "1px solid rgba(200,176,106,0.12)" }}>
      <button onClick={onAdore}
        className="flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95">
        <span className="text-base" style={{ color: adored ? "#C4968A" : "rgba(11,60,38,0.35)" }}>
          {adored ? "💎" : "◇"}
        </span>
        <span className="font-sans text-[9px]" style={{ color: adored ? "#C4968A" : "rgba(11,60,38,0.45)" }}>
          {adored ? post.adores + 1 : post.adores} Adore
        </span>
      </button>

      <button className="flex items-center gap-1.5 cursor-pointer opacity-40 hover:opacity-70 transition-opacity">
        <span className="text-sm text-[#0B3C26]">✦</span>
        <span className="font-sans text-[9px] text-[#0B3C26]">{post.whispers} Whisper</span>
      </button>

      <button onClick={onCollect}
        className="flex items-center gap-1.5 cursor-pointer transition-all duration-200 ml-auto active:scale-95">
        <span className="text-sm" style={{ color: collected ? "#C8B06A" : "rgba(11,60,38,0.35)" }}>
          {collected ? "✦" : "○"}
        </span>
        <span className="font-sans text-[9px]" style={{ color: collected ? "#C8B06A" : "rgba(11,60,38,0.45)" }}>
          Collect
        </span>
      </button>
    </div>
  );
}

// ─── Card: Product Review ─────────────────────────────────────────────────────

function ReviewCard({ post, adored, collected, onAdore, onCollect }: CardProps) {
  return (
    <div className="card-pearl rounded-2xl overflow-hidden">
      {/* Product strip */}
      <div className="h-20 relative"
        style={{ background: `linear-gradient(145deg, ${post.productHex ?? "#C8B06A"}, rgba(200,176,106,0.3))` }}>
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          {post.shadeHex && (
            <div className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ background: post.shadeHex, border: "2px solid rgba(255,255,255,0.6)" }} />
          )}
          <div>
            <p className="font-sans text-[7px] text-white/70 tracking-[0.12em] uppercase">{post.brand}</p>
            {post.shadeName && post.shadeName !== "N/A" && (
              <p className="font-sans text-[9px] text-white/90 font-medium">{post.shadeName}</p>
            )}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-[2px]"
              style={{ background: i < (post.rating ?? 0) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
        <div className="absolute top-2 right-3">
          <span className="font-sans text-[7px] tracking-[0.12em] uppercase text-white/50">Review</span>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <AuthorRow post={post} />
        <p className="font-sans text-[9px] text-[#8A8070] tracking-[0.06em] uppercase mb-2 truncate">
          {post.product}
        </p>
        <p className="font-cormorant text-[15px] italic text-[#5A5040] leading-relaxed mb-3">
          &ldquo;{post.text}&rdquo;
        </p>
        {post.brandReply && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl mb-2"
            style={{ background: "rgba(200,176,106,0.07)", border: "1px solid rgba(200,176,106,0.18)" }}>
            <span className="text-[9px] text-[#C8B06A]">✦</span>
            <p className="font-sans text-[8px] text-[#8A8070] tracking-wide">
              <span className="text-[#C8B06A] font-medium">The House</span>
              <span className="opacity-60"> · {post.brandReply} replied</span>
            </p>
          </div>
        )}
        <ActionBar post={post} adored={adored} collected={collected} onAdore={onAdore} onCollect={onCollect} />
      </div>
    </div>
  );
}

// ─── Card: Before & After ─────────────────────────────────────────────────────

function BeforeAfterCard({ post, adored, collected, onAdore, onCollect }: CardProps) {
  return (
    <div className="card-pearl rounded-2xl overflow-hidden">
      <div className="h-32 flex relative">
        {/* Before */}
        <div className="flex-1 relative" style={{ background: post.beforeHex ?? "#C8B8A8" }}>
          <div className="absolute top-2 left-3">
            <span className="font-sans text-[7px] tracking-[0.15em] uppercase text-white/60">Before</span>
          </div>
        </div>
        {/* Gold divider + arrow */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(200,176,106,0.85), transparent)" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(200,176,106,0.95)", boxShadow: "0 2px 10px rgba(11,60,38,0.25)" }}>
          <span className="font-sans text-[8px] text-white font-medium">→</span>
        </div>
        {/* After */}
        <div className="flex-1 relative" style={{ background: post.afterHex ?? "#EAE0D0" }}>
          <div className="absolute top-2 right-3">
            <span className="font-sans text-[7px] tracking-[0.15em] uppercase text-white/60">After</span>
          </div>
        </div>
        {/* Caption overlay */}
        {post.afterText && (
          <div className="absolute bottom-0 left-0 right-0 py-2 px-4 text-center"
            style={{ background: "linear-gradient(to top, rgba(11,60,38,0.35), transparent)" }}>
            <p className="font-sans text-[8px] text-white/85 tracking-wide">{post.afterText}</p>
          </div>
        )}
        <div className="absolute top-2 right-3">
          <span className="font-sans text-[7px] tracking-[0.12em] uppercase text-white/40">Before & After</span>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <AuthorRow post={post} />
        <p className="font-sans text-[9px] text-[#8A8070] tracking-[0.06em] uppercase mb-2 truncate">{post.product}</p>
        <ActionBar post={post} adored={adored} collected={collected} onAdore={onAdore} onCollect={onCollect} />
      </div>
    </div>
  );
}

// ─── Card: Shelfie ────────────────────────────────────────────────────────────

function ShelfieCard({ post, adored, collected, onAdore, onCollect }: CardProps) {
  return (
    <div className="card-pearl rounded-2xl overflow-hidden">
      {/* Swatch grid */}
      <div className="p-3 relative"
        style={{ background: "linear-gradient(135deg, rgba(250,246,239,1), rgba(240,232,204,0.4))" }}>
        <div className="grid grid-cols-5 gap-1.5">
          {(post.shelfHexes ?? []).slice(0, 10).map((hex, i) => (
            <div key={i}
              className="rounded-lg"
              style={{ height: "28px", background: hex, border: "1px solid rgba(200,176,106,0.2)" }} />
          ))}
        </div>
        <div className="absolute top-2.5 right-3 flex items-center gap-1">
          <span className="font-sans text-[7px] tracking-[0.12em] uppercase text-[#C8B06A]">
            {post.productCount} products
          </span>
          <span className="text-[8px] text-[#C8B06A]">✦</span>
        </div>
        <div className="absolute top-2 left-3">
          <span className="font-sans text-[7px] tracking-[0.12em] uppercase text-[#8A8070]/50">Shelfie</span>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <AuthorRow post={post} />
        <p className="font-cormorant text-base italic text-[#8A8070] mb-1">
          My spring edit ✦
        </p>
        <ActionBar post={post} adored={adored} collected={collected} onAdore={onAdore} onCollect={onCollect} />
      </div>
    </div>
  );
}

// ─── Card: Ritual Diary ───────────────────────────────────────────────────────

function RitualCard({ post, adored, collected, onAdore, onCollect }: CardProps) {
  const isMorning = post.ritualType === "morning";
  return (
    <div className="card-pearl rounded-2xl overflow-hidden">
      {/* Ritual header band */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{
          background: isMorning
            ? "linear-gradient(90deg, rgba(240,232,204,0.5), rgba(200,176,106,0.08))"
            : "linear-gradient(90deg, rgba(11,60,38,0.06), rgba(11,60,38,0.02))",
        }}>
        <span className="text-base">{isMorning ? "☀️" : "🌙"}</span>
        <p className="font-sans text-[8px] tracking-[0.2em] uppercase"
          style={{ color: isMorning ? "#C8B06A" : "#0B3C26" }}>
          {isMorning ? "Morning Ritual" : "Evening Ritual"} · {post.stepCount} steps
        </p>
      </div>

      <div className="px-4 pt-3 pb-4">
        <AuthorRow post={post} />
        <div className="flex flex-col gap-2 mb-3">
          {(post.steps ?? []).slice(0, 4).map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200,176,106,0.12)", border: "1px solid rgba(200,176,106,0.25)" }}>
                <span className="font-sans text-[7px] text-[#C8B06A]">{i + 1}</span>
              </div>
              <p className="font-sans text-[10px] text-[#5A5040]">{step}</p>
            </div>
          ))}
          {(post.steps?.length ?? 0) > 4 && (
            <p className="font-sans text-[9px] text-[#C8B06A] opacity-70 pl-6.5">
              +{(post.steps?.length ?? 0) - 4} more steps
            </p>
          )}
        </div>
        <ActionBar post={post} adored={adored} collected={collected} onAdore={onAdore} onCollect={onCollect} />
      </div>
    </div>
  );
}

// ─── Card: Ask The Circle ─────────────────────────────────────────────────────

function AskCard({ post, adored, collected, onAdore, onCollect }: CardProps) {
  return (
    <div className="card-pearl rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-4">
        {/* Question */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: "rgba(200,176,106,0.1)", border: "1px solid rgba(200,176,106,0.25)" }}>
            <span className="text-[#C8B06A] text-sm">✦</span>
          </div>
          <div className="flex-1">
            <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A] mb-1.5">
              Ask The Circle
            </p>
            <p className="font-serif text-base font-normal text-[#1C1C1C] leading-snug">
              {post.question}
            </p>
          </div>
        </div>

        {/* Author mini row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative w-7 h-7 flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-sans text-[8px] font-medium text-white"
              style={{ background: post.avatarHex }}>
              {post.initials}
            </div>
          </div>
          <p className="font-sans text-[9px] text-[#8A8070]">
            {post.author} · {post.timeAgo} ago
          </p>
        </div>

        {/* Response pill */}
        <div className="rounded-xl px-3 py-2 mb-3 flex items-center gap-2"
          style={{ background: "rgba(11,60,38,0.04)", border: "1px solid rgba(11,60,38,0.06)" }}>
          <span className="text-[8px] text-[#0B3C26] opacity-50">✦</span>
          <p className="font-sans text-[9px] text-[#0B3C26] opacity-55">
            {post.whispers} whispers · {post.votes} voted
          </p>
        </div>

        <ActionBar post={post} adored={adored} collected={collected} onAdore={onAdore} onCollect={onCollect} />
      </div>
    </div>
  );
}
