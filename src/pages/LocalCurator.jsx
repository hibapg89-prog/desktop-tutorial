import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, X, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import TranslateToggle from "@/components/TranslateToggle";
import { formatPrice } from "@/utils/locale";
import { base44 } from "@/api/base44Client";

export default function LocalCurator() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [original, setOriginal] = useState(null);
  const [curator, setCurator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedArtisan, setSavedArtisan] = useState(false);
  const [savingArtisan, setSavingArtisan] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);
  const [artisanProductId, setArtisanProductId] = useState(null);

  useEffect(() => {
    if (id) {
      base44.entities.Product.get(id).then(async (p) => {
        setOriginal(p);
        setLoading(false);
        findCuratorMatch(p);
      });
    }
  }, [id]);

  const findCuratorMatch = async (product) => {
    setAnalyzing(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are The Muse — a luxury beauty curator. Find an independent/local artisan alternative for: ${product.brand} ${product.name} ${product.shade || ""} (${product.category}). Tell a story — not just "cheaper alternative". Return JSON with: brand (string), name (string), price_usd (number), description (string — 2-3 editorial sentences celebrating this indie brand), scent_profile (string, if fragrance-relevant, else null), longevity (string, if relevant, else null), sustainability_score (1-10), sustainability_note (string), muse_recommendation_label (string like "Eco-Conscious Choice" or "Artisan Gem"), carbon_note (string), image_description (string — one poetic sentence describing what the product looks, feels, smells like).`,
      response_json_schema: {
        type: "object",
        properties: {
          brand: { type: "string" },
          name: { type: "string" },
          price_usd: { type: "number" },
          description: { type: "string" },
          scent_profile: { type: "string" },
          longevity: { type: "string" },
          sustainability_score: { type: "number" },
          sustainability_note: { type: "string" },
          muse_recommendation_label: { type: "string" },
          carbon_note: { type: "string" },
          image_description: { type: "string" },
        },
      },
    });
    setCurator(result);
    setAnalyzing(false);
  };

  const handleSaveArtisan = async () => {
    if (!curator || savedArtisan || savingArtisan) return artisanProductId;
    setSavingArtisan(true);
    try {
      const created = await base44.entities.Product.create({
        brand: curator.brand,
        name: curator.name,
        price: curator.price_usd || 0,
        currency: "USD",
        category: original?.category || "Makeup",
        description: curator.description,
        in_wishlist: true,
        muse_shimmer: curator.muse_recommendation_label,
        ingredients: curator.sustainability_note || null,
      });
      setArtisanProductId(created.id);
      setSavedArtisan(true);
      setSavingArtisan(false);
      return created.id;
    } catch (e) {
      console.error(e);
    }
    setSavingArtisan(false);
    return null;
  };

  const handleCuratorCardClick = async () => {
    if (!curator) return;
    if (artisanProductId) { navigate(`/product/${artisanProductId}`); return; }
    const newId = await handleSaveArtisan();
    if (newId) navigate(`/product/${newId}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col items-center justify-center">
      <div className="swan-float"><SwanLogo size={64} color="#043927" /></div>
    </div>
  );

  const savings =
    original?.price > 0 && curator?.price_usd > 0
      ? original.price - curator.price_usd
      : 0;

  return (
    <div className="min-h-screen bg-[#FDF5E6]">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-[#E5E4E2] flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} color="#043927" />
          </button>
          <div>
            <p className="text-[9px] tracking-[0.25em] uppercase text-[#043927]/40 font-light">
              The Muse
            </p>
            <h1 className="font-serif text-xl text-[#043927] font-light leading-tight">
              The Local Curator
            </h1>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#C8B06A]/30 to-transparent" />
      </div>

      {/* Analyzing banner */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-5 mb-4 rounded-2xl bg-[#043927] px-5 py-4 flex items-center gap-4"
          >
            <div className="swan-float flex-shrink-0">
              <SwanLogo size={28} color="#FDF5E6" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[#FDF5E6] font-light italic font-serif leading-snug">
                Searching independent artisans worldwide…
              </p>
              <div className="flex gap-1.5 mt-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#C8B06A]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {original && (
        <div className="px-5 pb-28">
          {/* Side-by-side cards */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* ── Original ── */}
            <div className="rounded-2xl overflow-hidden border border-[#E5E4E2] bg-white/60 cursor-pointer active:opacity-75" onClick={() => navigate(`/product/${id}`)}>
              <div
                className="px-3 py-2.5 border-b border-[#E5E4E2]"
                style={{ background: "linear-gradient(135deg, #C8B06A18, #FDF5E6)" }}
              >
                <p className="text-[8px] tracking-[0.22em] text-[#C8B06A] uppercase font-light">
                  Classic Luxury
                </p>
              </div>
              <div className="p-4">
                <div className="aspect-square rounded-xl bg-[#F5EDD8] flex items-center justify-center mb-3 overflow-hidden">
                  {original.image_url
                    ? <img src={original.image_url} alt="" className="w-full h-full object-contain p-2" />
                    : <SwanLogo size={36} color="#043927" />
                  }
                </div>
                <p className="text-[10px] font-medium text-[#043927] tracking-wide uppercase leading-tight">
                  {original.brand}
                </p>
                <p className="text-[11px] text-[#043927]/55 font-light leading-tight mt-0.5 line-clamp-2">
                  {original.name}
                </p>
                {original.price > 0 && (
                  <p className="text-sm font-light text-[#043927] mt-2.5">
                    {formatPrice(original.price)}
                  </p>
                )}
                <div className="mt-2.5 px-2 py-1.5 bg-[#C8B06A]/15 rounded-lg text-center">
                  <p className="text-[8px] text-[#C8B06A] font-light tracking-wide">The Standard</p>
                </div>
              </div>
            </div>

            {/* ── Artisan Alternative ── */}
            <div
              className={`rounded-2xl overflow-hidden border text-left transition-all cursor-pointer active:opacity-75 ${
                savedArtisan ? "border-[#BC8F8F]/50 bg-[#BC8F8F]/[0.04]" : "border-[#E5E4E2] bg-white/60"
              }`}
              onClick={handleCuratorCardClick}
            >
              <div
                className="px-3 py-2.5 border-b border-[#E5E4E2] flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #BC8F8F18, #FDF5E6)" }}
              >
                <p className="text-[8px] tracking-[0.22em] text-[#BC8F8F] uppercase font-light">
                  Local Curator
                </p>
                {curator && (
                  <Heart
                    size={11}
                    color="#BC8F8F"
                    fill={savedArtisan ? "#BC8F8F" : "none"}
                    strokeWidth={1.5}
                  />
                )}
              </div>
              <div className="p-4">
                {!curator && analyzing ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="swan-float">
                      <SwanLogo size={28} color="#BC8F8F" />
                    </div>
                  </div>
                ) : curator ? (
                  <>
                    {/* Brand monogram + image description */}
                    <div
                      className="aspect-square rounded-xl flex flex-col items-center justify-center mb-3 px-2 overflow-hidden"
                      style={{ background: "linear-gradient(135deg, #BC8F8F22, #F5EDD8)" }}
                    >
                      <span className="font-serif text-4xl text-[#BC8F8F]/50 leading-none">
                        {curator.brand?.[0] || "A"}
                      </span>
                      {curator.image_description && (
                        <p className="text-[7px] text-[#BC8F8F]/50 font-light italic text-center mt-1.5 leading-relaxed line-clamp-3">
                          {curator.image_description}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] font-medium text-[#043927] tracking-wide uppercase leading-tight">
                      {curator.brand}
                    </p>
                    <p className="text-[11px] text-[#043927]/55 font-light leading-tight mt-0.5 line-clamp-2">
                      {curator.name}
                    </p>
                    {curator.price_usd > 0 && (
                      <p className="text-sm font-light text-[#043927] mt-2.5">
                        {formatPrice(curator.price_usd)}
                      </p>
                    )}
                    <div className="mt-2.5 px-2 py-1.5 bg-[#BC8F8F]/15 rounded-lg text-center">
                      <p className="text-[8px] text-[#BC8F8F] font-light tracking-wide">
                        {curator.muse_recommendation_label}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Savings badge */}
          <AnimatePresence>
            {savings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center mb-5"
              >
                <div className="px-4 py-2 bg-[#043927] text-[#FDF5E6] rounded-full text-[9px] tracking-[0.2em] uppercase font-light">
                  Save {formatPrice(savings)} with the artisan
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Artisan details ── */}
          {curator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Story — editorial pull quote */}
              <div className="border-l-2 border-[#C8B06A] pl-5 py-1">
                <p className="text-[9px] tracking-[0.2em] text-[#BC8F8F] uppercase mb-3 font-light">
                  The Story
                </p>
                <TranslateToggle
                  text={curator.description}
                  className="font-serif text-[15px] text-[#043927]/70 leading-[1.65]"
                  italic
                />
              </div>

              {/* Sustainability score */}
              <div className="bg-white/60 rounded-2xl p-5 border border-[#E5E4E2]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] tracking-[0.18em] text-[#043927]/50 uppercase font-light">
                    Sustainability
                  </p>
                  <p className="text-sm font-light text-[#043927]">
                    {curator.sustainability_score}
                    <span className="text-[10px] text-[#043927]/35">/10</span>
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-[#E5E4E2] overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(curator.sustainability_score / 10) * 100}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-[#043927]"
                  />
                </div>
                {curator.sustainability_note && (
                  <p className="text-[11px] text-[#043927]/50 font-light italic leading-relaxed">
                    {curator.sustainability_note}
                  </p>
                )}
              </div>

              {/* Comparison table */}
              {(curator.scent_profile || curator.longevity) && (
                <div className="bg-white/60 rounded-2xl border border-[#E5E4E2] overflow-hidden">
                  <div className="px-5 py-3 border-b border-[#E5E4E2] flex items-center justify-between">
                    <p className="text-[9px] tracking-[0.2em] text-[#043927]/40 uppercase font-light">
                      Comparison
                    </p>
                    <div className="flex gap-4 text-[8px] text-[#043927]/30 font-light uppercase tracking-wide">
                      <span>Classic</span>
                      <span className="text-[#BC8F8F]">Artisan</span>
                    </div>
                  </div>
                  {[
                    curator.scent_profile && ["Scent", "—", curator.scent_profile],
                    curator.longevity && ["Longevity", "—", curator.longevity],
                  ]
                    .filter(Boolean)
                    .map(([label, orig, alt], i) => (
                      <div
                        key={i}
                        className="px-5 py-3.5 flex items-start border-b border-[#E5E4E2]/50 last:border-0"
                      >
                        <span className="text-[11px] text-[#043927]/40 font-light w-24 flex-shrink-0">
                          {label}
                        </span>
                        <span className="text-[11px] text-[#043927]/50 font-light flex-1 text-center">
                          {orig}
                        </span>
                        <span className="text-[11px] text-[#BC8F8F] font-light flex-1 text-right">
                          {alt}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Carbon / eco note */}
              {curator.carbon_note && (
                <div className="bg-[#043927]/[0.05] rounded-2xl p-4 border border-[#043927]/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#043927] flex items-center justify-center flex-shrink-0">
                    <Leaf size={14} color="#FDF5E6" strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] text-[#043927]/60 font-light leading-relaxed italic">
                    {curator.carbon_note}
                  </p>
                </div>
              )}

              {/* Save artisan button */}
              <button
                onClick={handleSaveArtisan}
                disabled={savedArtisan || savingArtisan}
                className={`w-full py-3.5 rounded-full text-[10px] tracking-[0.22em] uppercase font-light border transition-all flex items-center justify-center gap-2 ${
                  savedArtisan
                    ? "bg-[#BC8F8F] text-white border-[#BC8F8F]"
                    : "border-[#BC8F8F]/50 text-[#BC8F8F]"
                }`}
              >
                <Heart
                  size={12}
                  strokeWidth={1.5}
                  fill={savedArtisan ? "white" : "none"}
                />
                {savedArtisan
                  ? "Artisan Saved to Wishlist"
                  : savingArtisan
                  ? "Saving…"
                  : "Save Artisan to Wishlist"}
              </button>

              {/* CTA */}
              <div className="pt-2 space-y-3">
                <p className="text-[10px] text-[#043927]/35 font-light tracking-wide text-center leading-relaxed">
                  The Muse never tells you what to buy.<br />
                  It gives you perspective and lets you decide.
                </p>
                <button
                  onClick={() => setDecideOpen(true)}
                  className="w-full py-4 bg-[#043927] text-[#FDF5E6] text-[10px] tracking-[0.25em] uppercase rounded-2xl font-light"
                >
                  Compare &amp; Decide
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Compare & Decide bottom sheet */}
      <AnimatePresence>
        {decideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setDecideOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDF5E6] rounded-t-3xl px-5 pt-5 overflow-y-auto max-h-[88vh]"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 96px)" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-[#E5E4E2] rounded-full mx-auto mb-6" />

              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="font-serif text-xl text-[#043927] font-light">Your Decision</h2>
                  <p className="text-[10px] text-[#043927]/40 font-light tracking-wide mt-0.5">
                    The Muse presents both paths. You choose yours.
                  </p>
                </div>
                <button
                  onClick={() => setDecideOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#E5E4E2] flex items-center justify-center flex-shrink-0"
                >
                  <X size={14} color="#043927" />
                </button>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#C8B06A]/25 to-transparent my-5" />

              {/* Head-to-head */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-2xl bg-[#C8B06A]/10 border border-[#C8B06A]/30 p-4">
                  <p className="text-[8px] tracking-[0.22em] text-[#C8B06A] uppercase font-light mb-3">
                    The Classic
                  </p>
                  <p className="text-[10px] font-medium text-[#043927] uppercase tracking-wide leading-tight">
                    {original?.brand}
                  </p>
                  <p className="text-[11px] text-[#043927]/50 font-light mt-1 leading-tight line-clamp-2">
                    {original?.name}
                  </p>
                  {original?.price > 0 && (
                    <p className="text-sm text-[#043927] font-light mt-2.5">
                      {formatPrice(original.price)}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-[#BC8F8F]/10 border border-[#BC8F8F]/30 p-4">
                  <p className="text-[8px] tracking-[0.22em] text-[#BC8F8F] uppercase font-light mb-3">
                    The Artisan
                  </p>
                  <p className="text-[10px] font-medium text-[#043927] uppercase tracking-wide leading-tight">
                    {curator?.brand}
                  </p>
                  <p className="text-[11px] text-[#043927]/50 font-light mt-1 leading-tight line-clamp-2">
                    {curator?.name}
                  </p>
                  {curator?.price_usd > 0 && (
                    <p className="text-sm text-[#043927] font-light mt-2.5">
                      {formatPrice(curator.price_usd)}
                    </p>
                  )}
                </div>
              </div>

              {/* Savings hint */}
              {savings > 0 && (
                <p className="text-[10px] text-[#043927]/40 font-light italic text-center mb-5">
                  Choosing the artisan saves you {formatPrice(savings)}.
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => { setDecideOpen(false); navigate(-1); }}
                  className="w-full py-4 rounded-2xl border border-[#C8B06A]/60 text-[#043927] text-[10px] tracking-[0.25em] uppercase font-light"
                >
                  Keep the Classic
                </button>
                <button
                  onClick={async () => { await handleSaveArtisan(); setDecideOpen(false); }}
                  disabled={savedArtisan || savingArtisan}
                  className="w-full py-4 rounded-2xl bg-[#BC8F8F] text-white text-[10px] tracking-[0.25em] uppercase font-light disabled:opacity-60 transition-opacity"
                >
                  {savedArtisan
                    ? "Artisan Saved ✓"
                    : savingArtisan
                    ? "Saving…"
                    : "Choose the Artisan"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}