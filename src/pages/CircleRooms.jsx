import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Users, ChevronRight } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
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
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-primary-40 uppercase font-light">Private</p>
          <h1 className="font-serif text-3xl text-[var(--color-text-primary)] font-light mt-0.5">Rooms</h1>
        </div>
        <button
          onClick={() => setShowComingSoon(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-light text-white"
          style={{ background: "linear-gradient(135deg,#C8B06A 0%,#E5D4A0 50%,#C8B06A 100%)" }}
        >
          <Plus size={14} />
          New Room
        </button>
      </div>

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
