import { useState, useEffect } from "react";
import { Plus, Search, X, Sparkles, MessageCircle, Bookmark, Share2, Flag, Play } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import StarRating from "@/components/StarRating";
import CommunityComposer from "@/components/CommunityComposer";
import ReviewerLeaderboard from "@/components/ReviewerLeaderboard";
import PollComposer from "@/components/PollComposer";
import PollCard from "@/components/PollCard";
import SwapComposer from "@/components/SwapComposer";
import SwapCard from "@/components/SwapCard";
import ReportModal from "@/components/ReportModal";
import { parseSegments } from "@/utils/richText";
import { createNotification } from "@/utils/notifications";
import BadgePin from "@/components/BadgePin";
import { BADGES, computeNudge } from "@/utils/badgeDefinitions";

const FEED_MODES = [
  { key: "trending",  label: "Trending" },
  { key: "following", label: "Following" },
  { key: "curated",   label: "✦ Curated" },
];

const BEAUTY_ROOMS = [
  { key: "skin_rituals", label: "Skin Rituals",    glyph: "✦", color: "#C8A96E" },
  { key: "bold_colour",  label: "Bold Colour",     glyph: "◆", color: "#BC4A6A" },
  { key: "clean_beauty", label: "Clean Beauty",    glyph: "◉", color: "#3D7A5A" },
  { key: "vintage_glam", label: "Vintage Glamour", glyph: "◈", color: "#7A4E7A" },
  { key: "natural_glow", label: "Natural Glow",    glyph: "◇", color: "#C47B3A" },
  { key: "minimalist",   label: "Minimalist",      glyph: "○", color: "#043927" },
];

const ROOM_ARCHETYPES = {
  skin_rituals: { archetype: "The Alchemist",  tagline: "Ritual as transformation",  prompt: "What ritual have you been devoted to lately?" },
  bold_colour:  { archetype: "The Icon",       tagline: "Beauty as signature",        prompt: "Which shade is your signature right now?" },
  clean_beauty: { archetype: "The Purist",     tagline: "Clarity above all",          prompt: "What does your cleanest, most essential routine look like?" },
  vintage_glam: { archetype: "The Archivist",  tagline: "Beauty through time",        prompt: "What beauty secret deserves to be remembered?" },
  natural_glow: { archetype: "The Oracle",     tagline: "Intuition, illuminated",     prompt: "What has your skin been telling you lately?" },
  minimalist:   { archetype: "The Engineer",   tagline: "Precision is elegance",      prompt: "Which single product carries the whole routine?" },
};

function TrustBadge({ post }) {
  const isCertified = Boolean(post.product_id);
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[8px] tracking-[0.1em] font-light px-1.5 py-0.5 rounded-full border ${
        isCertified
          ? "text-[#043927] border-[#043927]/18 bg-[#043927]/5"
          : "text-[#043927]/38 border-[#E5E4E2] bg-transparent"
      }`}
    >
      {isCertified ? "Certified Review" : "Community Voice"}
    </span>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [composingPoll, setComposingPoll] = useState(false);
  const [composingSwap, setComposingSwap] = useState(false);
  const [polls, setPolls] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [feedMode, setFeedMode] = useState("trending");
  const [circleIds, setCircleIds] = useState(null);
  const [circleLoading, setCircleLoading] = useState(false);
  const [activeCircle, setActiveCircle] = useState(null);
  const [adoredIds, setAdoredIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_adored") || "[]")); }
    catch { return new Set(); }
  });
  const [collectedIds, setCollectedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_collected") || "[]")); }
    catch { return new Set(); }
  });
  const [reportingPostId, setReportingPostId] = useState(null);
  const [creatorBadges, setCreatorBadges] = useState({});
  const [nudge, setNudge] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [creatorNudge, setCreatorNudge] = useState({});
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [events, setEvents] = useState([]);
  const [showEventRsvp, setShowEventRsvp] = useState(false);

  const FAMILY_PRIORITY = { influence: 5, experience: 4, rituals: 3, self_connection: 2, foundations: 1 };

  const formatEventDate = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00");
    return {
      day: d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
    };
  };

  const loadCreatorBadges = async (posts) => {
    const ids = [...new Set(posts.map(p => p.created_by_id).filter(Boolean))];
    if (!ids.length) return;
    try {
      const [all, allStats] = await Promise.all([
        base44.entities.UserBadge.list("-created_date", 500),
        base44.entities.UserStat.list("-created_date", 200),
      ]);
      const statByUser = {};
      allStats.forEach(s => { statByUser[s.user_id] = s.total_adores || 0; });
      const byUser = {};
      all.forEach(ub => {
        if (!ids.includes(ub.user_id)) return;
        if (!byUser[ub.user_id]) byUser[ub.user_id] = new Set();
        byUser[ub.user_id].add(ub.badge_key);
      });
      const result = {};
      ids.forEach(uid => {
        const keys = byUser[uid] || new Set();
        let best = null, bestP = -1, bestIdx = -1;
        BADGES.forEach((badge, idx) => {
          if (!keys.has(badge.key)) return;
          const p = FAMILY_PRIORITY[badge.family] || 0;
          if (p > bestP || (p === bestP && idx > bestIdx)) {
            best = badge; bestP = p; bestIdx = idx;
          }
        });
        if (best) result[uid] = best;
      });
      setCreatorBadges(result);
      const nudgeResult = {};
      ids.forEach(uid => {
        const myKeys = byUser[uid] || new Set();
        const myPosts = posts.filter(p => p.created_by_id === uid);
        const n = computeNudge(myPosts, myKeys, statByUser[uid] || 0);
        if (n) nudgeResult[uid] = n;
      });
      setCreatorNudge(nudgeResult);
    } catch {}
  };

  const load = async () => {
    const [list, pollList, swapList, bannerList, eventList] = await Promise.all([
      base44.entities.CommunityPost.list("-created_date", 50),
      base44.entities.Poll.list("-created_date", 20),
      base44.entities.Swap.list("-created_date", 30),
      base44.entities.HeroBanner.list("display_order", 10),
      base44.entities.CommunityEvent.list("event_date", 20),
    ]);
    setPosts(list);
    setPolls(pollList);
    setSwaps(swapList);
    const activeBanners = bannerList
      .filter(b => b.active !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setBanners(activeBanners);
    setActiveBanner(0);
    const today = new Date().toISOString().split("T")[0];
    setEvents(
      eventList
        .filter(e => e.active !== false && e.event_date >= today)
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
    );
    setLoading(false);
    loadCreatorBadges(list);
  };

  const loadCircle = async (currentUser) => {
    const u = currentUser || user;
    if (!u) { setCircleIds(new Set()); return; }
    setCircleLoading(true);
    try {
      const msgs = await base44.entities.Message.list("-created_date", 500);
      const ids = new Set(
        msgs
          .map(m => m.sender_id === u.id ? m.recipient_id : m.sender_id)
          .filter(Boolean)
      );
      setCircleIds(ids);
    } catch {
      setCircleIds(new Set());
    } finally {
      setCircleLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
    base44.auth.me().then(u => { setUser(u); }).catch(() => {});
    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!user || !posts.length) return;
    Promise.all([
      base44.entities.UserBadge.list("-created_date", 500),
      base44.entities.UserStat.list("-created_date", 200),
    ])
      .then(([allBadges, allStats]) => {
        const myKeys = new Set(allBadges.filter(ub => ub.user_id === user.id).map(ub => ub.badge_key));
        const myPosts = posts.filter(p => p.created_by_id === user.id);
        const myStat = allStats.find(s => s.user_id === user.id);
        setNudge(computeNudge(myPosts, myKeys, myStat?.total_adores || 0));
      })
      .catch(() => {});
  }, [user?.id, posts.length]);

  const switchMode = (mode) => {
    setFeedMode(mode);
    if (mode === "following" && circleIds === null) {
      loadCircle();
    }
  };

  const toggleAdore = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    const wasAdored = adoredIds.has(post.id);
    setAdoredIds(prev => {
      const next = new Set(prev);
      if (next.has(post.id)) { next.delete(post.id); } else { next.add(post.id); }
      try { localStorage.setItem("muse_adored", JSON.stringify([...next])); } catch {}
      return next;
    });
    const delta = wasAdored ? -1 : 1;
    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, adore_count: Math.max(0, (p.adore_count || 0) + delta) } : p
    ));
    base44.entities.CommunityPost.update(post.id, {
      adore_count: Math.max(0, (post.adore_count || 0) + delta),
    }).catch(() => {});
    if (!wasAdored && user && post.created_by_id && post.created_by_id !== user.id) {
      createNotification({
        user_id: post.created_by_id,
        type: "adore",
        title: (user.full_name || user.email || "A Muse Member") + " adored your review",
        body: post.brand + " " + post.name + (post.shade ? " · " + post.shade : ""),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
    // Update running adore total for the post author
    if (post.created_by_id) {
      base44.entities.UserStat.list("-created_date", 200)
        .then(stats => {
          const existing = stats.find(s => s.user_id === post.created_by_id);
          const newTotal = Math.max(0, (existing?.total_adores || 0) + delta);
          if (existing) {
            return base44.entities.UserStat.update(existing.id, { total_adores: newTotal });
          } else if (delta > 0) {
            return base44.entities.UserStat.create({ user_id: post.created_by_id, total_adores: newTotal });
          }
        })
        .catch(() => {});
    }
  };

  const toggleCollect = (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    const wasCollected = collectedIds.has(post.id);
    setCollectedIds(prev => {
      const next = new Set(prev);
      if (next.has(post.id)) { next.delete(post.id); } else { next.add(post.id); }
      try { localStorage.setItem("muse_collected", JSON.stringify([...next])); } catch {}
      return next;
    });
    const delta = wasCollected ? -1 : 1;
    setPosts(prev => prev.map(p =>
      p.id === post.id ? { ...p, collect_count: Math.max(0, (p.collect_count || 0) + delta) } : p
    ));
    base44.entities.CommunityPost.update(post.id, {
      collect_count: Math.max(0, (post.collect_count || 0) + delta),
    }).catch(() => {});
    if (!wasCollected && user && post.created_by_id && post.created_by_id !== user.id) {
      createNotification({
        user_id: post.created_by_id,
        type: "collect",
        title: (user.full_name || user.email || "A Muse Member") + " saved your review",
        body: post.brand + " " + post.name + (post.shade ? " · " + post.shade : ""),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
  };

  const passAlong = async (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/community/${post.id}`;
    const shareTitle = `${post.brand ? `${post.brand} — ` : ""}${post.name || ""}${post.shade ? ` · ${post.shade}` : ""}`;
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); } catch {}
    navigate("/messages");
  };

  const presentCats = ["All", ...[...new Set(posts.map(p => p.category).filter(Boolean))]];
  const q = query.trim().toLowerCase().replace(/^#/, "");

  const getDisplayPosts = () => {
    let base = posts.filter(p => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      const tagList = p.tags ? (() => { try { return JSON.parse(p.tags); } catch { return []; } })() : [];
      return [...[p.brand, p.name, p.shade, p.review_text, p.author_name], ...tagList]
        .some(f => f && f.toLowerCase().includes(q));
    });

    if (activeCircle) {
      base = base.filter(p => p.circle === activeCircle);
    }

    if (feedMode === "following") {
      if (!circleIds) return [];
      base = base.filter(p => circleIds.has(p.created_by_id));
      return base.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    if (feedMode === "curated") {
      return [...base].sort((a, b) => {
        const scoreA = (a.product_id ? 2 : 0) + (a.review_count || 0);
        const scoreB = (b.product_id ? 2 : 0) + (b.review_count || 0);
        return scoreB - scoreA;
      });
    }

    if (feedMode === "trending") {
      return [...base].sort((a, b) => {
        const scoreA = (a.review_count || 0) * 2 + (adoredIds.has(a.id) ? 3 : 0) + (a.product_id ? 1 : 0);
        const scoreB = (b.review_count || 0) * 2 + (adoredIds.has(b.id) ? 3 : 0) + (b.product_id ? 1 : 0);
        return scoreB - scoreA;
      });
    }

    return base;
  };

  const displayPosts = getDisplayPosts();

  return (
    <div className="min-h-screen bg-[#FDF5E6]">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-[#043927]/40 uppercase font-light">The Circle</p>
          <h1 className="font-serif text-3xl text-[#043927] font-light mt-0.5">Community</h1>
        </div>
        <Link
          to="/circle-rooms"
          className="flex items-center gap-1 text-[11px] text-[#C8B06A] font-light tracking-wide mb-1.5"
        >
          Rooms
          <span className="text-[13px] leading-none">›</span>
        </Link>
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-3 flex items-center gap-2">
        <button
          onClick={() => setComposingSwap(true)}
          className="flex items-center gap-1.5 bg-white/70 border border-[#E5E4E2] text-[#043927] text-xs tracking-[0.12em] font-light px-4 py-2.5 rounded-2xl"
        >
          <Plus size={14} /> Swap
        </button>
        <button
          onClick={() => setComposingPoll(true)}
          className="flex items-center gap-1.5 bg-white/70 border border-[#E5E4E2] text-[#043927] text-xs tracking-[0.12em] font-light px-4 py-2.5 rounded-2xl"
        >
          <Plus size={14} /> Poll
        </button>
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-1.5 text-[#043927] text-xs tracking-[0.12em] font-light px-4 py-2.5 rounded-2xl"
          style={{ background: "linear-gradient(135deg, #C8B06A 0%, #E5D4A0 50%, #C8B06A 100%)" }}
        >
          <Plus size={14} /> Post
        </button>
      </div>

      {/* Search bar */}
      <div className="px-5 mb-3">
        <div className="flex items-center gap-2 bg-white/70 rounded-2xl border border-[#E5E4E2] px-3.5 py-2.5">
          <Search size={15} color="#043927" className="opacity-40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search brands, products, reviews…"
            className="flex-1 bg-transparent text-sm text-[#043927] font-light outline-none placeholder:text-[#043927]/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#043927]/40">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      {banners.length > 0 && (() => {
        const banner = banners[activeBanner];
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-5 mb-4 rounded-2xl overflow-hidden relative"
              style={{ height: "210px" }}
            >
              {banner.image_url ? (
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0B3C26 0%, #1D5438 100%)" }} />
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(11,60,38,0.88) 0%, rgba(11,60,38,0.18) 60%, transparent 100%)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                {banner.tag && (
                  <span
                    className="text-[9px] tracking-[0.25em] uppercase font-light mb-1.5"
                    style={{ color: "#C8B06A" }}
                  >
                    {banner.tag}
                  </span>
                )}
                <p
                  className="text-[22px] font-light text-white leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {banner.title}
                </p>
                {banner.subtitle && (
                  <p className="text-[11px] font-light text-white/65 leading-relaxed mt-1 max-w-[260px]">
                    {banner.subtitle}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  {banner.cta_label ? (
                    <Link
                      to={banner.cta_url || "#"}
                      onClick={(e) => { if (!banner.cta_url) e.preventDefault(); }}
                      className="px-4 py-1.5 rounded-full text-[11px] font-light tracking-wide"
                      style={{ background: "rgba(200,176,106,0.22)", border: "1px solid rgba(200,176,106,0.45)", color: "#C8B06A" }}
                    >
                      {banner.cta_label}
                    </Link>
                  ) : <div />}
                  {banners.length > 1 && (
                    <div className="flex gap-1.5">
                      {banners.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveBanner(i)}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: i === activeBanner ? "14px" : "4px",
                            height: "4px",
                            background: i === activeBanner ? "#C8B06A" : "rgba(255,255,255,0.35)",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })()}

      {/* Feed mode tabs */}
      <div className="px-5 mb-4 flex gap-2">
        {FEED_MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-light tracking-wide transition-all border ${
              feedMode === key
                ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                : "bg-transparent text-[#043927] border-[#E5E4E2]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Badge progress nudge */}
      <AnimatePresence>
        {nudge && !nudgeDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mx-5 mb-3 px-3.5 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: "rgba(200,176,106,0.08)", border: "1px solid rgba(200,176,106,0.22)" }}
          >
            <div className="flex-shrink-0 opacity-70">
              <BadgePin badge={nudge.badge} earned={false} size="xs" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#043927]/45 font-light tracking-wide leading-tight">
                {nudge.target - nudge.current === 1
                  ? `One more ${nudge.label} to unlock`
                  : `${nudge.target - nudge.current} more ${nudge.label} to unlock`}
              </p>
              <p
                className="text-[13px] font-light text-[#043927] leading-tight mt-0.5"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {nudge.badge.label}
              </p>
              <div className="mt-2 h-0.5 rounded-full overflow-hidden bg-[#C8B06A]/15">
                <div
                  className="h-full rounded-full bg-[#C8B06A] transition-all duration-700"
                  style={{ width: `${Math.round(nudge.pct * 100)}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setNudgeDismissed(true)}
              className="flex-shrink-0 text-[#043927]/20 hover:text-[#043927]/40 transition-colors"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beauty Rooms — curated interest communities */}
      <div className="mb-3">
        <div className="px-5 flex items-center justify-between mb-2">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#043927]/40 font-light">Beauty Rooms</p>
          {activeCircle && (
            <button
              onClick={() => setActiveCircle(null)}
              className="text-[9px] tracking-[0.15em] uppercase text-[#C8B06A] font-light"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-5 pb-1">
          {BEAUTY_ROOMS.map(c => {
            const postCount = posts.filter(p => p.circle === c.key).length;
            const isActive = activeCircle === c.key;
            const arch = ROOM_ARCHETYPES[c.key];
            return (
              <button
                key={c.key}
                onClick={() => setActiveCircle(isActive ? null : c.key)}
                className={`flex-shrink-0 flex flex-col items-start px-3.5 py-2 rounded-2xl border transition-all ${
                  isActive
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white/70 text-[#043927] border-[#E5E4E2] hover:border-[#C8B06A]/40"
                }`}
                style={isActive ? { background: c.color } : {}}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">{c.glyph}</span>
                  <span className="text-[11px] font-light tracking-wide">{c.label}</span>
                  {postCount > 0 && (
                    <span className={`text-[8px] ${isActive ? "text-white/70" : "text-[#043927]/35"}`}>
                      {postCount}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-light italic tracking-wide mt-0.5 ${isActive ? "text-white/70" : "text-[#043927]/40"}`}
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {arch?.archetype}
                </span>
              </button>
            );
          })}
        </div>

        {/* Archetype identity strip — visible when a circle is active */}
        {activeCircle && (() => {
          const c = BEAUTY_ROOMS.find(x => x.key === activeCircle);
          const arch = ROOM_ARCHETYPES[activeCircle];
          if (!c || !arch) return null;
          return (
            <div className="mx-5 mt-2 mb-1 px-4 py-2.5 rounded-xl flex items-center justify-between"
              style={{ background: c.color + "18", borderLeft: `3px solid ${c.color}` }}>
              <div>
                <p className="text-[13px] font-light tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#0B3C26" }}>
                  {arch.archetype}
                </p>
                <p className="text-[10px] font-light italic text-[#043927]/50 tracking-wide mt-0.5">{arch.tagline}</p>
              </div>
              <span className="text-[18px] opacity-40">{c.glyph}</span>
            </div>
          );
        })()}
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div className="mb-3">
          <div className="px-5 flex items-center justify-between mb-2">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#043927]/40 font-light">Upcoming Events</p>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
            {events.map(event => {
              const { day, date, month } = formatEventDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-[#E5E4E2] bg-white/70"
                >
                  <div
                    className="px-3 py-2.5 flex items-baseline gap-2.5"
                    style={{ background: "rgba(200,176,106,0.09)" }}
                  >
                    <span
                      className="text-[30px] font-light text-[#043927] leading-none"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {date}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-[#043927]/55 font-light leading-none">
                        {day}
                      </span>
                      <span className="text-[9px] tracking-[0.15em] uppercase font-light leading-none mt-0.5" style={{ color: "#C8B06A" }}>
                        {month}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[12px] font-light text-[#043927] leading-tight line-clamp-2">
                      {event.title}
                    </p>
                    {event.start_time && (
                      <p className="text-[10px] text-[#043927]/45 font-light mt-1 leading-tight">
                        {event.start_time}{event.end_time ? ` — ${event.end_time}` : ""}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-[10px] text-[#043927]/35 font-light mt-0.5 truncate">{event.location}</p>
                    )}
                    {event.cta_label && (
                      <button
                        onClick={e => { e.stopPropagation(); setShowEventRsvp(true); }}
                        className="inline-flex items-center gap-0.5 mt-2 text-[10px] font-light"
                        style={{ color: "#C8B06A" }}
                      >
                        {event.cta_label} ›
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-5 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float"><SwanLogo size={40} color="#C8B06A" /></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <SwanLogo size={56} color="#C8B06A" className="mb-5" />
            <p className="font-serif text-lg text-[#043927]/40 italic leading-relaxed">
              No reviews yet — be the first to share a find.
            </p>
          </div>
        ) : (
          <>
            <ReviewerLeaderboard posts={posts} />

            {feedMode !== "following" && polls.length > 0 && (
              <div className="space-y-3 mb-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#043927]/40 font-light">Active Polls</p>
                {polls.map((poll, i) => (
                  <motion.div key={poll.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <PollCard poll={poll} user={user} onVoted={load} />
                  </motion.div>
                ))}
              </div>
            )}

            {feedMode !== "following" && swaps.length > 0 && (
              <div className="space-y-3 mb-5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#043927]/40 font-light">Open Swaps</p>
                {swaps.map((swap, i) => (
                  <motion.div key={swap.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <SwapCard swap={swap} user={user} onUpdated={load} />
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-1">
              {presentCats.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-light tracking-wide transition-all border ${
                    activeCategory === cat
                      ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                      : "bg-transparent text-[#043927] border-[#E5E4E2]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Following loading */}
            {feedMode === "following" && circleLoading && (
              <div className="flex justify-center py-12">
                <div className="swan-float"><SwanLogo size={36} color="#C8B06A" /></div>
              </div>
            )}

            {/* Following empty */}
            {feedMode === "following" && !circleLoading && circleIds !== null && displayPosts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <SwanLogo size={48} color="#C8B06A" className="mb-4" />
                <p className="font-serif text-base text-[#043927]/40 italic leading-relaxed px-4">
                  No one you follow has posted yet — whisper to a member from any review to connect.
                </p>
              </div>
            )}

            {/* Post list empty state */}
            {!(feedMode === "following" && circleLoading) && displayPosts.length === 0 && feedMode !== "following" && (
              activeCircle && !query ? (() => {
                const c = BEAUTY_ROOMS.find(x => x.key === activeCircle);
                const arch = ROOM_ARCHETYPES[activeCircle];
                if (!c || !arch) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-16 text-center px-8"
                  >
                    <span
                      className="text-5xl mb-5 leading-none"
                      style={{ color: c.color, opacity: 0.18 }}
                    >
                      {c.glyph}
                    </span>
                    <p
                      className="text-[22px] font-light text-[#043927] mb-1.5 leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {arch.archetype}
                    </p>
                    <p className="text-[11px] font-light italic text-[#043927]/40 tracking-[0.12em] mb-6">
                      {arch.tagline}
                    </p>
                    <p className="text-[13px] font-light text-[#043927]/35 leading-relaxed max-w-[240px]">
                      {arch.prompt}
                    </p>
                  </motion.div>
                );
              })() : (
                <div className="flex flex-col items-center py-16 text-center">
                  <SwanLogo size={48} color="#C8B06A" className="mb-4" />
                  <p className="font-serif text-base text-[#043927]/40 italic">
                    {query ? "No reviews match your search" : `Nothing in ${activeCategory} yet`}
                  </p>
                </div>
              )
            )}

            {!(feedMode === "following" && circleLoading) && displayPosts.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={feedMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  {displayPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/community/${post.id}`}
                        className="block bg-white/70 rounded-2xl border border-[#E5E4E2] overflow-hidden"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5EDD8] relative">
                            {post.post_type === "before_after" ? (
                              <div className="w-full h-full flex">
                                {post.image_url && <img src={post.image_url} alt="before" className="w-1/2 h-full object-cover" />}
                                {post.secondary_image_url && <img src={post.secondary_image_url} alt="after" className="w-1/2 h-full object-cover" />}
                                {!post.image_url && !post.secondary_image_url && (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">◑</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-0.5">
                                  <span className="text-[7px] tracking-wide text-white/80 font-light" style={{textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>BEFORE · AFTER</span>
                                </div>
                              </div>
                            ) : post.post_type === "routine" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <SwanLogo size={18} color="#043927" className="opacity-40" />
                                {post.routine_steps && (
                                  <span className="text-[9px] text-[#043927]/50 font-light">
                                    {(() => { try { return JSON.parse(post.routine_steps).length; } catch { return ""; } })()} steps
                                  </span>
                                )}
                              </div>
                            ) : post.post_type === "grwm" ? (
                              <>
                                {post.image_url ? (
                                  <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#043927]/[0.08]">
                                    <Play size={24} color="#043927" className="opacity-40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full bg-[#043927]/60 flex items-center justify-center">
                                    <Play size={9} color="white" fill="white" className="ml-0.5" />
                                  </div>
                                </div>
                                {post.grwm_duration && (
                                  <div className="absolute bottom-1 left-1 bg-[#043927]/70 text-white text-[7px] px-1 py-0.5 rounded font-light">
                                    {post.grwm_duration}
                                  </div>
                                )}
                              </>
                            ) : post.image_url ? (
                              <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><SwanLogo size={22} color="#043927" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] tracking-[0.15em] uppercase text-[#BC8F8F] font-light">{post.brand}</p>
                            <p className="text-sm text-[#043927] font-light truncate">
                              {post.name}{post.shade ? ` · ${post.shade}` : ""}
                            </p>
                            {post.post_type === "swatch" && post.skin_tone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-3.5 h-3.5 rounded-full border border-[#E5E4E2]" style={{ backgroundColor: post.skin_tone }} />
                                <span className="text-[9px] text-[#043927]/40 font-light">Skin tone match</span>
                              </div>
                            )}
                            {post.post_type === "before_after" && (
                              <span className="text-[9px] text-[#043927]/40 font-light">◑ Before &amp; After</span>
                            )}
                            {post.post_type === "grwm" && post.grwm_duration && (
                              <span className="text-[9px] text-[#043927]/40 font-light">{post.grwm_duration} GRWM</span>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <StarRating value={post.rating || 0} readOnly size={12} />
                              <span className="text-[10px] text-[#043927]/40 font-light truncate">
                                by {post.author_name || "A Muse Member"}
                              </span>
                              {creatorBadges[post.created_by_id] && (
                                <span title={creatorBadges[post.created_by_id].label}>
                                  <BadgePin
                                    badge={creatorBadges[post.created_by_id]}
                                    earned
                                    size="nano"
                                  />
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center flex-wrap gap-1">
                              <TrustBadge post={post} />
                              {post.circle && (() => {
                                const cc = BEAUTY_ROOMS.find(c => c.key === post.circle);
                                if (!cc) return null;
                                return (
                                  <span
                                    key="circle-badge"
                                    className="inline-flex items-center gap-0.5 text-[8px] tracking-[0.1em] font-light px-1.5 py-0.5 rounded-full"
                                    style={{ color: cc.color, border: `1px solid ${cc.color}40`, background: cc.color + "12" }}
                                  >
                                    {cc.glyph} {cc.label}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-[#043927]/60 font-light mt-1 line-clamp-2">
                              {parseSegments(post.review_text).map((seg, i) =>
                                seg.type === "tag"
                                  ? <span key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuery("#" + seg.value); }} className="text-[#C8B06A] cursor-pointer">#{seg.value}</span>
                                  : seg.type === "mention"
                                  ? <span key={i} className="text-[#BC8F8F]">@{seg.value}</span>
                                  : <span key={i}>{seg.value}</span>
                              )}
                            </p>
                            {post.tags && (() => {
                              try {
                                const tagList = JSON.parse(post.tags);
                                if (!tagList.length) return null;
                                return (
                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {tagList.slice(0, 4).map(tag => (
                                      <span
                                        key={tag}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuery("#" + tag); }}
                                        className="text-[9px] text-[#C8B06A] font-light cursor-pointer hover:underline"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                );
                              } catch { return null; }
                            })()}
                          </div>
                        </div>

                        {/* Author progress toward next distinction */}
                        {creatorNudge[post.created_by_id] && (
                          <div className="mx-3 mb-2.5 h-px rounded-full overflow-hidden bg-[#C8B06A]/10">
                            <div
                              className="h-full rounded-full bg-[#C8B06A]/50 transition-all duration-700"
                              style={{ width: `${Math.round(creatorNudge[post.created_by_id].pct * 100)}%` }}
                            />
                          </div>
                        )}

                        {/* Interaction row */}
                        <div className="px-3 pb-3 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={(e) => toggleAdore(e, post)}
                              className={`flex items-center gap-1.5 text-[11px] font-light transition-colors ${adoredIds.has(post.id) ? "text-[#C8B06A]" : "text-[#043927]/[0.38]"}`}
                            >
                              <motion.span
                                key={adoredIds.has(post.id) ? `a1-${post.id}` : `a0-${post.id}`}
                                initial={adoredIds.has(post.id) ? { scale: 0.4, rotate: -20 } : { scale: 0.85 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 480, damping: 18 }}
                                style={{ display: "inline-flex" }}
                              >
                                <Sparkles size={13} />
                              </motion.span>
                              {adoredIds.has(post.id) ? "Adored" : "Adore"}
                              {(post.adore_count || 0) > 0 && (
                                <span className="text-[9px] opacity-55">{post.adore_count}</span>
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/community/${post.id}`); }}
                              className="flex items-center gap-1.5 text-[11px] text-[#043927]/38 font-light"
                            >
                              <MessageCircle size={13} />
                              {post.review_count || 0}
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => toggleCollect(e, post)}
                              className={`flex items-center gap-1.5 text-[11px] font-light transition-colors ${collectedIds.has(post.id) ? "text-[#043927]" : "text-[#043927]/[0.38]"}`}
                            >
                              <motion.span
                                key={collectedIds.has(post.id) ? `c1-${post.id}` : `c0-${post.id}`}
                                initial={collectedIds.has(post.id) ? { scale: 0.5, y: 3 } : { scale: 0.88 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 460, damping: 20 }}
                                style={{ display: "inline-flex" }}
                              >
                                <Bookmark size={13} fill={collectedIds.has(post.id) ? "#043927" : "none"} />
                              </motion.span>
                            </button>
                            <button
                              onClick={(e) => passAlong(e, post)}
                              className="flex items-center gap-1.5 text-[11px] text-[#043927]/45 font-light hover:text-[#043927] transition-colors"
                            >
                              <Share2 size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReportingPostId(post.id); }}
                              className="flex items-center text-[#043927]/18 hover:text-[#BC8F8F] transition-colors"
                            >
                              <Flag size={12} />
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>

      {showEventRsvp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C26]/50 backdrop-blur-sm"
          onClick={() => setShowEventRsvp(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative mx-5 w-full max-w-sm bg-[#FFF9E8] rounded-3xl px-8 py-14 flex flex-col items-center text-center"
            style={{ boxShadow: "0 24px 64px rgba(11,60,38,0.22), 0 0 0 1px rgba(200,176,106,0.18)" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowEventRsvp(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#0B3C26]/[0.08] hover:bg-[#0B3C26]/[0.14] transition-colors"
              aria-label="Close"
            >
              <X size={14} color="#0B3C26" />
            </button>
            <div className="mb-8">
              <SwanLogo size={96} className="opacity-90" />
            </div>
            <h1 className="font-serif text-[2rem] leading-tight text-[#0B3C26] font-light tracking-wide mb-3">
              Reservations Coming Soon
            </h1>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#0B3C26] font-light mb-6">
              Coming Soon
            </p>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/60 to-transparent mb-6" />
            <p className="text-[13px] text-[#0B3C26]/45 font-light leading-relaxed max-w-[210px] tracking-wide">
              You'll be able to reserve your place here soon.
            </p>
          </motion.div>
        </div>
      )}
      {composing && <CommunityComposer onClose={() => setComposing(false)} onPosted={load} />}
      {reportingPostId && <ReportModal postId={reportingPostId} onClose={() => setReportingPostId(null)} />}
      {composingPoll && <PollComposer onClose={() => setComposingPoll(false)} onPosted={load} />}
      {composingSwap && <SwapComposer onClose={() => setComposingSwap(false)} onPosted={load} />}
    </div>
  );
}