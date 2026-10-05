import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Share2 } from "lucide-react";
import { ArrowLeft, Camera, Upload } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import ScanShareSheet from "@/components/ScanShareSheet";
import { base44 } from "@/api/base44Client";

export default function ScanResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialProducts = state?.products || [];
  const [products, setProducts] = useState(initialProducts);
  const [shareProduct, setShareProduct] = useState(null);

  useEffect(() => {
    if (initialProducts.length === 0) {
      navigate("/home", { replace: true });
    }
  }, []);

  // Subscribe to Product updates so images appear in real-time as the
  // backend image-enrichment function finishes fetching them.
  useEffect(() => {
    const ids = new Set(initialProducts.map(p => p.id));
    if (ids.size === 0) return;
    const unsubscribe = base44.entities.Product.subscribe((event) => {
      if (event.type === 'update' && ids.has(event.id) && event.data) {
        setProducts(prev => prev.map(p =>
          p.id === event.id ? { ...p, ...event.data } : p
        ));
      }
    });
    return unsubscribe;
  }, []);

  // Backup poll after 4s — catches any images that arrived before the subscription
  useEffect(() => {
    if (initialProducts.length === 0) return;
    const t = setTimeout(async () => {
      const fresh = await Promise.all(
        initialProducts.map(async p => {
          try {
            const res = await base44.entities.Product.filter({ id: p.id });
            return { ...p, ...(res?.[0] || {}) };
          } catch { return p; }
        })
      );
      setProducts(prev => fresh.map((f, i) => ({ ...prev[i], ...f })));
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  if (products.length === 0) return null;

  const toggleVanity = async (product, e) => {
    e.stopPropagation();
    const next = !product.in_vanity;
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, in_vanity: next, in_wishlist: next ? false : p.in_wishlist } : p
    ));
    try {
      await base44.entities.Product.update(product.id, {
        in_vanity: next,
        in_wishlist: next ? false : product.in_wishlist,
      });
    } catch {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, in_vanity: !next, in_wishlist: product.in_wishlist } : p
      ));
    }
  };

  const toggleWishlist = async (product, e) => {
    e.stopPropagation();
    if (product.in_vanity) return;
    const next = !product.in_wishlist;
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, in_wishlist: next } : p
    ));
    try {
      await base44.entities.Product.update(product.id, { in_wishlist: next });
    } catch {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, in_wishlist: !next } : p
      ));
    }
  };
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <div className="flex items-center justify-between px-5 pt-14 pb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(11,60,38,0.07)" }}
            aria-label="Back"
          >
            <ArrowLeft size={18} color="var(--color-text-primary)" />
          </button>
          <SwanLogo size={32} color="var(--color-accent-gold)" />
          <div className="w-10" />
        </div>

        <div className="px-6 text-center mt-4 mb-10">
          <p className="text-[0.5625rem] tracking-[0.3em] uppercase font-light mb-2"
            style={{ color: "var(--color-accent-gold)" }}>The Muse</p>
          <h1 className="font-serif text-[2.25rem] font-light leading-tight"
            style={{ color: "var(--color-text-primary)" }}>Scan &amp; Discover</h1>
          <p className="text-[0.8125rem] font-light mt-3"
            style={{ color: "var(--color-text-secondary)" }}>Point your camera at any beauty product to identify it instantly.</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <label className="w-full max-w-sm cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="sr-only" />
            <div
              className="w-full aspect-square rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed"
              style={{ borderColor: "rgba(200,176,106,0.4)", background: "var(--color-bg-surface)" }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#043927" }}>
                <Camera size={28} color="#C8B06A" />
              </div>
              <p className="font-serif text-lg font-light" style={{ color: "var(--color-text-primary)" }}>Take a photo</p>
              <p className="text-[0.75rem] font-light" style={{ color: "var(--color-text-secondary)" }}>or tap to choose from library</p>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="file" accept="image/*" className="sr-only" />
            <Upload size={14} color="var(--color-accent-gold)" />
            <span className="text-[0.8125rem] font-light" style={{ color: "var(--color-accent-gold)" }}>Upload from library</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-page-gradient)" }}>
      {/* Marble shimmer overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 25%, rgba(200,176,106,0.09) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 65%, rgba(200,176,106,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 5%,  rgba(255,255,255,0.50) 0%, transparent 45%)
          `,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
          style={{ background: "rgba(11,60,38,0.07)" }}
          aria-label="Back"
        >
          <ArrowLeft size={18} color="var(--color-text-primary)" />
        </button>
        <SwanLogo className="h-8" />
        <div className="w-10" />
      </div>

      {/* Title block */}
      <div className="relative z-10 text-center px-6 mb-6">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-2"
          style={{ color: "var(--color-accent-gold)" }}
        >
          Scan Session
        </p>
        <h1
          className="text-[2rem] leading-tight"
          style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--color-text-primary)", fontWeight: 400 }}
        >
          Your Finds
        </h1>
        <p className="text-sm font-light mt-1" style={{ color: "var(--color-text-primary)", opacity: 0.45 }}>
          {products.length} {products.length === 1 ? "product" : "products"} identified
        </p>
      </div>

      {/* Gold rule */}
      <div className="relative z-10 mx-5 mb-6">
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C8B06A50, #C8B06A90, #C8B06A50, transparent)",
          }}
        />
      </div>

      {/* Product cards */}
      <div className="relative z-10 flex-1 px-5 pb-12 flex flex-col gap-3">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.38, ease: "easeOut" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid rgba(200,176,106,0.22)",
                boxShadow: "0 2px 18px rgba(11,60,38,0.06), 0 1px 4px rgba(200,176,106,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Main card row — tappable to view product */}
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 active:scale-[0.985] transition-transform"
              >
                {/* Product image / loading placeholder */}
                <div
                  className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(200,176,106,0.28)" }}
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "1.5rem",
                        color: "var(--color-accent-gold)",
                        lineHeight: 1,
                      }}
                    >
                      {product.brand?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-semibold tracking-[0.14em] uppercase truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {product.brand}
                  </p>
                  <p
                    className="mt-0.5 leading-snug line-clamp-2"
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "1.05rem",
                      color: "var(--color-text-primary)",
                      fontWeight: 400,
                    }}
                  >
                    {product.name}{product.shade ? ` — ${product.shade}` : ""}
                  </p>
                  {product.category && (
                    <p
                      className="text-[11px] mt-1 font-light"
                      style={{ color: "var(--color-text-primary)", opacity: 0.42 }}
                    >
                      {product.category}
                    </p>
                  )}
                </div>

                {/* Arrow pill */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#0B3C26" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6h8M6 2l4 4-4 4"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Action row — Vanity / Wishlist / Share */}
              <div className="flex items-center gap-2 px-5 pb-3 pt-1">
                <button
                  onClick={(e) => toggleVanity(product, e)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-light transition-all ${
                    product.in_vanity
                      ? "bg-[#043927] text-[#FDF5E6]"
                      : "border border-[var(--color-border)] text-primary-60"
                  }`}
                >
                  <Sparkles size={11} />
                  {product.in_vanity ? "In Vanity" : "Vanity"}
                </button>
                <button
                  onClick={(e) => toggleWishlist(product, e)}
                  disabled={product.in_vanity}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] tracking-[0.12em] uppercase font-light transition-all ${
                    product.in_vanity
                      ? "opacity-30 cursor-not-allowed border border-[var(--color-border)] text-primary-40"
                      : product.in_wishlist
                        ? "border border-[#BC8F8F] bg-[#BC8F8F]/10 text-[#BC8F8F]"
                        : "border border-[var(--color-border)] text-primary-60"
                  }`}
                >
                  <Heart size={11} fill={product.in_wishlist ? "currentColor" : "none"} />
                  {product.in_wishlist ? "Wishlisted" : "Wishlist"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShareProduct(product); }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] tracking-[0.12em] uppercase font-light border border-[var(--color-border)] text-primary-60 transition-all"
                >
                  <Share2 size={11} />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom shelf edge */}
      <div className="relative z-10 mx-5 mb-3">
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C8B06A50, #C8B06A90, #C8B06A50, transparent)",
          }}
        />
      </div>

      {/* Footer hint */}
      <p
        className="relative z-10 text-center text-[10px] pb-10 tracking-[0.12em] uppercase"
        style={{ color: "var(--color-text-primary)", opacity: 0.28 }}
      >
        Tap a product to explore
      </p>

      {/* Share sheet */}
      {shareProduct && (
        <ScanShareSheet product={shareProduct} onClose={() => setShareProduct(null)} />
      )}
    </div>
  );
}