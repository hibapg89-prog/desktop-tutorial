import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

// Gold 4-pointed sparkle — matches the jewelry accent in the mockup
function Sparkle({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 0 C8 0 8.6 5.4 9.6 6.4 C10.6 7.4 16 8 16 8 C16 8 10.6 8.6 9.6 9.6 C8.6 10.6 8 16 8 16 C8 16 7.4 10.6 6.4 9.6 C5.4 8.6 0 8 0 8 C0 8 5.4 7.4 6.4 6.4 C7.4 5.4 8 0 8 0 Z"
        fill="#C8B06A"
      />
    </svg>
  );
}

const SWAN_MEDALLION_URL =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/87fc5ab0f_IMG_4373.png";

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);
  const seenIdsRef     = useRef(new Set());
  const initialDoneRef = useRef(false);
  const counterRef     = useRef(0);
  const timersRef      = useRef({});

  const dismiss = useCallback((toastId) => {
    clearTimeout(timersRef.current[toastId]);
    delete timersRef.current[toastId];
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const push = useCallback(
    (notification) => {
      const toastId = `t-${++counterRef.current}`;
      setToasts((prev) => [...prev.slice(-2), { toastId, notification }]);
      timersRef.current[toastId] = setTimeout(() => dismiss(toastId), 5000);
    },
    [dismiss]
  );

  useEffect(() => {
    let mounted = true;

    // Silently seed existing IDs — never toast on initial load
    base44.entities.Notification.list("-created_date", 200)
      .then((items) => {
        if (!mounted) return;
        if (Array.isArray(items)) items.forEach((n) => seenIdsRef.current.add(n.id));
        initialDoneRef.current = true;
      })
      .catch(() => {
        if (mounted) initialDoneRef.current = true;
      });

    // Subscribe to real-time changes
    let unsub = null;
    try {
      unsub = base44.entities.Notification.subscribe(async () => {
        if (!mounted || !initialDoneRef.current) return;
        try {
          const fresh = await base44.entities.Notification.filter(
            { read: false },
            "-created_date",
            20
          );
          if (!Array.isArray(fresh) || !mounted) return;
          fresh.forEach((n) => {
            if (!seenIdsRef.current.has(n.id)) {
              seenIdsRef.current.add(n.id);
              push(n);
            }
          });
        } catch {}
      });
    } catch {}

    return () => {
      mounted = false;
      Object.values(timersRef.current).forEach(clearTimeout);
      if (unsub) unsub();
    };
  }, [push]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "max(env(safe-area-inset-top, 14px), 14px) 14px 0",
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map(({ toastId, notification }) => (
          <motion.div
            key={toastId}
            layout
            initial={{ y: -90, opacity: 0, scale: 0.94 }}
            animate={{ y: 0,   opacity: 1, scale: 1    }}
            exit={{    y: -90, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            onClick={() => dismiss(toastId)}
            style={{
              pointerEvents: "auto",
              cursor: "pointer",
              width: "100%",
              maxWidth: 440,
              position: "relative",
              // Pearl ivory satin — matches the mockup background card
              background:
                "linear-gradient(145deg, #F8F3EA 0%, #EDE5D2 55%, #F3EEE3 100%)",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.75)",
              boxShadow:
                "0 20px 60px rgba(4,57,39,0.13), 0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
              padding: "14px 56px 14px 14px", // right padding leaves room for sparkle
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Swan medallion — black circle with gold ring and swan image */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: "#111",
                border: "2px solid #C8B06A",
                flexShrink: 0,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(200,176,106,0.25)",
              }}
            >
              <img
                src={SWAN_MEDALLION_URL}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 17,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#043927",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.title}
              </p>
              {notification.body && (
                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: 12,
                    fontWeight: 300,
                    color: "rgba(4,57,39,0.5)",
                    lineHeight: 1.55,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {notification.body}
                </p>
              )}
            </div>

            {/* Gold sparkle — bottom right, matches mockup jewel accent */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 16,
                opacity: 0.85,
              }}
            >
              <Sparkle size={14} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
