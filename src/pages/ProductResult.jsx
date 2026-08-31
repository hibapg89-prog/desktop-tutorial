import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Copy, Check, Heart, ShoppingBag, Bookmark, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import ProductImage from "@/components/ProductImage";
import ProductImageControls from "@/components/ProductImageControls";
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
  const [inShoppingList, setInShoppingList] = useState(false);
  const [adored, setAdored] = useState(false);
  const [collected, setCollected] = useState(false);
  const [passedAlong, setPassedAlong] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      base44.entities.Product.filter({ id: id }).then(results => {
        const p = results?.[0];
        if (!p) { setLoading(false); return; }
        setProduct(p);
        setInVanity(p.in_vanity || false);
        setInShoppingList(p.in_shopping_list || false);
        setIsVisible(p.is_profile_visible || false);
        setLoading(false);
      }).catch(() => setLoading(false));
      base44.auth.me().then((u) => {
        const adoredIds = Array.isArray(u?.adored_products) ? u.adored_products : [];
        setAdored(adoredIds.includes(id));
        const collectedIds = Array.isArray(u?.collected_products) ? u.collected_products : [];
        setCollected(collectedIds.includes(id));
      }).catch(() => {});
      base44.entities.Review.filter({ post_id: id })
        .then((r) => setReviews(r || []))
        .catch(() => {});
    }
  }, [id]);

  // Listen for realtime updates so the product image appears as soon as the
  // backend image-enrichment function finishes (it runs after the page loads).
  useEffect(() => {
    if (!id) return;
    const unsubscribe = base44.entities.Product.subscribe((event) => {
      if (event.id === id && event.type === 'update' && event.data) {
        setProduct(event.data);
      }
    });
    return unsubscribe;
  }, [id]);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleAddToVanity = async () => {
    const prevVanity = inVanity;
    setInVanity(true);
    try {
      await base44.entities.Product.update(product.id, { in_vanity: true });
    } catch (err) {
      console.error("[ProductResult] add to vanity failed:", err);
      setInVanity(prevVanity);
      showError("Could not add to vanity — please try again.");
    }
  };

  const toggleAdore = async () => {
    const newState = !adored;
    setAdored(newState);
    try {
      const u = await base44.auth.me();
      const adoredIds = Array.isArray(u?.adored_products) ? u.adored_products : [];
      const updated = newState
        ? [...new Set([...adoredIds, id])]
        : adoredIds.filter((pid) => pid !== id);
      await base44.auth.updateMe({ adored_products: updated });
    } catch (err) {
      console.error("[ProductResult] adore update failed:", err);
      setAdored(!newState);
    }
  };

  const toggleCollect = async () => {
    const newState = !collected;
    setCollected(newState);
    try {
      const u = await base44.auth.me();
      const collectedIds = Array.isArray(u?.collected_products) ? u.collected_products : [];
      const updated = newState
        ? [...new Set([...collectedIds, id])]
        : collectedIds.filter((pid) => pid !== id);
      await base44.auth.updateMe({ collected_products: updated });
    } catch (err) {
      console.error("[ProductResult] collect update failed:", err);
      setCollected(!newState);
    }
  };

  const handlePassAlong = async () => {
    const shareData = {
      title: product?.name || "La Muse Product",
      text: product?.description ? product.description.slice(0, 120) + "…" : "Found on La Muse.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setPassedAlong(true);
        setTimeout(() => setPassedAlong(false), 2000);
      }
    } catch {
      // user cancelled — no-op
    }
  };

  const handleSubmitReview = async () => {
    const trimmed = reviewText.trim();
    if (!trimmed) return;
    setReviewSubmitting(true);
    try {
      const u = await base44.auth.me();
      const review = await base44.entities.Review.create({
        post_id: id,
        review_text: trimmed,
        author_name: u?.full_name || "Anonymous",
      });
      setReviews((prev) => [review, ...prev]);
      setReviewText("");
    } catch (err) {
      console.error("[ProductResult] failed to post whisper:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToShoppingList = async () => {
    const next = !inShoppingList;
    setInShoppingList(next);
    try {
      await base44.entities.Product.update(product.id, { in_shopping_list: next, shopping_qty: 1 });
    } catch (err) {
      console.error("[ProductResult] shopping list update failed:", err);
      setInShoppingList(!next);
      showError("Could not update shopping list — please try again.");
    }
  };

  const handleToggleVisible = async () => {
    const next = !isVisible;
    setIsVisible(next);
    try {
      await base44.entities.Product.update(product.id, { is_profile_visible: next });
    } catch (err) {
      console.error("[ProductResult] is_profile_visible update failed:", err);
      setIsVisible(!next);
      showError("Could not update visibility — please try again.");
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

        {/* Adore button */}
        <button
          onClick={toggleAdore}
          aria-label={adored ? "Un-adore" : "Adore"}
          className={`absolute top-14 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all ${
            adored ? "bg-[#C8B06A]/90" : "bg-[var(--color-bg-surface)]"
          }`}
        >
          <Heart size={16} color={adored ? "white" : "var(--color-text-primary)"} fill={adored ? "white" : "none"} aria-hidden={true} />
        </button>

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
            <ProductImage product={product} className="w-full h-full" fittingType="fit" alt={product.name} />
          </motion.div>

          <div className="flex items-center gap-2 mt-3">
            <ProductImageControls product={product} onUpdated={setProduct} />
          </div>

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
        <AnimatePresence>
          {errorMsg && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-[0.625rem] text-[#BC8F8F] font-light"
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
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

        {inVanity && (
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
        )}

        {/* Engagement row: Collect · Pass Along */}
        <div className="flex gap-2">
          <button
            onClick={toggleCollect}
            className={`flex-1 py-3 rounded-2xl text-[10px] tracking-[0.2em] uppercase font-light border transition-all flex items-center justify-center gap-1.5 ${
              collected
                ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                : "border-[var(--color-border)] text-primary-60"
            }`}
          >
            <Bookmark size={12} strokeWidth={1.5} fill={collected ? "white" : "none"} />
            {collected ? "Collected" : "Collect"}
          </button>
          <button
            onClick={handlePassAlong}
            className={`flex-1 py-3 rounded-2xl text-[10px] tracking-[0.2em] uppercase font-light border transition-all flex items-center justify-center gap-1.5 ${
              passedAlong
                ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                : "border-[var(--color-border)] text-primary-60"
            }`}
          >
            <Share2 size={12} strokeWidth={1.5} />
            {passedAlong ? "Copied" : "Pass Along"}
          </button>
        </div>

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

        {/* Whispers */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
          <h2 className="font-serif text-[18px] text-[var(--color-text-primary)] font-light tracking-wide mb-4">
            Whispers
          </h2>
          <div className="flex items-center gap-3 border border-[#C8B06A]/40 rounded-full px-4 py-2.5 mb-4">
            <input
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReview()}
              placeholder="Share a thought on this product..."
              className="flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-25"
            />
            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting || !reviewText.trim()}
              className="text-[var(--color-accent-gold)] text-[16px] font-light disabled:opacity-30"
            >
              →
            </button>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-l-2 border-[#C8B06A]/30 pl-4">
                  <p className="text-[13px] text-[var(--color-text-primary)]/80 font-light leading-[1.6] italic">
                    "{r.review_text}"
                  </p>
                  <p className="text-[10px] text-primary-40 font-light tracking-wide mt-1.5">
                    — {r.author_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-serif text-[11px] text-primary-30 text-center italic font-light">
              Be the first to whisper
            </p>
          )}
        </div>
      </div>
    </main>
  );
}