import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import CategoryProductCard from "@/components/CategoryProductCard";
import { CATEGORIES } from "@/lib/categories";

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

export default function CategoryDetail() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subFilter = searchParams.get("sub");
  const decoded = decodeURIComponent(category);
  const cat = CATEGORIES.find((c) => c.name === decoded);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hiddenSubs, setHiddenSubs] = useState([]);

  useEffect(() => {
    if (!cat) return;
    setLoading(true);
    base44.entities.Product
      .filter({ category: cat.name })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cat?.name]);

  if (!cat) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-8 text-center">
        <div className="swan-float mb-4"><SwanLogo size={48} color="var(--color-accent-gold)" /></div>
        <p className="font-serif text-xl text-[var(--color-text-primary)] mb-2">Category not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-primary-40 underline mt-2">Go back</button>
      </div>
    );
  }

  const isIntimate = cat.special === "intimate";
  const isLuxuryTools = cat.special === "luxury-tools";
  const showSideTabs = !isIntimate && cat.subcategories.length > 1;

  const palette = isIntimate
    ? { bg: "#F5F2EA", accent: "#E6D7D3", text: "#003326" }
    : { bg: "var(--color-bg)", accent: "#043927", text: "var(--color-text-primary)" };

  const sortProducts = (list) => {
    const sorted = [...list];
    if (sort === "price-low") sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "price-high") sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted;
  };

  const visibleSubs = cat.subcategories.filter((s) => !hiddenSubs.includes(s));
  const groups = subFilter
    ? [
        {
          sub: subFilter,
          items: sortProducts(
            products.filter((p) => (p.subcategory || "").toLowerCase() === subFilter.toLowerCase())
          ),
        },
      ]
    : visibleSubs.map((sub) => ({
        sub,
        items: sortProducts(
          products.filter((p) => (p.subcategory || "").toLowerCase() === sub.toLowerCase())
        ),
      }));
  const ungrouped = subFilter
    ? []
    : sortProducts(
        products.filter(
          (p) => !cat.subcategories.some((s) => s.toLowerCase() === (p.subcategory || "").toLowerCase())
        )
      );

  const title = subFilter ? subFilter : isLuxuryTools ? "Luxury Tools & Accessories" : isIntimate ? "Intimate Care" : cat.name;

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.bg }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full border flex-shrink-0"
          style={{ borderColor: isIntimate ? palette.text + "20" : "var(--color-border)" }}
        >
          <ChevronLeft size={18} color={palette.text} />
        </button>
        <div>
          {subFilter && (
            <p className="text-[9px] tracking-[0.2em] uppercase font-light" style={{ color: palette.text, opacity: 0.35 }}>
              {cat.name}
            </p>
          )}
          <h1 className="font-serif text-xl font-light tracking-wide" style={{ color: palette.text }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Intimate blush banner */}
      {isIntimate && (
        <div className="mx-5 mb-5 rounded-2xl px-5 py-4" style={{ backgroundColor: palette.accent }}>
          <p className="text-[10px] tracking-[0.3em] uppercase font-light" style={{ color: palette.text }}>
            Private Collection
          </p>
          <p className="font-serif text-sm italic mt-1" style={{ color: palette.text }}>
            Tenderness, bottled with discretion
          </p>
        </div>
      )}

      {/* Hero */}
      {!isIntimate && (
        <div className="mx-5 mb-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/30 to-transparent" />
      )}

      {/* Sort / Filter side tabs */}
      {showSideTabs && (
        <>
          <button
            onClick={() => setSortOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 rounded-r-2xl py-4 px-1.5 flex items-center bg-[#043927]"
          >
            <span className="text-[10px] tracking-[0.2em] uppercase font-light [writing-mode:vertical-rl] text-[#FDF5E6]">
              Sort
            </span>
          </button>
          {!subFilter && (
            <button
              onClick={() => setFilterOpen(true)}
              className="fixed left-0 top-[62%] -translate-y-1/2 z-30 rounded-r-2xl py-4 px-1.5 flex items-center bg-[var(--color-accent-gold)]"
            >
              <span className="text-[10px] tracking-[0.2em] uppercase font-light [writing-mode:vertical-rl] text-[#FDF5E6]">
                Filter
              </span>
            </button>
          )}
        </>
      )}

      {/* Sections */}
      <div className={`px-5 pb-36 space-y-10 ${showSideTabs ? "pl-9" : ""}`}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="swan-float"><SwanLogo size={40} color="var(--color-accent-gold)" /></div>
          </div>
        ) : (
          <>
            {groups.map((group, gi) => (
              <motion.div
                key={group.sub}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
              >
                {/* Editorial section header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1" style={{ backgroundColor: isIntimate ? "#C8B06A30" : "#C8B06A28" }} />
                  <span
                    className="text-[10px] tracking-[0.35em] uppercase font-light"
                    style={{ color: isIntimate ? palette.text : "var(--color-text-primary)" }}
                  >
                    {group.sub}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: isIntimate ? "#C8B06A30" : "#C8B06A28" }} />
                </div>

                {group.items.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((p, i) => (
                      <CategoryProductCard
                        key={p.id || i}
                        product={p}
                        variant={isLuxuryTools ? "shop" : "default"}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptySection sub={group.sub} />
                )}
              </motion.div>
            ))}

            {ungrouped.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-[#C8B06A28]" />
                  <span className="text-[10px] tracking-[0.35em] uppercase font-light text-[var(--color-text-primary)]">
                    All {cat.name}
                  </span>
                  <div className="h-px flex-1 bg-[#C8B06A28]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ungrouped.map((p, i) => (
                    <CategoryProductCard
                      key={p.id || i}
                      product={p}
                      variant={isLuxuryTools ? "shop" : "default"}
                    />
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 && groups.every((g) => g.items.length === 0) && (
              <EmptySection sub={subFilter || cat.subcategories[0]} full />
            )}
          </>
        )}
      </div>

      {/* Sort sheet */}
      <AnimatePresence>
        {sortOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => setSortOpen(false)}
          >
            <div className="absolute inset-0 bg-black/25" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full rounded-t-3xl bg-[var(--color-bg)] px-6 pt-4 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-5" />
              <p className="font-serif text-lg text-[var(--color-text-primary)] font-light mb-4">Sort by</p>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSort(opt.id);
                    setSortOpen(false);
                  }}
                  className="w-full flex items-center justify-between py-3.5 border-b border-[var(--color-border)]"
                >
                  <span className="text-sm text-[var(--color-text-primary)] font-light tracking-wide">{opt.label}</span>
                  {sort === opt.id && <Check size={14} color="var(--color-accent-gold)" />}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter sheet */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => setFilterOpen(false)}
          >
            <div className="absolute inset-0 bg-black/25" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full rounded-t-3xl bg-[var(--color-bg)] px-6 pt-4 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-5" />
              <p className="font-serif text-lg text-[var(--color-text-primary)] font-light mb-4">Sections</p>
              {cat.subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() =>
                    setHiddenSubs((prev) =>
                      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
                    )
                  }
                  className="w-full flex items-center justify-between py-3.5 border-b border-[var(--color-border)]"
                >
                  <span className="text-sm text-[var(--color-text-primary)] font-light tracking-wide">{sub}</span>
                  {hiddenSubs.includes(sub) ? (
                    <X size={14} color="var(--color-text-primary)" opacity={0.3} />
                  ) : (
                    <Check size={14} color="var(--color-accent-gold)" />
                  )}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptySection({ sub, full }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-center ${full ? "px-5 py-14" : "px-5 py-8"}`}
    >
      <div className="flex justify-center mb-3">
        <SwanLogo size={28} color="var(--color-accent-gold)" />
      </div>
      <p className="font-serif text-sm text-primary-45 italic font-light leading-relaxed">
        This section awaits its first treasures
      </p>
      <p className="text-[9px] tracking-[0.2em] uppercase text-primary-25 font-light mt-2">
        Scan a {sub} product to begin
      </p>
    </div>
  );
}
