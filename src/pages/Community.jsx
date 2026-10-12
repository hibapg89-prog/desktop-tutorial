import { useState, useEffect, useRef } from "react";
import { Plus, Search, X, Sparkles, Heart, MessageCircle, Bookmark, Share2, Flag, Play, Trash2 } from "lucide-react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import { Image } from "@/components/ui/image";
import { CategoryGradient } from "@/components/ProductImage";
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
  { key: "curated",   label: "Curated", icon: Sparkles },
];

const COMMUNITY_BANNER_URL = "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/80345aa08_generated_image.png";

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
      className={`inline-flex items-center gap-0.5 text-[0.5rem] tracking-[0.1em] font-light px-1.5 py-0.5 rounded-full border ${
        isCertified
          ? "text-[var(--color-text-primary)] border-[#043927]/18 bg-[#043927]/5"
          : "text-primary-40 border-[var(--color-border)] bg-transparent"
      }`}
    >
      {isCertified ? "Certified Review" : "Community Voice"}
    </span>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [prefillProduct, setPrefillProduct] = useState(null);

  // Detect a product shared from ScanResults — auto-open the composer
  useEffect(() => {
    if (location.state?.prefillProduct) {
      setPrefillProduct(location.state.prefillProduct);
      setComposing(true);
      window.history.replaceState(null, '');
    }
  }, [location.state]);
  const [creatorBadges, setCreatorBadges] = useState({});
  const [nudge, setNudge] = useState(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [creatorNudge, setCreatorNudge] = useState({});
  const [banners, setBanners] = useState([]);
  const [showSwapTeaser, setShowSwapTeaser] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [events, setEvents] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_beauty_rooms") || "[]")); }
    catch { return new Set(); }
  });

  // Pull-to-refresh
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 72;
  const [pullY, setPullY] = useState(0);
  const [ptr, setPtr] = useState(false);

  const FAMILY_PRIORITY = { influence: 5, experience: 4, rituals: 3, self_connection: 2, foundations: 1 };

  const toggleJoinRoom = (key) => {
    setJoinedRooms(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      const arr = [...next];
      localStorage.setItem("muse_beauty_rooms", JSON.stringify(arr));
      base44.auth.updateMe({ beauty_rooms: JSON.stringify(arr) }).catch(() => {});
      return next;
    });
  };

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
      const [badgeArrays, statArrays] = await Promise.all([
        Promise.all(ids.map(uid => base44.entities.UserBadge.filter({ user_id: uid }).catch(() => []))),
        Promise.all(ids.map(uid => base44.entities.UserStat.filter({ user_id: uid }).catch(() => []))),
      ]);
      const all = badgeArrays.flat();
      const allStats = statArrays.flat();
      const statByUser = {};
      allStats.forEach(s => { statByUser[s.user_id] = s.total_adores || 0; });
      const byUser = {};
      all.forEach(ub => {
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
      const follows = await base44.entities.UserFollow.filter({ follower_id: u.id });
      const ids = new Set(
        Array.isArray(follows) ? follows.map(f => f.followed_id).filter(Boolean) : []
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
      base44.entities.UserBadge.filter({ user_id: user.id }),
      base44.entities.UserStat.filter({ user_id: user.id }),
    ])
      .then(([allBadges, allStats]) => {
        const myKeys = new Set(allBadges.map(ub => ub.badge_key));
        const myPosts = posts.filter(p => p.created_by_id === user.id);
        const myStat = allStats[0];
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
        title: (user.full_name || user.email || "A Muse Member") + " adored your musing",
        body: post.brand ? post.brand + " " + post.name + (post.shade ? " · " + post.shade : "") : (post.review_text || "").slice(0, 80),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
    // Update running adore total for the post author
    if (post.created_by_id) {
      base44.entities.UserStat.filter({ user_id: post.created_by_id })
        .then(stats => {
          const existing = stats[0];
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
        title: (user.full_name || user.email || "A Muse Member") + " saved your musing",
        body: post.brand ? post.brand + " " + post.name + (post.shade ? " · " + post.shade : "") : (post.review_text || "").slice(0, 80),
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

  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await base44.entities.CommunityPost.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeletingPostId(null);
    } catch {}
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
      const decay = h => 1 / (1 + h / 48);
      return [...base].sort((a, b) => {
        const ageA = (Date.now() - new Date(a.created_date).getTime()) / 36e5;
        const ageB = (Date.now() - new Date(b.created_date).getTime()) / 36e5;
        const scoreA = ((a.review_count || 0) * 2 + (adoredIds.has(a.id) ? 3 : 0) + (a.product_id ? 1 : 0)) * decay(ageA);
        const scoreB = ((b.review_count || 0) * 2 + (adoredIds.has(b.id) ? 3 : 0) + (b.product_id ? 1 : 0)) * decay(ageB);
        return scoreB - scoreA;
      });
    }

    return base;
  };

  const displayPosts = getDisplayPosts();

  return (
    <main
      className="min-h-screen bg-[var(--color-bg)] overflow-x-hidden"
      onTouchStart={e => { touchStartY.current = e.touches[0].clientY; }}
      onTouchMove={e => {
        if (window.scrollY > 0 || ptr) return;
        const d = e.touches[0].clientY - touchStartY.current;
        if (d > 0) setPullY(Math.min(d * 0.45, PULL_THRESHOLD * 1.3));
      }}
      onTouchEnd={async () => {
        if (pullY >= PULL_THRESHOLD) {
          setPtr(true);
          await load();
          setPtr(false);
          setPullY(0);
        } else {
          setPullY(0);
        }
      }}
    >
      {/* ── Pull-to-refresh Swan indicator ─────────────────────────────── */}
      <AnimatePresence>
        {(pullY > 12 || ptr) && (
          <motion.div
            className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="mt-12 w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shadow-sm"
              animate={{ scale: ptr ? 1 : Math.min(pullY / PULL_THRESHOLD, 1) }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <motion.div
                animate={ptr ? { rotate: 360 } : {}}
                transition={ptr ? { duration: 0.9, repeat: Infinity, ease: "linear" } : {}}
              >
                <SwanLogo size={20} color="var(--color-accent-gold)" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Community header — framed banner block ─────────────────────── */}
      <div className="px-5 pt-14 pb-4">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: "1px solid rgba(200,176,106,0.45)" }}
        >
          {/* Top bar — title + action buttons */}
          <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3" style={{ background: "#F8F3E6" }}>
            <div className="flex-shrink-0">
              <p className="text-[0.625rem] tracking-[0.35em] text-primary-40 uppercase font-light">Community</p>
              <h1 className="font-serif text-2xl text-[#1C2E24] font-light mt-0.5 leading-tight flex items-baseline gap-2">
                Community
                {posts.length > 0 && (
                  <span className="text-sm font-light text-primary-40 italic">{posts.length}</span>
                )}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSwapTeaser(true)}
                  className="relative flex items-center gap-0.5 bg-white border border-[#D3CDBE] text-[#1C2E24]/50 text-[0.6875rem] tracking-[0.1em] font-light px-2.5 py-1.5 rounded-full whitespace-nowrap"
                >
                  <Plus size={11} /> Swap
                  <span className="absolute -top-2 -right-1 text-[7px] tracking-[0.06em] uppercase bg-[#C8B06A] text-white px-1 py-0.5 rounded-full font-light leading-none">
                    soon
                  </span>
                </button>
                <button
                  onClick={() => setComposingPoll(true)}
                  className="flex items-center gap-0.5 bg-white border border-[#D3CDBE] text-[#1C2E24] text-[0.6875rem] tracking-[0.1em] font-light px-2.5 py-1.5 rounded-full whitespace-nowrap"
                >
                  <Plus size={11} /> Poll
                </button>
                <button
                  onClick={() => setComposing(true)}
                  className="flex items-center gap-0.5 text-[#1C2E24] text-[0.6875rem] tracking-[0.1em] font-medium px-2.5 py-1.5 rounded-full whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #C4B47B 0%, #DED098 100%)" }}
                >
                  <Plus size={11} /> Musing
                </button>
              </div>
              <Link
                to="/circle-rooms"
                className="inline-flex items-center gap-1 text-[0.6875rem] text-[#1C2E24] font-light tracking-wide"
              >
                Beauty rooms
                <span className="text-[0.8125rem] leading-none">›</span>
              </Link>
            </div>
          </div>

          {/* Banner image with overlaid search + filter pills */}
          <div className="relative" style={{ height: "230px" }}>
            <Image
              src={COMMUNITY_BANNER_URL}
              alt="Community — luxury beauty flat-lay"
              fittingType="fill"
              className="w-full h-full"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-5">
              {/* Search bar */}
              <div className="w-full max-w-[320px] flex items-center gap-2 bg-white rounded-full border border-[#D3CDBE] px-4 py-2.5 shadow-sm">
                <Search size={15} color="#9C9482" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search brands, products, reviews..."
                  aria-label="Search brands, products, reviews"
                  className="flex-1 bg-transparent text-sm text-[#1C2E24] font-light outline-none placeholder:text-[#9C9482]"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear search" className="text-[#9C9482]">
                    <X size={14} aria-hidden={true} />
                  </button>
                )}
              </div>
              {/* Filter pills */}
              <div className="flex gap-2 mt-3">
                {FEED_MODES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={`flex items-center gap-1 flex-shrink-0 px-4 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide transition-all border ${
                      feedMode === key
                        ? "bg-[#0B3828] text-white border-[#0B3828]"
                        : "bg-white text-[#1C2E24] border-[#D3CDBE]"
                    }`}
                  >
                    {Icon && <Icon size={11} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
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
              <p className="text-[0.625rem] text-primary-45 font-light tracking-wide leading-tight">
                {nudge.target - nudge.current === 1
                  ? `One more ${nudge.label} to unlock`
                  : `${nudge.target - nudge.current} more ${nudge.label} to unlock`}
              </p>
              <p
                className="text-[0.8125rem] font-light text-[var(--color-text-primary)] leading-tight mt-0.5"
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
              aria-label="Dismiss"
              className="flex-shrink-0 text-[var(--color-text-primary)]/20 hover:text-primary-40 transition-colors"
            >
              <X size={13} aria-hidden={true} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beauty Rooms — curated interest communities */}
      <div className="mb-3">
        <div className="px-5 flex items-center justify-between mb-2.5">
          <Link
            to="/circle-rooms"
            className="flex items-center gap-1 group"
          >
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-primary-40 font-light group-hover:text-[var(--color-text-primary)] transition-colors">
              Beauty Rooms
            </p>
            <span className="text-[0.8125rem] text-[var(--color-accent-gold)] leading-none transition-transform group-hover:translate-x-0.5">›</span>
          </Link>
          {activeCircle && (
            <button
              onClick={() => setActiveCircle(null)}
              className="text-[0.5625rem] tracking-[0.15em] uppercase text-[var(--color-accent-gold)] font-light"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
          {[...BEAUTY_ROOMS].sort((a, b) => (joinedRooms.has(b.key) ? 1 : 0) - (joinedRooms.has(a.key) ? 1 : 0)).map(c => {
            const postCount = posts.filter(p => p.circle === c.key).length;
            const isActive = activeCircle === c.key;
            const isJoined = joinedRooms.has(c.key);
            const arch = ROOM_ARCHETYPES[c.key];
            const cardStyle = isActive
              ? { background: "linear-gradient(180deg, #F9F4E8 0%, #EFE6D2 100%)", border: "1px solid #C8B06A", boxShadow: "0 4px 18px rgba(200,176,106,0.18)" }
              : { background: "linear-gradient(180deg, #FAF6EC 0%, #F2EBDB 100%)", border: "1px solid rgba(200,176,106,0.28)" };
            return (
              <div
                key={c.key}
                onClick={() => navigate('/beauty-room/' + c.key)}
                className="flex-shrink-0 w-[144px] rounded-[1.75rem] transition-all cursor-pointer relative overflow-hidden"
                style={cardStyle}
              >
                {postCount > 0 && (
                  <span className="absolute top-3 right-3 text-[0.5rem] font-light text-[#9A8E76]">
                    {postCount}
                  </span>
                )}
                <div className="flex justify-center pt-5">
                  <span className="text-[0.9375rem] leading-none" style={{ color: c.color, opacity: isActive ? 1 : 0.75 }}>
                    {c.glyph}
                  </span>
                </div>
                <div className="px-3 mt-3 text-center">
                  <p className="text-[1.0625rem] font-light italic leading-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#2D3A30" }}>
                    {arch?.archetype}
                  </p>
                  <p className="text-[0.5625rem] tracking-[0.22em] uppercase text-[#4A5A4E] font-light mt-2">
                    {c.label}
                  </p>
                </div>
                <div className="mx-5 mt-3.5 h-px" style={{ background: isActive ? "rgba(200,176,106,0.35)" : "rgba(200,176,106,0.14)" }} />
                <div className="py-3 flex items-center justify-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleJoinRoom(c.key); }}
                    className="flex items-center gap-1 text-[0.5625rem] tracking-[0.2em] uppercase font-light transition-colors"
                    style={{ color: isJoined ? "#8A7530" : "#3A4A3E" }}
                  >
                    {isJoined ? "✦ Member" : "Join"}
                    {!isJoined && <Plus size={8} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
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
                <p className="text-[0.8125rem] font-light tracking-wide"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "var(--color-text-primary)" }}>
                  {arch.archetype}
                </p>
                <p className="text-[0.625rem] font-light italic text-primary-50 tracking-wide mt-0.5">{arch.tagline}</p>
              </div>
              <span className="text-[1.125rem] opacity-40">{c.glyph}</span>
            </div>
          );
        })()}
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div className="mb-3">
          <div className="px-5 flex items-center justify-between mb-2">
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-primary-40 font-light">Upcoming Events</p>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
            {events.map(event => {
              const { day, date, month } = formatEventDate(event.event_date);
              return (
                <div
                  key={event.id}
                  className="flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                >
                  <div
                    className="px-3 py-2.5 flex items-baseline gap-2.5"
                    style={{ background: "rgba(200,176,106,0.09)" }}
                  >
                    <span
                      className="text-[1.875rem] font-light text-[var(--color-text-primary)] leading-none"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {date}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-55 font-light leading-none">
                        {day}
                      </span>
                      <span className="text-[0.5625rem] tracking-[0.15em] uppercase font-light leading-none mt-0.5" style={{ color: "var(--color-accent-gold)" }}>
                        {month}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[0.75rem] font-light text-[var(--color-text-primary)] leading-tight line-clamp-2">
                      {event.title}
                    </p>
                    {event.start_time && (
                      <p className="text-[0.625rem] text-primary-45 font-light mt-1 leading-tight">
                        {event.start_time}{event.end_time ? ` — ${event.end_time}` : ""}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-[0.625rem] text-primary-35 font-light mt-0.5 truncate">{event.location}</p>
                    )}
                    {event.cta_label && (
                      event.cta_url ? (
                        <a
                          href={event.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 mt-2 text-[0.625rem] font-light"
                          style={{ color: "var(--color-accent-gold)" }}
                        >
                          {event.cta_label} ›
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-0.5 mt-2 text-[0.625rem] font-light"
                          style={{ color: "var(--color-accent-gold)" }}
                        >
                          {event.cta_label} ›
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-5 pb-32">
        {/* Polls always visible regardless of post count */}
        {!loading && feedMode !== "following" && polls.length > 0 && (
          <div className="space-y-3 mb-5">
            <p className="text-[0.625rem] tracking-[0.3em] uppercase text-primary-40 font-light">Active Polls</p>
            {polls.map((poll, i) => (
              <motion.div key={poll.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PollCard poll={poll} user={user} onVoted={load} onDelete={load} />
              </motion.div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float"><SwanLogo size={40} color="var(--color-accent-gold)" /></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <SwanLogo size={56} color="var(--color-accent-gold)" className="mb-5" />
            <p className="font-serif text-lg text-primary-40 italic leading-relaxed">
              No musings yet — be the first to share a find.
            </p>
          </div>
        ) : (
          <>
            <ReviewerLeaderboard posts={posts} />

            {feedMode !== "following" && swaps.length > 0 && (
              <div className="space-y-3 mb-5">
                <p className="text-[0.625rem] tracking-[0.3em] uppercase text-primary-40 font-light">Open Swaps</p>
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
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide transition-all border ${
                    activeCategory === cat
                      ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                      : "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Following loading */}
            {feedMode === "following" && circleLoading && (
              <div className="flex justify-center py-12">
                <div className="swan-float"><SwanLogo size={36} color="var(--color-accent-gold)" /></div>
              </div>
            )}

            {/* Following empty */}
            {feedMode === "following" && !circleLoading && circleIds !== null && displayPosts.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center">
                <SwanLogo size={48} color="var(--color-accent-gold)" className="mb-4" />
                <p className="font-serif text-base text-primary-40 italic leading-relaxed px-4">
                  Your coterie hasn't shared yet — whisper to a member from any musing to connect.
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
                      className="text-[1.375rem] font-light text-[var(--color-text-primary)] mb-1.5 leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {arch.archetype}
                    </p>
                    <p className="text-[0.6875rem] font-light italic text-primary-40 tracking-[0.12em] mb-6">
                      {arch.tagline}
                    </p>
                    <p className="text-[0.8125rem] font-light text-primary-35 leading-relaxed max-w-[240px]">
                      {arch.prompt}
                    </p>
                  </motion.div>
                );
              })() : (
                <div className="flex flex-col items-center py-16 text-center">
                  <SwanLogo size={48} color="var(--color-accent-gold)" className="mb-4" />
                  <p className="font-serif text-base text-primary-40 italic">
                    {query ? "No musings match your search" : `Nothing in ${activeCategory} yet`}
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
                        className="block bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)] relative">
                            {post.post_type === "before_after" ? (
                              <div className="w-full h-full flex">
                                {post.image_url && <img src={post.image_url} alt="before" className="w-1/2 h-full object-cover" />}
                                {post.secondary_image_url && <img src={post.secondary_image_url} alt="after" className="w-1/2 h-full object-cover" />}
                                {!post.image_url && !post.secondary_image_url && (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">◑</div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 flex justify-center pb-0.5">
                                  <span className="text-[0.4375rem] tracking-wide text-white/80 font-light" style={{textShadow:"0 1px 2px rgba(0,0,0,0.4)"}}>BEFORE · AFTER</span>
                                </div>
                              </div>
                            ) : post.post_type === "routine" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                <SwanLogo size={18} color="var(--color-text-primary)" className="opacity-40" />
                                {post.routine_steps && (
                                  <span className="text-[0.5625rem] text-primary-50 font-light">
                                    {(() => { try { return JSON.parse(post.routine_steps).length; } catch { return ""; } })()} steps
                                  </span>
                                )}
                              </div>
                            ) : post.post_type === "thought" ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#FDF8EE] to-[#F5EDDA]">
                                <span className="text-[1.5rem] leading-none text-[#C8B06A]/60 font-serif">"</span>
                                <span className="text-[0.4375rem] tracking-[0.15em] uppercase text-[#C8B06A]/70 font-light">Quick Take</span>
                              </div>
                            ) : post.post_type === "grwm" ? (
                              <>
                                {post.image_url ? (
                                  <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#043927]/[0.08]">
                                    <Play size={24} color="var(--color-text-primary)" className="opacity-40" />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-7 h-7 rounded-full bg-[#043927]/60 flex items-center justify-center">
                                    <Play size={9} color="white" fill="white" className="ml-0.5" />
                                  </div>
                                </div>
                                {post.grwm_duration && (
                                  <div className="absolute bottom-1 left-1 bg-[#043927]/70 text-white text-[0.4375rem] px-1 py-0.5 rounded font-light">
                                    {post.grwm_duration}
                                  </div>
                                )}
                              </>
                            ) : post.image_url ? (
                              <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                            ) : (
                              <CategoryGradient product={post} className="w-full h-full" alt={post.name} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.5625rem] tracking-[0.15em] uppercase text-[#BC8F8F] font-light">{post.brand}</p>
                            <p className="text-sm text-[var(--color-text-primary)] font-light truncate">
                              {post.name}{post.shade ? ` · ${post.shade}` : ""}
                            </p>
                            {post.post_type === "swatch" && post.skin_tone && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-3.5 h-3.5 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: post.skin_tone }} />
                                <span className="text-[0.5625rem] text-primary-40 font-light">Skin tone match</span>
                              </div>
                            )}
                            {post.post_type === "before_after" && (
                              <span className="text-[0.5625rem] text-primary-40 font-light">◑ Before &amp; After</span>
                            )}
                            {post.post_type === "grwm" && post.grwm_duration && (
                              <span className="text-[0.5625rem] text-primary-40 font-light">{post.grwm_duration} GRWM</span>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <StarRating value={post.rating || 0} readOnly size={12} />
                              <span className="text-[0.625rem] text-primary-40 font-light truncate">
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
                              {post.verified_purchase && (
                                <>
                                  <style>{`
                                    @property --vp-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
                                    @keyframes vp-spin { to { --vp-a: 360deg; } }
                                    .verified-badge-glow {
                                      animation: vp-spin 2.4s linear infinite;
                                      background: conic-gradient(from var(--vp-a), #C8B06A, #FFF9E8 20%, #C8B06A 40%, #0B3C26 60%, #C8B06A 80%, #FFF9E8, #C8B06A);
                                      padding: 1px;
                                      border-radius: 999px;
                                    }
                                    .verified-badge-inner {
                                      background: var(--color-bg-card, #1a1a1a);
                                      border-radius: 999px;
                                      padding: 1px 6px;
                                    }
                                  `}</style>
                                  <span className="verified-badge-glow">
                                    <span className="verified-badge-inner inline-flex items-center gap-0.5 text-[0.5rem] tracking-[0.08em] font-light" style={{ color: "#C8B06A" }}>
                                      ✦ Verified Purchase
                                    </span>
                                  </span>
                                </>
                              )}
                              {post.circle && (() => {
                                const cc = BEAUTY_ROOMS.find(c => c.key === post.circle);
                                if (!cc) return null;
                                return (
                                  <span
                                    key="circle-badge"
                                    className="inline-flex items-center gap-0.5 text-[0.5rem] tracking-[0.1em] font-light px-1.5 py-0.5 rounded-full"
                                    style={{ color: cc.color, border: `1px solid ${cc.color}40`, background: cc.color + "12" }}
                                  >
                                    {cc.glyph} {cc.label}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-primary-60 font-light mt-1 line-clamp-2">
                              {parseSegments(post.review_text).map((seg, i) =>
                                seg.type === "tag"
                                  ? <span key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuery("#" + seg.value); }} className="text-[var(--color-accent-gold)] cursor-pointer">#{seg.value}</span>
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
                                        className="text-[0.5625rem] text-[var(--color-accent-gold)] font-light cursor-pointer hover:underline"
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
                              className={`flex items-center gap-1.5 text-[0.6875rem] font-light transition-colors ${adoredIds.has(post.id) ? "text-[var(--color-accent-gold)]" : "text-primary-40"}`}
                            >
                              <motion.span
                                key={adoredIds.has(post.id) ? `a1-${post.id}` : `a0-${post.id}`}
                                initial={adoredIds.has(post.id) ? { scale: 0.4, rotate: -20 } : { scale: 0.85 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 480, damping: 18 }}
                                style={{ display: "inline-flex" }}
                              >
                                <Heart size={13} fill={adoredIds.has(post.id) ? "currentColor" : "none"} />
                              </motion.span>
                              {adoredIds.has(post.id) ? "Adored" : "Adore"}
                              {(post.adore_count || 0) > 0 && (
                                <span className="text-[0.5625rem] opacity-55">{post.adore_count}</span>
                              )}
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/community/${post.id}`); }}
                              aria-label={`View ${post.review_count || 0} comments`}
                              className="flex items-center gap-1.5 text-[0.6875rem] text-primary-40 font-light"
                            >
                              <MessageCircle size={13} aria-hidden={true} />
                              {post.review_count || 0}
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => toggleCollect(e, post)}
                              aria-label={collectedIds.has(post.id) ? "Remove from collection" : "Add to collection"}
                              className={`flex items-center gap-1.5 text-[0.6875rem] font-light transition-colors ${collectedIds.has(post.id) ? "text-[var(--color-text-primary)]" : "text-primary-40"}`}
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
                              aria-label="Pass along"
                              className="flex items-center gap-1.5 text-[0.6875rem] text-primary-45 font-light hover:text-[var(--color-text-primary)] transition-colors"
                            >
                              <Share2 size={13} aria-hidden={true} />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setReportingPostId(post.id); }}
                              aria-label="Report post"
                              className="flex items-center text-primary-25 hover:text-[#BC8F8F] transition-colors"
                            >
                              <Flag size={12} aria-hidden={true} />
                            </button>
                            {post.created_by_id && post.created_by_id === user?.id && (
                              deletingPostId === post.id ? (
                                <div className="flex items-center gap-1.5 text-[10px]" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                                  <button onClick={(e) => handleDeletePost(e, post.id)} className="text-[#BC8F8F] underline font-light">Yes</button>
                                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingPostId(null); }} className="text-primary-40 underline font-light">No</button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingPostId(post.id); }}
                                  aria-label="Delete post"
                                  className="flex items-center text-primary-25 hover:text-[#BC8F8F] transition-colors"
                                >
                                  <Trash2 size={12} aria-hidden={true} />
                                </button>
                              )
                            )}
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

      {composing && <CommunityComposer onClose={() => { setComposing(false); setPrefillProduct(null); }} onPosted={load} prefillProduct={prefillProduct} />}
      {reportingPostId && <ReportModal postId={reportingPostId} onClose={() => setReportingPostId(null)} />}
      {composingPoll && <PollComposer onClose={() => setComposingPoll(false)} onPosted={load} />}
      {composingSwap && <SwapComposer onClose={() => setComposingSwap(false)} onPosted={load} />}

      {/* Swap Teaser Modal */}
      <AnimatePresence>
        {showSwapTeaser && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#043927]/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSwapTeaser(false)}
          >
            <motion.div
              className="w-full sm:max-w-sm bg-[var(--color-bg)] rounded-t-3xl sm:rounded-3xl px-7 pt-8 pb-28 text-center"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSwapTeaser(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]/40"
              >
                <X size={14} />
              </button>

              <div className="w-12 h-12 rounded-full bg-[#C8B06A]/12 flex items-center justify-center mx-auto mb-5">
                <SwanLogo size={28} color="var(--color-accent-gold)" />
              </div>

              <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-[#C8B06A] font-light mb-2">Community · Coming Soon</p>

              <h2
                className="text-[1.75rem] font-light text-[var(--color-text-primary)] leading-tight mb-3"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                The Swap Circle
              </h2>

              <div className="w-8 h-px bg-[#C8B06A]/40 mx-auto mb-4" />

              <p className="text-[0.8125rem] font-light text-[var(--color-text-primary)]/65 leading-relaxed mb-2">
                Your gently-loved finds deserve a second life with someone who will truly cherish them.
              </p>
              <p className="text-[0.8125rem] font-light text-[var(--color-text-primary)]/65 leading-relaxed mb-6">
                List what you're ready to pass along. Discover what your circle is offering. Curate each other's routines.
              </p>

              <p className="text-[0.6875rem] font-light italic text-[var(--color-text-primary)]/40 leading-relaxed">
                Invite-only trading between members you trust — opening soon to the inner circle.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}