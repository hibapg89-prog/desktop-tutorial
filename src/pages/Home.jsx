import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import CategoryGrid from "@/components/CategoryGrid";
import EditorialBanner from "@/components/EditorialBanner";
import VanityBanner from "@/components/VanityBanner";
import AtelierBanner from "@/components/AtelierBanner";
import { formatPrice } from "@/utils/locale";

export default function Home() {
  const { openScan } = useOutletContext() ?? {};
  const navigate = useNavigate();
  const [shimmerProducts, setShimmerProducts] = useState([]);
  const [recentPosts,     setRecentPosts]     = useState([]);

  useEffect(() => {
    base44.entities.Product.filter({ muse_shimmer: true })
      .then(setShimmerProducts)
      .catch(() => {});

    base44.entities.CommunityPost.list("-created_date", 3)
      .then(setRecentPosts)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Atelier Banner ──────────────────────────────────────── */}
      <AtelierBanner onScan={openScan} />
      <AtelierBanner onScan={() => navigate("/scan-results")} />

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
          aria-label="View shopping list"
          className="block rounded-2xl overflow-hidden"
        >
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/43966a972_IMG_4390.jpeg"
            alt="Restock — Shopping List"
            className="w-full h-auto block"
            draggable={false}
          />
        </Link>
      </div>

      {/* ── Editorial Tutorials ─────────────────────────────────── */}
      <EditorialBanner />

      {/* ── Services Map ────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/map"
          aria-label="Discover beauty venues"
          className="block rounded-2xl overflow-hidden"
        >
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/c97d5be14_IMG_4381.png"
            alt="Cartography of Refinement — Services Map"
            className="w-full h-auto block"
            draggable={false}
          />
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
          aria-label="See community reviews"
          className="block rounded-2xl overflow-hidden"
        >
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/9c938a6a3_IMG_4428.jpeg"
            alt="The Muse Circle — Community Feed"
            className="w-full h-auto block"
            draggable={false}
          />
        </Link>
      </div>

      {/* ── Messages ────────────────────────────────────────────── */}
      <div className="px-5 mb-8">
        <Link
          to="/messages"
          aria-label="Open inbox"
          className="block rounded-2xl overflow-hidden"
        >
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/f0a3403cb_IMG_4385.jpeg"
            alt="The Muse Circle — Direct Messages"
            className="w-full h-auto block"
            draggable={false}
          />
        </Link>
      </div>
    </main>
  );
}
