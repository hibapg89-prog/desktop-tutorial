import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, ShieldAlert, Ban, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";

// Medical consent persists forever — only shown once per device.
const CONSENT_KEY = "muse_allergy_consent_v1";

// ── Curated concern categories ───────────────────────────────────────────────
const CONCERNS = [
  {
    key: "fragrances",
    label: "Fragrances",
    color: "#BC8F8F",
    bg: "rgba(188,143,143,0.10)",
    border: "rgba(188,143,143,0.28)",
    ingredients: [
      "Fragrance / Parfum", "Linalool", "Limonene", "Citronellol",
      "Eugenol", "Geraniol", "Cinnamal", "Isoeugenol",
    ],
  },
  {
    key: "preservatives",
    label: "Preservatives",
    color: "#8B7240",
    bg: "rgba(139,114,64,0.08)",
    border: "rgba(139,114,64,0.26)",
    ingredients: [
      "Parabens", "Phenoxyethanol", "Methylisothiazolinone (MIT)",
      "Methylchloroisothiazolinone (MCI)", "Formaldehyde",
      "DMDM Hydantoin", "Quaternium-15", "Imidazolidinyl Urea",
    ],
  },
  {
    key: "actives",
    label: "Strong Actives",
    color: "#5B7FA6",
    bg: "rgba(91,127,166,0.08)",
    border: "rgba(91,127,166,0.26)",
    ingredients: [
      "Retinol", "Glycolic Acid (AHA)", "Salicylic Acid (BHA)",
      "Benzoyl Peroxide", "Lactic Acid", "Mandelic Acid",
      "Vitamin C (Ascorbic Acid)", "Tretinoin / Retinoids",
    ],
  },
  {
    key: "surfactants",
    label: "Surfactants",
    color: "#5A7A5A",
    bg: "rgba(90,122,90,0.08)",
    border: "rgba(90,122,90,0.24)",
    ingredients: [
      "Sodium Lauryl Sulfate (SLS)", "Sodium Laureth Sulfate (SLES)",
      "Ammonium Lauryl Sulfate", "Cocamidopropyl Betaine",
      "Sodium Coco Sulfate",
    ],
  },
  {
    key: "silicones",
    label: "Silicones",
    color: "#7A6E8A",
    bg: "rgba(122,110,138,0.08)",
    border: "rgba(122,110,138,0.24)",
    ingredients: [
      "Dimethicone", "Cyclopentasiloxane (D5)", "Cyclomethicone",
      "Amodimethicone", "Cetearyl Methicone",
    ],
  },
  {
    key: "nuts",
    label: "Nut & Seed Oils",
    color: "#A07848",
    bg: "rgba(160,120,72,0.08)",
    border: "rgba(160,120,72,0.24)",
    ingredients: [
      "Almond Oil (Prunus Amygdalus)", "Shea Butter", "Macadamia Oil",
      "Argan Oil", "Coconut Oil", "Wheat Germ Oil", "Lanolin",
    ],
  },
  {
    key: "gluten",
    label: "Gluten & Wheat",
    color: "#8A7260",
    bg: "rgba(138,114,96,0.08)",
    border: "rgba(138,114,96,0.24)",
    ingredients: [
      "Hydrolyzed Wheat Protein", "Wheat Starch", "Barley Extract",
      "Oat Extract (Avena Sativa)", "Rye Seed Extract",
    ],
  },
  {
    key: "vegan",
    label: "Non-Vegan",
    color: "#5A8060",
    bg: "rgba(90,128,96,0.08)",
    border: "rgba(90,128,96,0.24)",
    ingredients: [
      "Beeswax / Cera Alba", "Carmine / CI 75470", "Keratin",
      "Collagen", "Tallow / Sodium Tallowate", "Squalene (shark-derived)",
    ],
  },
];

// ── Ingredient chip ──────────────────────────────────────────────────────────
function IngredientChip({ name, already, concern, onAdd }) {
  return (
    <motion.button
      layout
      onClick={() => !already && onAdd(name)}
      disabled={already}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-light tracking-wide border transition-all select-none"
      style={{
        background: already ? concern.bg : "var(--color-bg-surface)",
        borderColor: already ? concern.border : "var(--color-border)",
        color: already ? concern.color : "rgba(var(--color-text-primary-rgb), 0.65)",
        cursor: already ? "default" : "pointer",
      }}
      whileTap={already ? {} : { scale: 0.94 }}
    >
      {already
        ? <Check size={10} strokeWidth={2.5} style={{ color: concern.color }} />
        : <Plus size={10} strokeWidth={2} style={{ color: "rgba(var(--color-text-primary-rgb), 0.4)" }} />
      }
      {name}
    </motion.button>
  );
}

// ── Watchlist row ─────────────────────────────────────────────────────────────
function WatchRow({ item, onRemove }) {
  const isAllergy = item.type === "allergy";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
        isAllergy
          ? "bg-[#BC8F8F]/[0.07] border-[#BC8F8F]/[0.28]"
          : "bg-[var(--color-bg-elevated)]/55 border-[var(--color-border)]/90"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
          isAllergy
            ? "bg-[#BC8F8F]/[0.14] border-[#BC8F8F]/30"
            : "bg-[#C8B06A]/[0.12] border-[#C8B06A]/25"
        }`}
      >
        {isAllergy
          ? <ShieldAlert size={14} color="#B05040" strokeWidth={1.5} />
          : <Ban size={14} color="#8B7240" strokeWidth={1.5} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)] font-light capitalize truncate">{item.name}</p>
        <p className={`text-[9px] tracking-[0.15em] uppercase font-light ${isAllergy ? "text-[#B05040]" : "text-[#8B7240]"}`}>
          {isAllergy ? "Allergy" : "Restricted"}
        </p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-border)] transition-colors"
      >
        <Trash2 size={13} color="#BC8F8F" />
      </button>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function IngredientAlerts() {
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [name, setName]             = useState("");
  const [type, setType]             = useState("restricted");
  const [activeConcern, setActiveConcern] = useState(null);

  // Consent gate
  const [showConsent, setShowConsent] = useState(false);
  const [pendingName, setPendingName] = useState("");

  useEffect(() => {
    base44.entities.RestrictedIngredient.list("-created_date", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Normalized set of names already in the watchlist (for chip state)
  const addedNames = useMemo(
    () => new Set(items.map((i) => i.name.toLowerCase())),
    [items]
  );

  // ── Core add ───────────────────────────────────────────────────────────────
  const commitAdd = async (ingredientName, ingredientType) => {
    const created = await base44.entities.RestrictedIngredient.create({
      name: ingredientName,
      type: ingredientType,
    }).catch(() => null);
    if (created) setItems((prev) => [created, ...prev]);
    setName("");
  };

  // Manual form "Add" button
  const add = async () => {
    const n = name.trim();
    if (!n) return;
    if (type === "allergy" && localStorage.getItem(CONSENT_KEY) !== "true") {
      setPendingName(n);
      setShowConsent(true);
      return;
    }
    await commitAdd(n, type);
  };

  // Suggestion chip tap — always restricted type
  const addSuggestion = async (ingredientName) => {
    if (addedNames.has(ingredientName.toLowerCase())) return;
    await commitAdd(ingredientName, "restricted");
  };

  // Consent accepted
  const acceptConsent = async () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setShowConsent(false);
    await commitAdd(pendingName, "allergy");
    setPendingName("");
  };

  const cancelConsent = () => {
    setShowConsent(false);
    setPendingName("");
  };

  const remove = async (id) => {
    await base44.entities.RestrictedIngredient.delete(id).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const activeConcernData = CONCERNS.find((c) => c.key === activeConcern);
  const allergyCount    = items.filter((i) => i.type === "allergy").length;
  const restrictedCount = items.filter((i) => i.type === "restricted").length;

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg)]">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-14 pb-4 flex items-center gap-3 sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)]/60">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C8B06A]/30 flex-shrink-0"
          >
            <ChevronLeft size={18} strokeWidth={1.5} color="var(--color-text-primary)" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.22em] uppercase font-light text-[var(--color-accent-gold)]">
              Safety
            </p>
            <h1 className="font-serif text-xl font-light text-[var(--color-text-primary)]">
              Ingredient Alerts
            </h1>
          </div>
          {items.length > 0 && (
            <div className="flex gap-2">
              {allergyCount > 0 && (
                <span
                  className="text-[9px] tracking-[0.12em] uppercase font-light px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(188,143,143,0.12)", color: "#B05040", border: "1px solid rgba(188,143,143,0.3)" }}
                >
                  {allergyCount} allergy
                </span>
              )}
              {restrictedCount > 0 && (
                <span
                  className="text-[9px] tracking-[0.12em] uppercase font-light px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(200,176,106,0.10)", color: "#8B7240", border: "1px solid rgba(200,176,106,0.25)" }}
                >
                  {restrictedCount} restricted
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-5 pb-28">

          {/* ── Intro ─────────────────────────────────────────────────────────── */}
          <p className="text-xs text-primary-50 font-light leading-relaxed mb-1">
            Flag ingredients you're allergic to or prefer to avoid. The Muse will warn you whenever a scanned product contains them.
          </p>
          <p className="text-[10px] text-primary-30 font-light leading-relaxed mb-5">
            For convenience only — always check the full label yourself. Not a substitute for medical advice.
          </p>

          {/* ── Your watchlist ────────────────────────────────────────────────── */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-primary-40 font-light mb-3">
              Your watchlist
            </p>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="swan-float"><SwanLogo size={36} color="var(--color-accent-gold)" /></div>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-[var(--color-border)] py-7 flex flex-col items-center text-center bg-[var(--color-bg-surface)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[#C8B06A]/[0.08] border border-[#C8B06A]/20">
                  <ShieldAlert size={16} strokeWidth={1.5} color="var(--color-accent-gold)" />
                </div>
                <p className="font-serif text-sm font-light italic text-primary-35">
                  No flagged ingredients yet
                </p>
                <p className="text-[10px] text-primary-25 font-light mt-1">
                  Add from the suggestions below or enter a custom one.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <WatchRow key={item.id} item={item} onRemove={remove} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Gold rule ─────────────────────────────────────────────────────── */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent mb-6" />

          {/* ── Common concerns ───────────────────────────────────────────────── */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-primary-40 font-light mb-3">
              Flag from common concerns
            </p>

            {/* Category pills — horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-4 -mx-5 px-5">
              {CONCERNS.map((c) => {
                const isActive = activeConcern === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setActiveConcern(isActive ? null : c.key)}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[10px] tracking-[0.12em] uppercase font-light border transition-all"
                    style={{
                      background: isActive ? c.bg : "var(--color-bg-surface)",
                      borderColor: isActive ? c.border : "var(--color-border)",
                      color: isActive ? c.color : "rgba(var(--color-text-primary-rgb), 0.55)",
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Ingredient chips for selected concern */}
            <AnimatePresence mode="wait">
              {activeConcernData && (
                <motion.div
                  key={activeConcernData.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl p-4 border"
                  style={{
                    background: activeConcernData.bg,
                    borderColor: activeConcernData.border,
                  }}
                >
                  <p className="text-[9px] tracking-[0.18em] uppercase font-light mb-3"
                    style={{ color: activeConcernData.color }}>
                    {activeConcernData.label} — tap to add
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeConcernData.ingredients.map((ingredient) => (
                      <IngredientChip
                        key={ingredient}
                        name={ingredient}
                        already={addedNames.has(ingredient.toLowerCase())}
                        concern={activeConcernData}
                        onAdd={addSuggestion}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!activeConcernData && (
              <p className="text-[10px] text-primary-25 font-light italic text-center py-2">
                Tap a concern above to see common ingredients
              </p>
            )}
          </div>

          {/* ── Gold rule ─────────────────────────────────────────────────────── */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent mb-6" />

          {/* ── Add custom ingredient ─────────────────────────────────────────── */}
          <div className="mb-2">
            <p className="text-[10px] tracking-[0.22em] uppercase text-primary-40 font-light mb-3">
              Add a custom ingredient
            </p>
            <div
              className="rounded-2xl p-4 border border-[var(--color-border)]"
              style={{ background: "var(--color-bg-surface)" }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="e.g. retinol, fragrance, lanolin…"
                className="w-full bg-transparent text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 mb-3"
              />

              {/* Type toggle */}
              <div className="flex gap-2 mb-3">
                {[
                  { key: "restricted", label: "Restricted", Icon: Ban,        hint: "I prefer to avoid this" },
                  { key: "allergy",    label: "Allergy",    Icon: ShieldAlert, hint: "I have a medical reaction" },
                ].map(({ key, label, Icon, hint }) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className="flex-1 py-2 rounded-xl text-[11px] font-light tracking-wide flex flex-col items-center gap-1 border transition-all"
                    style={{
                      background: type === key ? (key === "allergy" ? "rgba(188,143,143,0.12)" : "#043927") : "transparent",
                      borderColor: type === key ? (key === "allergy" ? "rgba(188,143,143,0.4)" : "#043927") : "var(--color-border)",
                      color: type === key ? (key === "allergy" ? "#B05040" : "#FDF5E6") : "rgba(var(--color-text-primary-rgb), 0.55)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} /> {label}
                    </div>
                    <span className="text-[8px] tracking-wide opacity-60">{hint}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={add}
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl text-[10px] tracking-[0.22em] uppercase font-light flex items-center justify-center gap-2 transition-all"
                style={{
                  background: name.trim() ? "linear-gradient(135deg, #C8B06A 0%, #E5D4A0 50%, #C8B06A 100%)" : "var(--color-border)",
                  color: name.trim() ? "#043927" : "rgba(var(--color-text-primary-rgb), 0.35)",
                  cursor: name.trim() ? "pointer" : "not-allowed",
                }}
              >
                <Plus size={13} /> Add to watchlist
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Allergy consent modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showConsent && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[5px]"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed left-5 right-5 z-50 px-6 py-7 shadow-2xl top-[24vh] bg-[var(--color-bg)] border border-[#C8B06A]/[0.28] rounded-[24px]"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#C8B06A]/[0.12] border border-[#C8B06A]/[0.28]">
                <ShieldAlert size={18} strokeWidth={1.5} color="var(--color-accent-gold)" />
              </div>
              <h3 className="font-serif text-[21px] font-light text-[var(--color-text-primary)] text-center mb-3">
                Before you continue
              </h3>
              <p className="text-[12px] text-primary-50 text-center leading-relaxed mb-7">
                Allergy information is sensitive personal data. The Muse stores it only to flag matching
                ingredients in scan results — it's never shared, sold, or used for anything else.
                You can delete it anytime from{" "}
                <span className="text-primary-70">Account &amp; Beauty Data</span>.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={acceptConsent}
                  className="w-full py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-light bg-[var(--color-accent-gold)] text-[var(--color-bg)]"
                >
                  I understand, continue
                </button>
                <button
                  onClick={cancelConsent}
                  className="w-full py-3 text-[12px] font-light text-primary-40 bg-transparent"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}