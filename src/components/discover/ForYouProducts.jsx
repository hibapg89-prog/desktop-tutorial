import { useState, useEffect } from "react";
import { Sparkles, Check, Heart, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import ProductImage from "@/components/ProductImage";
import ShareButton from "@/components/ShareButton";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/utils/locale";

const CAT_ACCENT = {
  Makeup:                   "#BC8F8F",
  Fragrance:                "#8F8FAA",
  Skincare:                 "#6B9E6B",
  Haircare:                 "#A89B6B",
  Body:                     "#C4A882",
  Nails:                    "#B48FAA",
  Devices:                  "#7A9BA8",
  Accessories:              "#A8906B",
  "Men's Grooming":         "#7A8FA8",
  "Pet Care":               "#8FA87A",
  "Intimate Hygiene":       "#A87A90",
  "Intimate Care":          "#A87A90",
  Tools:                    "#9B8F7A",
  "Cosmetic Bags & Cases":  "#A8907A",
};

const BEAUTY_CATEGORIES = new Set(Object.keys(CAT_ACCENT));

const withTimeout = (promise, ms = 12000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

export default function ForYouProducts() {
  const [picks,        setPicks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [collectedIdx, setCollectedIdx] = useState(new Set());
  const [adoredIdx,    setAdoredIdx]    = useState(new Set());

  useEffect(() => {
    const controller = { cancelled: false };

    (async () => {
      try {
        const me = await withTimeout(base44.auth.me().catch(() => null));
        if (controller.cancelled) return;

        if (!me?.id) { setPicks([]); return; }

        const myProducts = await withTimeout(
          base44.entities.Product.filter({ created_by_id: me.id })
        );
        if (controller.cancelled) return;

        // Derive beauty categories and brands from scan history
        const userBeautyCategories = [...new Set(
          myProducts.map(p => p.category).filter(c => c && BEAUTY_CATEGORIES.has(c))
        )];
        const userBrands = [...new Set(myProducts.map(p => p.brand).filter(Boolean))].slice(0, 8);

        if (!userBeautyCategories.length) { setPicks([]); return; }

        const prompt = `A luxury beauty concierge user has scanned and saved products in these beauty categories: ${userBeautyCategories.join(", ")} from brands including: ${userBrands.join(", ")}. Recommend 6 NEW beauty products they'd adore but don't own yet — ONLY within beauty, skincare, haircare, fragrance, or cosmetics. Do NOT suggest clothing, electronics, food, or any non-beauty item. Stay within their preferred categories. Return JSON with brand, name, shade (or empty string), category (must be one of: ${userBeautyCategories.join(", ")}), price_usd, description, muse_shimmer (poetic editorial tagline, max 8 words).`;

        const result = await withTimeout(base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    brand:        { type: "string" },
                    name:         { type: "string" },
                    shade:        { type: "string" },
                    category:     { type: "string" },
                    price_usd:    { type: "number" },
                    description:  { type: "string" },
                    muse_shimmer: { type: "string" },
                  },
                },
              },
            },
          },
        }), 15000);

        if (controller.cancelled) return;

        // Hard-filter LLM output to beauty categories only
        const initialPicks = (result.products || [])
          .filter(p => p.category && BEAUTY_CATEGORIES.has(p.category));

        setPicks(initialPicks);

        // Restore adored state from user profile
        const adoredProducts = Array.isArray(me?.adored_products) ? me.adored_products : [];
        if (adoredProducts.length > 0) {
          const adoredSet = new Set(
            initialPicks.reduce((acc, p, i) => {
              if (adoredProducts.includes(`${p.brand} ${p.name}`)) acc.push(i);
              return acc;
            }, [])
          );
          setAdoredIdx(adoredSet);
        }

        // Fire-and-forget: validate and resolve product images server-side.
        // Replaces hallucinated LLM URLs with real ones (or null so the
        // gradient fallback inside ProductImage shows cleanly).
        if (initialPicks.length > 0) {
          base44.functions.invoke('resolveProductImages', {
            products: initialPicks.map(p => ({ brand: p.brand, name: p.name, shade: p.shade })),
          }).then((res) => {
            if (controller.cancelled) return;
            const r = res?.data || res;
            if (r?.results) {
              setPicks(prev => prev.map((p, i) => {
                const match = r.results.find(m => m.index === i);
                if (match?.image_url) return { ...p, image_url: match.image_url };
                return { ...p, image_url: null };
              }));
            }
          }).catch(() => {});
        }
      } catch {
        if (!controller.cancelled) setPicks([]);
      } finally {
        if (!controller.cancelled) setLoading(false);
      }
    })();

    return () => { controller.cancelled = true; };
  }, []);

  const collectToList = async (p, i) => {
    setCollectedIdx(prev => new Set(prev).add(i));
    const me = await base44.auth.me().catch(() => null);

    // Check for an existing cart entry with the same brand + name to avoid duplicates
    let prod = null;
    if (me?.id) {
      const existing = await base44.entities.Product.filter({
        created_by_id: me.id,
        in_shopping_list: true,
        name: p.name,
        brand: p.brand,
      }).catch(() => []);
      const match = Array.isArray(existing) ? existing[0] : null;
      if (match) {
        const newQty = (match.shopping_qty || 1) + 1;
        prod = await base44.entities.Product.update(match.id, { shopping_qty: newQty }).catch(() => null);
        return; // quantity incremented — no new entity needed
      }
    }

    prod = await base44.entities.Product.create({
      brand:            p.brand,
      name:             p.name,
      shade:            p.shade,
      category:         p.category,
      price:            p.price_usd,
      description:      p.description,
      muse_shimmer:     p.muse_shimmer,
      image_url:        p.image_url || null,
      in_shopping_list: true,
      shopping_qty:     1,
      ...(me?.id ? { created_by_id: me.id } : {}),
    }).catch(() => null);
    // Fetch a verified product image for the saved item
    if (prod?.id && p.brand) {
      base44.functions.invoke('fetchProductImage', {
        product_id: prod.id, brand: p.brand, name: p.name, shade: p.shade,
      }).catch(() => {});
    }
  };

  const toggleAdore = async (i) => {
    const p = picks[i];
    const key = `${p.brand} ${p.name}`;
    const newAdored = !adoredIdx.has(i);
    setAdoredIdx(prev => {
      const next = new Set(prev);
      newAdored ? next.add(i) : next.delete(i);
      return next;
    });
    try {
      const u = await base44.auth.me();
      const current = Array.isArray(u?.adored_products) ? u.adored_products : [];
      const updated = newAdored
        ? [...new Set([...current, key])]
        : current.filter(k => k !== key);
      await base44.auth.updateMe({ adored_products: updated });
    } catch {
      setAdoredIdx(prev => {
        const next = new Set(prev);
        newAdored ? next.delete(i) : next.add(i);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} color="#C8B06A" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Curated For You</h2>
        </div>
        <div className="flex gap-3 -mx-5 px-5 overflow-x-auto hide-scrollbar pb-1">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-40 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              <div className="h-36 bg-[var(--color-bg-elevated)] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-1.5 bg-[var(--color-border)] rounded-full animate-pulse w-14" />
                <div className="h-3 bg-[var(--color-border)] rounded-full animate-pulse w-full" />
                <div className="h-2.5 bg-[var(--color-border)] rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-[var(--color-text-muted)] font-light tracking-[0.15em] text-center mt-3 italic">
          The Muse is curating for you…
        </p>
      </div>
    );
  }

  if (!picks.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} color="#C8B06A" strokeWidth={1.5} />
        <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Curated For You</h2>
      </div>

      <div className="flex gap-3 -mx-5 px-5 overflow-x-auto hide-scrollbar pb-2">
        {picks.map((p, i) => {
          const accent    = CAT_ACCENT[p.category] || "#A89B6B";
          const collected = collectedIdx.has(i);
          const adored    = adoredIdx.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex-shrink-0 w-40 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-col"
            >
              {/* Visual header */}
              <div className="h-36 relative">
                <ProductImage product={p} className="w-full h-full" fittingType="fill" showStatus={false} />
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className="text-[8px] tracking-[0.15em] uppercase font-light px-1.5 py-0.5 rounded-full"
                    style={{ color: accent, background: `${accent}18`, border: `1px solid ${accent}30` }}
                  >
                    {p.category}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-[9px] tracking-[0.12em] uppercase text-[var(--color-text-muted)] font-light truncate">
                  {p.brand}
                </p>
                <p className="text-[13px] text-[var(--color-text-primary)] font-light leading-snug mt-0.5 line-clamp-2">
                  {p.name}{p.shade ? ` · ${p.shade}` : ""}
                </p>
                {p.muse_shimmer && (
                  <p className="text-[9px] text-[var(--color-text-muted)] italic font-light mt-1.5 line-clamp-2 leading-relaxed">
                    {p.muse_shimmer}
                  </p>
                )}

                {p.price_usd ? (
                  <p className="mt-auto pt-2 text-[11px] text-[var(--color-text-secondary)] font-light">
                    {formatPrice(p.price_usd)}
                  </p>
                ) : (
                  <div className="mt-auto" />
                )}
              </div>

              {/* Compact engagement bar */}
              <div className="px-2.5 pb-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => toggleAdore(i)}
                  aria-label={adored ? "Un-adore" : "Adore"}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                    adored ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"
                  }`}
                >
                  <Heart size={11} strokeWidth={1.5} color={adored ? "white" : "var(--color-text-muted)"} fill={adored ? "white" : "none"} />
                </button>
                <button
                  onClick={() => collectToList(p, i)}
                  disabled={collected}
                  aria-label={collected ? "Collected" : "Collect"}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                    collected ? "bg-[#043927] border-[#043927]" : "border-[var(--color-border)]"
                  }`}
                >
                  {collected
                    ? <Check    size={11} strokeWidth={1.5} color="white" />
                    : <Bookmark size={11} strokeWidth={1.5} color="var(--color-text-muted)" />
                  }
                </button>
                <ShareButton
                  title={`${p.brand} ${p.name}`}
                  text={p.muse_shimmer || `${p.brand} ${p.name}`}
                  url={window.location.href}
                  size={11}
                  className="flex-1 py-2 rounded-xl border border-[var(--color-border)]"
                />
              </div>
            </motion.div>
          );
        })}

        {/* End spacer */}
        <div className="flex-shrink-0 w-2" />
      </div>
    </div>
  );
}
