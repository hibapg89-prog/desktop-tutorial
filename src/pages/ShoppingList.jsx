import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag, Check, Sparkles, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SwanLogo from "@/components/SwanLogo";
import { formatPrice } from "@/utils/locale";

function resolveRetailerUrl(product, countryCode) {
  const links = Array.isArray(product.retailer_links) ? product.retailer_links : [];
  if (links.length === 0) return product.source_url || null;
  const exact = links.find(l => l.country?.toUpperCase() === (countryCode || "").toUpperCase());
  if (exact?.url) return exact.url;
  const us = links.find(l => l.country?.toUpperCase() === "US");
  if (us?.url) return us.url;
  return links[0]?.url || product.source_url || null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByCategory(products) {
  const groups = {};
  products.forEach((p) => {
    const cat = p.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(p);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

// ── Product row ───────────────────────────────────────────────────────────────

function ProductRow({ product, acquired, onQty, onAcquire, onRemove, countryCode }) {
  const shopUrl = !acquired ? resolveRetailerUrl(product, countryCode) : null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-3.5 border flex items-center gap-3 transition-colors ${
        acquired
          ? "bg-[rgba(200,176,106,0.06)] border-[#C8B06A]/30"
          : "bg-[var(--color-bg-surface)] border-[var(--color-border)]"
      }`}
    >
      {/* Thumbnail */}
      <Link
        to={`/product/${product.id}`}
        className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-[var(--color-bg-elevated)]"
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <SwanLogo size={22} color="var(--color-text-primary)" />
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] tracking-wider uppercase font-light text-primary-40 truncate">
          {product.brand}
        </p>
        <p
          className={`text-sm font-light truncate leading-snug transition-colors ${
            acquired ? "text-primary-35 line-through" : "text-[var(--color-text-primary)]"
          }`}
        >
          {product.name}
        </p>
        {product.price > 0 && (
          <p className={`text-xs font-light ${acquired ? "text-primary-25" : "text-primary-50"}`}>
            {formatPrice(product.price)}
            {(product.shopping_qty || 1) > 1 && (
              <span className="text-primary-35"> × {product.shopping_qty}</span>
            )}
          </p>
        )}
        {shopUrl && (
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] tracking-[0.12em] uppercase text-[#C8B06A] font-light mt-0.5 inline-block"
          >
            Shop Now →
          </a>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Qty stepper — hidden when acquired */}
        {!acquired && (
          <div className="flex items-center gap-1 bg-[var(--color-bg-elevated)] rounded-full px-1 py-0.5">
            <button
              onClick={() => onQty(product, -1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors"
            >
              <Minus size={10} color="var(--color-text-primary)" />
            </button>
            <span className="text-xs font-light w-4 text-center text-[var(--color-text-primary)]">
              {product.shopping_qty || 1}
            </span>
            <button
              onClick={() => onQty(product, 1)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white transition-colors"
            >
              <Plus size={10} color="var(--color-text-primary)" />
            </button>
          </div>
        )}

        {/* Acquire + Remove */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAcquire(product)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${acquired ? "bg-[#C8B06A]" : "bg-[#043927]"}`}
            aria-label={acquired ? "Unmark" : "Mark as acquired"}
          >
            <Check size={12} color="#FDF5E6" />
          </button>
          <button
            onClick={() => onRemove(product)}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--color-border)]/50 hover:bg-red-50 transition-colors"
            aria-label="Remove"
          >
            <Trash2 size={11} color="#BC8F8F" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShoppingList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const countryCode = user?.country_code || null;
  const [items,       setItems]       = useState([]);
  const [favorites,   setFavorites]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [acquiredIds, setAcquiredIds] = useState(new Set());

  const load = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      const [list, vanity] = await Promise.all([
        base44.entities.Product.filter({ in_shopping_list: true, created_by_id: me.id }),
        base44.entities.Product.filter({ in_vanity: true, created_by_id: me.id }),
      ]);
      const safeList   = Array.isArray(list)   ? list   : [];
      const safeVanity = Array.isArray(vanity) ? vanity : [];
      setItems(safeList);
      const favs = safeVanity.filter(
        (p) => (p.rating || 0) >= 4 || (p.tags || []).includes("daily use")
      );
      setFavorites(favs.filter((p) => !safeList.find((i) => i.id === p.id)));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateQty = async (product, delta) => {
    const qty = Math.max(1, (product.shopping_qty || 1) + delta);
    setItems((prev) => prev.map((p) => p.id === product.id ? { ...p, shopping_qty: qty } : p));
    await base44.entities.Product.update(product.id, { shopping_qty: qty }).catch(() => {});
  };

  const remove = async (product) => {
    setItems((prev) => prev.filter((p) => p.id !== product.id));
    setAcquiredIds((prev) => { const s = new Set(prev); s.delete(product.id); return s; });
    await base44.entities.Product.update(product.id, { in_shopping_list: false, shopping_qty: 1 }).catch(() => {});
  };

  const toggleAcquired = (product) => {
    setAcquiredIds((prev) => {
      const s = new Set(prev);
      if (s.has(product.id)) s.delete(product.id);
      else s.add(product.id);
      return s;
    });
  };

  const moveAcquiredToVanity = async () => {
    const toMove = items.filter((p) => acquiredIds.has(p.id));
    setItems((prev) => prev.filter((p) => !acquiredIds.has(p.id)));
    setAcquiredIds(new Set());
    await Promise.all(
      toMove.map((p) =>
        base44.entities.Product.update(p.id, {
          in_vanity: true,
          in_shopping_list: false,
          shopping_qty: 1,
        }).catch(() => {})
      )
    );
  };

  const quickAdd = async (product) => {
    setItems((prev) => [...prev, { ...product, in_shopping_list: true, shopping_qty: 1 }]);
    setFavorites((prev) => prev.filter((p) => p.id !== product.id));
    await base44.entities.Product.update(product.id, { in_shopping_list: true, shopping_qty: 1 }).catch(() => {});
  };

  const pendingItems  = items.filter((p) => !acquiredIds.has(p.id));
  const acquiredItems = items.filter((p) => acquiredIds.has(p.id));
  const groups        = groupByCategory(pendingItems);
  const total         = pendingItems.reduce((s, p) => s + (p.price || 0) * (p.shopping_qty || 1), 0);
  const totalUnits    = pendingItems.reduce((s, p) => s + (p.shopping_qty || 1), 0);

  return (
    <div className="min-h-screen pb-28 bg-[var(--color-bg)]">

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] flex-shrink-0"
          >
            <ChevronLeft size={18} color="var(--color-text-primary)" />
          </button>
          <div className="flex-1">
            <p className="text-[9px] tracking-[0.22em] uppercase text-primary-40 font-light">
              Le Rituel
            </p>
            <h1 className="font-serif text-xl text-[var(--color-text-primary)] leading-tight">Shopping List</h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1.5 text-primary-35">
              <ShoppingBag size={15} strokeWidth={1.5} />
              <span className="text-xs font-light">{items.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/30 to-transparent mb-5" />

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="swan-float"><SwanLogo size={40} color="var(--color-accent-gold)" /></div>
        </div>
      ) : items.length === 0 ? (

        /* Empty state */
        <div className="flex flex-col items-center py-16 text-center px-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-[rgba(200,176,106,0.10)] border border-[#C8B06A]/25">
            <ShoppingBag size={24} strokeWidth={1} color="var(--color-accent-gold)" />
          </div>
          <p className="font-serif text-base text-primary-50 italic mb-1.5">
            Your list is empty
          </p>
          <p className="text-xs font-light leading-relaxed text-primary-30 max-w-[200px]">
            Save products from search results to restock them here.
          </p>
          <Link
            to="/discover"
            className="mt-6 px-6 py-2.5 rounded-full text-[10px] tracking-[0.22em] uppercase font-light bg-[#043927] text-[#FDF5E6]"
          >
            Discover products
          </Link>
        </div>

      ) : (
        <div className="px-5">

          {/* Category groups (pending) */}
          <AnimatePresence>
            {groups.map(({ category, items: groupItems }) => {
              const groupTotal = groupItems.reduce(
                (s, p) => s + (p.price || 0) * (p.shopping_qty || 1),
                0
              );
              return (
                <motion.div
                  key={category}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-7"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[10px] tracking-[0.25em] uppercase font-light text-primary-40">
                      {category}
                    </h2>
                    {groupTotal > 0 && (
                      <span className="text-[10px] font-light text-primary-35">
                        {formatPrice(groupTotal)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <AnimatePresence>
                      {groupItems.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          acquired={false}
                          onQty={updateQty}
                          onAcquire={toggleAcquired}
                          onRemove={remove}
                          countryCode={countryCode}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Acquired section */}
          <AnimatePresence>
            {acquiredItems.length > 0 && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-7"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[10px] tracking-[0.25em] uppercase font-light text-[var(--color-accent-gold)]">
                    Acquired · {acquiredItems.length}
                  </h2>
                  <button
                    onClick={moveAcquiredToVanity}
                    className="flex items-center gap-1 text-[10px] font-light text-[var(--color-text-primary)] hover:opacity-60 transition-opacity"
                  >
                    Move to Vanity <ArrowRight size={10} />
                  </button>
                </div>
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {acquiredItems.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        acquired
                        onQty={updateQty}
                        onAcquire={toggleAcquired}
                        onRemove={remove}
                        countryCode={countryCode}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estimated total */}
          {pendingItems.length > 0 && (
            <motion.div
              layout
              className="rounded-2xl px-5 py-4 flex items-center justify-between mb-8 bg-[#043927]"
            >
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase font-light text-[var(--color-accent-gold)] mb-0.5">
                  Estimated total
                </p>
                <p className="font-serif text-2xl font-light text-[#FDF5E6]">
                  {formatPrice(total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-light text-[#FDF5E6]/40">
                  {totalUnits} item{totalUnits !== 1 ? "s" : ""}
                </p>
                {groups.length > 1 && (
                  <p className="text-[10px] font-light text-[#FDF5E6]/30 mt-0.5">
                    {groups.length} categories
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick add — vanity favorites */}
          {favorites.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} strokeWidth={1.5} color="var(--color-accent-gold)" />
                <p className="text-[10px] tracking-[0.2em] uppercase font-light text-primary-45">
                  Quick add — your favorites
                </p>
              </div>
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 -mx-5 px-5">
                {favorites.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-28 rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-surface)]"
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="block aspect-square bg-[var(--color-bg-elevated)]"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <SwanLogo size={22} color="var(--color-text-primary)" />
                        </div>
                      )}
                    </Link>
                    <div className="p-2">
                      <p className="text-[8px] uppercase font-light truncate text-primary-40">
                        {product.brand}
                      </p>
                      <p className="text-[10px] font-light truncate leading-tight mb-1.5 text-[var(--color-text-primary)]">
                        {product.name}
                      </p>
                      <button
                        onClick={() => quickAdd(product)}
                        className="w-full py-1.5 rounded-lg text-[9px] tracking-[0.15em] uppercase font-light flex items-center justify-center gap-1 bg-[#C8B06A] text-[#FDF5E6]"
                      >
                        <Plus size={10} strokeWidth={2} /> Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
