import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ShieldAlert, ShoppingCart, BarChart3, Award, ChevronRight, Star } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import CategoryGrid from "@/components/CategoryGrid";
import EditorialBanner from "@/components/EditorialBanner";
import VanityBanner from "@/components/VanityBanner";
import { formatPrice } from "@/utils/locale";

const QUICK_LINKS = [
  { label: "Alerts",   Icon: ShieldAlert,  to: "/ingredient-alerts" },
  { label: "Shopping", Icon: ShoppingCart, to: "/shopping-list"     },
  { label: "Insights", Icon: BarChart3,    to: "/vanity/insights"   },
  { label: "Badges",   Icon: Award,        to: "/distinctions"      },
];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function readAccessibilityPref(key) {
  try { return JSON.parse(localStorage.getItem("muse_accessibility") || "{}")[key] ?? false; }
  catch { return false; }
}

export default function Home() {
  const context = useOutletContext();
  const [user,            setUser]            = useState(null);
  const [shimmerProducts, setShimmerProducts] = useState([]);
  const [recentPosts,     setRecentPosts]     = useState([]);
  const [guidedPath,      setGuidedPath]      = useState(() => readAccessibilityPref("guidedPath"));
  const chimePlayedRef = useRef(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
      })
      .catch(() => {});

    base44.entities.Product.filter({ muse_shimmer: true })
      .then(setShimmerProducts)
      .catch(() => {});

    base44.entities.CommunityPost.list("-created_date", 3)
      .then(setRecentPosts)
      .catch(() => {});
  }, []);

  // Re-read guidedPath when user navigates back from settings
  useEffect(() => {
    const sync = () => {
      const next = readAccessibilityPref("guidedPath");
      setGuidedPath(prev => {
        if (!next) chimePlayedRef.current = false;
        return next;
      });
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Play a subtle chime when Guided Path first activates (skip in Calm Mode)
  useEffect(() => {
    if (!guidedPath || chimePlayedRef.current) return;
    if (readAccessibilityPref("calmMode")) return;
    chimePlayedRef.current = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.55);
    } catch {}
  }, [guidedPath]);

  const dismissGuide = () => {
    try {
      const current = JSON.parse(localStorage.getItem("muse_accessibility") || "{}");
      localStorage.setItem("muse_accessibility", JSON.stringify({ ...current, guidedPath: false }));
    } catch {}
    chimePlayedRef.current = false;
    setGuidedPath(false);
  };

  const firstName = user?.full_name?.split(" ")[0]
    || user?.email?.split("@")[0]
    || "Muse";

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-5 flex items-center justify-between">
        <div>
          <p className="text-[0.625rem] tracking-[0.3em] uppercase text-primary-35 font-light">
            {timeGreeting()}
          </p>
          <h1 className="font-serif text-2xl text-[var(--color-text-primary)] font-light tracking-wide">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/profile"
            aria-label="View profile"
            className="w-9 h-9 rounded-full bg-[#043927] flex items-center justify-center flex-shrink-0"
          >
            <span className="font-serif text-sm leading-none text-[var(--color-accent-gold)]">
              {firstName[0]?.toUpperCase()}
            </span>
          </Link>
        </div>
      </header>

      {/* ── Quick links ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="px-5 mb-6"
      >
        <div className="flex gap-2">
          {QUICK_LINKS.map(({ label, Icon, to }) => (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl py-3 hover:border-[#C8B06A]/40 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                <Icon size={14} color="var(--color-text-primary)" />
              </div>
              <span className="text-[0.5625rem] tracking-[0.15em] uppercase text-primary-45 font-light">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Scan & Discover CTA ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-5 mb-8 relative"
      >
        {/* Guided Path tooltip */}
        {guidedPath && (
          <div
            className="absolute -top-14 left-0 right-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl z-10"
            style={{
              background: "rgba(4,57,39,0.94)",
              border: "1px solid rgba(200,176,106,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p
              className="flex-1 text-[0.75rem] font-light leading-snug"
              style={{ color: "#C8B06A", fontFamily: "Inter, DM Sans, sans-serif" }}
            >
              Start here — scan your first product.
            </p>
            <button
              onClick={dismissGuide}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "rgba(200,176,106,0.2)" }}
              aria-label="Dismiss guide"
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 1l5 5M6 1L1 6" stroke="#C8B06A" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            {/* Arrow pointing down */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
              style={{
                width: 0, height: 0,
                borderLeft: "7px solid transparent",
                borderRight: "7px solid transparent",
                borderTop: "7px solid rgba(4,57,39,0.94)",
              }}
            />
          </div>
        )}

        <div
          role="button"
          tabIndex={0}
          aria-label="Scan & Discover – Identify any beauty product"
          className="rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-[#043927]"
          style={guidedPath ? {
            boxShadow: "0 0 0 2.5px #C8B06A, 0 0 14px rgba(200,176,106,0.35)",
          } : {}}
          onClick={() => { dismissGuide(); context?.openScan?.(); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              dismissGuide();
              context?.openScan?.();
            }
          }}
        >
          <div className="px-6 py-7 flex items-center justify-between">
            <div>
              <p className="text-[0.5625rem] tracking-[0.35em] uppercase text-gold-70 font-light">The Muse</p>
              <h2 className="font-serif text-2xl text-[#FDF5E6] font-light mt-1">Scan & Discover</h2>
              <p className="text-[0.6875rem] text-[#FDF5E6]/45 font-light mt-1.5 tracking-wide">Identify any beauty product</p>
            </div>
            <SwanLogo size={40} color="var(--color-accent-gold)" className="opacity-70 flex-shrink-0" />
          </div>
        </div>
      </motion.div>

      {/* ── Muse Shimmer strip ──────────────────────────────────── */}
      {shimmerProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mb-8"
        >
          <div className="px-5 flex items-center justify-between mb-3">
            <div>
              <p className="text-[0.5625rem] tracking-[0.3em] uppercase font-light text-[var(--color-accent-gold)]">
                Editor's Choice
              </p>
              <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light">Muse Shimmer</h2>
            </div>
            <Link
              to="/discover"
              className="flex items-center gap-0.5 text-[0.625rem] text-primary-40 font-light"
            >
              All <ChevronRight size={13} className="opacity-50" aria-hidden={true} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-1">
            {shimmerProducts.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="flex-shrink-0 w-[130px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
              >
                <div className="w-full h-[120px] overflow-hidden bg-[var(--color-bg-elevated)] relative">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SwanLogo size={24} color="var(--color-text-primary)" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C8B06A]/[0.88] flex items-center justify-center">
                    <Star size={9} fill="white" color="white" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[0.5rem] tracking-[0.12em] uppercase text-[#BC8F8F] font-light truncate">
                    {p.brand}
                  </p>
                  <p className="text-[0.6875rem] text-[var(--color-text-primary)] font-light truncate leading-snug mt-0.5">
                    {p.name}
                  </p>
                  {p.price > 0 && (
                    <p className="text-[0.625rem] text-primary-45 font-light mt-1">
                      {formatPrice(p.price)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Category Grid ───────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <CategoryGrid />
      </div>

      {/* ── Vanity preview ──────────────────────────────────────── */}
      <VanityBanner />

      {/* ── Shopping List ───────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/shopping-list"
          className="flex items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-5 hover:border-[#C8B06A]/40 transition-colors"
        >
          <div>
            <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-gold-70 font-light">The Muse</p>
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light mt-0.5">Restock</h2>
            <p className="text-[0.625rem] text-primary-40 font-light mt-0.5 tracking-wide">Your shopping list</p>
          </div>
          <ChevronRight size={18} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" aria-hidden={true} />
        </Link>
      </div>

      {/* ── Editorial Tutorials ─────────────────────────────────── */}
      <EditorialBanner />

      {/* ── Services Map ────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/map"
          className="flex items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-5 hover:border-[#C8B06A]/40 transition-colors"
        >
          <div>
            <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-gold-70 font-light">The Muse</p>
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light mt-0.5">Cartography</h2>
            <p className="text-[0.625rem] text-primary-40 font-light mt-0.5 tracking-wide">Beauty services near you</p>
          </div>
          <ChevronRight size={18} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" aria-hidden={true} />
        </Link>
      </div>

      {/* ── From the Circle ─────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-5 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light">From the Circle</h2>
            <Link
              to="/community"
              className="flex items-center gap-0.5 text-[0.625rem] text-primary-40 font-light"
            >
              All <ChevronRight size={13} className="opacity-50" aria-hidden={true} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                to={`/community/${post.id}`}
                className="flex gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-3 items-center"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)]">
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SwanLogo size={16} color="var(--color-text-primary)" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.5rem] tracking-[0.12em] uppercase text-[#BC8F8F] font-light">
                    {post.brand}
                  </p>
                  <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate">
                    {post.name}{post.shade ? ` · ${post.shade}` : ""}
                  </p>
                  {post.review_text && (
                    <p className="text-[0.625rem] text-primary-40 font-light truncate mt-0.5">
                      {post.review_text}
                    </p>
                  )}
                </div>
                <ChevronRight size={14} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" aria-hidden={true} />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Community ───────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/community"
          className="flex items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-5 hover:border-[#C8B06A]/40 transition-colors"
        >
          <div>
            <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-gold-70 font-light">The Circle</p>
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light mt-0.5">Community</h2>
            <p className="text-[0.625rem] text-primary-40 font-light mt-0.5 tracking-wide">Beauty editorial & exchange</p>
          </div>
          <ChevronRight size={18} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" aria-hidden={true} />
        </Link>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/messages"
          className="flex items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-5 py-5 hover:border-[#C8B06A]/40 transition-colors"
        >
          <div>
            <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-gold-70 font-light">The Circle</p>
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light mt-0.5">Messages</h2>
            <p className="text-[0.625rem] text-primary-40 font-light mt-0.5 tracking-wide">Direct correspondence</p>
          </div>
          <ChevronRight size={18} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" aria-hidden={true} />
        </Link>
      </div>
    </main>
  );
}