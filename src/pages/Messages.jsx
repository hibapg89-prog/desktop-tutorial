import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, X, Trash2, CheckCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function avatarColor(id = "") {
  const palette = ["#043927", "#0B2D26", "#1a4a38", "#2d5c47", "#3d6b54"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const shareProduct = location.state?.shareProduct || null;
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null);

  const load = async (u) => {
    const [sent, received] = await Promise.all([
      base44.entities.Message.filter({ sender_id: u.id }),
      base44.entities.Message.filter({ recipient_id: u.id }),
    ]);
    const all = [...sent, ...received];
    setMessages(all);
    const others = [
      ...new Set(all.map((m) => (m.sender_id === u.id ? m.recipient_id : m.sender_id))),
    ];
    const nameMap = {};
    await Promise.all(
      others.map(async (oid) => {
        try {
          const ou = await base44.entities.User.get(oid);
          nameMap[oid] = ou?.full_name || ou?.email || "Muse Member";
        } catch {
          nameMap[oid] = "Muse Member";
        }
      })
    );
    setNames(nameMap);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      if (!u) { setLoading(false); return; }
      try { await load(u); } catch { setLoading(false); }
    })();
  }, []);

  // Build conversation map
  const convos = {};
  for (const m of messages) {
    const other = m.sender_id === user?.id ? m.recipient_id : m.sender_id;
    if (!other) continue;
    if (!convos[other]) convos[other] = { other, last: m, unread: 0, count: 0 };
    convos[other].count++;
    if (new Date(m.created_date) > new Date(convos[other].last.created_date))
      convos[other].last = m;
    if (m.recipient_id === user?.id && !m.read) convos[other].unread++;
  }

  let convoList = Object.values(convos).sort(
    (a, b) => new Date(b.last.created_date) - new Date(a.last.created_date)
  );

  const q = query.trim().toLowerCase();
  if (q) {
    convoList = convoList.filter((c) => {
      const name = (names[c.other] || "").toLowerCase();
      return name.includes(q) || (c.last.body || "").toLowerCase().includes(q);
    });
  }

  const totalUnread = convoList.reduce((s, c) => s + c.unread, 0);

  const markAllRead = async () => {
    if (!user || totalUnread === 0) return;
    setMessages((prev) =>
      prev.map((m) => (m.recipient_id === user.id && !m.read ? { ...m, read: true } : m))
    );
    try {
      await base44.entities.Message.updateMany(
        { recipient_id: user.id, read: false },
        { $set: { read: true } }
      );
    } catch {}
  };

  const deleteConvo = async (otherId) => {
    if (!user) return;
    setMessages((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.sender_id === user.id && m.recipient_id === otherId) ||
            (m.recipient_id === user.id && m.sender_id === otherId)
          )
      )
    );
    setConfirming(null);
    try {
      await base44.entities.Message.deleteMany({
        $or: [
          { sender_id: user.id, recipient_id: otherId },
          { recipient_id: user.id, sender_id: otherId },
        ],
      });
    } catch {}
  };

  const initial = (name) => (name?.[0] || "M").toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header banner */}
      <div className="px-5 pt-14 pb-4">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/979e52955_IMG_4551.jpeg"
            alt="The Muse Circle — Messages"
            className="w-full h-auto block"
            draggable={false}
          />
          {/* Read all badge */}
          {totalUnread > 0 && (
            <button
              onClick={markAllRead}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase font-light rounded-full px-3 py-1.5 border border-[#C5A059]/70 bg-[#0A3D2A]/40 backdrop-blur-sm text-[#C5A059]"
            >
              <CheckCheck size={12} />
              {totalUnread}
            </button>
          )}
          {/* Functional invisible back button — covers the baked-in button in the banner image */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-1 top-12 bottom-20 w-14 rounded-full"
            aria-label="Back"
          />
          {/* Functional search overlay (covers baked-in search bar) */}
          <div className="absolute left-4 right-4 bottom-4">
            <div className="flex items-center gap-2 bg-[#FBF7EF] rounded-full border border-[#E5DFD0] px-4 py-2.5 shadow-sm">
              <Search size={15} color="#999999" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-sm text-[#2D362E] font-light outline-none placeholder:text-[#999999]"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-[#999999]">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-32">
        {/* Share product banner */}
        {shareProduct && (
          <div
            className="mb-3 rounded-2xl p-3.5 flex items-center gap-3"
            style={{ background: "var(--color-bg-surface)", border: "1px solid #C8B06A" }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: "var(--color-bg-elevated)" }}>
              {shareProduct.image_url ? (
                <img src={shareProduct.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--color-accent-gold)" }}>
                  {shareProduct.brand?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[var(--color-accent-gold)] font-light">Sharing</p>
              <p className="text-sm text-[var(--color-text-primary)] font-light truncate">{shareProduct.brand} — {shareProduct.name}</p>
            </div>
            <p className="text-[10px] text-primary-40 font-light italic">Tap a conversation →</p>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float">
              <SwanLogo size={40} color="var(--color-accent-gold)" />
            </div>
          </div>
        ) : convoList.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <SwanLogo size={56} color="var(--color-accent-gold)" className="mb-5" />
            <p className="font-serif text-base text-primary-40 italic leading-relaxed max-w-[240px]">
              {query
                ? "No conversations match your search."
                : "No conversations yet — message a member from any community post."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {!q && (
              <p className="text-[9px] tracking-[0.2em] uppercase text-primary-35 font-light mb-3">
                {convoList.length}{" "}
                {convoList.length === 1 ? "conversation" : "conversations"}
              </p>
            )}
            <AnimatePresence>
              {convoList.map((c, i) => (
                <motion.div
                  key={c.other}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden"
                >
                  <div
                    onClick={() => navigate(`/messages/${c.other}`, { state: shareProduct ? { shareProduct } : undefined })}
                    className="w-full flex items-center gap-3 p-3.5 text-left cursor-pointer hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    {/* Avatar with unread dot */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: avatarColor(c.other) }}
                      >
                        <span className="text-sm font-serif text-[var(--color-accent-gold)]">
                          {initial(names[c.other])}
                        </span>
                      </div>
                      {c.unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-accent-gold)] border-2 border-[var(--color-bg)]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm text-[var(--color-text-primary)] truncate ${
                            c.unread > 0 ? "font-medium" : "font-light"
                          }`}
                        >
                          {names[c.other] || "Muse Member"}
                        </p>
                        <span className="text-[10px] text-primary-40 font-light flex-shrink-0">
                          {timeAgo(c.last.created_date)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          c.unread > 0
                            ? "text-[var(--color-text-primary)]/80 font-normal"
                            : "text-primary-45 font-light italic"
                        }`}
                      >
                        {c.last.sender_id === user?.id ? "You: " : ""}
                        {c.last.image_url && !c.last.body
                          ? "Shared an image"
                          : c.last.body}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirming(confirming === c.other ? null : c.other);
                      }}
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-primary-25 hover:bg-red-50 hover:text-red-400 transition-colors"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Delete confirm */}
                  <AnimatePresence>
                    {confirming === c.other && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-red-50/60 border-t border-red-100"
                      >
                        <div className="px-3.5 py-3 flex items-center justify-between">
                          <span className="text-xs text-primary-60 font-light">
                            Delete this conversation?
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirming(null)}
                              className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] font-light"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => deleteConvo(c.other)}
                              className="text-[11px] px-3 py-1.5 rounded-full bg-red-500 text-white font-light"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}