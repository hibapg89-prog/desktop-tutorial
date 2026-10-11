import { useState, useEffect, useCallback, useRef } from "react";
import { Grid3X3, List, Layers, AlertTriangle, Sparkles, X, Heart, Tag, Check, CheckSquare, BarChart3, ArrowLeftRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { Image } from "@/components/ui/image";
import ProductImage from "@/components/ProductImage";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/utils/locale";
import VanityExport from "@/components/VanityExport";
import ShareButton from "@/components/ShareButton";
import ProductImageControls from "@/components/ProductImageControls";
import VanitySummary from "@/components/VanitySummary";
import ProductTagSheet, { TAGS, TAG_ACCENT } from "@/components/ProductTagSheet";
import BulkTagSheet from "@/components/BulkTagSheet";
import StarRating from "@/components/StarRating";

const CATEGORIES = ["Makeup", "Fragrance", "Skincare", "Haircare", "Body", "Nails", "Devices", "Accessories", "Men's Grooming", "Pet Care", "Intimate Hygiene"];

const BAD_BRANDS = ["not identified", "unknown", "n/a", "none", "unidentified"];
const isIdentified = (p) => p.brand && !BAD_BRANDS.includes(p.brand.trim().toLowerCase()) && !p.brand.trim().toLowerCase().startsWith("not ");

const VANITY_BANNER_URL = "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/ad9ca50a5_generated_image.png";

const CAT_ACCENT = {
  Makeup: "#BC8F8F",
  Fragrance: "#8F8FAA",
  Skincare: "#6B9E6B",
  Haircare: "#A89B6B",
  Body: "#C4A882",
  Nails: "#B48FAA",
  Devices: "#7A9BA8",
  Accessories: "#A8906B",
  "Men's Grooming": "#7A8FA8",
  "Pet Care": "#8FA87A",
  "Intimate Hygiene": "#A87A90",
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.floor((new Date(dateStr) - new Date()) / 86400000);
}

// deterministic rotation per product id — stable across re-renders
function pseudoRot(id = "") {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h * 31) + id.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 100) - 50) / 14;
}

// ── small reusable components ──────────────────────────────────────────────

function ExpiryBadge({ days }) {
  if (days === null || days > 90) return null;
  const urgent = days <= 30;
  return (
    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${urgent ? "bg-red-500" : "bg-amber-400"}`}>
      <AlertTriangle size={9} color="white" />
    </div>
  );
}

function SaleBadge({ product }) {
  if (!product.on_sale) return null;
  return (
    <div className="absolute top-2 left-2 bg-[var(--color-accent-gold)] text-white text-[0.5rem] font-medium px-1.5 py-0.5 rounded-full">
      {product.sale_discount_pct > 0 ? `-${Math.round(product.sale_discount_pct)}%` : "SALE"}
    </div>
  );
}

function ProductThumb({ product }) {
  return (
    <ProductImage product={product} className="w-full h-full" alt={product.name} />
  );
}

function TagChips({ tags }) {
  if (!tags || !tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map(t => (
        <span
          key={t}
          className="text-[0.5rem] font-light px-1.5 py-0.5 rounded-full capitalize"
          style={{ color: TAG_ACCENT[t], background: `${TAG_ACCENT[t]}15`, border: `1px solid ${TAG_ACCENT[t]}30` }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function SelectDot({ selected }) {
  return (
    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center z-10 ${selected ? "bg-[#043927]" : "bg-[var(--color-bg-surface)]/90 border border-[var(--color-border)]"}`}>
      {selected && <Check size={13} color="#FDF5E6" />}
    </div>
  );
}

function MuseAlertCard({ alert, onDismiss }) {
  if (!alert) return null;
  const { type, product, days } = alert;
  const isUrgent = type === "expiry" && days <= 30;

  const headline = type === "expiry"
    ? (days <= 0 ? "A gentle farewell" : days <= 30 ? "A gentle nudge" : "A quiet reminder")
    : "A new whisper";

  const body = type === "expiry"
    ? (days <= 0
        ? `${product.brand} ${product.name} has expired — time to let it go`
        : days <= 30
        ? `${product.brand} ${product.name} expires in ${days} day${days !== 1 ? "s" : ""} — use it soon`
        : `${product.brand} ${product.name} expires in ${days} days`)
    : `${product.brand} ${product.name} is now on sale — ${product.sale_discount_pct > 0 ? `${Math.round(product.sale_discount_pct)}% off` : "check the price"}`;

  // Hardcoded colors — the light gradient bg must never inherit dark-mode text tokens
  const accent = isUrgent ? "#B85450" : type === "expiry" ? "#B8862A" : "#C8B06A";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mx-5 mb-4 rounded-full pl-2 pr-2 py-2 flex items-center gap-2.5"
      style={{
        background: isUrgent
          ? "linear-gradient(135deg, #F5E8E6 0%, #FBF2F0 100%)"
          : "linear-gradient(135deg, #F5F2EA 0%, #FBF9F2 100%)",
        border: `1px solid ${accent}40`,
      }}
    >
      {/* Swan icon — circular with gold border */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center"
        style={{ border: `1.5px solid ${accent}`, background: "#0D1A14" }}
      >
        <SwanLogo size={20} />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[0.8125rem] leading-tight" style={{ color: "#1B3A25", fontWeight: 500 }}>
          {headline}
        </p>
        <p className="text-[0.6875rem] leading-snug mt-0.5 truncate" style={{ color: "#3A3A3A", fontWeight: 400 }}>
          {body}
        </p>
      </div>

      {/* Gold line + sparkle */}
      <div className="flex-shrink-0 flex items-center gap-0.5">
        <div className="w-6 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
        <Sparkles size={11} color={accent} />
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={11} color="#1B3A25" />
      </button>
    </motion.div>
  );
}

// ── BrushHolder SVG decoration ─────────────────────────────────────────────

function BrushHolder() {
  return (
    <svg width="44" height="72" viewBox="0 0 44 72" fill="none">
      <rect x="6"  y="6"  width="2.5" height="28" rx="1.25" fill="#7A6548" opacity="0.85" />
      <rect x="12" y="2"  width="2.5" height="24" rx="1.25" fill="#8B7355" opacity="0.9" />
      <rect x="18" y="8"  width="2.5" height="26" rx="1.25" fill="#7A6548" opacity="0.85" />
      <rect x="25" y="0"  width="2.5" height="22" rx="1.25" fill="#956E50" opacity="0.85" />
      <rect x="31" y="5"  width="2.5" height="25" rx="1.25" fill="#8B7355" opacity="0.9" />
      <ellipse cx="7.25"  cy="5"  rx="4.5" ry="3"   fill="#A8896C" opacity="0.9" />
      <ellipse cx="13.25" cy="1"  rx="4"   ry="2.5" fill="#9E8060" opacity="0.9" />
      <ellipse cx="19.25" cy="7"  rx="3.5" ry="2.5" fill="#B08070" opacity="0.9" />
      <ellipse cx="26.25" cy="-1" rx="3.5" ry="2"   fill="#A0806A" opacity="0.9" />
      <ellipse cx="32.25" cy="4"  rx="3.5" ry="2.5" fill="#A8896C" opacity="0.9" />
      <rect x="2" y="28" width="40" height="40" rx="6" fill="#C8B06A" opacity="0.88" />
      <rect x="2" y="28" width="40" height="9"  rx="5" fill="#D4BB78" opacity="0.95" />
      <rect x="5" y="30" width="4"  height="24" rx="2" fill="white"  opacity="0.18" />
      <rect x="2" y="64" width="40" height="4"  rx="3" fill="#A8906A" opacity="0.25" />
    </svg>
  );
}

// ── DraggableProduct — free 2D drag on canvas ────────────────────────────────────

function DraggableProduct({ product, initPos, onDragEnd }) {
  const navigate = useNavigate();
  const x = useMotionValue(initPos.x);
  const y = useMotionValue(initPos.y);
  const [dragging, setDragging] = useState(false);

  return (
    <motion.div
      drag
      dragMomentum={false}
      style={{ x, y, rotate: initPos.r || 0, position: "absolute", touchAction: "none", userSelect: "none", zIndex: dragging ? 50 : 1 }}
      whileDrag={{ scale: 1.12, filter: "drop-shadow(0 8px 24px rgba(4,57,39,0.22))" }}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => { setDragging(false); onDragEnd({ x: x.get(), y: y.get(), r: initPos.r || 0 }); }}
      onTap={() => navigate(`/product/${product.id}`)}
      className="cursor-grab active:cursor-grabbing"
    >
      <div className="w-16 select-none">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} draggable={false} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center shadow-md border border-[var(--color-border)]">
            <SwanLogo size={20} color="var(--color-text-primary)" />
          </div>
        )}
        <p className="text-[0.5rem] text-primary-50 font-light text-center mt-1 truncate">{product.brand}</p>
      </div>
    </motion.div>
  );
}

// ── VanityCanvas — 2D marble surface with freely draggable products ─────────────

function VanityCanvas({ products }) {
  const [posMap, setPosMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("luxe_v2d") || "{}"); } catch { return {}; }
  });
  const COLS = 4, COL_W = 76, ROW_H = 108, X_PAD = 16, Y_PAD = 28;
  const canvasH = Math.max(480, Math.ceil(products.length / COLS) * ROW_H + Y_PAD + 56);

  const getInitPos = (p, i) => {
    if (posMap[p.id]) return posMap[p.id];
    return { x: X_PAD + (i % COLS) * COL_W, y: Y_PAD + Math.floor(i / COLS) * ROW_H, r: pseudoRot(p.id) };
  };

  const savePos = useCallback((id, pos) => {
    setPosMap(prev => {
      const next = { ...prev, [id]: pos };
      localStorage.setItem("luxe_v2d", JSON.stringify(next));
      return next;
    });
  }, []);

  if (products.length === 0) {
    return (
      <div className="mx-5 rounded-3xl bg-[var(--color-bg-elevated)]/40 border border-[var(--color-border)] flex flex-col items-center justify-center py-16">
        <SwanLogo size={40} color="var(--color-accent-gold)" />
        <p className="font-serif text-sm text-primary-40 italic mt-3">Your vanity awaits its first treasure</p>
      </div>
    );
  }

  return (
    <div className="mx-5 rounded-3xl overflow-hidden relative border border-[var(--color-border)]" style={{ height: canvasH }}>
      <img
        src="https://images.unsplash.com/photo-1615529162924-f8605388461d?w=700&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.28 }}
        draggable={false}
      />
      <div className="absolute inset-0 bg-[var(--color-bg)]" style={{ opacity: 0.52 }} />
      {products.map((p, i) => (
        <DraggableProduct
          key={p.id}
          product={p}
          initPos={getInitPos(p, i)}
          onDragEnd={(pos) => savePos(p.id, pos)}
        />
      ))}
      <div className="absolute top-3 right-3 pointer-events-none">
        <BrushHolder />
      </div>
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="text-[0.5625rem] tracking-[0.3em] text-primary-40 uppercase font-light">DRAG TO REARRANGE · MY VANITY</span>
      </div>
    </div>
  );
}

// ── PanelProduct — draggable item for split-screen ─────────────────────────────

function PanelProduct({ product, targetRef, onMove }) {
  const inRect = (rect, point) =>
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  const [isDragging, setIsDragging] = useState(false);
  const [trails, setTrails] = useState([]);
  const trailIdRef = useRef(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const spawnTrail = () => {
    const id = trailIdRef.current++;
    setTrails(prev => [...prev.slice(-6), { id, x: x.get(), y: y.get() }]);
    setTimeout(() => setTrails(prev => prev.filter(t => t.id !== id)), 500);
  };

  return (
    <div style={{ position: "relative" }}>
      {isDragging && trails.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0.7, scale: 0.9 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: t.x - 6,
            top: t.y - 6,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,176,106,0.9) 0%, rgba(255,249,232,0.6) 60%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 999,
          }}
        />
      ))}
      <motion.div
        drag
        dragMomentum={false}
        dragSnapToOrigin
        style={{ x, y, touchAction: "none" }}
        whileDrag={{ scale: 1.18, zIndex: 60, filter: "drop-shadow(0 16px 32px rgba(4,57,39,0.28))" }}
        onDragStart={() => setIsDragging(true)}
        onDrag={() => spawnTrail()}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          setTrails([]);
          if (targetRef.current && inRect(targetRef.current.getBoundingClientRect(), info.point)) {
            onMove(product);
          }
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} draggable={false} className="w-full aspect-square object-cover rounded-xl shadow-sm" />
        ) : (
          <div className="w-full aspect-square rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border)]">
            <SwanLogo size={14} color="var(--color-text-primary)" />
          </div>
        )}
        <p className="text-[0.4375rem] text-primary-45 font-light truncate mt-0.5 text-center leading-none">{product.brand}</p>
      </motion.div>
    </div>
  );
}

// ── VanityOrganize — split-screen drag between vanity and wishlist ──────────

function VanityOrganize({ vanityProducts, wishlistProducts, onMoveToWishlist, onMoveToVanity }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  return (
    <div className="mx-5 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm flex flex-col" style={{ minHeight: 420 }}>
      <div className="flex" style={{ minHeight: 380 }}>
        {/* Left panel: MY VANITY */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--color-border)]" ref={leftRef}>
          <div className="bg-[var(--color-bg-elevated)] px-3 py-2.5 border-b border-[var(--color-border)] flex items-center justify-center gap-1.5">
            <p className="text-[0.5625rem] tracking-[0.25em] text-primary-60 uppercase font-light">MY VANITY</p>
            <span className="text-[0.5rem] text-[var(--color-accent-gold)]">{vanityProducts.length}</span>
          </div>
          <div className="flex-1 bg-[var(--color-bg)] overflow-y-auto p-3">
            {vanityProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <SwanLogo size={28} color="var(--color-accent-gold)" />
                <p className="text-[0.5rem] text-primary-30 font-light mt-2 text-center italic">Products you own appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {vanityProducts.map(p => (
                  <PanelProduct key={p.id} product={p} targetRef={rightRef} onMove={onMoveToWishlist} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: WISHLIST */}
        <div className="flex-1 flex flex-col min-w-0" ref={rightRef}>
          <div className="bg-[var(--color-bg-elevated)] px-3 py-2.5 border-b border-[var(--color-border)] flex items-center justify-center gap-1.5">
            <Heart size={9} color="var(--color-text-primary)" className="opacity-50" />
            <p className="text-[0.5625rem] tracking-[0.25em] text-primary-60 uppercase font-light">WISHLIST</p>
            <span className="text-[0.5rem] text-[var(--color-accent-gold)]">{wishlistProducts.length}</span>
          </div>
          <div className="flex-1 bg-[var(--color-bg)] overflow-y-auto p-3">
            {wishlistProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <SwanLogo size={28} color="var(--color-accent-gold)" />
                <p className="text-[0.5rem] text-primary-30 font-light mt-2 text-center italic">Your future treasures</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {wishlistProducts.map(p => (
                  <PanelProduct key={p.id} product={p} targetRef={leftRef} onMove={onMoveToVanity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instruction bar */}
      <div className="bg-[var(--color-bg-elevated)]/80 border-t border-[var(--color-border)] py-2 text-center flex-shrink-0 flex items-center justify-center gap-1.5">
        <ArrowLeftRight size={8} color="var(--color-text-primary)" className="opacity-40" />
        <span className="text-[0.5rem] tracking-[0.2em] text-primary-40 uppercase font-light">drag to move between collections</span>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────

export default function Vanity() {
  const [activeTab, setActiveTab] = useState("vanity");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("split");
  const [vanityProducts, setVanityProducts] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOrder, setDrawerOrder] = useState([]);
  const [alertIdx, setAlertIdx] = useState(0);
  const [activeTag, setActiveTag] = useState("All");
  const [taggingProduct, setTaggingProduct] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    base44.auth.me().then(me => Promise.all([
      base44.entities.Product.filter({ in_vanity: true, created_by_id: me.id }),
      base44.entities.Product.filter({ in_wishlist: true, created_by_id: me.id }),
    ])).then(([vanity, wishlist]) => {
      const goodVanity = vanity.filter(isIdentified);
      const goodWishlist = wishlist.filter(isIdentified);
      setVanityProducts(goodVanity);
      setWishlistProducts(goodWishlist);
      try {
        const saved = JSON.parse(localStorage.getItem("luxe_vanity_order") || "[]");
        const savedSet = new Set(saved);
        const merged = [
          ...saved.filter(id => goodVanity.find(p => p.id === id)),
          ...goodVanity.filter(p => !savedSet.has(p.id)).map(p => p.id),
        ];
        setDrawerOrder(merged);
      } catch {
        setDrawerOrder(goodVanity.map(p => p.id));
      }
      setLoading(false);
    });
  }, []);

  // Realtime: flip image + status chip live when the background fetcher
  // (or a manual re-fetch) updates a product.
  useEffect(() => {
    const unsubscribe = base44.entities.Product.subscribe((event) => {
      if (event.type !== "update" || !event.data) return;
      const updated = event.data;
      const apply = (prev) => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)).filter(isIdentified);
      setVanityProducts(apply);
      setWishlistProducts(apply);
    });
    return unsubscribe;
  }, []);

  const handleImageUpdated = (updated) => {
    const apply = (prev) => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p));
    setVanityProducts(apply);
    setWishlistProducts(apply);
  };

  const persistOrder = useCallback((order) => {
    setDrawerOrder(order);
    localStorage.setItem("luxe_vanity_order", JSON.stringify(order));
  }, []);

  const handleMoveToVanity = async (product) => {
    await base44.entities.Product.update(product.id, { in_vanity: true, in_wishlist: false });
    setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
    const updated = { ...product, in_vanity: true, in_wishlist: false };
    setVanityProducts(prev => [...prev, updated]);
    persistOrder([...drawerOrder, product.id]);
  };

  const handleMoveToWishlist = async (product) => {
    await base44.entities.Product.update(product.id, { in_vanity: false, in_wishlist: true });
    setVanityProducts(prev => prev.filter(p => p.id !== product.id));
    persistOrder(drawerOrder.filter(id => id !== product.id));
    const updated = { ...product, in_vanity: false, in_wishlist: true };
    setWishlistProducts(prev => [...prev, updated]);
  };

  const handleRate = async (product, n) => {
    const rating = product.rating === n ? 0 : n;
    await base44.entities.Product.update(product.id, { rating });
    const updater = p => (p.id === product.id ? { ...p, rating } : p);
    setVanityProducts(prev => prev.map(updater));
    setWishlistProducts(prev => prev.map(updater));
  };

  const orderedVanity = drawerOrder.map(id => vanityProducts.find(p => p.id === id)).filter(Boolean);
  const activeProducts = activeTab === "vanity" ? orderedVanity : wishlistProducts;
  const presentCats = ["All", ...[...new Set(activeProducts.map(p => p.category))]];
  const presentTags = ["All", ...TAGS.filter(t => activeProducts.some(p => (p.tags || []).includes(t)))];
  const tagFiltered = activeTag === "All" ? activeProducts : activeProducts.filter(p => (p.tags || []).includes(activeTag));
  const filteredProducts = activeCategory === "All" ? tagFiltered : tagFiltered.filter(p => p.category === activeCategory);
  const sortedProducts = (() => {
    const arr = [...filteredProducts];
    switch (sortBy) {
      case "price-asc": return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc": return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "brand": return arr.sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
      default: return arr.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  })();

  const allAlerts = [
    ...vanityProducts
      .filter(isIdentified)
      .map(p => { const d = daysUntil(p.expiry_date); return d !== null && d >= 0 && d <= 90 ? { type: "expiry", product: p, days: d } : null; })
      .filter(Boolean)
      .sort((a, b) => a.days - b.days),
    ...[...vanityProducts, ...wishlistProducts]
      .filter(p => p.on_sale && isIdentified(p))
      .map(p => ({ type: "sale", product: p })),
  ];
  const currentAlert = allAlerts[alertIdx] || null;

  const dismissAlert = () => {
    if (alertIdx < allAlerts.length - 1) setAlertIdx(i => i + 1);
    else setAlertIdx(allAlerts.length);
  };

  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const selectAll = () => setSelected(new Set(filteredProducts.map(p => p.id)));
  const exitBulk = () => { setBulkMode(false); setSelected(new Set()); };

  const bulkMove = async () => {
    const ids = [...selected];
    if (!ids.length) return;
    const toVanity = activeTab === "wishlist";
    const patch = toVanity ? { in_vanity: true, in_wishlist: false } : { in_vanity: false, in_wishlist: true };
    await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, ...patch })));
    const sel = selected;
    if (toVanity) {
      const moved = wishlistProducts.filter(p => sel.has(p.id)).map(p => ({ ...p, ...patch }));
      setWishlistProducts(prev => prev.filter(p => !sel.has(p.id)));
      setVanityProducts(prev => [...prev, ...moved]);
      persistOrder([...drawerOrder, ...moved.map(p => p.id)]);
    } else {
      const moved = vanityProducts.filter(p => sel.has(p.id)).map(p => ({ ...p, ...patch }));
      setVanityProducts(prev => prev.filter(p => !sel.has(p.id)));
      persistOrder(drawerOrder.filter(id => !sel.has(id)));
      setWishlistProducts(prev => [...prev, ...moved]);
    }
    setSelected(new Set());
  };

  const applyBulkTags = async (tags) => {
    const ids = [...selected];
    if (!ids.length) return;
    await base44.entities.Product.bulkUpdate(ids.map(id => ({ id, tags })));
    const sel = selected;
    const updater = p => (sel.has(p.id) ? { ...p, tags } : p);
    setVanityProducts(prev => prev.map(updater));
    setWishlistProducts(prev => prev.map(updater));
    setBulkTagOpen(false);
  };

  const selectedProducts = activeProducts.filter(p => selected.has(p.id));
  const commonTags = TAGS.filter(t => selectedProducts.length > 0 && selectedProducts.every(p => (p.tags || []).includes(t)));

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="swan-float"><SwanLogo size={48} color="var(--color-accent-gold)" /></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Vanity header — framed banner block ─────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(200,176,106,0.45)" }}>
          {/* Top bar — title + centered toggle */}
          <div className="px-4 pt-4 pb-3" style={{ background: "#F7F3E8" }}>
            <div>
              <p className="text-[0.625rem] tracking-[0.35em] text-primary-40 uppercase font-light">La Collection</p>
              <h1 className="font-serif text-2xl text-[#1E352B] font-light mt-0.5 flex items-baseline gap-2">
                La Vanity
                {(vanityProducts.length + wishlistProducts.length) > 0 && (
                  <span className="text-sm font-light text-primary-40 italic">
                    {activeTab === "vanity" ? vanityProducts.length : wishlistProducts.length}
                  </span>
                )}
              </h1>
            </div>
            {/* Centered toggle */}
            <div className="flex justify-center mt-3">
              <div className="flex bg-white/50 rounded-full p-1 border border-white/80">
                {[
                  { key: "vanity", label: "MY VANITY", count: vanityProducts.length },
                  { key: "wishlist", label: "WISHLIST", count: wishlistProducts.length },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setActiveCategory("All");
                      setActiveTag("All");
                      setSelected(new Set());
                      if (tab.key === "wishlist") setViewMode(v => v === "canvas" ? "grid" : v);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] tracking-[0.1em] font-light transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-[#1E352B] text-white" : "text-[#7D8B84]"}`}
                  >
                    {tab.key === "wishlist" && <Heart size={10} fill={activeTab === "wishlist" ? "currentColor" : "none"} />}
                    {tab.label}
                    <span className={`text-[0.5625rem] rounded-full px-1.5 py-0.5 ${activeTab === tab.key ? "bg-white/20" : "bg-[#1E352B]/10"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Banner image with overlaid action buttons */}
          <div className="relative" style={{ height: "200px" }}>
            <Image
              src={VANITY_BANNER_URL}
              alt="La Vanity — luxury beauty flat-lay"
              fittingType="fill"
              className="w-full h-full"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <VanityExport products={vanityProducts} />
              <Link
                to="/vanity/insights"
                className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shadow-sm"
                aria-label="Vanity insights"
              >
                <BarChart3 size={16} color="var(--color-text-primary)" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <VanitySummary products={activeTab === "vanity" ? vanityProducts : wishlistProducts} />

      {/* Muse alert */}
      <AnimatePresence>
        {currentAlert && alertIdx < allAlerts.length && (
          <MuseAlertCard key={alertIdx} alert={currentAlert} onDismiss={dismissAlert} />
        )}
      </AnimatePresence>

      {/* View mode + category filter */}
      <div className="px-5 mb-4 flex items-center gap-3">
        <div className="flex bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] p-1 flex-shrink-0 shadow-sm">
          {[
            { mode: "grid",   Icon: Grid3X3 },
            { mode: "canvas", Icon: Layers },
            { mode: "list",   Icon: List },
            { mode: "split",  Icon: ArrowLeftRight },
          ].map(({ mode, Icon }) => {
            const disabled =
              (mode === "canvas" && (activeTab === "wishlist" || bulkMode)) ||
              (mode === "split" && bulkMode);
            return (
              <button
                key={mode}
                onClick={() => {
                  if (disabled) return;
                  setViewMode(mode);
                  if (mode === "canvas") setActiveTab("vanity");
                }}
                disabled={disabled}
                aria-label={`${mode} view`}
                aria-pressed={viewMode === mode}
                className={`w-9 h-8 rounded-lg flex items-center justify-center transition-all ${disabled ? "opacity-25 cursor-not-allowed" : ""} ${viewMode === mode ? "bg-[#1E352B] shadow-sm" : "bg-[var(--color-bg-elevated)]/50 hover:bg-[var(--color-bg-elevated)]"}`}
              >
                <Icon size={15} color={viewMode === mode ? "#FDF5E6" : "var(--color-text-primary)"} aria-hidden={true} />
              </button>
            );
          })}
        </div>

        {/* Category pills */}
        <div className="overflow-x-auto hide-scrollbar flex-1">
          <div className="flex gap-2 pb-0.5">
            {presentCats.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide transition-all border ${activeCategory === cat ? "bg-[#043927] text-[#FDF5E6] border-[#043927]" : "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setBulkMode(v => !v);
            setSelected(new Set());
            if (!bulkMode && (viewMode === "canvas" || viewMode === "split")) setViewMode("grid");
          }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide border transition-all ${bulkMode ? "bg-[#043927] text-[#FDF5E6] border-[#043927]" : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]"}`}
        >
          <CheckSquare size={13} color={bulkMode ? "#FDF5E6" : "var(--color-text-primary)"} />
          {bulkMode ? "Done" : "Bulk"}
        </button>
      </div>

      {/* Tag filter */}
      {presentTags.length > 1 && (
        <div className="px-5 mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {presentTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide transition-all border flex items-center gap-1.5 capitalize ${activeTag === tag ? "text-[#FDF5E6] border-transparent" : "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)]"}`}
              style={activeTag === tag ? { background: TAG_ACCENT[tag] || "#043927" } : {}}
            >
              {tag !== "All" && <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeTag === tag ? "#FDF5E6" : TAG_ACCENT[tag] }} />}
              {tag === "All" ? "All tags" : tag}
            </button>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto hide-scrollbar items-center">
        <span className="text-[0.5625rem] tracking-[0.2em] uppercase text-primary-40 font-light flex-shrink-0">Sort</span>
        {[
          { key: "recent",     label: "Recently added" },
          { key: "price-asc",  label: "Price ↑" },
          { key: "price-desc", label: "Price ↓" },
          { key: "brand",      label: "Brand A–Z" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[0.6875rem] font-light tracking-wide transition-all border ${sortBy === s.key ? "bg-[#043927] text-[#FDF5E6] border-[#043927]" : "bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)]"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pb-32">
        <AnimatePresence mode="wait">
          {viewMode === "split" ? (
            <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VanityOrganize
                vanityProducts={vanityProducts}
                wishlistProducts={wishlistProducts}
                onMoveToWishlist={handleMoveToWishlist}
                onMoveToVanity={handleMoveToVanity}
              />
            </motion.div>
          ) : viewMode === "canvas" ? (
            <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VanityCanvas products={filteredProducts} />
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 text-center px-8"
            >
              <SwanLogo size={56} color="var(--color-accent-gold)" className="mb-5" />
              <p className="font-serif text-lg text-primary-40 italic leading-relaxed">
                {activeTab === "vanity"
                  ? activeProducts.length === 0
                    ? "Your vanity awaits its first treasure"
                    : `Nothing in ${activeCategory}`
                  : activeProducts.length === 0
                  ? "Your wishlist is empty — let The Muse inspire you"
                  : `Nothing in ${activeCategory}`}
              </p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5">
              <div className="grid grid-cols-3 gap-3">
                {sortedProducts.map((product, i) => {
                  const expDays = daysUntil(product.expiry_date);
                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link to={`/product/${product.id}`} className="block" onClick={bulkMode ? (e) => { e.preventDefault(); toggleSelect(product.id); } : undefined}>
                        <div className="relative rounded-2xl overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-sm">
                          <div className="aspect-square">
                            <ProductThumb product={product} />
                          </div>
                          {bulkMode && <SelectDot selected={selected.has(product.id)} />}
                          {!bulkMode && <SaleBadge product={product} />}
                          <ExpiryBadge days={expDays} />
                          <div className="absolute bottom-1.5 right-1.5">
                            <ShareButton product={product} className="w-7 h-7 bg-[var(--color-bg-surface)]/85 backdrop-blur hover:bg-[var(--color-bg-surface)]" />
                          </div>
                          <div className="absolute bottom-1.5 left-1.5">
                            <button
                              onClick={e => { e.preventDefault(); e.stopPropagation(); setTaggingProduct(product); }}
                              className="w-7 h-7 rounded-full bg-[var(--color-bg-surface)]/85 backdrop-blur flex items-center justify-center"
                              aria-label="Tag product"
                            >
                              <Tag size={13} color={product.tags && product.tags[0] ? TAG_ACCENT[product.tags[0]] : "#043927"} />
                            </button>
                          </div>
                          {!bulkMode && (
                            <div className="absolute top-1.5 left-1/2 -translate-x-1/2" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                              <ProductImageControls product={product} onUpdated={handleImageUpdated} size="xs" />
                            </div>
                          )}
                        </div>
                        <p className="text-[0.5625rem] tracking-wide text-primary-40 mt-1.5 font-light uppercase truncate px-0.5">{product.brand}</p>
                        <p className="text-xs text-[var(--color-text-primary)] font-light truncate leading-tight px-0.5">{product.name}</p>
                        <div className="px-0.5 mt-1" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                          <StarRating value={product.rating || 0} onChange={(n) => handleRate(product, n)} size={11} />
                        </div>
                        <TagChips tags={product.tags} />
                        {activeTab === "wishlist" && (
                          <button
                            onClick={e => { e.preventDefault(); handleMoveToVanity(product); }}
                            className="mt-1 w-full text-[0.5625rem] font-light text-[var(--color-text-primary)]/70 bg-[var(--color-border)] rounded-lg py-1 text-center tracking-wide hover:bg-[#043927] hover:text-[#FDF5E6] transition-colors"
                          >
                            Move to Vanity
                          </button>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* LIST VIEW — grouped by category */
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5">
              {(activeCategory !== "All" ? [activeCategory] : CATEGORIES.filter(c => filteredProducts.find(p => p.category === c))).map(cat => {
                const catProducts = sortedProducts.filter(p => p.category === cat);
                if (!catProducts.length) return null;
                const accent = CAT_ACCENT[cat] || "#A89B6B";
                return (
                  <div key={cat} className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                      <p className="text-[0.625rem] tracking-[0.2em] uppercase font-light" style={{ color: accent }}>{cat}</p>
                      <span className="text-[0.625rem] text-primary-30 font-light">{catProducts.length}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {catProducts.map(product => {
                        const expDays = daysUntil(product.expiry_date);
                        return (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="flex items-center gap-3.5 bg-[var(--color-bg-surface)] rounded-2xl p-4 border border-[var(--color-border)] shadow-sm"
                            onClick={bulkMode ? (e) => { e.preventDefault(); toggleSelect(product.id); } : undefined}
                          >
                            {bulkMode && (
                              <button
                                onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSelect(product.id); }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selected.has(product.id) ? "bg-[#043927]" : "border border-[var(--color-border)]"}`}
                              >
                                {selected.has(product.id) && <Check size={13} color="#FDF5E6" />}
                              </button>
                            )}
                            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-[var(--color-border)] shadow-sm bg-[var(--color-bg-surface)]">
                              <ProductThumb product={product} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--color-text-primary)] font-light truncate">{product.brand} — {product.name}</p>
                              {product.shade && <p className="text-xs text-primary-40 font-light">{product.shade}</p>}
                              {expDays !== null && expDays >= 0 && expDays <= 90 && (
                                <p className={`text-[0.625rem] font-light mt-0.5 ${expDays <= 30 ? "text-red-500" : "text-amber-600"}`}>
                                  Expires in {expDays} day{expDays !== 1 ? "s" : ""}
                                </p>
                              )}
                              <TagChips tags={product.tags} />
                              <div onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                                <StarRating value={product.rating || 0} onChange={(n) => handleRate(product, n)} size={13} />
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                              {product.on_sale && <span className="text-[0.5625rem] bg-[var(--color-accent-gold)] text-white rounded-full px-1.5 py-0.5">SALE</span>}
                              {product.price > 0 && <span className="text-xs text-primary-60 font-light">{formatPrice(product.price)}</span>}
                              <button
                                onClick={e => { e.preventDefault(); e.stopPropagation(); setTaggingProduct(product); }}
                                className="w-7 h-7 rounded-full bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border)] flex items-center justify-center"
                                aria-label="Tag product"
                              >
                                <Tag size={13} color={product.tags && product.tags[0] ? TAG_ACCENT[product.tags[0]] : "#043927"} />
                              </button>
                              <ShareButton product={product} className="w-7 h-7 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border)]" />
                              <ProductImageControls product={product} onUpdated={handleImageUpdated} size="xs" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    {activeTab === "vanity" && !bulkMode && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => catProducts.forEach(p => handleMoveToWishlist(p))}
                          className="text-[0.625rem] text-primary-30 font-light underline underline-offset-2"
                        >
                          Move all to wishlist
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk action bar */}
      {bulkMode && (
        <div className="fixed bottom-24 left-0 right-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <span className="text-xs text-primary-60 font-light">{selected.size} selected</span>
            <div className="flex-1" />
            <button onClick={selectAll} className="text-[0.6875rem] text-primary-60 font-light px-2 py-1.5 rounded-full hover:bg-[var(--color-border)]">Select all</button>
            <button
              onClick={() => setBulkTagOpen(true)}
              disabled={!selected.size}
              className="flex items-center gap-1 text-[0.6875rem] font-light px-3 py-1.5 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-40"
            >
              <Tag size={12} /> Tag
            </button>
            <button
              onClick={bulkMove}
              disabled={!selected.size}
              className="text-[0.6875rem] font-light px-3 py-1.5 rounded-full bg-[#043927] text-[#FDF5E6] disabled:opacity-40"
            >
              {activeTab === "vanity" ? "To Wishlist" : "To Vanity"}
            </button>
          </div>
        </div>
      )}

      {bulkTagOpen && (
        <BulkTagSheet
          count={selected.size}
          initialTags={commonTags}
          onClose={() => setBulkTagOpen(false)}
          onApply={applyBulkTags}
        />
      )}

      {taggingProduct && (
        <ProductTagSheet
          product={taggingProduct}
          onClose={() => setTaggingProduct(null)}
          onUpdated={(updated) => {
            const updater = p => (p.id === updated.id ? updated : p);
            setVanityProducts(prev => prev.map(updater));
            setWishlistProducts(prev => prev.map(updater));
            setTaggingProduct(updated);
          }}
        />
      )}
    </main>
  );
}
