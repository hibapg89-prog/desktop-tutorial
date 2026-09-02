import { useState, useEffect } from "react";
import { Sparkles, Check, Heart, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ForYouProducts() {
  const [picks,          setPicks]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [collectedIdx,   setCollectedIdx]   = useState(new Set());
  const [adoredIdx,      setAdoredIdx]      = useState(new Set());
  const [passedAlongIdx, setPassedAlongIdx] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        const userFilter = me?.id ? { created_by_id: me.id } : {};
        const myProducts = await base44.entities.Product.filter(userFilter);
        const myProductIds = new Set(myProducts.map(p => p.id));

        // User's preferred categories — beauty only
        const userBeautyCategories = [...new Set(
          myProducts.map(p => p.category).filter(c => c && BEAUTY_CATEGORIES.has(c))
        )];

        // ── Step 1: try to surface real scanned products with images ──
        const allProducts = await base44.entities.Product.list("-created_date", 300);

        const candidates = allProducts.filter(p =>
          p.image_url &&
          p.category && BEAUTY_CATEGORIES.has(p.category) &&
          !myProductIds.has(p.id) &&
          (!me?.id || p.created_by_id !== me.id)
        );

        const targetSet = new Set(userBeautyCategories.length ? userBeautyCategories : [...BEAUTY_CATEGORIES]);
        const preferred = candidates.filter(p => targetSet.has(p.category));
        const others    = candidates.filter(p => !targetSet.has(p.category));

        // Normalise to a common shape
        const toCard = (p, isReal) => ({
          _isReal:     isReal,
          _id:         p.id || null,
          brand:       p.brand,
          name:        p.name,
          shade:       p.shade,
          category:    p.category,
          price:       p.price || p.price_usd || null,
          image_url:   p.image_url || null,
          description: p.description,
          muse_shimmer: p.muse_shimmer || null,
        });

        let finalPicks = [...shuffle(preferred), ...shuffle(others)]
          .slice(0, 6)
          .map(p => toCard(p, true));

        // ── Step 2: if fewer than 3 real picks, supplement with LLM ──
        if (finalPicks.length < 3 && userBeautyCategories.length) {
          const prompt = `A luxury beauty concierge user has scanned and saved products in these beauty categories: ${userBeautyCategories.join(", ")}. Recommend ${6 - finalPicks.length} NEW beauty products they'd adore but don't own yet — ONLY within beauty, skincare, haircare, fragrance, or cosmetics. Do NOT suggest clothing, electronics, food, or any non-beauty item. Return JSON with brand, name, shade (or empty string), category (one of: ${userBeautyCategories.join(", ")}), price_usd, description, muse_shimmer (poetic tagline, max 8 words).`;

          const result = await base44.integrations.Core.InvokeLLM({
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
          });

          // Only keep LLM picks that fall within beauty categories
          const llmPicks = (result.products || [])
            .filter(p => p.category && BEAUTY_CATEGORIES.has(p.category))
            .map(p => toCard(p, false));

          finalPicks = [...finalPicks, ...llmPicks].slice(0, 6);
        }

        setPicks(finalPicks);
      } catch {
        setPicks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const collectToList = async (p, i) => {
    setCollectedIdx(prev => new Set(prev).add(i));
    const me = await base44.auth.me().catch(() => null);
    if (p._isReal && p._id) {
      await base44.entities.Product.update(p._id, {
        in_shopping_list: true,
        shopping_qty: 1,
      }).catch(() => {});
    } else {
      await base44.entities.Product.create({
        brand:            p.brand,
        name:             p.name,
        shade:            p.shade,
        category:         p.category,
        price:            p.price,
        description:      p.description,
        muse_shimmer:     p.muse_shimmer,
        in_shopping_list: true,
        shopping_qty:     1,
        ...(me?.id ? { created_by_id: me.id } : {}),
      }).catch(() => {});
    }
  };

  const toggleAdore = (i) => {
    setAdoredIdx(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handlePassAlong = async (p, i) => {
    const shareData = {
      title: `${p.brand} ${p.name}`,
      text:  p.muse_shimmer || `Found on La Muse — ${p.brand} ${p.name}`,
      url:   window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setPassedAlongIdx(prev => new Set(prev).add(i));
        setTimeout(() => setPassedAlongIdx(prev => {
          const next = new Set(prev); next.delete(i); return next;
        }), 2000);
      }
    } catch {
      // user cancelled — no-op
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
          const passed    = passedAlongIdx.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex-shrink-0 w-40 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-col"
            >
              {/* Visual header — real image when available, editorial gradient otherwise */}
              <div className="h-36 relative overflow-hidden flex items-center justify-center"
                style={!p.image_url ? { background: `linear-gradient(160deg, ${accent}28 0%, ${accent}0a 100%)` } : undefined}
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={`${p.brand} ${p.name}`}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.style.background = `linear-gradient(160deg, ${accent}28 0%, ${accent}0a 100%)`;
                    }}
                  />
                ) : (
                  <SwanLogo size={30} color={accent} />
                )}
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

                {p.price ? (
                  <p className="mt-auto pt-2 text-[11px] text-[var(--color-text-secondary)] font-light">
                    {formatPrice(p.price)}
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
                <button
                  onClick={() => handlePassAlong(p, i)}
                  aria-label="Pass Along"
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                    passed ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"
                  }`}
                >
                  <Share2 size={11} strokeWidth={1.5} color={passed ? "white" : "var(--color-text-muted)"} />
                </button>
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
