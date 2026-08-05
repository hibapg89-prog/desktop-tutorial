import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import SwanLogo from "@/components/SwanLogo";
import BadgePin from "@/components/BadgePin";
import { BADGES, BADGE_FAMILIES, FAMILY_MAP, computeEarned } from "@/utils/badgeDefinitions";
import { computeTier, TIER_CONFIG } from "@/utils/trustTier";
import { createNotification } from "@/utils/notifications";

// ─── Tray scatter layout (positions & rotations for 20 badges) ───────────────
const TRAY_POSITIONS = [
  // Row 1 – top arc
  { left: "10%",  top: "2%",  rot: -12, size: "sm" },
  { left: "28%",  top: "0%",  rot: 6,   size: "sm" },
  { left: "50%",  top: "0%",  rot: -4,  size: "md" },
  { left: "70%",  top: "1%",  rot: 10,  size: "sm" },
  { left: "85%",  top: "4%",  rot: -8,  size: "sm" },
  // Row 2
  { left: "2%",   top: "24%", rot: 8,   size: "sm" },
  { left: "20%",  top: "20%", rot: -6,  size: "md" },
  { left: "40%",  top: "18%", rot: 4,   size: "sm" },
  { left: "61%",  top: "17%", rot: -10, size: "sm" },
  { left: "79%",  top: "22%", rot: 7,   size: "md" },
  // Row 3 – centre (hero)
  { left: "4%",   top: "46%", rot: -9,  size: "sm" },
  { left: "22%",  top: "42%", rot: 5,   size: "sm" },
  { left: "43%",  top: "39%", rot: -3,  size: "lg" },
  { left: "64%",  top: "41%", rot: 8,   size: "sm" },
  { left: "82%",  top: "44%", rot: -5,  size: "sm" },
  // Row 4 – bottom
  { left: "8%",   top: "68%", rot: 10,  size: "md" },
  { left: "26%",  top: "65%", rot: -7,  size: "sm" },
  { left: "46%",  top: "63%", rot: 6,   size: "sm" },
  { left: "66%",  top: "66%", rot: -11, size: "md" },
  { left: "83%",  top: "70%", rot: 4,   size: "sm" },
];

// ─── Badge detail drawer ──────────────────────────────────────────────────────
function BadgeDrawer({ badge, earned, earnedAt, onClose }) {
  const family = FAMILY_MAP[badge?.family];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-md rounded-t-3xl shadow-2xl px-6 pt-8 pb-10 bg-[#FDF5E6] border border-[#E5E4E2]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#C8B06A]/40 mx-auto mb-6" />

        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <BadgePin badge={badge} earned={earned} size="lg" />
          </div>
          <div className="flex-1 pt-2">
            <p className="text-xs tracking-[0.18em] uppercase mb-1 font-light font-serif text-[#C8B06A]">
              {family?.label}
            </p>
            <h3 className="text-xl font-light leading-tight mb-2 font-serif text-[#043927]">
              {badge.label}
            </h3>
            <p className="text-sm leading-relaxed font-light text-[#5c7a69]">
              {badge.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[#E5E4E2]">
          {earned ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C8B06A]" />
              <span className="text-sm font-light text-[#043927]">
                Distinction earned
                {earnedAt && (
                  <span className="text-[#8a9e92]">
                    {" "}· {new Date(earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div>
              <p className="text-xs tracking-widest uppercase mb-2 font-light text-[#8a9e92]">
                How to earn
              </p>
              <p className="text-sm leading-relaxed font-light text-[#5c7a69]">
                {badge.howToEarn}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`mt-6 w-full py-3 rounded-xl text-sm tracking-[0.12em] uppercase font-light transition-all border ${
            earned
              ? "bg-[#043927] text-[#FAF6EF] border-[#043927]"
              : "bg-transparent text-[#043927] border-[#C8B06A]"
          }`}
        >
          {earned ? "Close" : "Keep going"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Tier progress card ───────────────────────────────────────────────────────
function TierProgressCard({ postCount, badgeCount }) {
  const tier = computeTier(postCount, badgeCount);

  let nextTierKey = null;
  let progressItems = [];

  if (tier.key === "seeker") {
    nextTierKey = "muse";
    progressItems = [
      { label: "Posts shared", current: postCount,  target: 3 },
      { label: "Distinctions", current: badgeCount, target: 3 },
    ];
  } else if (tier.key === "muse") {
    nextTierKey = "patron";
    progressItems = [
      { label: "Posts shared", current: postCount,  target: 7 },
      { label: "Distinctions", current: badgeCount, target: 5 },
    ];
  }

  const nextTier = nextTierKey ? TIER_CONFIG[nextTierKey] : null;

  return (
    <div className="mx-4 mb-5 rounded-2xl px-5 py-4 border border-[#E5E4E2] bg-white/55">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="text-[8px] tracking-[0.2em] uppercase font-light px-2.5 py-0.5 rounded-full"
            style={{ color: tier.color, border: `1px solid ${tier.border}`, background: tier.bg }}
          >
            {tier.label}
          </span>
          <span className="text-[11px] font-light text-[#043927]/40">
            {badgeCount} of 20 distinctions
          </span>
        </div>
        {nextTier && (
          <span className="text-[9px] font-light italic text-[#043927]/[0.28]">
            toward {nextTier.label}
          </span>
        )}
      </div>

      {tier.key === "patron" ? (
        <p className="text-[11px] font-light italic text-[#043927]/[0.45]">
          The highest distinction. You have arrived.
        </p>
      ) : (
        <>
          <div className="space-y-2.5">
            {progressItems.map(({ label, current, target }) => {
              const pct = Math.min(current / target, 1) * 100;
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-light uppercase tracking-wider text-[#043927]/[0.38]">
                      {label}
                    </span>
                    <span className="text-[9px] font-light text-[#043927]/[0.45]">
                      {Math.min(current, target)}/{target}
                    </span>
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden bg-[#C8B06A]/[0.18]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 100
                          ? "linear-gradient(90deg, #C8B06A, #D4BF85)"
                          : "linear-gradient(90deg, rgba(200,176,106,0.7), #C8B06A)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {tier.key === "seeker" && (
            <p className="text-[10px] font-light italic mt-2.5 text-[#043927]/[0.32]">
              {postCount >= 3 || badgeCount >= 3
                ? "Almost there — keep sharing your rituals."
                : `${3 - Math.max(postCount, badgeCount)} more ${postCount >= badgeCount ? "distinctions" : "posts"} to reach The Muse.`}
            </p>
          )}
          {tier.key === "muse" && (
            <p className="text-[10px] font-light italic mt-2.5 text-[#043927]/[0.32]">
              {postCount >= 7 && badgeCount >= 5
                ? "You have reached the threshold — The Patron awaits."
                : [
                    postCount < 7  && (7  - postCount  + " more posts"),
                    badgeCount < 5 && (5  - badgeCount + " more distinctions"),
                  ].filter(Boolean).join(" and ") + " to reach The Patron."}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Distinctions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [earnedKeys,    setEarnedKeys]    = useState(new Set());
  const [earnedDates,   setEarnedDates]   = useState({});
  const [newlyEarned,   setNewlyEarned]   = useState(new Set());
  const [postCount,     setPostCount]     = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [activeFamily,  setActiveFamily]  = useState("all");
  const [toast,         setToast]         = useState(null);
  const hasAutoAwarded = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        const [badgeRecords, posts] = await Promise.all([
          base44.entities.UserBadge.filter({ user_id: user.id }),
          base44.entities.CommunityPost.filter({ created_by_id: user.id }),
        ]);

        const existingKeys = new Set(badgeRecords.map((b) => b.badge_key));
        const dates = {};
        badgeRecords.forEach((b) => { dates[b.badge_key] = b.earned_at || b.created_date; });

        setPostCount(Array.isArray(posts) ? posts.length : 0);

        if (!hasAutoAwarded.current) {
          hasAutoAwarded.current = true;
          const newKeys = computeEarned(posts, existingKeys);

          for (const key of newKeys) {
            try {
              const now = new Date().toISOString();
              await base44.entities.UserBadge.create({ user_id: user.id, badge_key: key, earned_at: now });
              existingKeys.add(key);
              dates[key] = now;
            } catch {}
          }

          if (newKeys.length > 0) {
            setNewlyEarned(new Set(newKeys));

            const BADGE_MAP = Object.fromEntries(BADGES.map(b => [b.key, b]));
            const firstBadge = BADGE_MAP[newKeys[0]];
            if (firstBadge) {
              createNotification({
                user_id: user.id,
                type: "recommendation",
                title: "New distinction earned: " + firstBadge.label,
                body: firstBadge.subtitle,
              }).catch(() => {});

              setToast({ label: firstBadge.label });
              setTimeout(() => setToast(null), 3800);
            }
          }
        }

        setEarnedKeys(new Set(existingKeys));
        setEarnedDates(dates);
      } catch (e) {
        console.error("Distinctions load error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id]);

  const earnedCount = earnedKeys.size;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF5E6]">
        <div className="flex flex-col items-center gap-3">
          <div className="swan-float">
            <SwanLogo size={40} color="#C8B06A" />
          </div>
          <p className="text-xs tracking-[0.2em] uppercase font-light text-[#C8B06A]">
            Preparing your sanctuary
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[#FDF5E6]">

      {/* ── New-badge toast ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full shadow-lg bg-[#043927] border border-[#C8B06A]/45"
          >
            <p className="text-[11px] tracking-[0.16em] uppercase font-light text-[#C8B06A] whitespace-nowrap">
              Distinction earned — {toast.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative pt-6 pb-4 px-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[#C8B06A]/30 hover:border-[#C8B06A]/60 transition-colors"
        >
          <ChevronLeft size={18} strokeWidth={1.5} color="#043927" />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-[10px] tracking-[0.3em] uppercase font-light font-serif text-[#C8B06A]">
            Le Sanctuaire
          </p>
          <h1 className="text-xl tracking-[0.12em] uppercase font-light font-serif text-[#043927]">
            Distinctions
          </h1>
        </div>
        <div className="w-9" />
      </div>

      {/* ── Marble tray ───────────────────────────────────────────────────── */}
      <div className="px-4 mb-4">
        <div
          className="relative w-full rounded-3xl overflow-hidden h-[340px]"
          style={{
            background: "radial-gradient(ellipse at 40% 35%, #f0e8d5 0%, #e8dcc4 40%, #d4c9b0 100%)",
            boxShadow: "inset 0 2px 20px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* Marble veins */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 340" preserveAspectRatio="none">
            <path d="M0 120 Q60 80 120 130 Q180 180 280 100 Q360 40 400 90" fill="none" stroke="#fff" strokeWidth="0.8" />
            <path d="M50 280 Q130 240 200 270 Q280 300 380 240" fill="none" stroke="#fff" strokeWidth="0.6" />
            <path d="M320 0 Q340 80 300 160 Q260 240 290 340" fill="none" stroke="#C8B06A" strokeWidth="0.4" opacity="0.5" />
          </svg>

          <div className="absolute left-0 top-0 bottom-0 w-12 opacity-30 pointer-events-none bg-gradient-to-r from-[#f5ead8] to-transparent" />

          {/* Progress ribbon */}
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full border border-[#C8B06A] backdrop-blur-sm"
            style={{ background: "rgba(253,245,230,0.85)" }}
          >
            <span className="text-[11px] tracking-[0.2em] uppercase font-light font-serif text-[#043927]">
              {earnedCount} of 20 earned
            </span>
          </div>

          {/* Scattered badges */}
          {BADGES.map((badge, i) => {
            const pos = TRAY_POSITIONS[i] || { left: "50%", top: "50%", rot: 0, size: "sm" };
            const isEarned = earnedKeys.has(badge.key);
            const isNew = newlyEarned.has(badge.key);
            return (
              <motion.div
                key={badge.key}
                className="absolute cursor-pointer"
                style={{
                  left: pos.left,
                  top: pos.top,
                  zIndex: isNew ? 20 : isEarned ? 10 : 5,
                }}
                initial={{ opacity: 0, scale: 0.6, rotate: pos.rot }}
                animate={{ opacity: 1, scale: 1, rotate: pos.rot }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                whileHover={{ scale: 1.12 }}
                onClick={() => setSelectedBadge(badge)}
              >
                {isNew && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: "50%", animation: "pulseRing 1.8s ease-out infinite" }}
                  />
                )}
                <BadgePin badge={badge} earned={isEarned} size={pos.size} rotation={0} />
              </motion.div>
            );
          })}

          {/* Bottom ribbon */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-[9px] tracking-[0.35em] uppercase font-light font-serif text-[#C8B06A]">
              Your Beauty Journey, Celebrated
            </p>
          </div>
        </div>
      </div>

      {/* ── Tier progress card ─────────────────────────────────────────────── */}
      <TierProgressCard postCount={postCount} badgeCount={earnedCount} />

      {/* ── Family filter tabs ─────────────────────────────────────────────── */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFamily("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-light transition-all border border-[#043927] tracking-[0.06em] ${
              activeFamily === "all" ? "bg-[#043927] text-[#FAF6EF]" : "bg-transparent text-[#043927]"
            }`}
          >
            All
          </button>
          {BADGE_FAMILIES.map((f) => {
            const familyBadges = BADGES.filter((b) => b.family === f.key);
            const familyEarned = familyBadges.filter((b) => earnedKeys.has(b.key)).length;
            const isActive = activeFamily === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFamily(f.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-light transition-all flex items-center gap-1 border border-[#043927] tracking-[0.06em] ${
                  isActive ? "bg-[#043927] text-[#FAF6EF]" : "bg-transparent text-[#043927]"
                }`}
              >
                {f.label}
                {familyEarned > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-medium bg-[#C8B06A] text-[#FAF6EF]">
                    {familyEarned}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Badge grid ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeFamily === "all" ? (
          <motion.div
            key="all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="px-4 space-y-8"
          >
            {BADGE_FAMILIES.map((family) => {
              const familyBadges = BADGES.filter((b) => b.family === family.key);
              const earned = familyBadges.filter((b) => earnedKeys.has(b.key)).length;
              const total = familyBadges.length;
              return (
                <div key={family.key}>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <h2 className="text-base tracking-[0.1em] uppercase font-light font-serif text-[#043927]">
                        {family.label}
                      </h2>
                      <p className="text-[11px] mt-0.5 font-light text-[#8a9e92]">
                        {family.subtitle}
                      </p>
                    </div>
                    <span className="text-xs tabular-nums font-light text-[#C8B06A]">
                      {earned}/{total}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    {familyBadges.map((badge) => (
                      <BadgePin
                        key={badge.key}
                        badge={badge}
                        earned={earnedKeys.has(badge.key)}
                        size="sm"
                        showLabel
                        onClick={() => setSelectedBadge(badge)}
                      />
                    ))}
                  </div>

                  <div className="mt-4 h-px w-full rounded-full overflow-hidden bg-[#E5E4E2]">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-[#C8B06A]"
                      style={{ width: `${(earned / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key={activeFamily}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="px-4"
          >
            {(() => {
              const family = FAMILY_MAP[activeFamily];
              const familyBadges = BADGES.filter((b) => b.family === activeFamily);
              const earned = familyBadges.filter((b) => earnedKeys.has(b.key)).length;
              return (
                <div>
                  <p className="text-sm mb-5 font-light text-[#5c7a69]">
                    {family?.subtitle}
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    {familyBadges.map((badge) => {
                      const isEarned = earnedKeys.has(badge.key);
                      return (
                        <div
                          key={badge.key}
                          className="flex flex-col items-center gap-3 cursor-pointer"
                          onClick={() => setSelectedBadge(badge)}
                        >
                          <BadgePin badge={badge} earned={isEarned} size="lg" />
                          <div className="text-center">
                            <p className={`text-sm font-light font-serif ${
                              isEarned ? "text-[#043927]" : "text-[#8a9e92]"
                            }`}>
                              {badge.label}
                            </p>
                            <p className="text-[11px] mt-0.5 leading-snug font-light text-[#8a9e92]">
                              {isEarned ? "Earned" : badge.howToEarn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 rounded-xl p-4 flex items-center justify-between bg-white/60 border border-[#E5E4E2]">
                    <span className="text-sm font-light text-[#043927]">
                      {family?.label} progress
                    </span>
                    <span className="text-sm font-light font-serif text-[#C8B06A]">
                      {earned} of {familyBadges.length}
                    </span>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Badge detail drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDrawer
            badge={selectedBadge}
            earned={earnedKeys.has(selectedBadge.key)}
            earnedAt={earnedDates[selectedBadge.key]}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(200,176,106,0.65); }
          70%  { box-shadow: 0 0 0 12px rgba(200,176,106,0); }
          100% { box-shadow: 0 0 0 0 rgba(200,176,106,0); }
        }
      `}</style>
    </div>
  );
}
