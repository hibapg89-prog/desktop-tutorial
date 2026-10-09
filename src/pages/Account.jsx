import { useState, useEffect } from "react";
import { ArrowLeft, Download, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

// ── BEAUTY PROFILE OPTIONS ────────────────────────────────────────────────────
const SKIN_TYPES  = ["Normal", "Dry", "Oily", "Combination", "Sensitive"];
const CONCERNS    = [
  "Hydration", "Radiance", "Pores", "Uneven Tone",
  "Dark Spots", "Aging", "Acne", "Sensitivity",
];
const BUDGET_TIERS = ["Under $50", "$50–$100", "$100–$200", "$200+"];

// ── STYLE HELPERS ─────────────────────────────────────────────────────────────
const sectionHeading = "text-[11px] tracking-[0.22em] uppercase mb-3 font-normal";

const chipClass = (active, variant = "green") => {
  if (!active) return "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-full";
  if (variant === "gold")   return "bg-[#C8B06A] text-[#FFF9E8] border border-[#C8B06A] rounded-full";
  if (variant === "tinted") return "bg-[#C8B06A]/[0.16] text-[var(--color-text-primary)] border border-[#C8B06A] rounded-full";
  return "bg-[#043927] text-[#FFF9E8] border border-[#043927] rounded-full";
};

export default function Account() {
  const navigate = useNavigate();

  const [user, setUser]             = useState(null);
  const [saved, setSaved]           = useState(false);

  // Beauty profile state
  const [skinType, setSkinType]     = useState("");
  const [concerns, setConcerns]     = useState([]);
  const [budgetTier, setBudget]     = useState("");
  const [favBrands, setFavBrands]   = useState("");

  // Delete modal state
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [deleteInput, setDeleteInput]     = useState("");
  const [deleting, setDeleting]           = useState(false);
  const [deleteError, setDeleteError]     = useState("");

  // Email preferences state
  const [priceEmails, setPriceEmails]     = useState(true);
  const [savingEmail, setSavingEmail]     = useState(false);

  // Catalog re-sync state
  const [resyncing,   setResyncing]   = useState(false);
  const [resyncResult, setResyncResult] = useState(null);

  // Load user data
  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) return;
      setUser(u);
      try {
        const sp = u.skin_profile ? JSON.parse(u.skin_profile) : {};
        setSkinType(sp.type             || "");
        setConcerns(sp.concerns         || []);
        setBudget(sp.budget_tier        || "");
        setFavBrands(sp.favorite_brands || "");
        setPriceEmails(u.price_emails_opted_in !== false);
      } catch {}
    }).catch(() => {});
  }, []);

  const toggleConcern = c =>
    setConcerns(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await base44.auth.updateMe({
        skin_profile: JSON.stringify({
          type:            skinType,
          concerns,
          budget_tier:     budgetTier,
          favorite_brands: favBrands,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  };

  // ── RE-SYNC MISSING IMAGES ────────────────────────────────────────────────
  const handleResync = async () => {
    if (resyncing) return;
    setResyncing(true);
    setResyncResult(null);
    try {
      const res = await base44.functions.invoke("backfillProductImages", {});
      setResyncResult({
        filled: res.filled || 0,
        checked: res.checked || 0,
        missing: res.markedMissing || 0,
      });
    } catch {
      setResyncResult({ error: true });
    }
    setResyncing(false);
  };

  // ── EMAIL PREFERENCES ─────────────────────────────────────────────────────
  const togglePriceEmails = async () => {
    if (savingEmail) return;
    const next = !priceEmails;
    setPriceEmails(next);
    setSavingEmail(true);
    try {
      await base44.auth.updateMe({ price_emails_opted_in: next });
    } catch {
      setPriceEmails(!next);
    }
    setSavingEmail(false);
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const payload = {
      profile: {
        name:       user?.full_name,
        email:      user?.email,
        username:   user?.username,
        membership: user?.membership_tier,
      },
      beautyProfile: { skinType, concerns, budgetTier, favoriteBrands: favBrands },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "the-muse-my-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteInput !== "DELETE" || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await base44.functions.invoke("deleteAccount", {});
      if (res?.ok === true) {
        base44.auth.logout("/");
      } else {
        setDeleteError("We couldn't finish deleting your account. Please try again or contact us.");
        setDeleting(false);
      }
    } catch {
      setDeleteError("We couldn't finish deleting your account. Please try again or contact us.");
      setDeleting(false);
    }
  };

  const canDelete = deleteInput === "DELETE";

  return (
    <>
      <div className="min-h-screen pb-28 bg-[var(--color-bg)]">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div className="px-5 pt-14 pb-5 flex items-start gap-4 border-b border-[#C8B06A]/20">
          <button onClick={() => navigate(-1)} className="mt-0.5 flex-shrink-0">
            <ArrowLeft size={18} strokeWidth={1.5} color="var(--color-text-primary)" />
          </button>
          <div>
            <h1 className="font-serif text-[22px] text-[var(--color-text-primary)] leading-tight font-light">
              Account & Beauty Data
            </h1>
            <p className="text-[11px] text-primary-50 mt-1 leading-snug">
              Your information, always in your control.
            </p>
          </div>
        </div>

        <div className="px-5 py-7 space-y-8">

          {/* ── SECTION 1: MY BEAUTY PROFILE ────────────────────────────────── */}
          <section>
            <p className={sectionHeading + " text-primary-45"}>
              My Beauty Profile
            </p>

            <div className="bg-[var(--color-bg-elevated)] border border-[#C8B06A]/[0.38] rounded-[20px] overflow-hidden">
              <div className="px-5 py-5 space-y-5">

                {/* Skin Type */}
                <div>
                  <p className="text-[11px] text-primary-55 mb-2.5">Skin Type</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSkinType(t)}
                        className={`px-3.5 py-1.5 text-[11px] transition-all ${chipClass(skinType === t, "green")}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Concerns */}
                <div>
                  <p className="text-[11px] text-primary-55 mb-2.5">Skin Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {CONCERNS.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleConcern(c)}
                        className={`px-3 py-1.5 text-[11px] transition-all ${chipClass(concerns.includes(c), "tinted")}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Tier */}
                <div>
                  <p className="text-[11px] text-primary-55 mb-2.5">Budget Tier</p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_TIERS.map(b => (
                      <button
                        key={b}
                        onClick={() => setBudget(b)}
                        className={`px-3.5 py-1.5 text-[11px] transition-all ${chipClass(budgetTier === b, "gold")}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Favorite Brands */}
                <div>
                  <p className="text-[11px] text-primary-55 mb-2">Favorite Brands</p>
                  <input
                    value={favBrands}
                    onChange={e => setFavBrands(e.target.value)}
                    placeholder="e.g. Charlotte Tilbury, NARS, Dior…"
                    className="w-full px-4 py-2.5 text-[12px] bg-[var(--color-bg)] rounded-[14px] border border-[#C8B06A]/[0.38] text-[var(--color-text-primary)] outline-none"
                  />
                  <p className="text-[9px] text-primary-30 mt-1.5">
                    Separate with commas
                  </p>
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  className={`w-full py-3.5 rounded-[14px] text-[11px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 transition-all text-[#FFF9E8] ${saved ? "bg-[#043927]" : "bg-[#C8B06A]"}`}
                >
                  {saved ? (
                    <><Check size={12} strokeWidth={2} /> Saved</>
                  ) : (
                    "Save Changes"
                  )}
                </button>

              </div>
            </div>
          </section>

          {/* ── SECTION 2: YOUR DATA ─────────────────────────────────────────── */}
          <section>
            <p className={sectionHeading + " text-primary-45"}>
              Your Data
            </p>

            <div className="bg-[var(--color-bg-elevated)] border border-[#C8B06A]/[0.38] rounded-[20px] overflow-hidden">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-4 px-5 py-4 transition-opacity active:opacity-70"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#C8B06A]/[0.14] border border-[#C8B06A]/[0.32]">
                  <Download size={15} strokeWidth={1.5} color="#C8B06A" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] text-[var(--color-text-primary)]">Export My Data</p>
                  <p className="text-[10px] text-[var(--color-text-primary)]/42 mt-0.5 leading-snug">
                    Download a copy of everything The Muse knows about you.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* ── SECTION 3: CATALOG MAINTENANCE ──────────────────────────────── */}
          <section>
            <p className={sectionHeading + " text-primary-45"}>
              Catalog Maintenance
            </p>

            <div className="bg-[var(--color-bg-elevated)] border border-[#C8B06A]/0.38 rounded-[20px] overflow-hidden">
              <button
                onClick={handleResync}
                disabled={resyncing}
                className="w-full flex items-center gap-4 px-5 py-4 transition-opacity active:opacity-70 disabled:opacity-60"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#C8B06A]/[0.14] border border-[#C8B06A]/[0.32]">
                  <RefreshCw size={15} strokeWidth={1.5} color="#C8B06A" className={resyncing ? "animate-spin" : ""} />
                </div>
                <div className="text-left flex-1">
                  <p className="text-[13px] text-[var(--color-text-primary)]">
                    {resyncing ? "Finding missing photos…" : "Fill in missing product photos"}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-primary)]/42 mt-0.5 leading-snug">
                    Finds photos only for products that don't have one yet. Won't replace photos that were already found or uploaded.
                  </p>
                </div>
              </button>

              {resyncResult && !resyncing && (
                <div className="px-5 pb-4 -mt-1">
                  <p className="text-[11px] font-light leading-relaxed">
                    {resyncResult.error ? (
                      <span className="text-[#BC8F8F]">Something went wrong. Please try again.</span>
                    ) : (
                      <span className="text-primary-60">
                        {resyncResult.filled > 0
                          ? <>Refreshed <strong className="font-medium text-[var(--color-text-primary)]">{resyncResult.filled}</strong> image{resyncResult.filled !== 1 ? "s" : ""}.</>
                          : "No new images found — your catalog is up to date."}
                        {resyncResult.missing > 0 && (
                          <span className="text-primary-40"> {resyncResult.missing} still missing a photo.</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── SECTION 4: DANGER ZONE ──────────────────────────────────────── */}
          <section>
            <p className={sectionHeading + " text-[#BC8F8F]/65"}>
              Danger Zone
            </p>

            <div className="bg-[var(--color-bg-elevated)]/60 border border-[#BC8F8F]/[0.32] rounded-[20px] overflow-hidden">
              <button
                onClick={() => setDeleteOpen(true)}
                className="w-full flex items-center gap-4 px-5 py-4 transition-opacity active:opacity-70"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#BC8F8F]/10 border border-[#BC8F8F]/[0.28]">
                  <AlertTriangle size={14} strokeWidth={1.5} color="#BC8F8F" />
                </div>
                <div className="text-left">
                  <p className="text-[13px] text-[#BC8F8F]">Delete My Account</p>
                  <p className="text-[10px] text-[var(--color-text-primary)]/38 mt-0.5">
                    Permanently removes your profile and all data.
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* ── FOOTER ──────────────────────────────────────────────────────── */}
          {/* ── PRIVACY POLICY ──────────────────────────────────────────────── */}
          <section className="px-5 pb-6">
            <h3 className="text-[9px] tracking-[0.28em] uppercase text-[var(--color-accent-gold)] font-light mb-3">Privacy</h3>

            <div className="space-y-4 text-[11px] text-[var(--color-text-primary)]/55 font-light leading-relaxed">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-primary)]/40 mb-1.5">Information We Collect</p>
                <p>
                  We use your IP address to estimate your country and currency, so we can show you relevant retailers and prices in your local currency. This is done automatically and does not involve precise location tracking (such as GPS). We do not share this information with third parties for advertising purposes.
                </p>
                <p className="mt-2 text-[var(--color-text-primary)]/38 italic">
                  Nous utilisons votre adresse IP pour estimer votre pays et votre devise, afin de vous proposer des revendeurs et des prix pertinents dans votre devise locale. Cette estimation se fait automatiquement et n'implique aucun suivi de localisation précise (comme le GPS). Nous ne partageons pas cette information avec des tiers à des fins publicitaires.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-primary)]/40 mb-1.5">Email Preferences</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="flex-1">
                    Weekly price-drop emails — a curated digest of price changes on your shopping list.
                  </p>
                  <button
                    onClick={togglePriceEmails}
                    disabled={savingEmail}
                    aria-label={priceEmails ? "Unsubscribe from price emails" : "Subscribe to price emails"}
                    className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${priceEmails ? "bg-[#043927]" : "bg-[var(--color-border)]"} ${savingEmail ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${priceEmails ? "left-5" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-primary)]/40 mb-1.5">In-App Notifications</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="flex-1">
                    Price drops, new arrivals, and other in-app alerts — manage which categories you receive.
                  </p>
                  <Link
                    to="/notifications-settings"
                    className="flex-shrink-0 text-[10px] tracking-[0.14em] uppercase text-[var(--color-accent-gold)] font-light"
                  >
                    Manage →
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-primary)]/40 mb-1.5">Prices &amp; Retailer Links</p>
                <p>
                  Prices are sourced from retailer listings and may not reflect the current price at checkout. Always confirm the final price on the retailer's site before purchasing. Some links may be affiliate links — LuxeBeauty may earn a small commission at no extra cost to you.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {deleteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="del-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/38 backdrop-blur-[5px]"
              onClick={() => { setDeleteOpen(false); setDeleteInput(""); setDeleteError(""); }}
            />

            {/* Modal */}
            <motion.div
              key="del-modal"
              initial={{ opacity: 0, scale: 0.93, y: 18 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 18 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed left-5 right-5 z-50 px-6 py-7 shadow-2xl top-[22vh] bg-[var(--color-bg)] border border-[#BC8F8F]/[0.28] rounded-[24px]"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#BC8F8F]/10 border border-[#BC8F8F]/[0.28]">
                <AlertTriangle size={18} strokeWidth={1.5} color="#BC8F8F" />
              </div>

              {/* Title */}
              <h3 className="font-serif text-[22px] text-[var(--color-text-primary)] text-center mb-2 font-light">
                Delete Your Account?
              </h3>

              {/* Body */}
              <p className="text-[12px] text-[var(--color-text-primary)]/52 text-center leading-relaxed mb-6">
                This permanently deletes your profile, scan history, and Vanity.
                <br />
                <strong className="font-normal text-[#BC8F8F]">
                  This cannot be undone.
                </strong>
              </p>

              {/* Confirmation input */}
              <div className="mb-5">
                <p className="text-[10px] text-[var(--color-text-primary)]/42 text-center mb-2">
                  Type{" "}
                  <span className="tracking-widest text-[#BC8F8F] font-medium">
                    DELETE
                  </span>{" "}
                  to confirm
                </p>
                <input
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  className={`w-full px-4 py-3 text-[13px] text-center tracking-[0.25em] transition-colors bg-[var(--color-bg-elevated)] rounded-[14px] text-[var(--color-text-primary)] outline-none border ${canDelete ? "border-[#BC8F8F]" : "border-[#BC8F8F]/[0.28]"}`}
                />
              </div>

              {/* Actions */}
              {deleteError && (
                <p className="text-[11px] text-[#BC8F8F] text-center leading-relaxed mb-3">
                  {deleteError}
                </p>
              )}
              <div className="space-y-2">
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || deleting}
                  className={`w-full py-3.5 text-[11px] tracking-[0.18em] uppercase transition-all rounded-[14px] text-[#FFF9E8] ${canDelete ? "bg-[#BC8F8F]" : "bg-[#BC8F8F]/[0.22]"} ${deleting ? "opacity-60" : ""} ${canDelete && !deleting ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  {deleting ? "Deleting…" : "Permanently Delete"}
                </button>

                <button
                  onClick={() => { setDeleteOpen(false); setDeleteInput(""); setDeleteError(""); }}
                  className="w-full py-3 text-[11px] tracking-[0.12em] uppercase text-[var(--color-text-primary)] bg-transparent"
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