import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Send, X, Image, Link2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import BadgePin from "@/components/BadgePin";
import { BADGES } from "@/utils/badgeDefinitions";

function avatarColor(id) {
  const palette = ["#C8B06A", "#043927", "#BC4A6A", "#3D7A5A", "#7A4E7A", "#C47B3A"];
  if (!id) return palette[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return palette[Math.abs(h) % palette.length];
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function MemberAvatars({ ids, max = 5 }) {
  const shown = ids.slice(0, max);
  const extra = ids.length - max;
  return (
    <div className="flex items-center">
      {shown.map((id, i) => (
        <div
          key={id}
          style={{
            background: avatarColor(id),
            marginLeft: i === 0 ? 0 : -8,
            zIndex: shown.length - i,
          }}
          className="relative w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center"
        >
          <span className="text-white text-[10px] font-medium select-none">
            {id.slice(0, 1).toUpperCase()}
          </span>
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{ marginLeft: -8, zIndex: 0 }}
          className="relative w-8 h-8 rounded-full border-2 border-white/40 bg-white/20 flex items-center justify-center"
        >
          <span className="text-white text-[9px] font-medium">+{extra}</span>
        </div>
      )}
    </div>
  );
}

const FAMILY_PRIORITY_CR = { influence: 5, experience: 4, rituals: 3, self_connection: 2, foundations: 1 };

function PostBubble({ post, isOwn, badge }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isOwn ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={{
          background: isOwn
            ? "rgba(200,176,106,0.15)"
            : "rgba(255,255,255,0.85)",
          boxShadow: "0 1px 6px rgba(4,57,39,0.06)",
        }}
      >
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: avatarColor(post.created_by_id) }}
            >
              <span className="text-white text-[8px] font-medium">
                {(post.author_name || post.created_by_id || "?").slice(0, 1).toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-primary-50 font-light">
              {post.author_name || "Member"}
            </span>
            {badge && (
              <span title={badge.label}>
                <BadgePin badge={badge} earned size="nano" />
              </span>
            )}
          </div>
        )}

        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="w-full rounded-xl mb-2 object-cover max-h-48"
          />
        )}

        {post.post_type === "link" && post.text && post.text.startsWith("http") ? (
          <a
            href={post.text}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#C8B06A] text-sm font-light underline-offset-2 underline break-all"
          >
            <Link2 size={12} className="flex-shrink-0" />
            {post.text}
          </a>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] font-light leading-relaxed">{post.text}</p>
        )}

        <p className={`text-[9px] mt-1.5 ${isOwn ? "text-primary-30 text-right" : "text-primary-30"}`}>
          {timeAgo(post.created_date)}
        </p>
      </div>
    </div>
  );
}

function InviteSheet({ room, memberIds, user, onClose, onInvited }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const msgs = await base44.entities.Message.list("-created_date", 500);
        const idSet = new Set(
          msgs
            .map(m => m.sender_id === user.id ? m.recipient_id : m.sender_id)
            .filter(id => id && !memberIds.includes(id))
        );
        setContacts([...idSet]);
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remaining = 8 - memberIds.length;

  const toggle = (id) => {
    if (selected.has(id)) {
      setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
    } else if (selected.size < remaining) {
      setSelected(prev => new Set([...prev, id]));
    }
  };

  const handleInvite = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const newIds = [...memberIds, ...selected];
      await base44.entities.CircleRoom.update(room.id, {
        member_ids: JSON.stringify(newIds),
      });
      onInvited(newIds);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-lg rounded-t-3xl bg-[var(--color-bg)] px-6 pt-6 pb-10 shadow-2xl"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-xl text-[var(--color-text-primary)]">Invite to Room</h2>
          <button onClick={onClose} className="text-primary-40">
            <X size={20} />
          </button>
        </div>
        <p className="text-[11px] text-primary-40 font-light mb-4">
          {remaining > 0
            ? `Up to ${remaining} more ${remaining === 1 ? "person" : "people"} can join.`
            : "This room is at capacity (8 members)."}
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="swan-float"><SwanLogo size={28} color="#C8B06A" /></div>
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-primary-35 font-light py-6 text-center italic">
            No contacts to invite. Start a conversation in Messages first.
          </p>
        ) : (
          <div className="space-y-2 mb-5">
            {contacts.map(id => {
              const isSelected = selected.has(id);
              const disabled = !isSelected && selected.size >= remaining;
              return (
                <button
                  key={id}
                  onClick={() => !disabled && toggle(id)}
                  disabled={disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-[#043927] border-[#043927]"
                      : "bg-[var(--color-bg-surface)] border-[var(--color-border)]"
                  } ${disabled ? "opacity-30" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: avatarColor(id) }}
                  >
                    <span className="text-white text-[10px] font-medium">{id.slice(0, 1).toUpperCase()}</span>
                  </div>
                  <span className={`flex-1 text-left text-sm font-light ${isSelected ? "text-white" : "text-[var(--color-text-primary)]"}`}>
                    {id.slice(0, 8)}…
                  </span>
                  {isSelected && <Check size={14} className="text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {contacts.length > 0 && (
          <button
            onClick={handleInvite}
            disabled={selected.size === 0 || saving}
            className="w-full py-3.5 rounded-2xl text-sm font-light tracking-wide text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#C8B06A 0%,#E5D4A0 50%,#C8B06A 100%)" }}
          >
            {saving ? "Sending invites…" : `Invite ${selected.size > 0 ? selected.size : ""} ${selected.size === 1 ? "Person" : "People"}`}
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default function CircleRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatorBadges, setCreatorBadges] = useState({});
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageField, setShowImageField] = useState(false);
  const [showLinkField, setShowLinkField] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [memberIds, setMemberIds] = useState([]);

  const loadRoomBadges = async (posts) => {
    const ids = [...new Set(posts.map(p => p.created_by_id).filter(Boolean))];
    if (!ids.length) return;
    try {
      const all = await base44.entities.UserBadge.list("-created_date", 500);
      const byUser = {};
      all.forEach(ub => {
        if (!ids.includes(ub.user_id)) return;
        if (!byUser[ub.user_id]) byUser[ub.user_id] = new Set();
        byUser[ub.user_id].add(ub.badge_key);
      });
      const result = {};
      ids.forEach(uid => {
        const keys = byUser[uid] || new Set();
        let best = null, bestP = -1, bestIdx = -1;
        BADGES.forEach((badge, idx) => {
          if (!keys.has(badge.key)) return;
          const p = FAMILY_PRIORITY_CR[badge.family] || 0;
          if (p > bestP || (p === bestP && idx > bestIdx)) {
            best = badge; bestP = p; bestIdx = idx;
          }
        });
        if (best) result[uid] = best;
      });
      setCreatorBadges(result);
    } catch {}
  };

  const load = async () => {
    try {
      const [u, roomData, allPosts] = await Promise.all([
        base44.auth.me(),
        base44.entities.CircleRoom.get(id),
        base44.entities.CirclePost.list("-created_date", 100),
      ]);
      setUser(u);
      setRoom(roomData);
      try {
        setMemberIds(JSON.parse(roomData.member_ids || "[]"));
      } catch { setMemberIds([]); }
      const roomPosts = allPosts
        .filter(p => p.room_id === id)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setPosts(roomPosts);
      loadRoomBadges(roomPosts);
    } catch {
      navigate("/circle-rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts.length]);

  const send = async () => {
    const content = text.trim();
    const link = showLinkField && text.trim().startsWith("http") ? text.trim() : "";
    if (!content && !imageUrl.trim()) return;
    setSending(true);
    try {
      const isLink = showLinkField && content.startsWith("http");
      const post = await base44.entities.CirclePost.create({
        room_id: id,
        text: content,
        image_url: imageUrl.trim() || undefined,
        author_name: user?.full_name || user?.email || user?.id,
        post_type: isLink ? "link" : imageUrl.trim() ? "image" : "text",
      });
      await base44.entities.CircleRoom.update(id, {
        last_activity: new Date().toISOString(),
      });
      setPosts(prev => [...prev, post]);
      setText("");
      setImageUrl("");
      setShowImageField(false);
      setShowLinkField(false);
    } catch {}
    setSending(false);
  };

  const handleInvited = (newIds) => {
    setMemberIds(newIds);
    setInviting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="swan-float"><SwanLogo size={40} color="#C8B06A" /></div>
      </div>
    );
  }

  if (!room) return null;

  const isActive = room.last_activity &&
    Date.now() - new Date(room.last_activity) < 86400000;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Room Header */}
      <div className="relative flex-shrink-0">
        {room.cover_image ? (
          <div className="relative h-52 w-full">
            <img src={room.cover_image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C26]/80 via-[#0B3C26]/20 to-transparent" />
          </div>
        ) : (
          <div
            className="h-52 w-full"
            style={{ background: "linear-gradient(160deg,#C8B06A22 0%,#04392710 100%)" }}
          />
        )}

        {/* Back button */}
        <button
          onClick={() => navigate("/circle-rooms")}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>

        {/* Invite button */}
        {memberIds.length < 8 && (
          <button
            onClick={() => setInviting(true)}
            className="absolute top-12 right-4 w-9 h-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center"
          >
            <UserPlus size={16} className="text-white" />
          </button>
        )}

        {/* Room info overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-4"
          style={{ background: room.cover_image ? undefined : undefined }}
        >
          <div className="flex items-end justify-between">
            <div>
              <h1
                className={`font-serif text-2xl font-light leading-tight ${
                  room.cover_image ? "text-white" : "text-[var(--color-text-primary)]"
                }`}
              >
                {room.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
                <span
                  className={`text-[10px] font-light ${
                    room.cover_image ? "text-white/60" : "text-primary-45"
                  }`}
                >
                  {memberIds.length} {memberIds.length === 1 ? "member" : "members"}
                </span>
              </div>
            </div>
            <MemberAvatars ids={memberIds} max={4} />
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="font-serif text-lg text-primary-35 italic">
              Nothing shared yet.
            </p>
            <p className="text-sm text-primary-30 font-light mt-1">
              Start the conversation below.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostBubble
              key={post.id}
              post={post}
              isOwn={post.created_by_id === user?.id}
              badge={post.created_by_id !== user?.id ? creatorBadges[post.created_by_id] : undefined}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-8 border-t border-[var(--color-text-primary)]/06"
        style={{ background: "var(--color-bg)", backdropFilter: "blur(12px)" }}
      >
        <AnimatePresence>
          {showImageField && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-2"
            >
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Image URL…"
                className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          {/* Attachment buttons */}
          <div className="flex gap-1 mb-0.5">
            <button
              onClick={() => { setShowImageField(v => !v); setShowLinkField(false); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                showImageField ? "bg-[#C8B06A]/20 text-[#C8B06A]" : "text-primary-35 hover:text-primary-60"
              }`}
            >
              <Image size={16} />
            </button>
            <button
              onClick={() => { setShowLinkField(v => !v); setShowImageField(false); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                showLinkField ? "bg-[#C8B06A]/20 text-[#C8B06A]" : "text-primary-35 hover:text-primary-60"
              }`}
            >
              <Link2 size={16} />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-3.5 py-2.5 min-h-[42px] flex items-center">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={showLinkField ? "Paste a link…" : "Share something…"}
              rows={1}
              className="w-full bg-transparent text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 resize-none leading-snug"
              style={{ maxHeight: 90, overflowY: "auto" }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={send}
            disabled={(!text.trim() && !imageUrl.trim()) || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
            style={{ background: "linear-gradient(135deg,#C8B06A 0%,#E5D4A0 50%,#C8B06A 100%)" }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Invite sheet */}
      <AnimatePresence>
        {inviting && (
          <InviteSheet
            room={room}
            memberIds={memberIds}
            user={user}
            onClose={() => setInviting(false)}
            onInvited={handleInvited}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
