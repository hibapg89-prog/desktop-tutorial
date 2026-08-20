import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Paperclip, X, CheckCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import SwanLogo from "@/components/SwanLogo";

const QUICK_REPLIES = [
  "Thank you for the recommendation",
  "I have this in my collection",
  "Where did you find this?",
  "Adding to my wishlist",
  "What's the scent like?",
  "Is it worth the price?",
  "Do you have a skincare routine tip?",
];

function timeLabel(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function avatarColor(id = "") {
  const palette = ["#043927", "#0B2D26", "#1a4a38", "#2d5c47", "#3d6b54"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function Conversation() {
  const { userId: otherId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

  const load = async (u) => {
    const [sent, received] = await Promise.all([
      base44.entities.Message.filter({ sender_id: u.id, recipient_id: otherId }),
      base44.entities.Message.filter({ recipient_id: u.id, sender_id: otherId }),
    ]);
    const thread = [...sent, ...received].sort(
      (a, b) => new Date(a.created_date) - new Date(b.created_date)
    );
    setMessages(thread);
    const unread = received.filter((m) => !m.read);
    await Promise.all(
      unread.map((m) => base44.entities.Message.update(m.id, { read: true }).catch(() => {}))
    );
    setLoading(false);
    scrollToBottom();
  };

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me().catch(() => null);
      setUser(u);
      try {
        const ou = await base44.entities.User.get(otherId);
        setOther(ou);
      } catch {}
      if (u) await load(u);
      else setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId]);

  useEffect(() => {
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type !== "create") return;
      const m = event.data;
      const me = user?.id;
      if (!m || !me) return;
      const inThread =
        (m.sender_id === me && m.recipient_id === otherId) ||
        (m.recipient_id === me && m.sender_id === otherId);
      if (!inThread) return;
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, m].sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );
      });
      if (m.recipient_id === me)
        base44.entities.Message.update(m.id, { read: true }).catch(() => {});
      scrollToBottom();
    });
    return unsub;
  }, [otherId, user?.id]);

  const pickImage = () => fileRef.current?.click();

  const onImageSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingImage(file_url);
    } catch {}
    setUploading(false);
  };

  const send = async (overrideText) => {
    if (sending || !user) return;
    const text = (overrideText ?? draft).trim();
    if (!text && !pendingImage) return;
    setSending(true);
    try {
      const created = await base44.entities.Message.create({
        sender_id: user.id,
        recipient_id: otherId,
        body: text,
        image_url: pendingImage || undefined,
        read: false,
      });
      setMessages((prev) =>
        prev.some((x) => x.id === created.id) ? prev : [...prev, created]
      );
      setDraft("");
      setPendingImage(null);
      scrollToBottom();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const otherName = other?.full_name || other?.email || "Muse Member";
  const otherInitial = otherName[0]?.toUpperCase() || "M";

  // Group messages by date with separators
  const grouped = [];
  let lastDay = null;
  for (const m of messages) {
    const day = new Date(m.created_date).toDateString();
    if (day !== lastDay) {
      grouped.push({ type: "separator", label: dayLabel(m.created_date), key: `sep-${day}` });
      lastDay = day;
    }
    grouped.push({ type: "message", data: m, key: m.id });
  }

  const canSend = (draft.trim() || pendingImage) && !sending && !uploading;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Sticky header */}
      <div className="px-5 pt-14 pb-3 flex items-center gap-3 bg-[var(--color-bg)]/95 sticky top-0 z-10 border-b border-[var(--color-border)]/60 backdrop-blur-sm">
        <button
          onClick={() => navigate("/messages")}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)] flex-shrink-0"
        >
          <ChevronLeft size={18} color="var(--color-text-primary)" />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: avatarColor(otherId) }}
        >
          <span className="text-sm font-serif text-[var(--color-accent-gold)]">
            {otherInitial}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] tracking-[0.22em] uppercase text-primary-40 font-light">
            Direct Message
          </p>
          <p className="text-sm text-[var(--color-text-primary)] font-light truncate">{otherName}</p>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex-1 px-4 py-4 pb-44 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float">
              <SwanLogo size={36} color="var(--color-accent-gold)" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-8">
            <SwanLogo size={48} color="var(--color-accent-gold)" className="mb-5" />
            <p className="font-serif text-base text-primary-40 italic leading-relaxed">
              Say hello — your shared love of beauty is a wonderful place to begin.
            </p>
          </div>
        ) : (
          <div>
            <AnimatePresence initial={false}>
              {grouped.map((item) => {
                if (item.type === "separator") {
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 py-4"
                    >
                      <div className="flex-1 h-px bg-[var(--color-border)]" />
                      <span className="text-[9px] tracking-[0.18em] uppercase text-primary-35 font-light">
                        {item.label}
                      </span>
                      <div className="flex-1 h-px bg-[var(--color-border)]" />
                    </motion.div>
                  );
                }

                const m = item.data;
                const mine = m.sender_id === user?.id;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex mb-1.5 ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm font-light leading-relaxed ${
                        mine
                          ? "bg-[#043927] text-[#FDF5E6] rounded-br-md"
                          : "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-bl-md shadow-sm"
                      }`}
                    >
                      {m.image_url && (
                        <Image
                          src={m.image_url}
                          alt="attachment"
                          fittingType="fit"
                          className="rounded-xl mb-1.5 max-h-60 w-full"
                        />
                      )}
                      {m.body && <p>{m.body}</p>}
                      <p
                        className={`text-[9px] mt-1.5 text-right ${
                          mine ? "text-[#FDF5E6]/40" : "text-primary-30"
                        }`}
                      >
                        {timeLabel(m.created_date)}
                        {mine && (
                          <CheckCheck
                            size={10}
                            className="inline ml-1 opacity-50"
                          />
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Fixed input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] px-4 pt-3 pb-6">
        <div className="max-w-lg mx-auto">
          {/* Pending image preview */}
          {pendingImage && (
            <div className="mb-2 flex items-center gap-2 bg-[var(--color-bg-surface)] rounded-2xl p-2 border border-[var(--color-border)] w-fit">
              <img
                src={pendingImage}
                alt="pending"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <button
                onClick={() => setPendingImage(null)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-[#043927]/5"
              >
                <X size={12} color="var(--color-text-primary)" />
              </button>
            </div>
          )}

          {/* Quick replies */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-2 pb-0.5">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => send(qr)}
                disabled={sending || uploading}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-light tracking-wide bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]/65 hover:bg-[#043927] hover:text-[#FDF5E6] hover:border-[#043927] transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Compose row */}
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onImageSelected}
              className="hidden"
            />
            <button
              onClick={pickImage}
              disabled={uploading}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--color-bg-surface)] border border-[var(--color-border)]"
            >
              {uploading ? (
                <div className="swan-float"><SwanLogo size={14} color="var(--color-accent-gold)" /></div>
              ) : (
                <Paperclip size={16} color="var(--color-text-primary)" />
              )}
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) send();
              }}
              placeholder="Write a message…"
              className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-full px-4 py-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30"
            />
            <motion.button
              onClick={() => send()}
              disabled={!canSend}
              animate={{ scale: canSend ? 1 : 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                canSend ? "bg-[#043927]" : "bg-[var(--color-border)] cursor-not-allowed"
              }`}
            >
              <Send size={15} color={canSend ? "#FDF5E6" : "var(--color-text-primary)"} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}