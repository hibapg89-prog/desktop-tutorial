import { useState, useEffect } from "react";
import { Sparkles, Check, Heart, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/utils/locale";

const CAT_ACCENT = {
  Makeup:             "#BC8F8F",
  Fragrance:          "#8F8FAA",
  Skincare:           "#6B9E6B",
  Haircare:           "#A89B6B",
  Body:               "#C4A882",
  Nails:              "#B48FAA",
  Devices:            "#7A9BA8",
  Accessories:        "#A8906B",
  "Men's Grooming":   "#7A8FA8",
  "Pet Care":         "#8FA87A",
  "Intimate Hygiene": "#A87A90",
};

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

        const prefs = {
          categories: [...new Set(myProducts.map(p => p.category).filter(Boolean))],
          brands:     [...new Set(myProducts.map(p => p.brand).filter(Boolean))].slice(0, 8),
        };

        if (!prefs.categories.length) {
          setPicks([]);
          return;
        }

        const prompt = `A luxury beauty concierge user has scanned and saved products in these categories: ${prefs.categories.join(", ")} from brands including: ${prefs.brands.join(", ")}. Based on their scan history and saved preferences, recommend 6 NEW beauty products they'd adore but don't own yet — strictly complementary to their established taste, staying within their preferred categories. Return JSON with brand, name, shade, category, price_usd, description, muse_shimmer (poetic editorial tagline, max 8 words).`;

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
        setPicks(result.products || []);
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
    await base44.entities.Product.create({
      brand:            p.brand,
      name:             p.name,
      shade:            p.shade,
      category:         p.category,
      price:            p.price_usd,
      description:      p.description,
      muse_shimmer:     p.muse_shimmer,
      in_shopping_list: true,
      shopping_qty:     1,
      ...(me?.id ? { created_by_id: me.id } : {}),
    }).catch(() => {});
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
              {/* Visual header */}
              <div
                className="h-36 relative flex items-center justify-center"
                style={{ background: `linear-gradient(160deg, ${accent}28 0%, ${accent}0a 100%)` }}
              >
                <SwanLogo size={30} color={accent} />
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
