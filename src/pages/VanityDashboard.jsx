import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, DollarSign, Instagram, Package, Layers } from "lucide-react";
import { formatPrice } from "@/utils/locale";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

const CAT_ACCENT = {
  Makeup:              "#BC8F8F",
  Fragrance:           "#8F8FAA",
  Skincare:            "#6B9E6B",
  Haircare:            "#A89B6B",
  Body:                "#C4A882",
  Nails:               "#B48FAA",
  Devices:             "#7A9BA8",
  Accessories:         "#A8906B",
  "Men's Grooming":    "#7A8FA8",
  "Pet Care":          "#8FA87A",
  "Intimate Hygiene":  "#A87A90",
};

const INK   = "#043927";
const GOLD  = "#C8B06A";

function derivePersona(products, categoryData) {
  const total = products.length;
  if (!total) return null;

  const avgPrice     = products.reduce((s, p) => s + (p.price || 0), 0) / total;
  const topCat       = categoryData[0];
  const topCatPct    = topCat ? topCat.value / total : 0;
  const uniqueBrands = new Set(products.map((p) => (p.brand || "").trim()).filter(Boolean)).size;

  if (topCatPct >= 0.55) {
    const map = {
      Skincare:  ["The Skincare Devotee",    "Your ritual is your religion — serums, actives, and SPF reign supreme in your collection."],
      Makeup:    ["The Colour Collector",    "Your vanity is a palette of possibilities — you live for pigment, finish, and artistry."],
      Fragrance: ["The Scent Connoisseur",   "You collect memories in bottles — your shelf is a museum of olfactory stories."],
      Haircare:  ["The Mane Enthusiast",     "Great hair is everything — your collection reflects a deep commitment to your crown."],
      Body:      ["The Body Care Ritualist", "Head to toe luxury — your belief that beauty extends far beyond the face shows in every choice."],
      Nails:     ["The Nail Artiste",        "Your fingertips tell a story — colour, texture, and precision define your aesthetic."],
    };
    if (map[topCat.name]) return { title: map[topCat.name][0], desc: map[topCat.name][1] };
  }

  if (avgPrice >= 120)            return { title: "The Luxury Curator",     desc: "Quality over quantity — every piece in your vanity is a considered, elevated investment." };
  if (uniqueBrands >= total * 0.75) return { title: "The Beauty Explorer",  desc: "Always discovering, always experimenting — your vanity is a living archive of curiosity." };
  if (categoryData.length >= 5)   return { title: "The Beauty Omnivore",    desc: "Face, body, fragrance, hair — your collection is a complete sensory world." };
  return                                  { title: "The Curated Collector",  desc: "Every item earns its place — your vanity is intentional, personal, and perfectly you." };
}

export default function VanityDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(me => base44.entities.Product.filter({ in_vanity: true, created_by_id: me.id }))
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="swan-float"><SwanLogo size={48} color={GOLD} /></div>
      </div>
    );
  }

  const total = products.length;

  if (total === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-8 text-center">
        <SwanLogo size={64} color={GOLD} className="mb-5" />
        <p className="font-serif text-xl text-primary-60 italic mb-1">Your vanity awaits its first treasure</p>
        <p className="text-xs text-primary-40 font-light mb-6">
          Add products to your vanity to see your collection insights.
        </p>
        <button
          onClick={() => navigate("/vanity")}
          className="px-6 py-3 bg-[#043927] text-[#FDF5E6] text-xs tracking-[0.2em] uppercase rounded-full font-light"
        >
          Back to Vanity
        </button>
      </div>
    );
  }

  /* ── derived data ───────────────────────────────────────────── */

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      const c = p.category || "Other";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value, color: CAT_ACCENT[name] || "#A89B6B" }))
    .sort((a, b) => b.value - a.value);

  const brandData = Object.entries(
    products.reduce((acc, p) => {
      const b = (p.brand || "Unknown").trim() || "Unknown";
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // spend per category — CSS bars (no chart lib needed)
  const catValueMap = products.reduce((acc, p) => {
    const c = p.category || "Other";
    if (!acc[c]) acc[c] = { total: 0, count: 0, color: CAT_ACCENT[c] || "#A89B6B" };
    acc[c].total += p.price || 0;
    acc[c].count += 1;
    return acc;
  }, {});
  const categoryValueData = Object.entries(catValueMap)
    .map(([name, { total: t, count, color }]) => ({
      name, color, total: t, avg: count > 0 ? t / count : 0,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const totalValue   = products.reduce((s, p) => s + (p.price || 0), 0);
  const avgPrice     = totalValue / total;
  const topCategory  = categoryData[0];
  const topBrand     = brandData[0];
  const uniqueBrands = new Set(products.map((p) => (p.brand || "").trim()).filter(Boolean)).size;

  // highlights
  const topByPrice = [...products].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 3);
  const musePicks  = products.filter((p) => p.muse_shimmer).slice(0, 3);

  const persona = derivePersona(products, categoryData);

  const stats = [
    { label: "Total Items",      value: total,                   icon: Package,   accent: INK          },
    { label: "Collection Value", value: formatPrice(totalValue), icon: DollarSign, accent: GOLD        },
    { label: "Avg Item Value",   value: formatPrice(avgPrice),   icon: BarChart3, accent: "#A89B6B"    },
    { label: "Unique Brands",    value: uniqueBrands,            icon: Layers,    accent: INK          },
  ];

  const handleInstagramShare = async () => {
    const top3Cats   = categoryData.slice(0, 3).map((c) => `${c.name} (${c.value})`).join(" · ");
    const top3Brands = brandData.slice(0, 3).map((b) => b.name).join(", ");
    const caption =
      `My Beauty Collection\n` +
      `${total} pieces · ${formatPrice(totalValue)}\n\n` +
      `${persona?.title || "Beauty Collector"}\n` +
      `Top category: ${topCategory?.name || "—"} · Top brand: ${topBrand?.name || "—"}\n` +
      `${top3Cats}\nFavourite brands: ${top3Brands}\n\n` +
      `Curated with The Muse`;
    try { await navigator.clipboard.writeText(caption); } catch {}
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      const isMobile = /android|iphone|ipad/i.test(navigator.userAgent);
      window.open(isMobile ? "instagram://app" : "https://www.instagram.com", "_blank");
    }, 1200);
  };

  /* ── render ─────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-28">

      {/* Header */}
      <div className="px-5 pt-14 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate("/vanity")}
          className="w-9 h-9 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center shadow-sm flex-shrink-0"
        >
          <ArrowLeft size={16} color={INK} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary-40 font-light">La Collection</p>
          <h1 className="font-serif text-2xl text-[var(--color-text-primary)] font-light leading-tight">Vanity Insights</h1>
        </div>
        <button
          onClick={handleInstagramShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] tracking-[0.15em] uppercase font-light border border-[#043927]/25 text-[var(--color-text-primary)] hover:bg-[#043927] hover:text-[#FDF5E6] transition-colors flex-shrink-0"
        >
          <Instagram size={12} color={copied ? "#22c55e" : GOLD} />
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Stat cards */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: `${s.accent}18` }}
                >
                  <Icon size={13} color={s.accent} />
                </div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-primary-40 font-light">{s.label}</p>
              </div>
              <p className="font-serif text-xl text-[var(--color-text-primary)] font-light leading-tight truncate">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Beauty Persona */}
      {persona && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mx-5 mt-4 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #043927 0%, #074d37 100%)" }}
        >
          <div className="px-5 pt-5 pb-5">
            <p className="text-[9px] tracking-[0.3em] uppercase text-[#C8B06A]/70 font-light mb-2">
              Your Beauty Persona
            </p>
            <h2 className="font-serif text-2xl text-[#FDF5E6] font-light leading-tight mb-2">
              {persona.title}
            </h2>
            <p className="text-xs text-[#FDF5E6]/60 font-light leading-relaxed">{persona.desc}</p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8B06A]/60 font-light">
                {categoryData.length} categories
              </span>
              <span className="w-px h-3 bg-[#C8B06A]/25" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8B06A]/60 font-light">
                {uniqueBrands} brands
              </span>
              <span className="w-px h-3 bg-[#C8B06A]/25" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C8B06A]/60 font-light">
                {formatPrice(avgPrice)} avg
              </span>
            </div>
          </div>
          <div
            className="h-[3px]"
            style={{ background: "linear-gradient(90deg, #C8B06A 0%, #E5D4A0 50%, #C8B06A 100%)" }}
          />
        </motion.div>
      )}

      {/* Category donut */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-5 mt-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">By Category</h2>
          <span className="text-[10px] text-primary-40 font-light">{categoryData.length} categories</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-5">
          {/* Donut */}
          <div className="relative w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="none"
                >
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 11,
                    fontFamily: "Inter",
                  }}
                  formatter={(v) => [`${v} items`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-serif text-2xl text-[var(--color-text-primary)] font-light leading-none">{total}</p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-primary-40 font-light mt-1">items</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-[11px] text-primary-70 font-light flex-1 truncate">{c.name}</span>
                <span className="text-[11px] text-primary-50 font-light">{c.value}</span>
                <span className="text-[9px] text-primary-25 font-light w-8 text-right">
                  {Math.round((c.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Spend by category — CSS progress bars */}
      {categoryValueData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="mx-5 mt-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Spend by Category</h2>
            <span className="text-[10px] text-primary-40 font-light">{formatPrice(totalValue)}</span>
          </div>
          <div className="space-y-4">
            {categoryValueData.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-[11px] text-primary-70 font-light">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-primary-30 font-light">avg {formatPrice(c.avg)}</span>
                    <span className="text-[11px] text-[var(--color-text-primary)] font-light">{formatPrice(c.total)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.total / categoryValueData[0].total) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                    style={{ background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Brand chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.49 }}
        className="mx-5 mt-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">By Brand</h2>
          <span className="text-[10px] text-primary-40 font-light">Top {brandData.length}</span>
        </div>
        <div className="w-full" style={{ height: Math.max(180, brandData.length * 34) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={brandData}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "var(--color-text-muted)", fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                tick={{ fontSize: 10, fill: "var(--color-text-secondary)", fontFamily: "Inter" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#0439270a" }}
                contentStyle={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 11,
                  fontFamily: "Inter",
                }}
                formatter={(v) => [`${v} items`, ""]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                {brandData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? GOLD : INK} fillOpacity={i === 0 ? 1 : 0.45} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Most Luxurious */}
      {topByPrice[0]?.price > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
          className="mx-5 mt-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-5"
        >
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light mb-1">Most Luxurious</h2>
          <p className="text-[10px] text-primary-35 font-light mb-4">Your highest-value pieces</p>
          <div className="space-y-3">
            {topByPrice.map((p, i) => (
              <div key={p.id || i} className="flex items-center gap-3">
                <span
                  className="font-serif text-xl font-light w-5 text-center leading-none flex-shrink-0"
                  style={{ color: i === 0 ? GOLD : "#043927" + (i === 1 ? "99" : "55") }}
                >
                  {i + 1}
                </span>
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover bg-[var(--color-border)] flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-border)] flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--color-text-primary)] font-light truncate">{p.name}</p>
                  <p className="text-[10px] text-primary-40 font-light">{p.brand}</p>
                </div>
                <p className="text-[12px] text-[var(--color-text-primary)] font-light flex-shrink-0">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Muse Shimmer picks you own */}
      {musePicks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.63 }}
          className="mx-5 mt-4 rounded-2xl border border-[#C8B06A]/30 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(200,176,106,0.07) 0%, rgba(229,212,160,0.11) 100%)",
          }}
        >
          <div className="px-5 pt-5 pb-1 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#C8B06A]" />
            <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Muse Shimmer Picks</h2>
          </div>
          <p className="px-5 text-[10px] text-primary-40 font-light mb-4">
            Editor-approved pieces from your collection
          </p>
          <div className="px-5 pb-5 space-y-3">
            {musePicks.map((p, i) => (
              <div key={p.id || i} className="flex items-center gap-3">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover bg-[var(--color-border)]/60 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-border)]/60 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--color-text-primary)] font-light truncate">{p.name}</p>
                  <p className="text-[10px] text-primary-40 font-light">{p.brand} · {p.category}</p>
                </div>
                {p.price > 0 && (
                  <p className="text-[11px] font-light flex-shrink-0 text-[var(--color-accent-gold)]">
                    {formatPrice(p.price)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] text-primary-25 font-light tracking-wide mt-6">
        {total} pieces · {formatPrice(totalValue)} curated
      </p>
    </div>
  );
}
