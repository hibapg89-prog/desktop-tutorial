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

export default function VanitySummary({ products = [] }) {
  const total = products.length;

  if (total === 0) return null;

  const counts = products.reduce((acc, p) => {
    const c = p.category || "Other";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const cats = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const categoryCount = cats.length;

  return (
    <div className="mx-5 mb-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] font-light">Collection</p>
          <p className="font-serif text-2xl text-[var(--color-text-primary)] font-light leading-none mt-0.5">
            {total} <span className="text-xs text-[var(--color-text-muted)] font-sans">items</span>
          </p>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] font-light">{categoryCount} {categoryCount === 1 ? "category" : "categories"}</p>
      </div>

      {/* Stacked distribution bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--color-bg-elevated)]">
        {cats.map(([cat, count]) => (
          <div
            key={cat}
            style={{ width: `${(count / total) * 100}%`, background: CAT_ACCENT[cat] || "#A89B6B" }}
            title={`${cat} · ${count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {cats.map(([cat, count]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: CAT_ACCENT[cat] || "#A89B6B" }}
            />
            <span className="text-[10px] text-[var(--color-text-secondary)] font-light">{cat}</span>
            <span className="text-[10px] text-[var(--color-text-muted)] font-light">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}