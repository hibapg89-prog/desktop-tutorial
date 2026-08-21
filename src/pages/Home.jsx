import { useState, useEffect } from "react";
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

export default function Home() {
  const context = useOutletContext();
  const [user,            setUser]            = useState(null);
  const [shimmerProducts, setShimmerProducts] = useState([]);
  const [recentPosts,     setRecentPosts]     = useState([]);

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
        role="button"
        tabIndex={0}
        aria-label="Scan & Discover – Identify any beauty product"
        className="mx-5 mb-8 rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-[#043927]"
        onClick={() => context?.openScan?.()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); context?.openScan?.(); } }}
      >
        <div className="px-6 py-7 flex items-center justify-between">
          <div>
            <p className="text-[0.5625rem] tracking-[0.35em] uppercase text-gold-70 font-light">The Muse</p>
            <h2 className="font-serif text-2xl text-[#FDF5E6] font-light mt-1">Scan & Discover</h2>
            <p className="text-[0.6875rem] text-[#FDF5E6]/45 font-light mt-1.5 tracking-wide">Identify any beauty product</p>
          </div>
          <SwanLogo size={40} color="var(--color-accent-gold)" className="opacity-70 flex-shrink-0" />
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