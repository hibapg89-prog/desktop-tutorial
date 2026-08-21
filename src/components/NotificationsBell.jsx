import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function NotificationsBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const me = await base44.auth.me();
        const items = await base44.entities.Notification.filter({ read: false, user_id: me.id }, "-created_date", 50);
        if (mounted) setUnread(Array.isArray(items) ? items.length : 0);
      } catch {
        if (mounted) setUnread(0);
      }
    };
    load();
    let unsub = null;
    try { unsub = base44.entities.Notification.subscribe(() => load()); } catch {}
    return () => { mounted = false; if (unsub) unsub(); };
  }, []);

  return (
    <Link
      to="/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      style={{
        position: "fixed",
        top: "max(env(safe-area-inset-top, 0px), 14px)",
        right: 16,
        zIndex: 40,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--color-pill-bg-idle)",
        border: "1px solid rgba(var(--color-text-primary-rgb), 0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: unread > 0
          ? "0 0 0 4px rgba(200,176,106,0.15), 0 2px 10px rgba(4,57,39,0.1)"
          : "0 2px 10px rgba(4,57,39,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        transition: "box-shadow 0.4s ease",
      }}
    >
      {/* Gold pulse ring when there are unread notifications */}
      <AnimatePresence>
        {unread > 0 && (
          <motion.span
            key="pulse"
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "1.5px solid rgba(200,176,106,0.5)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <Bell
        size={18}
        strokeWidth={1.5}
        color={unread > 0 ? "var(--color-text-primary)" : "var(--color-text-muted)"}
        style={{ transition: "color 0.3s ease" }}
      />

      {/* Unread badge */}
      <AnimatePresence>
        {unread > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 300 }}
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 17,
              height: 17,
              padding: "0 4px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #D4B896, #C8B06A)",
              color: "#043927",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px rgba(200,176,106,0.4)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
