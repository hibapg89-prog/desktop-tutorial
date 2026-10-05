import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

// ─── Intention options ────────────────────────────────────────────────────────
const INTENTIONS = [
  { id: "signature",  label: "Find my signature",  sub: "A scent, a finish, a ritual that is mine." },
  { id: "skin",       label: "Understand my skin",  sub: "What it needs. What it loves." },
  { id: "ritual",     label: "Curate my ritual",    sub: "Morning or evening. Simple or elaborate." },
];

// ─── Skin types ───────────────────────────────────────────────────────────────
const SKIN_TYPES = ["Oily", "Dry", "Combination", "Sensitive", "Normal", "Dehydrated", "Acne-prone", "Mature"];

// ─── Budget tiers ─────────────────────────────────────────────────────────────
const BUDGETS = [
  { id: "luxury",   label: "Luxury",    sub: "Prestige & designer" },
  { id: "prestige", label: "Prestige",  sub: "Department store" },
  { id: "artisan",  label: "Artisan",   sub: "Indie & independent" },
];

// ─── Shared motion config ─────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

// ─── Halo component ───────────────────────────────────────────────────────────
function GoldenHalo({ size = 180, opacity = 0.25 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none blur-[18px]"
      style={{
        width: size, height: size,
        background: `radial-gradient(circle, rgba(212,185,140,${opacity}) 0%, transparent 70%)`,
      }}
      animate={{ scale: [1, 1.07, 1], opacity: [opacity, opacity * 1.35, opacity] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [intentions, setIntentions]   = useState([]);
  const [skinTypes,  setSkinTypes]    = useState([]);
  const [budget,     setBudget]       = useState(null);
  const [saving,     setSaving]       = useState(false);

  const toggleIntention = (id) =>
    setIntentions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSkin = (t) =>
    setSkinTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const canContinue = [
    true,                         // 0 — Welcome Veil (always)
    true,                         // 1 — Meet The Muse
    intentions.length > 0,        // 2 — Intention
    skinTypes.length > 0 || true, // 3 — Profile (optional)
    true,                         // 4 — First Glow
  ];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const me = await base44.auth.updateMe({
        skin_types:          skinTypes.join(","),
        intention:           intentions.join(","),
        budget_tier:         budget || "prestige",
        onboarding_complete: true,
      });
      // Grant "The Awakening" badge now that the profile is complete
      const userId = me?.id;
      if (userId) {
        try {
          const existing = await base44.entities.UserBadge.filter({ user_id: userId });
          const alreadyEarned = existing.some(b => b.badge_key === "the_awakening");
          if (!alreadyEarned) {
            await base44.entities.UserBadge.create({
              user_id: userId,
              badge_key: "the_awakening",
              earned_at: new Date().toISOString(),
            });
          }
        } catch {}
      }
    } catch {}
    navigate("/home");
  };

  // ─── Step 0: Welcome Veil ───────────────────────────────────────────────────
  const WelcomeVeil = (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="relative flex items-center justify-center mb-10">
        <GoldenHalo size={220} opacity={0.28} />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <SwanLogo size={100} color="var(--color-text-primary)" />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="font-serif text-4xl text-[var(--color-text-primary)] font-light mb-3 leading-tight"
      >
        Bienvenue, ma douce.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.7 }}
        className="font-serif text-lg text-[var(--color-text-secondary)] italic font-light mb-2"
      >
        Entre dans ton univers beauté.
      </motion.p>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="w-12 h-px bg-[var(--color-accent-gold)] mx-auto mt-4"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        className="text-[9px] text-[var(--color-text-muted)] font-light mt-8 max-w-[240px] leading-relaxed text-center"
      >
        We use your general location to show local prices and retailers. No GPS — just your IP. See our Privacy Policy in Account settings.
      </motion.p>
    </div>
  );

  // ─── Step 1: Meet The Muse ─────────────────────────────────────────────────
  const MeetMuse = (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="relative flex items-center justify-center mb-8">
        <GoldenHalo size={180} opacity={0.22} />
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <SwanLogo size={80} color="var(--color-text-primary)" />
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-accent-gold)] mb-5 font-light"
      >
        A presence. Not a chatbot.
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="font-serif text-3xl text-[var(--color-text-primary)] font-light mb-4 leading-snug"
      >
        Je suis The Muse.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="font-serif text-lg text-[var(--color-text-secondary)] italic font-light leading-relaxed max-w-[260px]"
      >
        Une voix douce, ici pour éclairer ta lumière.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-xs text-[var(--color-text-muted)] font-light mt-8 max-w-[220px] leading-relaxed"
      >
        I'll be your personal beauty curator — always present, always curating, always for you.
      </motion.p>
    </div>
  );

  // ─── Step 2: Your Intention ────────────────────────────────────────────────
  const YourIntention = (
    <div className="flex flex-col h-full px-6 pt-4 pb-2">
      <motion.div {...fadeUp} className="mb-8 text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-accent-gold)] mb-3 font-light">Step 1 of 2</p>
        <h2 className="font-serif text-2xl text-[var(--color-text-primary)] font-light mb-2 leading-snug">
          What are you seeking to feel?
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] font-light italic">Choose all that resonate</p>
      </motion.div>

      <div className="flex flex-col gap-3">
        {INTENTIONS.map(({ id, label, sub }, i) => {
          const selected = intentions.includes(id);
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              onClick={() => toggleIntention(id)}
              className="w-full text-left px-5 py-4 rounded-2xl transition-all"
              style={{
                background: selected
                  ? "linear-gradient(135deg, #1A3A30 0%, #2A5040 100%)"
                  : "var(--color-bg-surface)",
                border: selected ? "1.5px solid #1A3A30" : "1.5px solid rgba(197,160,112,0.35)",
                boxShadow: selected ? "0 4px 16px rgba(26,58,48,0.18)" : "0 1px 6px rgba(197,160,112,0.06)",
              }}
            >
              <p className={`font-serif text-base font-light ${selected ? "text-[#FAF7F1]" : "text-[var(--color-text-primary)]"}`}>
                {label}
              </p>
              <p className={`text-xs font-light mt-0.5 ${selected ? "text-[#FAF7F1]/55" : "text-[var(--color-text-secondary)]"}`}>
                {sub}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ─── Step 3: Beauty Profile ────────────────────────────────────────────────
  const BeautyProfile = (
    <div className="flex flex-col h-full px-6 pt-4 pb-2 overflow-y-auto">
      <motion.div {...fadeUp} className="mb-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--color-accent-gold)] mb-3 font-light">Step 2 of 2</p>
        <h2 className="font-serif text-2xl text-[var(--color-text-primary)] font-light mb-1 leading-snug">
          Tell me about your skin.
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] italic font-light">So I can guide you perfectly.</p>
      </motion.div>

      {/* Skin type */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-3 font-light">Your skin type</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {SKIN_TYPES.map(t => (
            <button key={t} onClick={() => toggleSkin(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-light tracking-wide border transition-all ${skinTypes.includes(t) ? "bg-[#1A3A30] text-[#FAF7F1] border-[#1A3A30]" : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[#C5A070]/40"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Budget */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-3 font-light">Your beauty budget</p>
        <div className="flex flex-col gap-2">
          {BUDGETS.map(({ id, label, sub }) => (
            <button key={id} onClick={() => setBudget(id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${budget === id ? "bg-[#1A3A30] text-[#FAF7F1] border-[#1A3A30]" : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border-[#C5A070]/35"}`}>
              <p className="text-sm font-light">{label}</p>
              <p className="text-[10px] font-light mt-0.5 opacity-55">{sub}</p>
            </button>
          ))}
        </div>
      </motion.div>

      <p className="text-[9px] text-[var(--color-text-muted)] text-center font-light mt-6 italic">
        You can refine this anytime from your profile
      </p>
    </div>
  );

  // ─── Step 4: First Glow ─────────────────────────────────────────────────────
  const FirstGlow = (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      {/* Bloom animation */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: 160, height: 160 }}>
        {[160, 120, 85].map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: s, height: s, background: `radial-gradient(circle, rgba(212,185,140,${0.18 - i * 0.04}) 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.1 + i * 0.05, 1] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 180 }}
        >
          <SwanLogo size={72} color="var(--color-text-primary)" />
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-accent-gold)] mb-4 font-light"
      >
        Your First Glow
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="font-serif text-3xl text-[var(--color-text-primary)] font-light mb-4 leading-snug"
      >
        The Muse is ready.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="text-sm text-[var(--color-text-secondary)] font-light italic leading-relaxed max-w-[260px]"
      >
        Your personal curation awaits — beauty discoveries, rituals, and alternatives, all curated for you.
      </motion.p>
    </div>
  );

  const screens = [WelcomeVeil, MeetMuse, YourIntention, BeautyProfile, FirstGlow];
  const isLast = step === screens.length - 1;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-page-gradient)" }}>

      {/* Progress dots */}
      <div className="pt-14 pb-4 px-8 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => step > 0 && setStep(s => s - 1)}
          className="text-xs text-[var(--color-text-muted)] font-light tracking-wide min-w-[32px]"
        >
          {step > 0 ? "Back" : ""}
        </button>

        <div className="flex gap-2 items-center">
          {screens.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full h-1.5 bg-[var(--color-accent-gold)]"
              animate={{
                width: i === step ? 20 : 6,
                opacity: i <= step ? 1 : 0.25,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <button
          onClick={() => { navigate("/home"); }}
          className="text-[10px] text-[var(--color-text-muted)] font-light tracking-wide min-w-[32px] text-right"
        >
          {step < 2 ? "Skip" : ""}
        </button>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {screens[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-6 pt-4 pb-12 flex-shrink-0">
        {!isLast ? (
          <button
            onClick={() => canContinue[step] && setStep(s => s + 1)}
            disabled={!canContinue[step]}
            className={`w-full py-4 rounded-full text-xs tracking-[0.3em] uppercase font-light transition-all ${canContinue[step] ? "bg-[#1A3A30] text-[#FAF7F1]" : "bg-[#1A3A30]/[0.15] text-[var(--color-text-muted)]"}`}
          >
            {step === 0 ? "Begin" : "Continue"}
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={saving}
            className={`w-full py-4 rounded-full text-xs tracking-[0.3em] uppercase font-light transition-all bg-[#1A3A30] text-[#FAF7F1] ${saving ? "opacity-60" : ""}`}
          >
            {saving ? "Preparing your Muse..." : "Enter My Universe"}
          </button>
        )}

        {step === 0 && (
          <button
            onClick={() => navigate("/home")}
            className="w-full text-center mt-4 text-xs text-[var(--color-text-muted)] tracking-wide font-light"
          >
            Explore as a guest
          </button>
        )}
      </div>
    </div>
  );
}
