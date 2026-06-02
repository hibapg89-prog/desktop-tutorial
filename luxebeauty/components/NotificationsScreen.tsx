"use client";

import { useState } from "react";

interface Props { onBack: () => void; }

// ─── Types ────────────────────────────────────────────────────────────────────

type ToneMode  = "whisper" | "muse" | "silence";
type NotifType = "morning-bundle" | "evening-bundle" | "distinction" | "circle-reaction" | "admirer" | "price-drop" | "new-launch";

interface BundleItem { icon: string; text: string; }
interface Notif {
  id:          string;
  type:        NotifType;
  time:        string;
  read:        boolean;
  icon:        string;
  accent:      string;
  discount?:   string;
  bundleItems?: BundleItem[];
  text:        Record<ToneMode, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONE_MODES: { id: ToneMode; icon: string; label: string; desc: string }[] = [
  { id: "whisper", icon: "🌙", label: "Gentle Whisper",    desc: "Soft, poetic, unhurried" },
  { id: "muse",    icon: "✦",  label: "Enthusiastic Muse", desc: "Warm, engaged, expressive" },
  { id: "silence", icon: "○",  label: "Deep Silence",      desc: "Critical alerts only" },
];

const TYPE_LABELS: Record<NotifType, string> = {
  "morning-bundle":  "Morning Muse",
  "evening-bundle":  "Evening Edit",
  "distinction":     "Distinction Unlocked",
  "circle-reaction": "Circle Reaction",
  "admirer":         "New Admirer",
  "price-drop":      "Price Drop",
  "new-launch":      "New Launch",
};

// ─── Notification Data ────────────────────────────────────────────────────────

const NOTIFICATIONS: Notif[] = [
  {
    id: "mb1", type: "morning-bundle", time: "8:00", read: false,
    icon: "✦", accent: "#C8B06A",
    text: {
      whisper: "Your morning edit awaits — 4 whispers from The Muse",
      muse:    "Good morning, chérie ✦ Your personalised edit is ready!",
      silence: "",
    },
    bundleItems: [
      { icon: "🌿", text: "Tatcha's new Camellia Glow serum matches your ritual" },
      { icon: "✨", text: "La Mer restocked — 3 shades back in your tone" },
      { icon: "◇",  text: "Amélie D. added Charlotte Tilbury to her Vanity" },
      { icon: "💎", text: "New Rare Beauty launch fits your Prestige tier" },
    ],
  },
  {
    id: "d1", type: "distinction", time: "9:14", read: false,
    icon: "💎", accent: "#C8B06A",
    text: {
      whisper: "A new Distinction arrived quietly — Gem Collector is yours",
      muse:    "💎 You earned Gem Collector! 50 reviews and counting, queen!",
      silence: "Distinction unlocked: Gem Collector",
    },
  },
  {
    id: "cr1", type: "circle-reaction", time: "11:32", read: false,
    icon: "💎", accent: "#C4968A",
    text: {
      whisper: "Isabelle found your La Mer Crème review Iconic",
      muse:    "💎 Isabelle R. called your La Mer review Iconic — you're a legend!",
      silence: "",
    },
  },
  {
    id: "a1", type: "admirer", time: "13:05", read: true,
    icon: "◯", accent: "#A07850",
    text: {
      whisper: "Sophie M. has begun admiring you",
      muse:    "✨ Sophie M. loves your taste — she's now admiring you 💛",
      silence: "",
    },
  },
  {
    id: "eb1", type: "evening-bundle", time: "18:00", read: true,
    icon: "○", accent: "#0B3C26",
    text: {
      whisper: "Your evening edit is ready — beauty, curated for tonight",
      muse:    "🌙 Evening, chérie! Your beauty news is in ✦",
      silence: "",
    },
    bundleItems: [
      { icon: "🔥", text: "Pillow Talk trended in 12 Beauty Circles today" },
      { icon: "○",  text: "Fragrance Lovers shared 8 new Iconic reviews" },
      { icon: "✦",  text: "The Muse's pick of the week: Sulwhasoo First Care" },
    ],
  },
  {
    id: "pd1", type: "price-drop", time: "Yesterday", read: true,
    icon: "◇", accent: "#3A7A5A",
    discount: "−15%",
    text: {
      whisper: "Charlotte Tilbury Pillow Talk dropped quietly — 15% less",
      muse:    "💸 Your wishlist item just dropped 15%! Time to treat yourself ✦",
      silence: "Wishlist: Charlotte Tilbury Pillow Talk −15%",
    },
  },
  {
    id: "nl1", type: "new-launch", time: "Yesterday", read: true,
    icon: "✦", accent: "#C8B06A",
    text: {
      whisper: "Chanel released something new — No. 5 L'Eau Limited Edition",
      muse:    "✨ NEW DROP! Chanel No. 5 L'Eau just launched in limited edition!",
      silence: "",
    },
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationsScreen({ onBack }: Props) {
  const [tone,     setTone]     = useState<ToneMode>("whisper");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["mb1"]));
  const [readAll,  setReadAll]  = useState(false);

  const toggleExpanded = (id: string) =>
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const visible = NOTIFICATIONS.filter(n => n.text[tone] !== "");
  const today   = visible.filter(n => n.time !== "Yesterday");
  const earlier = visible.filter(n => n.time === "Yesterday");
  const unreadCount = visible.filter(n => !n.read && !readAll).length;

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">Inbox</p>
          <div className="flex items-center justify-center gap-2">
            <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Notifications</h2>
            {unreadCount > 0 && (
              <div className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#C4968A" }}>
                <span className="font-sans text-[7px] font-bold text-white">{unreadCount}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setReadAll(true)}
          className="font-sans text-[8px] tracking-[0.1em] text-[#0B3C26] opacity-35 hover:opacity-70 transition-opacity cursor-pointer">
          Read all
        </button>
      </div>

      <div className="divider-gold mx-5 mb-4" />

      {/* ── Tone Mode Selector ── */}
      <div className="mx-5 mb-4 flex-shrink-0">
        <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#8A8070] mb-2">
          Notification Tone
        </p>
        <div className="flex rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(200,176,106,0.2)", background: "rgba(200,176,106,0.04)" }}>
          {TONE_MODES.map((mode, i) => (
            <button key={mode.id}
              onClick={() => setTone(mode.id)}
              className="flex-1 py-2.5 flex flex-col items-center gap-1 cursor-pointer transition-all duration-200"
              style={{
                background: tone === mode.id ? "rgba(11,60,38,0.08)" : "transparent",
                borderRight: i < 2 ? "1px solid rgba(200,176,106,0.15)" : "none",
              }}>
              <span className="text-base leading-none">{mode.icon}</span>
              <span className="font-sans text-[6.5px] tracking-[0.06em] uppercase text-center leading-tight"
                style={{ color: tone === mode.id ? "#0B3C26" : "rgba(11,60,38,0.38)", maxWidth: "56px" }}>
                {mode.label}
              </span>
            </button>
          ))}
        </div>
        <p className="font-cormorant italic text-[12px] text-[#8A8070] mt-1.5 text-center">
          {TONE_MODES.find(m => m.id === tone)?.desc}
        </p>
      </div>

      {/* ── Feed ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">

        {visible.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="font-cormorant text-xl italic text-[#8A8070]">Pure silence, as requested</p>
            <p className="font-sans text-[10px] text-[#C8B06A] tracking-wide">
              Only critical alerts will appear ○
            </p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <section className="mb-5">
                <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-3">Today</p>
                <div className="flex flex-col gap-2.5">
                  {today.map(n => (
                    <NotifCard key={n.id} notif={n} tone={tone}
                      unread={!n.read && !readAll}
                      isExpanded={expanded.has(n.id)}
                      onToggle={() => toggleExpanded(n.id)} />
                  ))}
                </div>
              </section>
            )}
            {earlier.length > 0 && (
              <section>
                <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#8A8070] mb-3">Earlier</p>
                <div className="flex flex-col gap-2.5">
                  {earlier.map(n => (
                    <NotifCard key={n.id} notif={n} tone={tone}
                      unread={false}
                      isExpanded={expanded.has(n.id)}
                      onToggle={() => toggleExpanded(n.id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

interface CardProps {
  notif:      Notif;
  tone:       ToneMode;
  unread:     boolean;
  isExpanded: boolean;
  onToggle:   () => void;
}

function NotifCard({ notif, tone, unread, isExpanded, onToggle }: CardProps) {
  const isBundle = notif.type === "morning-bundle" || notif.type === "evening-bundle";
  const text     = notif.text[tone];

  return (
    <div
      className="card-pearl rounded-2xl overflow-hidden transition-all duration-300"
      onClick={isBundle ? onToggle : undefined}
      style={{
        cursor: isBundle ? "pointer" : "default",
        borderLeft: unread ? `3px solid ${notif.accent}` : undefined,
      }}>
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          {/* Icon circle */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${notif.accent}14`,
              border: `1px solid ${notif.accent}28`,
            }}>
            <span className="text-base leading-none">{notif.icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-sans text-[8px] tracking-[0.1em] uppercase font-medium"
                style={{ color: notif.accent }}>
                {TYPE_LABELS[notif.type]}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {unread && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: notif.accent }} />
                )}
                <p className="font-sans text-[8px] text-[#8A8070]">{notif.time}</p>
              </div>
            </div>

            <p className="font-sans text-[10px] text-[#5A5040] leading-snug">{text}</p>

            {/* Price drop badge */}
            {notif.discount && (
              <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(58,122,90,0.1)", border: "1px solid rgba(58,122,90,0.22)" }}>
                <span className="font-sans text-[8px] font-bold text-[#3A7A5A]">{notif.discount}</span>
                <span className="font-sans text-[8px] text-[#3A7A5A] opacity-70">on wishlist</span>
              </div>
            )}
          </div>

          {/* Bundle chevron */}
          {isBundle && (
            <div className="flex-shrink-0 mt-1 transition-transform duration-300"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="#C8B06A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Bundle expanded items */}
        {isBundle && isExpanded && notif.bundleItems && (
          <div className="mt-3 ml-12 pt-3 flex flex-col gap-2.5"
            style={{ borderTop: "1px solid rgba(200,176,106,0.14)" }}>
            {notif.bundleItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[11px] flex-shrink-0 mt-px leading-snug">{item.icon}</span>
                <p className="font-sans text-[9px] text-[#8A8070] leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
