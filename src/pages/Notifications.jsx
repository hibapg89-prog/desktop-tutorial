import { useEffect, useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Bell, CheckCheck, MessageCircle,
  Tag, Users, TrendingDown, AlertTriangle,
  ShieldAlert, ArrowLeftRight, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { autoReadStaleNotifications } from "@/utils/notifications";
import { formatPrice } from "@/utils/locale";
import SwanLogo from "@/components/SwanLogo";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dayGroup(dateStr) {
  if (!dateStr) return "Earlier";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (d >= weekAgo)                                  return "This Week";
  return "Earlier";
}

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  welcome:        { Icon: Bell,           color: "#C8B06A", bg: "rgba(200,176,106,0.10)", label: "Welcome"    },
  message:        { Icon: MessageCircle,  color: "#C8B06A", bg: "rgba(200,176,106,0.10)", label: "Message"    },
  deal:           { Icon: TrendingDown,   color: "#043927", bg: "rgba(4,57,39,0.07)",     label: "Deal"       },
  price_drop:     { Icon: TrendingDown,   color: "#043927", bg: "rgba(4,57,39,0.07)",     label: "Price Drop" },
  expiry:         { Icon: AlertTriangle,  color: "#B87333", bg: "rgba(184,115,51,0.10)",  label: "Expiry"     },
  allergen:       { Icon: ShieldAlert,    color: "#A0522D", bg: "rgba(160,82,45,0.10)",   label: "Allergen"   },
  swap:           { Icon: ArrowLeftRight, color: "#BC8F8F", bg: "rgba(188,143,143,0.10)", label: "Swap"       },
  recommendation: { Icon: Sparkles,       color: "#C8B06A", bg: "rgba(200,176,106,0.10)", label: "For You"    },
  community:      { Icon: Users,          color: "#BC8F8F", bg: "rgba(188,143,143,0.10)", label: "Community"  },
  post:           { Icon: Users,          color: "#BC8F8F", bg: "rgba(188,143,143,0.10)", label: "Community"  },
  comment:        { Icon: Users,          color: "#BC8F8F", bg: "rgba(188,143,143,0.10)", label: "Community"  },
  adore:          { Icon: Sparkles,       color: "#C8B06A", bg: "rgba(200,176,106,0.08)", label: "Adored"     },
  whisper:        { Icon: MessageCircle,  color: "#BC8F8F", bg: "rgba(188,143,143,0.10)", label: "Whisper"    },
  collect:        { Icon: Tag,            color: "#043927", bg: "rgba(4,57,39,0.07)",     label: "Collected"  },
  default:        { Icon: Bell,           color: "#C8B06A", bg: "rgba(200,176,106,0.10)", label: "Alert"      },
};

const TABS = [
  { key: "all",            label: "All"      },
  { key: "recommendation", label: "For You"  },
  { key: "message",        label: "Messages" },
  { key: "deal",           label: "Deals"    },
  { key: "community",      label: "Circle"   },
];

function matchesTab(n, tab) {
  if (tab === "all") return true;
  if (tab === "deal")      return ["deal", "price_drop", "offer"].includes(n.type);
  if (tab === "community") return ["community", "post", "comment", "swap", "adore", "whisper", "collect"].includes(n.type);
  return n.type === tab;
}

const EMPTY_MSGS = {
  all:            { title: "All clear",       body: "Price drops, messages and community activity will appear here." },
  recommendation: { title: "No picks yet",    body: "The Muse is studying your vanity — curated finds will appear here." },
  message:        { title: "No messages yet", body: "When someone reaches out, you'll see it here." },
  deal:           { title: "No deals yet",    body: "We'll let you know when a product you love drops in price." },
  community:      { title: "Quiet circle",    body: "Activity from Community will surface here." },
};

// ── Notification card ─────────────────────────────────────────────────────────

function NotificationCard({ n, onOpen }) {
  const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
  const { Icon, color, bg, label } = cfg;

  const subtext =
    n.type === "price_drop" && n.price_now
      ? `Now ${formatPrice(n.price_now)}${n.was_price ? ` (was ${formatPrice(n.was_price)})` : ""}${
          n.discount_pct ? ` — ${Math.round(n.discount_pct)}% off` : ""
        }${n.product_name ? ` on ${n.product_name}` : ""}`
      : n.body;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpen(n)}
      className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-2xl border transition-colors ${
        n.read
          ? "bg-[var(--color-bg-surface)] border-[var(--color-border)]/50"
          : "bg-[var(--color-bg-surface)] border-[#C8B06A]/30 shadow-[0_2px_16px_rgba(200,176,106,0.10)]"
      }`}
    >
      {/* Icon / thumbnail */}
      <div
        className="w-11 h-11 rounded-[14px] flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: n.read ? "rgba(229,228,226,0.4)" : bg }}
      >
        {n.image_url ? (
          <img src={n.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon size={18} color={n.read ? "#B8B0A8" : color} strokeWidth={1.5} />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className="text-[10px] font-light tracking-[0.07em] uppercase"
            style={{ color: n.read ? "rgba(4,57,39,0.30)" : color }}
          >
            {label}
          </span>
          <span className="text-[10px] font-light text-primary-30 whitespace-nowrap flex-shrink-0">
            {timeAgo(n.created_date)}
          </span>
        </div>

        <p
          className={`font-serif text-[15px] leading-snug ${
            n.read ? "text-primary-55" : "text-[var(--color-text-primary)]"
          }`}
        >
          {n.title}
        </p>

        {subtext && (
          <p
            className={`text-xs font-light leading-relaxed mt-1 line-clamp-2 ${
              n.read ? "text-primary-30" : "text-primary-55"
            }`}
          >
            {subtext}
          </p>
        )}
      </div>

      {/* Unread pip */}
      {!n.read && (
        <div className="w-1.5 h-1.5 rounded-full bg-[#C8B06A] flex-shrink-0 mt-2" />
      )}
    </motion.button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Notifications() {
  const navigate = useNavigate();
  const { openScan } = useOutletContext() ?? {};
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me().catch(() => null);
      if (!u) { setItems([]); setLoading(false); return; }
      const data = await base44.entities.Notification.filter({ user_id: u.id });
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await autoReadStaleNotifications();
      await load();
    };
    init();
  }, [load]);

  const open = async (n) => {
    if (!n.read) {
      try { await base44.entities.Notification.update(n.id, { read: true }); } catch {}
      setItems(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    if (n.type === "welcome")                                        { navigate("/home"); openScan?.(); return; }
    if (n.type === "message"        && n.sender_id)                  return navigate(`/messages/${n.sender_id}`);
    if (n.type === "swap"           && n.sender_id)                  return navigate(`/messages/${n.sender_id}`);
    if (n.type === "recommendation" && n.product_id?.startsWith("tut_")) return navigate(`/tutorial/${n.product_id.slice(4)}`);
    if (n.type === "recommendation" && n.product_id)                 return navigate(`/product/${n.product_id}`);
    if (n.type === "recommendation")                                 return navigate("/discover");
    if (n.product_id)                                                navigate(`/product/${n.product_id}`);
  };

  const markAllRead = async () => {
    const unread = items.filter(n => !n.read);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
      setItems(prev => prev.map(x => ({ ...x, read: true })));
    } catch { load(); }
  };

  const filtered    = items.filter(n => matchesTab(n, tab));
  const unreadCount = items.filter(n => !n.read).length;

  const counts = {};
  TABS.forEach(t => {
    counts[t.key] = t.key === "all"
      ? items.filter(n => !n.read).length
      : items.filter(n => !n.read && matchesTab(n, t.key)).length;
  });

  // Build grouped list (day separators)
  const grouped = [];
  let lastGroup = null;
  for (const n of filtered) {
    const g = dayGroup(n.created_date);
    if (g !== lastGroup) {
      grouped.push({ type: "label", label: g, key: `grp-${g}` });
      lastGroup = g;
    }
    grouped.push({ type: "item", data: n, key: n.id });
  }

  const { title: emptyTitle, body: emptyBody } = EMPTY_MSGS[tab] ?? EMPTY_MSGS.all;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] flex-shrink-0"
            >
              <ChevronLeft size={18} color="var(--color-text-primary)" />
            </button>
            <div>
              <p className="text-[9px] tracking-[0.22em] uppercase text-primary-40 font-light">
                The Muse
              </p>
              <h1 className="font-serif text-xl text-[var(--color-text-primary)] leading-tight flex items-baseline gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-sm font-light text-primary-40 italic">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-primary-50 font-light border border-[var(--color-border)] rounded-full px-3 py-1.5 hover:bg-[#043927] hover:text-[#FDF5E6] hover:border-[#043927] transition-colors"
            >
              <CheckCheck size={12} />
              Read all
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-5 bg-gradient-to-r from-transparent via-[#C8B06A]/35 to-transparent" />

      {/* Tabs */}
      <div className="flex gap-2 px-5 py-3.5 overflow-x-auto hide-scrollbar">
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-light tracking-[0.04em] transition-all border ${
                active
                  ? "bg-[rgba(200,176,106,0.12)] border-[#C8B06A]/50 text-[var(--color-text-primary)]"
                  : "bg-transparent border-[var(--color-border)]/60 text-primary-40"
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <span
                  className={`min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center ${
                    active
                      ? "bg-[#C8B06A] text-[var(--color-text-primary)]"
                      : "bg-[rgba(200,176,106,0.35)] text-primary-55"
                  }`}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="px-4 pb-32 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float">
              <SwanLogo size={40} color="#C8B06A" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 rounded-[18px] bg-[rgba(200,176,106,0.10)] border border-[#C8B06A]/25 flex items-center justify-center mb-4">
              <Bell size={22} strokeWidth={1} color="#C8B06A" />
            </div>
            <p className="font-serif text-lg text-[var(--color-text-primary)] mb-1.5">{emptyTitle}</p>
            <p className="text-xs font-light text-primary-40 leading-relaxed max-w-[220px]">
              {emptyBody}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map(item => {
              if (item.type === "label") {
                return (
                  <motion.p
                    key={item.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] tracking-[0.2em] uppercase text-primary-35 font-light pt-3 pb-0.5"
                  >
                    {item.label}
                  </motion.p>
                );
              }
              return (
                <NotificationCard key={item.key} n={item.data} onOpen={open} />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
