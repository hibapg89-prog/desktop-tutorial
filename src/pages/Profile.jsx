import { useState, useEffect } from "react";
import { applyTheme } from "@/lib/theme";
import {
  Settings, X, ChevronRight, Droplets, Feather,
  Sun, LogOut, Check, Eye, EyeOff, MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SwanLogo from "@/components/SwanLogo";
import ProfileTrends from "@/components/ProfileTrends";
import { base44 } from "@/api/base44Client";
import { createNotification } from "@/utils/notifications";
import { motion, AnimatePresence } from "framer-motion";
import BadgePin from "@/components/BadgePin";
import { BADGES } from "@/utils/badgeDefinitions";
import { computeTier } from "@/utils/trustTier";

const BEAUTY_ROOM_META = {
  skin_rituals: { label: "Skin Rituals",    glyph: "✦", color: "#C8A96E", archetype: "The Alchemist"  },
  bold_colour:  { label: "Bold Colour",     glyph: "◆", color: "#BC4A6A", archetype: "The Icon"       },
  clean_beauty: { label: "Clean Beauty",    glyph: "◉", color: "#3D7A5A", archetype: "The Purist"     },
  vintage_glam: { label: "Vintage Glamour", glyph: "◈", color: "#7A4E7A", archetype: "The Archivist"  },
  natural_glow: { label: "Natural Glow",    glyph: "◇", color: "#C47B3A", archetype: "The Oracle"     },
  minimalist:   { label: "Minimalist",      glyph: "○", color: "#043927", archetype: "The Engineer"   },
};

// ── ADN ATTRIBUTES ──────────────────────────────────────────────────────────────
const SKIN_TYPE_MAP = {
  dry:         { label: "Dry Skin",       icon: "droplet" },
  oily:        { label: "Oily Skin",      icon: "sun"     },
  combination: { label: "Combination",    icon: "sun"     },
  sensitive:   { label: "Sensitive Skin", icon: "feather" },
  normal:      { label: "Normal Skin",    icon: "sun"     },
  mature:      { label: "Mature Skin",    icon: "feather" },
  dehydrated:  { label: "Dehydrated",     icon: "droplet" },
  acne_prone:  { label: "Acne-Prone",     icon: "feather" },
};
const INTENTION_MAP = {
  hydration:   { label: "Hydration",    icon: "droplet" },
  anti_aging:  { label: "Anti-Ageing",  icon: "feather" },
  brightening: { label: "Brightening",  icon: "sun"     },
  glow:        { label: "Radiance",     icon: "sun"     },
  acne:        { label: "Clarifying",   icon: "feather" },
  soothing:    { label: "Soothing",     icon: "feather" },
  firming:     { label: "Firming",      icon: "feather" },
  protection:  { label: "Protection",   icon: "sun"     },
};
function buildAdnAttrs(user) {
  const attrs = [];
  (user?.skin_types || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean).forEach(key => {
    if (SKIN_TYPE_MAP[key]) attrs.push({ ...SKIN_TYPE_MAP[key], aesthetic: true });
  });
  (user?.intention || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean).forEach(key => {
    if (INTENTION_MAP[key]) attrs.push({ ...INTENTION_MAP[key], aesthetic: false });
  });
  return attrs;
}


// ── HELPERS ────────────────────────────────────────────────────────────────────
function glowShadow(mode) {
  if (mode === "GHOST") return "none";
  if (mode === "SOFT")  return "0 0 22px 5px rgba(200,176,106,0.18), 0 0 7px 2px rgba(200,176,106,0.10)";
  return "0 0 36px 10px rgba(200,176,106,0.30), 0 0 12px 4px rgba(200,176,106,0.16)";
}

function AdnIcon({ type, size = 16 }) {
  const p = { size, strokeWidth: 1.5, color: "var(--color-accent-gold)" };
  if (type === "droplet") return <Droplets {...p} />;
  if (type === "feather")  return <Feather  {...p} />;
  return <Sun {...p} />;
}


// ── GLOW INDICATOR ─────────────────────────────────────────────────────────────
function GlowIndicator({ mode, onTap, isAtelier: atelierView }) {
  const label = mode === "PUBLIC" ? "Public Glow" : mode === "SOFT" ? "Soft Glow" : "Ghost Glow";
  const ringGlow =
    mode === "PUBLIC" ? "0 0 8px 2px rgba(200,176,106,0.55)"
    : mode === "SOFT" ? "0 0 5px 1px rgba(200,176,106,0.32)"
    : "none";

  const visual = (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center justify-center w-[18px] h-[18px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `1.5px solid ${mode !== "GHOST" ? "#C8B06A" : "rgba(200,176,106,0.28)"}`,
            boxShadow: ringGlow,
          }}
        />
        {mode === "PUBLIC" && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#C8B06A]" />
        )}
        {mode === "SOFT" && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#C8B06A]/45" />
        )}
      </div>
      <span className="text-[0.5625rem] tracking-[0.18em] uppercase font-light text-primary-40">
        {label}
      </span>
    </div>
  );

  if (!atelierView) return <div>{visual}</div>;

  return (
    <button onClick={onTap} className="hover:opacity-75 transition-opacity">
      {visual}
    </button>
  );
}

// ── PROFILE ────────────────────────────────────────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [glowMode, setGlowMode]         = useState("PUBLIC");
  const [privacy, setPrivacy]           = useState("PUBLIC");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode,         setDarkMode] = useState(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("muse_accessibility") || "{}");
      if (prefs.darkMode !== undefined) return prefs.darkMode;
    } catch {}
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [earnedKeys, setEarnedKeys]     = useState(new Set());
  const [postCount, setPostCount]       = useState(0);
  const [isAtelier, setIsAtelier]       = useState(true);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [admiratricesCount, setAdmiratricesCount] = useState(0);
  const [coterieCount, setCoterieCount]           = useState(0);
  const [admiratricesList, setAdmiratricesList]   = useState([]);
  const [coterieList, setCoterieList]             = useState([]);
  const [isAdmiring, setIsAdmiring]               = useState(false);
  const [admireLoading, setAdmireLoading]         = useState(false);
  const [admireError, setAdmireError]             = useState(false);
  const [followListModal, setFollowListModal]     = useState(null);
  const [adoredCount,    setAdoredCount]    = useState(0);
  const [rituelsCount,   setRituelsCount]   = useState(0);
  const [myEditProducts, setMyEditProducts] = useState([]);
  const [myRooms,        setMyRooms]        = useState([]);
  const [myBeautyRooms,  setMyBeautyRooms]  = useState([]);

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (u) {
        try {
          const msgs = await base44.entities.Message.filter({ recipient_id: u.id, read: false });
          setUnreadCount(msgs.length);
        } catch {}
        try {
          const ub = await base44.entities.UserBadge.filter({ user_id: u.id });
          setEarnedKeys(new Set(ub.map(b => b.badge_key)));
        } catch {}
        try {
          const myPosts = await base44.entities.CommunityPost.filter({ created_by_id: u.id });
          setPostCount(Array.isArray(myPosts) ? myPosts.length : 0);
        } catch {}
        try {
          const followers = await base44.entities.UserFollow.filter({ followed_id: u.id });
          setAdmiratricesCount(Array.isArray(followers) ? followers.length : 0);
          setAdmiratricesList(Array.isArray(followers) ? followers : []);
        } catch (e) { console.error("[Profile] Admiratrices load failed:", e); }
        try {
          const following = await base44.entities.UserFollow.filter({ follower_id: u.id });
          setCoterieCount(Array.isArray(following) ? following.length : 0);
          setCoterieList(Array.isArray(following) ? following : []);
        } catch (e) { console.error("[Profile] Coterie load failed:", e); }
        try {
          const stats = await base44.entities.UserStat.filter({ user_id: u.id });
          setAdoredCount(Array.isArray(stats) && stats[0] ? (stats[0].total_adores || 0) : 0);
        } catch {}
        try {
          const tutorials = await base44.entities.Tutorial.filter({ is_collected: true, created_by_id: u.id });
          setRituelsCount(Array.isArray(tutorials) ? tutorials.length : 0);
        } catch {}
        try {
          const products = await base44.entities.Product.filter({ in_vanity: true, created_by_id: u.id });
          setMyEditProducts(Array.isArray(products) ? products.slice(0, 6) : []);
        } catch {}
        try {
          const allRooms = await base44.entities.CircleRoom.list("-last_activity", 50);
          setMyRooms(Array.isArray(allRooms) ? allRooms.filter(r => Array.isArray(r.member_ids) && r.member_ids.includes(u.id)) : []);
        } catch {}
        try {
          const stored = JSON.parse(localStorage.getItem("muse_beauty_rooms") || "[]");
          const serverKeys = u?.beauty_rooms ? JSON.parse(u.beauty_rooms) : [];
          setMyBeautyRooms([...new Set([...stored, ...serverKeys])]);
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    applyTheme(darkMode);
    try {
      const prefs = JSON.parse(localStorage.getItem("muse_accessibility") || "{}");
      prefs.darkMode = darkMode;
      localStorage.setItem("muse_accessibility", JSON.stringify(prefs));
    } catch {}
  }, [darkMode]);

  const sortedBadges = [...BADGES].sort((a, b) => {
    const aE = earnedKeys.has(a.key) ? 0 : 1;
    const bE = earnedKeys.has(b.key) ? 0 : 1;
    return aE - bE;
  });
  const earnedCount = earnedKeys.size;
  const tier = computeTier(postCount, earnedCount);

  const handleAdmire = async () => {
    if (!user || admireLoading) return;
    setAdmireLoading(true);
    try {
      if (isAdmiring) {
        const records = await base44.entities.UserFollow.filter({ follower_id: user.id, followed_id: user.id });
        if (Array.isArray(records) && records[0]) {
          await base44.entities.UserFollow.delete(records[0].id);
        }
        setIsAdmiring(false);
        setAdmiratricesCount(c => Math.max(0, c - 1));
      } else {
        await base44.entities.UserFollow.create({ follower_id: user.id, followed_id: user.id });
        setIsAdmiring(true);
        setAdmiratricesCount(c => c + 1);
        createNotification({
          user_id: user.id,
          type: "admire",
          title: (user.full_name || user.email || "A Muse Member") + " now admires you",
          sender_id: user.id,
        });
      }
    } catch (e) {
      console.error("[Profile] Admire action failed:", e);
      setAdmireError(true);
      setTimeout(() => setAdmireError(false), 3000);
    }
    setAdmireLoading(false);
  };

  const adnAttrs = buildAdnAttrs(user);
  const privateWall = !isAtelier && (glowMode === "GHOST" || privacy === "PRIVATE_MUSE");
  const visitorHidden = !isAtelier && glowMode === "GHOST";

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">

      {/* ── DEMO TOGGLE (production: remove) ──────────────────────────────────── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={() => setIsAtelier(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#C8B06A]/25 text-[0.5rem] tracking-[0.2em] uppercase font-light text-primary-35 hover:text-primary-70 transition-colors bg-[var(--color-bg)]/85"
        >
          {isAtelier ? <Eye size={9} strokeWidth={1.5} /> : <EyeOff size={9} strokeWidth={1.5} />}
          {isAtelier ? "Preview visitor view" : "Return to My View"}
        </button>
      </div>

      {/* ── PRIVATE SANCTUARY WALL ────────────────────────────────────────────── */}
      {privateWall && (
        <div className="flex flex-col items-center justify-center min-h-screen px-10 text-center">
          <div className="opacity-50"><SwanLogo size={52} color="var(--color-accent-gold)" /></div>
          <p className="text-[var(--color-text-primary)] text-[1.375rem] mt-6 mb-2 font-light font-serif">
            This Muse keeps her sanctuary private.
          </p>
          <p className="text-[0.6875rem] text-primary-40 font-light tracking-wide">
            Her beauty ritual is hers alone.
          </p>
        </div>
      )}

      {!privateWall && (
        <div className="pb-28">

          {/* ── SECTION 1: HEADER ──────────────────────────────────────────────── */}
          <div className="relative pt-14 px-5">

            {isAtelier ? (
              <>
                {/* Glow Mode label + gear icon */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="flex items-center gap-1.5"
                  >
                    <span className="text-[0.5625rem] tracking-[0.2em] font-light uppercase text-primary-40">
                      Glow Mode:
                    </span>
                    <span className="text-[0.5625rem] tracking-[0.2em] font-light uppercase text-[var(--color-accent-gold)]">
                      {glowMode}
                    </span>
                  </button>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="w-8 h-8 rounded-full border border-[#C8B06A]/35 flex items-center justify-center hover:border-[#C8B06A] transition-colors"
                  >
                    <Settings size={13} strokeWidth={1.5} color="var(--color-accent-gold)" />
                  </button>
                </div>

                {/* Centered avatar */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className="rounded-full mb-4 flex items-center justify-center overflow-hidden w-[112px] h-[112px] border-2 border-[#C8B06A]"
                    style={{
                      background: "linear-gradient(135deg, #F5EDD8 0%, #EDE3CC 100%)",
                      boxShadow: glowShadow(glowMode),
                    }}
                  >
                    {user?.profile_photo_url ? (
                      <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <SwanLogo size={46} color="var(--color-accent-gold)" />
                    )}
                  </div>
                  <h1 className="text-[var(--color-text-primary)] font-light tracking-wide mb-1 font-serif text-[1.875rem]">
                    {user?.full_name || "The Seeker"}
                  </h1>
                  <span
                    className="px-2.5 py-0.5 text-[0.5rem] tracking-[0.22em] uppercase font-light rounded-full mb-2"
                    style={{ color: tier.color, border: `1px solid ${tier.border}`, background: tier.bg }}
                  >
                    {tier.label}
                  </span>
                  <p className="text-[0.6875rem] text-primary-40 font-light italic leading-relaxed max-w-[220px]">
                    Creating a sanctuary for beauty curation.
                  </p>
                </div>
              </>
            ) : (
              /* ── ÉDITORIAL: asymmetric layout ─────────────────────────────── */
              <div className="flex items-start gap-5 pt-4">
                <div
                  className="rounded-full flex-shrink-0 flex items-center justify-center w-24 h-24"
                  style={{
                    border: "1.5px solid #C8B06A",
                    background: "linear-gradient(135deg, #F5EDD8 0%, #EDE3CC 100%)",
                    boxShadow: glowMode !== "GHOST" ? "0 0 18px 5px rgba(200,176,106,0.18)" : "none",
                  }}
                >
                  {user?.profile_photo_url ? (
                    <img src={user.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <SwanLogo size={38} color="var(--color-accent-gold)" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h1 className="text-[var(--color-text-primary)] font-light tracking-wide leading-tight mb-1 font-serif text-[1.75rem]">
                    {user?.full_name || "The Seeker"}
                  </h1>
                  <p className="text-[0.625rem] text-primary-40 font-light italic leading-relaxed mb-2">
                    Creating a sanctuary for beauty curation.
                  </p>
                  <span
                    className="px-2 py-0.5 text-[0.5rem] tracking-[0.2em] uppercase font-light rounded-full"
                    style={{ color: tier.color, border: `1px solid ${tier.border}`, background: tier.bg }}
                  >
                    {tier.label}
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <GlowIndicator mode={glowMode} isAtelier={false} />
                    <button
                      onClick={handleAdmire}
                      disabled={admireLoading}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light transition-colors disabled:opacity-50 ${
                        isAdmiring
                          ? "border border-[#C8B06A] text-[#0B3C26] bg-[#C8B06A]/10"
                          : "bg-[#043927] text-[#FDF5E6]"
                      }`}
                    >
                      {isAdmiring && <Check size={9} strokeWidth={2.5} />}
                      {isAdmiring ? "Admiring" : "Admire"}
                    </button>
                  </div>
                  {admireError && (
                    <p className="text-right text-[0.5625rem] tracking-wider mt-0.5" style={{ color: "#BC8F8F" }}>
                      Couldn’t connect · try again
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── DIVIDER ───────────────────────────────────────────────────────── */}
          <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />

          {/* ── MESSAGES ENTRY (Atelier only) ─────────────────────────────────── */}
          {isAtelier && (
            <div className="px-5 mb-1">
              <Link
                to="/messages"
                className="block rounded-2xl px-5 py-4 border border-[var(--color-border)] flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #043927 0%, #0B3C26 100%)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#C8B06A]/15">
                    <MessageCircle size={16} color="var(--color-accent-gold)" />
                  </div>
                  <div>
                    <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-[var(--color-accent-gold)] font-light">The Muse Circle</p>
                    <p className="text-sm text-[#FDF5E6] font-light">Your Conversations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-[var(--color-accent-gold)] text-white text-[0.625rem] flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                  <ChevronRight size={14} color="var(--color-accent-gold)" />
                </div>
              </Link>
            </div>
          )}

          {/* ── SECTION 2: DISTINCTIONS ───────────────────────────────────────── */}
          {!visitorHidden && (
            <div className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
                  Distinctions Preview
                </h2>
                {isAtelier && (
                  <Link
                    to="/distinctions"
                    className="text-[0.5625rem] tracking-[0.2em] text-[var(--color-accent-gold)] uppercase font-light"
                  >
                    Le Sanctuaire →
                  </Link>
                )}
              </div>

              {isAtelier ? (
                <div className="rounded-2xl px-5 py-5 border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                  <div className="flex justify-around">
                    {sortedBadges.slice(0, 3).map((badge, i) => (
                      <motion.div
                        key={badge.key}
                        initial={{ opacity: 0, scale: 0.82 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08, ease: "easeOut" }}
                      >
                        <BadgePin badge={badge} earned={earnedKeys.has(badge.key)} size="sm" showLabel />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl px-5 py-5 border border-[var(--color-border)] inline-block bg-[var(--color-bg-surface)]">
                  {sortedBadges[0] && (
                    <BadgePin badge={sortedBadges[0]} earned={earnedKeys.has(sortedBadges[0].key)} size="md" showLabel />
                  )}
                </div>
              )}
            </div>
          )}

          {!visitorHidden && (
            <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />
          )}

          {/* ── SECTION 3: WHISPERS ───────────────────────────────────────────── */}
          {!visitorHidden && (
            <div className="px-5">
              <div className="rounded-2xl px-5 py-4 border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
                <p className="text-[0.8125rem] text-primary-45 font-light uppercase tracking-[0.18em] mb-1.5">
                  Murmures
                </p>
                <p className="text-[0.9375rem] text-[var(--color-text-primary)] font-light font-serif">
                  {isAtelier ? (
                    <>
                      <span className="font-normal">{rituelsCount}</span>
                      {" "}<span className="text-[var(--color-accent-gold)]">Rituels</span>
                      <span className="text-primary-25 mx-2">·</span>
                      <span className="font-normal">{adoredCount}</span>
                      {" "}<span className="text-[var(--color-accent-gold)]">Adores</span>
                      <span className="text-primary-25 mx-2">·</span>
                      <button onClick={() => setFollowListModal("admiratrices")} className="hover:opacity-70 transition-opacity">
                        <span className="font-normal">{admiratricesCount}</span>
                        {" "}<span className="text-[var(--color-accent-gold)]">Admiratrices</span>
                      </button>
                      <span className="text-primary-25 mx-2">·</span>
                      <button onClick={() => setFollowListModal("coterie")} className="hover:opacity-70 transition-opacity">
                        <span className="font-normal">{coterieCount}</span>
                        {" "}<span className="text-[var(--color-accent-gold)]">Coterie</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-normal">{adoredCount}</span>
                      {" "}<span className="text-[var(--color-accent-gold)]">Adores</span>
                      <span className="text-primary-25 mx-2">·</span>
                      <button onClick={() => setFollowListModal("admiratrices")} className="hover:opacity-70 transition-opacity">
                        <span className="font-normal">{admiratricesCount}</span>
                        {" "}<span className="text-[var(--color-accent-gold)]">Admiratrices</span>
                      </button>
                      <span className="text-primary-25 mx-2">·</span>
                      <button onClick={() => setFollowListModal("coterie")} className="hover:opacity-70 transition-opacity">
                        <span className="font-normal">{coterieCount}</span>
                        {" "}<span className="text-[var(--color-accent-gold)]">Coterie</span>
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* ── SECTION 3.5: BEAUTY TRENDS (Atelier only) ─────────────────────── */}
          {isAtelier && (
            <div className="px-5">
              <ProfileTrends />
            </div>
          )}

          {isAtelier && (
            <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />
          )}

          {/* ── SECTION 4: MY EDIT ────────────────────────────────────────────── */}
          {!visitorHidden && (
            <div className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
                  My Edit
                </h2>
                {isAtelier && (
                  <button onClick={() => navigate("/vanity")} className="px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light text-[#FDF5E6] bg-[#043927]">
                    Edit My Selection
                  </button>
                )}
              </div>

              {isAtelier ? (
                myEditProducts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {myEditProducts.map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/35"
                      >
                        <div className="aspect-square overflow-hidden relative bg-[var(--color-bg-elevated)]">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <SwanLogo size={28} color="var(--color-accent-gold)" />
                            </div>
                          )}
                        </div>
                        <div className="px-2 py-1.5">
                          <p className="text-[0.4375rem] text-primary-45 font-light uppercase tracking-wider truncate mb-0.5">
                            {p.brand}
                          </p>
                          <p className="text-[0.5625rem] text-[var(--color-text-primary)] font-light leading-tight truncate">
                            {p.name}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-5 py-8 text-center bg-[var(--color-bg-surface)]">
                    <p className="text-[0.6875rem] text-primary-40 font-light italic">Your Edit is empty.</p>
                    <p className="text-[0.5625rem] text-primary-30 font-light mt-1 tracking-wide">Add products to your Vanity to curate your Edit.</p>
                  </div>
                )
              ) : (
                myEditProducts.length > 0 ? (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5">
                    {myEditProducts.slice(0, 4).map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="rounded-xl overflow-hidden border border-[var(--color-border)] flex-shrink-0 w-[132px] bg-[var(--color-bg-surface)]"
                      >
                        <div className="aspect-square overflow-hidden bg-[var(--color-bg-elevated)]">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <SwanLogo size={24} color="var(--color-accent-gold)" />
                            </div>
                          )}
                        </div>
                        <div className="px-2.5 py-2">
                          <p className="text-[0.4375rem] text-[var(--color-accent-gold)] font-light uppercase tracking-wider truncate mb-0.5">
                            {p.brand}
                          </p>
                          <p className="text-[0.625rem] text-[var(--color-text-primary)] font-light leading-tight truncate mb-1.5">
                            {p.name}
                          </p>
                          <span className="text-[0.4375rem] tracking-[0.12em] uppercase font-light px-2 py-1 rounded-lg text-[#FDF5E6] block text-center bg-[#003629]">
                            View
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* ── DIVIDER ───────────────────────────────────────────────────────── */}
          <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />

          {/* ── SECTION 5: SKIN PROFILE / ADN ────────────────────────────────── */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
                Skin Profile / ADN
              </h2>
              {isAtelier && (
                <button onClick={() => navigate("/onboarding")} className="text-[0.5625rem] tracking-[0.2em] text-[var(--color-accent-gold)] uppercase font-light">
                  Edit →
                </button>
              )}
            </div>

            {isAtelier ? (
              adnAttrs.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {adnAttrs.map(({ label, icon }) => (
                    <div
                      key={label}
                      className="rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center gap-3 bg-[var(--color-bg-surface)]"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C8B06A]/10 border border-[#C8B06A]/25">
                        <AdnIcon type={icon} size={15} />
                      </div>
                      <p className="text-[0.5625rem] text-center text-primary-60 font-light leading-tight tracking-wide">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/onboarding")}
                  className="w-full rounded-xl px-4 py-5 border border-dashed border-[#C8B06A]/40 text-center bg-[var(--color-bg-surface)]"
                >
                  <p className="text-[0.75rem] text-primary-40 font-light">Complete your skin profile →</p>
                </button>
              )
            ) : (
              <div className="rounded-xl px-4 py-4 border border-[var(--color-border)] space-y-2 bg-[var(--color-bg-surface)]">
                {adnAttrs.filter(a => a.aesthetic).map(({ label }) => (
                  <p key={label} className="text-[0.75rem] text-primary-60 font-light">
                    — {label}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* ── DIVIDER ───────────────────────────────────────────────────────── */}
          <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />

          {/* ── SECTION 6: BEAUTY ROOMS (community themed rooms) ─────────────── */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
                Beauty Rooms
              </h2>
              {isAtelier && (
                <button onClick={() => navigate("/community")} className="text-[0.5625rem] tracking-[0.2em] text-[var(--color-accent-gold)] uppercase font-light">
                  Explore →
                </button>
              )}
            </div>

            {myBeautyRooms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myBeautyRooms.map(key => {
                  const meta = BEAUTY_ROOM_META[key];
                  if (!meta) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                    >
                      <span className="text-[0.5625rem]" style={{ color: meta.color }}>{meta.glyph}</span>
                      <span className="text-[0.625rem] font-light text-[var(--color-text-primary)] tracking-wide">{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              isAtelier ? (
                <button
                  onClick={() => navigate("/community")}
                  className="w-full rounded-xl px-4 py-5 border border-dashed border-[#C8B06A]/40 text-center bg-[var(--color-bg-surface)]"
                >
                  <p className="text-[0.75rem] text-primary-40 font-light">Join beauty rooms in Community →</p>
                </button>
              ) : null
            )}
          </div>

          {/* ── DIVIDER ───────────────────────────────────────────────────────── */}
          <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />

          {/* ── SECTION 7: PRIVATE ROOMS ──────────────────────────────────────── */}
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[1rem] text-[var(--color-text-primary)] font-light font-serif">
                Private Rooms
              </h2>
            </div>

            {isAtelier ? (
              myRooms.length > 0 ? (
                <div className="space-y-2">
                  {myRooms.map(room => (
                    <Link
                      key={room.id}
                      to={`/circle-rooms/${room.id}`}
                      className="rounded-xl px-4 py-3 border border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-elevated)]/35"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.625rem] font-light text-primary-50 flex-shrink-0 bg-[#C8B06A]/12 border border-[#C8B06A]/25">
                          {room.name?.[0]?.toUpperCase() || "R"}
                        </div>
                        <span className="text-[0.8125rem] text-[var(--color-text-primary)] font-light">{room.name}</span>
                      </div>
                      {room.created_by_id === user?.id && (
                        <span className="text-[0.5rem] tracking-[0.18em] uppercase font-light px-2 py-0.5 rounded-full text-[var(--color-accent-gold)] border border-[#C8B06A]/30 bg-[#C8B06A]/7">
                          Leader
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] px-5 py-6 text-center bg-[var(--color-bg-surface)]">
                  <p className="text-[0.6875rem] text-primary-40 font-light italic">You haven't joined any rooms yet.</p>
                </div>
              )
            ) : (
              myRooms.length > 0 ? (
                <div className="space-y-2">
                  {myRooms.map(room => (
                    <div
                      key={room.id}
                      className="rounded-xl px-4 py-3 border border-[var(--color-border)] flex items-center justify-between bg-[var(--color-bg-elevated)]/22"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.625rem] font-light text-primary-40 flex-shrink-0 bg-[#C8B06A]/10 border border-[#C8B06A]/20">
                          {room.name?.[0]?.toUpperCase() || "R"}
                        </div>
                        <span className="text-[0.8125rem] text-[var(--color-text-primary)]/70 font-light">{room.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null
            )}
          </div>

          {/* ── SIGN OUT (Atelier only — plain footer) ────────────────────────── */}
          {isAtelier && (
            <>
              <div className="mx-5 my-5 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />
              <div className="px-5">
                <button
                  onClick={() => base44.auth.logout("/login")}
                  className="flex items-center gap-3 py-3"
                >
                  <LogOut size={14} strokeWidth={1.5} color="#BC8F8F" />
                  <span className="text-[0.8125rem] text-[#BC8F8F] font-light tracking-wide">Sign out</span>
                </button>
              </div>
            </>
          )}

        </div>
      )}

      {/* ── SETTINGS PANEL (right-sliding, Atelier only) ─────────────────────── */}
      <AnimatePresence>
        {isAtelier && settingsOpen && (
          <>
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/22 backdrop-blur-sm"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              key="settings-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 310, damping: 33 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-panel-title"
              className="fixed right-0 top-0 h-full z-50 flex flex-col w-[min(88vw,360px)] bg-[var(--color-bg)] border-l border-[#C8B06A]/[0.22]"
            >
              <div className="flex items-center justify-between px-6 pt-14 pb-5 border-b border-[#C8B06A]/15">
                <h3 id="settings-panel-title" className="text-xl text-[var(--color-text-primary)] font-light font-serif">
                  Sanctuary Settings
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="px-4 py-1.5 rounded-full text-[0.5625rem] tracking-[0.2em] uppercase font-light text-[#FDF5E6] bg-[#043927]"
                  >
                    Save
                  </button>
                  <button onClick={() => setSettingsOpen(false)} aria-label="Close settings">
                    <X size={18} strokeWidth={1.5} color="var(--color-text-primary)" aria-hidden={true} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28 space-y-8">

                {/* Appearance — top so it's always visible */}
                <div>
                  <p className="text-[0.5625rem] tracking-[0.22em] text-primary-45 uppercase font-light mb-3">
                    Appearance
                  </p>
                  <button
                    onClick={() => setDarkMode(v => !v)}
                    className="w-full rounded-xl px-4 py-3 flex items-center justify-between border transition-all"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg-surface)" }}
                  >
                    <div>
                      <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light">Dark Mode</p>
                      <p className="text-[0.5625rem] text-primary-40 font-light mt-0.5">Tap to toggle · saves instantly</p>
                    </div>
                    <div
                      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-300"
                      style={{
                        background: darkMode ? "#043927" : "rgba(200,176,106,0.25)",
                        border: `1.5px solid ${darkMode ? "#043927" : "rgba(200,176,106,0.40)"}`,
                      }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                        style={{ left: darkMode ? "calc(100% - 18px)" : "2px" }}
                      />
                    </div>
                  </button>
                </div>

                {/* Glow Mode — not yet enforced, locked until backend ships */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[0.5625rem] tracking-[0.22em] text-primary-45 uppercase font-light">
                      Glow Mode
                    </p>
                    <span className="text-[0.5rem] tracking-[0.15em] uppercase font-light text-[#C8B06A] border border-[#C8B06A]/40 rounded-full px-2 py-0.5">
                      Coming Soon
                    </span>
                  </div>
                  <div className="space-y-2 opacity-40 pointer-events-none select-none">
                    {[
                      { mode: "PUBLIC", label: "Public Glow",  desc: "Everything visible to visitors" },
                      { mode: "SOFT",   label: "Soft Glow",    desc: "Partial visibility — intimate but present" },
                      { mode: "GHOST",  label: "Ghost Glow",   desc: "Minimal presence. Just the halo." },
                    ].map(({ mode, label, desc }) => (
                      <button
                        key={mode}
                        tabIndex={-1}
                        className="w-full rounded-xl px-4 py-3 flex items-center justify-between border transition-all text-left"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-bg-surface)",
                        }}
                      >
                        <div>
                          <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light">{label}</p>
                          <p className="text-[0.5625rem] text-primary-40 font-light mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Tier — not yet enforced, locked until backend ships */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[0.5625rem] tracking-[0.22em] text-primary-45 uppercase font-light">
                      Privacy Tier
                    </p>
                    <span className="text-[0.5rem] tracking-[0.15em] uppercase font-light text-[#C8B06A] border border-[#C8B06A]/40 rounded-full px-2 py-0.5">
                      Coming Soon
                    </span>
                  </div>
                  <div className="space-y-2 opacity-40 pointer-events-none select-none">
                    {[
                      { tier: "PUBLIC",        label: "Public",        desc: "Any visitor may view your profile" },
                      { tier: "CIRCLE_ONLY",   label: "Circle Only",   desc: "Visible to your Beauty Room members only" },
                      { tier: "PRIVATE_MUSE",  label: "Private Muse",  desc: "Your sanctuary is yours alone" },
                    ].map(({ tier, label, desc }) => (
                      <button
                        key={tier}
                        tabIndex={-1}
                        className="w-full rounded-xl px-4 py-3 flex items-center justify-between border transition-all text-left"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-bg-surface)",
                        }}
                      >
                        <div>
                          <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light">{label}</p>
                          <p className="text-[0.5625rem] text-primary-40 font-light mt-0.5">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other settings rows */}
                {[
                  { label: "Ingredient Alerts",     to: "/ingredient-alerts" },
                  { label: "Notifications",         to: "/notifications-settings" },
                  { label: "Account & Beauty Data",  to: "/account" },
                  { label: "Accessibility",          to: "/accessibility" },
                ].map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setSettingsOpen(false)}
                    className="flex items-center justify-between py-3.5 border-b border-[var(--color-border)]"
                  >
                    <span className="text-[0.8125rem] text-[var(--color-text-primary)] font-light">{label}</span>
                    <ChevronRight size={13} strokeWidth={1.5} color="var(--color-text-primary)" aria-hidden={true} />
                  </Link>
                ))}
              </div>


            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── FOLLOW LIST MODAL ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {followListModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end"
            onClick={() => setFollowListModal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label={followListModal === "admiratrices" ? "Admiratrices" : "My Coterie"}
              className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
                  {followListModal === "admiratrices" ? "Admiratrices" : "My Coterie"}
                </h3>
                <button onClick={() => setFollowListModal(null)} aria-label="Close">
                  <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} aria-hidden={true} />
                </button>
              </div>
              {(followListModal === "admiratrices" ? admiratricesList : coterieList).length === 0 ? (
                <p className="text-center font-serif italic text-[0.875rem] text-primary-40 py-12">
                  {followListModal === "admiratrices"
                    ? "No one has admired you yet."
                    : "You haven't admired anyone yet."}
                </p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {(followListModal === "admiratrices" ? admiratricesList : coterieList).map((f, i) => (
                    <div key={f.id || i} className="flex items-center gap-3 py-2 border-b border-[var(--color-border)]">
                      <div className="w-9 h-9 rounded-full bg-[#F5EDD8] border border-[#C8B06A]/25 flex items-center justify-center flex-shrink-0">
                        <SwanLogo size={16} color="var(--color-accent-gold)" />
                      </div>
                      <p className="text-[0.8125rem] font-light text-[var(--color-text-primary)]">
                        Muse Member
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}