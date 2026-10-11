import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

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

function MemberAvatars({ ids, max = 4 }) {
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
          className="relative w-7 h-7 rounded-full border-2 border-[var(--color-bg)] flex items-center justify-center"
        >
          <span className="text-white text-[9px] font-medium select-none">
            {id.slice(0, 1).toUpperCase()}
          </span>
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{ marginLeft: -8, zIndex: 0 }}
          className="relative w-7 h-7 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-bg-elevated)] flex items-center justify-center"
        >
          <span className="text-[var(--color-text-primary)] text-[8px] font-medium">+{extra}</span>
        </div>
      )}
    </div>
  );
}

function RoomCard({ room, onPress }) {
  const memberIds = (() => {
    try { return JSON.parse(room.member_ids || "[]"); }
    catch { return []; }
  })();
  const isActive = room.last_activity &&
    Date.now() - new Date(room.last_activity) < 86400000;

  return (
    <motion.button
      onClick={onPress}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full text-left rounded-3xl overflow-hidden shadow-sm transition-all active:scale-[0.98] ${isActive ? "" : "opacity-60"}`}
      style={{ background: "var(--color-bg-surface)" }}
    >
      {room.cover_image ? (
        <div className="relative h-28 w-full">
          <img src={room.cover_image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3C26]/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <p className="font-serif text-white text-lg leading-tight">{room.name}</p>
            {isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm flex-shrink-0 mb-1" />
            )}
          </div>
        </div>
      ) : (
        <div className="h-28 w-full bg-gradient-to-br from-[#C8B06A]/20 to-[#043927]/10 flex items-center justify-between px-5">
          <p className="font-serif text-[var(--color-text-primary)] text-xl">{room.name}</p>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm flex-shrink-0" />
          )}
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MemberAvatars ids={memberIds} />
          <span className="text-[11px] text-primary-50 font-light">
            {memberIds.length} {memberIds.length === 1 ? "member" : "members"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {room.last_activity && (
            <span className="text-[10px] text-primary-35 font-light">
              {timeAgo(room.last_activity)}
            </span>
          )}
          <ChevronRight size={14} className="text-primary-30" />
        </div>
      </div>
    </motion.button>
  );
}

function ComingSoonModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-lg rounded-t-3xl bg-[var(--color-bg)] px-8 pt-8 pb-32 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-primary-40"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center mb-5 shadow-sm">
            <SwanLogo size={30} color="var(--color-text-primary)" />
          </div>

          <h2 className="font-serif text-3xl text-[var(--color-text-primary)] font-light mb-2">
            Private Rooms
          </h2>
          <p className="text-[10px] tracking-[0.3em] text-primary-50 uppercase font-light mb-4">
            Coming Soon
          </p>
          <div className="w-8 h-px bg-[var(--color-accent-gold)] mb-5" />
          <p className="text-sm text-primary-45 font-light leading-relaxed max-w-[260px]">
            Your intimate circle is being prepared. Invite-only rooms are on their way.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function CircleRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const load = async () => {
    try {
      const u = await base44.auth.me();
      const allRooms = await base44.entities.CircleRoom.list("-last_activity", 100);
      const myRooms = allRooms.filter(r => {
        try {
          const ids = JSON.parse(r.member_ids || "[]");
          return ids.includes(u.id) || r.created_by_id === u.id;
        } catch { return r.created_by_id === u.id; }
      });
      setRooms(myRooms);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header banner */}
      <div className="px-5 pt-14 pb-4">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/66ad09890_IMG_5400.jpeg"
            alt="Beauty Rooms"
            className="w-full h-auto block"
            draggable={false}
          />
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full border border-[#C5A059]/70 bg-[#0A3D2A]/40 backdrop-blur-sm"
            aria-label="Back"
          >
            <ChevronLeft size={18} color="#C5A059" />
          </button>
          {/* Invisible overlay over baked-in "New Room" button (right side) */}
          <button
            onClick={() => setShowComingSoon(true)}
            className="absolute top-3 right-3 bottom-3 w-32 rounded-2xl"
            style={{ background: "transparent" }}
            aria-label="New Room"
          />
        </div>
      </div>

      {/* Phase 1 — Curated Beauty Rooms */}
      {(() => {
        const BEAUTY_ROOMS = [
          { key: "skin_rituals", label: "Skin Rituals",    glyph: "✦", color: "#C8A96E" },
          { key: "bold_colour",  label: "Bold Colour",     glyph: "◆", color: "#BC4A6A" },
          { key: "clean_beauty", label: "Clean Beauty",    glyph: "◉", color: "#3D7A5A" },
          { key: "vintage_glam", label: "Vintage Glamour", glyph: "◈", color: "#7A4E7A" },
          { key: "natural_glow", label: "Natural Glow",    glyph: "◇", color: "#C47B3A" },
          { key: "minimalist",   label: "Minimalist",      glyph: "○", color: "#043927" },
        ];
        const ARCHETYPES = {
          skin_rituals: "The Alchemist",
          bold_colour:  "The Icon",
          clean_beauty: "The Purist",
          vintage_glam: "The Archivist",
          natural_glow: "The Oracle",
          minimalist:   "The Engineer",
        };
        return (
          <div className="px-5 pt-2 pb-4">
            <p className="text-[0.5625rem] tracking-[0.25em] uppercase font-light text-[#8A7A60] mb-3">
              Beauty Rooms
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BEAUTY_ROOMS.map(room => (
                <button
                  key={room.key}
                  onClick={() => navigate(`/beauty-room/${room.key}`)}
                  className="relative rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${room.color}22 0%, ${room.color}0A 100%)`,
                    border: `1px solid ${room.color}40`,
                    minHeight: "88px",
                    padding: "14px 16px",
                  }}
                >
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[2.5rem] opacity-[0.08] leading-none select-none"
                    style={{ color: room.color }}
                  >
                    {room.glyph}
                  </span>
                  <p className="text-[0.5625rem] tracking-[0.2em] uppercase font-light mb-1" style={{ color: room.color }}>
                    {room.glyph}
                  </p>
                  <p className="text-[0.8125rem] font-light leading-snug text-[#1C2E24]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                    {ARCHETYPES[room.key]}
                  </p>
                  <p className="text-[0.625rem] font-light text-[#6A7A6E] mt-0.5">{room.label}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 mb-1 h-px bg-[#C8B06A]/15" />
            <p className="text-[0.5625rem] tracking-[0.25em] uppercase font-light text-[#8A7A60] mt-3 mb-3">
              Private Rooms
            </p>
          </div>
        );
      })()}

      {/* List */}
      <div className="px-5 pb-32 space-y-3">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="swan-float">
              <SwanLogo size={40} color="#C8B06A" />
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Users size={36} className="text-[#C8B06A] mb-4 opacity-60" />
            <p className="font-serif text-lg text-primary-40 italic">
              No rooms yet.
            </p>
            <p className="text-sm text-primary-30 font-light mt-1">
              Your private circle is on its way.
            </p>
            <button
              onClick={() => setShowComingSoon(true)}
              className="mt-6 px-6 py-3 rounded-2xl text-sm font-light text-white"
              style={{ background: "linear-gradient(135deg,#C8B06A 0%,#E5D4A0 50%,#C8B06A 100%)" }}
            >
              Learn More
            </button>
          </div>
        ) : (
          rooms.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              onPress={() => navigate(`/circle-rooms/${room.id}`)}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal onClose={() => setShowComingSoon(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
