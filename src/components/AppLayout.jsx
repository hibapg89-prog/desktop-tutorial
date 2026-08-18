import { useState, useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import MuseNavBar from "./MuseNavBar";
import FloatingMuseButton from "./FloatingMuseButton";
import ScanHub from "./ScanHub";
import MuseAssistant from "./MuseAssistant";
import NotificationsBell from "./NotificationsBell";
import NotificationToast from "./NotificationToast";
import SoundscapePlayer from "./SoundscapePlayer";
import { seedWelcomeNotification } from "@/utils/notifications";
import { applyTheme } from "@/lib/theme";

export default function AppLayout() {
  const [museOpen, setMuseOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const [prefersCalm, setPrefersCalm] = useState(() => {
    try { return JSON.parse(localStorage.getItem("muse_accessibility") || "{}").calmMode ?? false; }
    catch { return false; }
  });

  useEffect(() => {
    const onCustom = (e) => setPrefersCalm(e.detail?.calmMode ?? false);
    const onStorage = (e) => {
      if (e.key !== "muse_accessibility") return;
      try { setPrefersCalm(JSON.parse(e.newValue || "{}").calmMode ?? false); } catch {}
    };
    window.addEventListener("musePrefsCalmChange", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("musePrefsCalmChange", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => { seedWelcomeNotification(); }, []);

  useLayoutEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("muse_accessibility") || "{}");
      if (prefs.largeTypography) {
        const STYLE_ID = "__muse_large_typography__";
        if (!document.getElementById(STYLE_ID)) {
          const tag = document.createElement("style");
          tag.id = STYLE_ID;
          tag.textContent = [
            "html { font-size: 20px !important; }",
            ".text-xs   { font-size: 15px   !important; }",
            ".text-sm   { font-size: 17.5px !important; }",
            ".text-base { font-size: 20px   !important; }",
            ".text-lg   { font-size: 22.5px !important; }",
            ".text-xl   { font-size: 25px   !important; }",
            ".text-2xl  { font-size: 30px   !important; }",
            ".text-3xl  { font-size: 37.5px !important; }",
            ".text-4xl  { font-size: 45px   !important; }",
            ".text-5xl  { font-size: 60px   !important; }",
            ".text-6xl  { font-size: 75px   !important; }",
          ].join(" ");
          document.head.appendChild(tag);
        }
      }
      if (prefs.darkMode) applyTheme(true);
      if (prefs.highContrastText) {
        document.documentElement.setAttribute("data-high-contrast", "true");
      }
    } catch {}
  }, []);

  const openScan = () => { setMuseOpen(false); setScanOpen(true); };
  const openMuse = () => { setScanOpen(false); setMuseOpen(true); };

  // Hide the soundscape pill when a full-screen overlay is open
  const overlayOpen = museOpen || scanOpen;

  const location = useLocation();
  const isConversation = /^\/messages\/[^/]+$/.test(location.pathname);
  const isRoomDetail = /^\/circle-rooms\/[^/]+$/.test(location.pathname);
  const hideNav = isConversation || isRoomDetail;

  return (
    <MotionConfig reducedMotion={prefersCalm ? "always" : "user"}>
      <div className="min-h-screen bg-[var(--color-bg)]">
        <Outlet context={{ openScan, openMuse }} />
        {!hideNav && <div className="h-24" />}
        <NotificationsBell />
        <NotificationToast />
        {!hideNav && <MuseNavBar />}
        {!overlayOpen && !hideNav && <FloatingMuseButton onTap={openMuse} />}
        {!overlayOpen && !hideNav && <SoundscapePlayer calmMode={prefersCalm} />}
        {museOpen && (
          <MuseAssistant
            onClose={() => setMuseOpen(false)}
            onOpenScan={openScan}
          />
        )}
        {scanOpen && <ScanHub onClose={() => setScanOpen(false)} />}
      </div>
    </MotionConfig>
  );
}
