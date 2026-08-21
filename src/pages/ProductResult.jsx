import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Copy, Check, Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import IngredientAlert from "@/components/IngredientAlert";
import TranslateToggle from "@/components/TranslateToggle";
import { formatPrice } from "@/utils/locale";
import { base44 } from "@/api/base44Client";

export default function ProductResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inVanity, setInVanity] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [inShoppingList, setInShoppingList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vanityHint, setVanityHint] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleError, setVisibleError] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (id) {
      const savedVisible = localStorage.getItem(`vis_${id}`);
      if (savedVisible !== null) setIsVisible(savedVisible === 'true');
      base44.entities.Product.filter({ id: id }).then(results => {
        const p = results?.[0];
        if (!p) { setLoading(false); return; }
        setProduct(p);
        setInVanity(p.in_vanity || false);
        setInWishlist(p.in_wishlist || false);
        setInShoppingList(p.in_shopping_list || false);
        if (savedVisible === null) setIsVisible(p.is_profile_visible || false);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleAddToVanity = async () => {
    await base44.entities.Product.update(product.id, { in_vanity: true, in_wishlist: false });
    setInVanity(true);
    setInWishlist(false);
  };

  const handleAddToWishlist = async () => {
    if (inVanity) {
      setVanityHint(true);
      setTimeout(() => setVanityHint(false), 2200);
      return;
    }
    await base44.entities.Product.update(product.id, { in_wishlist: !inWishlist });
    setInWishlist(w => !w);
  };

  const handleAddToShoppingList = async () => {
    await base44.entities.Product.update(product.id, { in_shopping_list: !inShoppingList, shopping_qty: 1 });
    setInShoppingList(s => !s);
  };

  const handleToggleVisible = async () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem(`vis_${id}`, String(next));
    try {
      await base44.entities.Product.update(product.id, { is_profile_visible: next });
    } catch (err) {
      console.error("[ProductResult] is_profile_visible update failed:", err);
      setIsVisible(!next);
      localStorage.setItem(`vis_${id}`, String(!next));
      setVisibleError(true);
      setTimeout(() => setVisibleError(false), 2500);
    }
  };

  const handleCopyIngredients = () => {
    navigator.clipboard.writeText(product?.ingredients || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="swan-float"><SwanLogo size={48} color="var(--color-accent-gold)" /></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-8 text-center">
      <SwanLogo size={64} color="var(--color-text-primary)" className="mb-4" />
      <p className="font-serif text-xl text-[var(--color-text-primary)]">Product not found</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-xs text-[#BC8F8F] underline font-light">Go back</button>
    </div>
  );

  const whereToBuy = (() => {
    try { return JSON.parse(product.where_to_buy || "[]"); } catch { return []; }
  })();

  // Defensive guards for stale bad-data records
  const BAD_BRANDS = ["not identified", "unknown", "n/a", "none", "unidentified"];
  const displayBrand = (product.brand && !BAD_BRANDS.includes(product.brand.trim().toLowerCase()))
    ? product.brand
    : null;
  const displayShade = (product.shade && product.shade.trim().toLowerCase() !== "null")
    ? product.shade
    : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <div className="relative min-h-[300px]" style={{ background: "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg) 100%)" }}>
        <button onClick={() => navigate(-1)} aria-label="Go back" className="absolute top-14 left-5 z-10 w-9 h-9 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} color="var(--color-text-primary)" aria-hidden={true} />
        </button>

        {/* Wishlist heart */}
        <div className="absolute top-14 right-5 z-10">
          <button
            onClick={handleAddToWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="w-9 h-9 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center shadow-sm"
          >
            <Heart size={16} color={inWishlist ? "#BC8F8F" : "var(--color-text-primary)"} fill={inWishlist ? "#BC8F8F" : "none"} aria-hidden={true} />
          </button>
          <AnimatePresence>
            {vanityHint && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                className="absolute right-0 top-11 bg-[#043927] text-[#FDF5E6] text-[0.625rem] font-light px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg"
              >
                Already in your vanity
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-16 right-16 opacity-10" aria-hidden={true}>
          <SwanLogo size={100} color="var(--color-text-primary)" />
        </div>

        <div className="flex flex-col items-center pt-20 pb-8 px-8">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl mb-6 border border-white/60"
            style={{ background: "var(--color-bg-elevated)" }}
          >
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <SwanLogo size={60} color="var(--color-text-primary)" />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-xs tracking-[0.3em] text-[#BC8F8F] uppercase font-light mb-1">{product.category}</p>
            {displayBrand ? (
              <h1 className="font-serif text-3xl text-[var(--color-text-primary)] font-light uppercase tracking-wide mb-1">{displayBrand}</h1>
            ) : (
              <p className="text-xs tracking-[0.25em] text-primary-30 uppercase font-light mb-1 italic">Brand not identified</p>
            )}
            <p className="font-serif text-lg text-primary-70 font-light italic mb-2">{product.name}{displayShade ? ` — ${displayShade}` : ""}</p>
            {product.price > 0 && (
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-light text-[var(--color-text-primary)]">{formatPrice(product.price)}</p>
                {product.on_sale && product.sale_discount_pct > 0 && (
                  <span className="text-xs bg-[var(--color-accent-gold)] text-white rounded-full px-2 py-0.5 font-medium">
                    -{Math.round(product.sale_discount_pct)}%
                  </span>
                )}
              </div>
            )}
            {product.muse_shimmer && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[var(--color-accent-gold)] text-sm">✦</span>
                <p className="text-xs text-primary-50 font-light italic">{product.muse_shimmer}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="px-5 py-4 flex flex-col gap-3"
      >
        <button
          onClick={handleAddToVanity}
          disabled={inVanity}
          className={`w-full py-4 rounded-2xl text-xs tracking-[0.25em] uppercase font-light transition-all ${
            inVanity
              ? "bg-[#043927] text-[#FDF5E6]"
              : "bg-[#BC8F8F] text-white hover:bg-[#A87878]"
          }`}
        >
          {inVanity ? "In My Vanity" : "Add to My Vanity"}
        </button>

        {currentUser && product.created_by_id === currentUser.id && (
          <div>
            <div className="flex items-center justify-between bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
              <div>
                <p className="text-xs text-[var(--color-text-primary)] font-light">Visible in Discovery</p>
                <p className="text-[0.5625rem] text-primary-40 font-light mt-0.5">Let others find this product</p>
              </div>
              <button
                onClick={handleToggleVisible}
                aria-label={isVisible ? "Hide from Discovery" : "Show in Discovery"}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${isVisible ? "bg-[#C8B06A]" : "bg-[var(--color-border)]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${isVisible ? "left-[calc(100%-18px)]" : "left-0.5"}`} />
              </button>
            </div>
            <AnimatePresence>
              {visibleError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[0.5625rem] text-[#BC8F8F] font-light text-right px-1 mt-1"
                >
                  Couldn't save — try again
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {!inVanity && (
          <button
            onClick={handleAddToWishlist}
            className={`w-full py-3.5 rounded-2xl text-xs tracking-[0.25em] uppercase font-light transition-all flex items-center justify-center gap-2 border ${
              inWishlist
                ? "border-[#BC8F8F] bg-[#BC8F8F]/10 text-[#BC8F8F]"
                : "border-[var(--color-border)] text-primary-60"
            }`}
          >
            <Heart size={12} fill={inWishlist ? "currentColor" : "none"} />
            {inWishlist ? "In Wishlist" : "Save to Wishlist"}
          </button>
        )}

        <button
          onClick={handleAddToShoppingList}
          className={`w-full py-3.5 rounded-2xl text-xs tracking-[0.25em] uppercase font-light transition-all flex items-center justify-center gap-2 border ${
            inShoppingList
              ? "border-[#C8B06A] bg-[#C8B06A]/10 text-[var(--color-accent-gold)]"
              : "border-[var(--color-border)] text-primary-60"
          }`}
        >
          <ShoppingBag size={12} />
          {inShoppingList ? "In Shopping List" : "Save to Shopping List"}
        </button>

        <Link
          to={`/local-curator/${product.id}`}
          className="w-full py-3.5 rounded-2xl text-xs tracking-[0.25em] uppercase font-light text-center border border-[#BC8F8F] text-[#BC8F8F] hover:bg-[#BC8F8F]/5 transition-all"
        >
          Discover The Local Curator
        </Link>
      </motion.div>

      {/* Details */}
      <div className="px-5 pb-24 space-y-4">
        <IngredientAlert product={product} />

        {product.description && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <p className="text-xs tracking-[0.2em] text-primary-50 uppercase mb-3 font-light">About this product</p>
            <TranslateToggle
              text={product.description}
              className="text-sm text-primary-70 leading-relaxed font-light"
            />
          </div>
        )}

        {whereToBuy.length > 0 && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} color="#BC8F8F" />
              <p className="text-xs tracking-[0.2em] text-primary-50 uppercase font-light">Where to Buy</p>
            </div>
            {whereToBuy.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-text-primary)] font-light">{r}</span>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${r} ${product.brand || ''} ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#BC8F8F] font-light underline underline-offset-2"
                >
                  Shop →
                </a>
              </div>
            ))}
          </div>
        )}

        {product.ingredients && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs tracking-[0.2em] text-primary-50 uppercase font-light">Ingredients</p>
              <button onClick={handleCopyIngredients} className="flex items-center gap-1">
                {copied ? <Check size={12} color="var(--color-text-primary)" /> : <Copy size={12} color="var(--color-text-primary)" />}
                <span className="text-[0.625rem] text-primary-40 font-light">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs text-primary-60 leading-relaxed font-light">{product.ingredients}</p>
          </div>
        )}
      </div>
    </main>
  );
}
