import { useState, useEffect } from "react";
import { TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { base44 } from "@/api/base44Client";

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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ProfileTrends() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ in_vanity: true })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl px-5 py-8 border border-[var(--color-border)] flex items-center justify-center" style={{ background: "var(--color-bg-surface)" }}>
        <div className="w-5 h-5 border-2 border-[#C8B06A]/30 border-t-[#C8B06A] rounded-full animate-spin" />
      </div>
    );
  }

  const total = products.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl px-5 py-6 border border-[var(--color-border)]" style={{ background: "var(--color-bg-surface)" }}>
        <p className="text-[13px] text-[var(--color-text-muted)] font-light uppercase tracking-[0.18em] mb-1.5">Beauty Trends</p>
        <p className="text-[12px] text-[var(--color-text-muted)] font-light italic">Add products to your vanity to reveal your yearly trends.</p>
      </div>
    );
  }

  // Build 12-month series keyed by category
  const now = new Date();
  const year = now.getFullYear();
  const series = MONTHS.map((m) => ({ month: m }));
  const catTotals = {};

  products.forEach((p) => {
    const d = p.created_date ? new Date(p.created_date) : null;
    const cat = p.category || "Other";
    catTotals[cat] = (catTotals[cat] || 0) + 1;
    if (!d || isNaN(d)) return;
    // Group by month across all years (Jan–Dec) to show seasonal tendency
    const mi = d.getMonth();
    series[mi][cat] = (series[mi][cat] || 0) + 1;
  });

  const rankedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const topCat = rankedCats[0];
  const topCats = rankedCats.slice(0, 5).map(([c]) => c);

  // Peak month
  let peakMonth = null;
  let peakCount = 0;
  series.forEach((row) => {
    const sum = topCats.reduce((s, c) => s + (row[c] || 0), 0);
    if (sum > peakCount) { peakCount = sum; peakMonth = row.month; }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[16px] text-[var(--color-text-primary)] font-light"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Beauty Trends
        </h2>
        <span className="text-[9px] tracking-[0.2em] text-[#C8B06A] uppercase font-light">Yearly</span>
      </div>

      <div
        className="rounded-2xl px-5 py-5 border border-[var(--color-border)]"
        style={{ background: "var(--color-bg-surface)" }}
      >
        {/* Highlights */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${CAT_ACCENT[topCat[0]] || "#C8B06A"}18` }}>
              <TrendingUp size={14} color={CAT_ACCENT[topCat[0]] || "#C8B06A"} />
            </div>
            <div>
              <p className="text-[8px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-light">Most Bought</p>
              <p className="text-[13px] text-[var(--color-text-primary)] font-light leading-tight">{topCat[0]} · {topCat[1]}</p>
            </div>
          </div>
          {peakMonth && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(200,176,106,0.12)" }}>
                <Calendar size={14} color="#C8B06A" />
              </div>
              <div>
                <p className="text-[8px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] font-light">Peak Month</p>
                <p className="text-[13px] text-[var(--color-text-primary)] font-light leading-tight">{peakMonth} · {peakCount} added</p>
              </div>
            </div>
          )}
        </div>

        {/* Stacked area chart */}
        <div className="w-full" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                {topCats.map((c) => (
                  <linearGradient key={c} id={`grad-${c.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CAT_ACCENT[c] || "#A89B6B"} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={CAT_ACCENT[c] || "#A89B6B"} stopOpacity={0.12} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--color-text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--color-text-muted)", fontFamily: "Inter" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
              <Tooltip
                contentStyle={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 11, fontFamily: "Inter" }}
                formatter={(v, name) => [`${v} added`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Inter" }} iconType="circle" iconSize={7} />
              {topCats.map((c) => (
                <Area
                  key={c}
                  type="monotone"
                  dataKey={c}
                  stackId="1"
                  stroke={CAT_ACCENT[c] || "#A89B6B"}
                  strokeWidth={1.5}
                  fill={`url(#grad-${c.replace(/[^a-z0-9]/gi, "")})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category ranking */}
        <div className="mt-4 space-y-2">
          {rankedCats.slice(0, 5).map(([cat, count], i) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--color-text-muted)] font-light w-4">{i + 1}.</span>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CAT_ACCENT[cat] || "#A89B6B" }} />
                <span className="text-[11px] text-[var(--color-text-secondary)] font-light flex-1 truncate">{cat}</span>
                <div className="w-20 h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ background: CAT_ACCENT[cat] || "#A89B6B" }}
                  />
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)] font-light w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
