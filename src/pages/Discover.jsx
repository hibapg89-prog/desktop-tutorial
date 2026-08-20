import { useState, useEffect } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import SwanLogo from "@/components/SwanLogo";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ForYouProducts from "@/components/discover/ForYouProducts";
import ForYouServices from "@/components/discover/ForYouServices";
import ForYouTutorials from "@/components/discover/ForYouTutorials";
import CommunityDiscoveries from "@/components/discover/CommunityDiscoveries";
import { formatPrice } from "@/utils/locale";

// Category grid — invisible tappable zones mapped to subcategory pages
const GRID_IMAGE =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/fa98cf11e_IMG_4519.jpg";

const TILES = [
  { label: "Makeup",                to: "/explore/makeup" },
  { label: "Fragrance",             to: "/explore/fragrance" },
  { label: "Intimate Care",         to: "/explore/intimate-care" },
  { label: "Skincare",              to: "/explore/skincare" },
  { label: "Haircare",              to: "/explore/haircare" },
  { label: "Body",                  to: "/explore/body" },
  { label: "Nails",                 to: "/explore/nails" },
  { label: "Devices",               to: "/explore/devices" },
  { label: "Tools",                 to: "/explore/tools" },
  { label: "Men's Grooming",        to: "/explore/mens" },
  { label: "Pet Care",              to: "/explore/pet-care" },
  { label: "Cosmetic Bags & Cases", to: "/explore/cosmetic-bags-cases" },
];

export default function Discover() {
  const [query,       setQuery]       = useState("");
  const [allProducts, setAllProducts] = useState(null);
  const [results,     setResults]     = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [savedIds,    setSavedIds]    = useState(new Set());

  const saveToList = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds(prev => new Set(prev).add(product.id));
    await base44.entities.Product.update(product.id, {
      in_shopping_list: true,
      shopping_qty: 1,
    }).catch(() => {});
  };

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        let catalog = allProducts;
        if (!catalog) {
          const list = await base44.entities.Product.list("-created_date", 300);
          setAllProducts(list);
          catalog = list;
        }
        const filtered = (catalog || []).filter(p =>
          [p.brand, p.name, p.shade, p.category].some(f => f && f.toLowerCase().includes(q))
        );
        setResults(filtered.slice(0, 15));
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 320);
    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = query.trim().length >= 2;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Editorial banner with integrated search */}
      <div className="px-5 pt-14 pb-5">
        <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(200,176,106,0.45)" }}>
          {/* Banner image (contains "For you" + "Discover" + search bar baked-in) */}
          <div className="relative" style={{ aspectRatio: "5 / 6" }}>
            <img
              src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/ff8a8a622_IMG_5361.jpeg"
              alt="The Muse Edit — Discover"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            {/* Functional opaque input covering baked-in search bar */}
            <div className="absolute bottom-5 left-5 right-5">
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2.5 shadow-sm"
                style={{ background: "linear-gradient(135deg, #D4C592 0%, #C5B374 50%, #9A8B70 100%)", border: "1px solid #4A4438" }}
              >
                <Search
                  size={14}
                  color="#2C2B26"
                  strokeWidth={1.5}
                  className={`flex-shrink-0 transition-opacity ${searching ? "opacity-30" : "opacity-100"}`}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search brands, products, reviews..."
                  className="flex-1 bg-transparent text-sm text-[#2C2B26] font-light outline-none placeholder:text-[#2C2B26]"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-[#2C2B26] hover:opacity-70 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {searching && (
          <p className="text-[0.625rem] text-primary-30 font-light mt-1.5 px-1 tracking-wide">
            Searching catalog…
          </p>
        )}
      </div>

      {/* Search results */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 mb-6"
          >
            {results.length > 0 && (
              <p className="text-[0.625rem] tracking-[0.25em] text-primary-40 uppercase font-light mb-3">
                {results.length} found
              </p>
            )}
            <div className="space-y-2">
              {results.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/product/${p.id}`}
                    className="flex items-center gap-3 bg-[var(--color-bg-surface)] rounded-2xl p-3 border border-[var(--color-border)]"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)] flex items-center justify-center">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        : <SwanLogo size={20} color="var(--color-text-primary)" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.5625rem] text-[#BC8F8F] uppercase tracking-wide font-light">
                        {p.brand}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)] font-light truncate">
                        {p.name}{p.shade ? ` · ${p.shade}` : ""}
                      </p>
                      <p className="text-[0.5625rem] text-primary-35 font-light">{p.category}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {p.price && (
                        <p className="text-xs text-[var(--color-text-primary)] font-light">{formatPrice(p.price)}</p>
                      )}
                      <button
                        onClick={(e) => saveToList(e, p)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.5625rem] tracking-[0.12em] uppercase font-light transition-all ${
                          savedIds.has(p.id)
                            ? "bg-[#043927] text-[#FDF5E6]"
                            : "bg-[var(--color-accent-gold)] text-white"
                        }`}
                      >
                        {savedIds.has(p.id)
                          ? <><Check size={10} /> Saved</>
                          : <><Plus size={10} /> List</>
                        }
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {!searching && results.length === 0 && (
              <p className="text-sm text-primary-35 font-light italic text-center py-10">
                No products found for &ldquo;{query.trim()}&rdquo;
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* For-you sections + categories grid — hidden while searching */}
      {!isSearching && (
        <div className="px-5 pb-24">
          <ForYouProducts />
          <CommunityDiscoveries />
          <ForYouServices />
          <ForYouTutorials />

          <p className="text-[0.625rem] tracking-[0.2em] text-primary-40 uppercase font-light mb-4">
            All Categories
          </p>
          <div className="relative rounded-2xl overflow-hidden">
            <img src={GRID_IMAGE} alt="Categories" className="w-full h-auto block" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
              {TILES.map((t) => (
                <Link
                  key={t.label}
                  to={t.to}
                  aria-label={t.label}
                  className="flex items-end justify-start p-2"
                >
                  <span className="text-[0.625rem] text-white/90 font-light tracking-wide leading-none px-2 py-1 rounded-lg" style={{ background: "rgba(4,57,39,0.35)", backdropFilter: "blur(2px)" }}>
                    {t.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
