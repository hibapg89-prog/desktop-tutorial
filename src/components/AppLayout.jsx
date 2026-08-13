import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
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

  useEffect(() => { seedWelcomeNotification(); }, []);

  useEffect(() => {
    try {
      const prefs = JSON.parse(localStorage.getItem("muse_accessibility") || "{}");
      if (prefs.largeTypography) document.documentElement.style.fontSize = "20px";
      if (prefs.darkMode) applyTheme(true);
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
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Outlet context={{ openScan, openMuse }} />
      {!hideNav && <div className="h-24" />}
      <NotificationsBell />
      <NotificationToast />
      {!hideNav && <MuseNavBar />}
      {!overlayOpen && !hideNav && <FloatingMuseButton onTap={openMuse} />}
      {!overlayOpen && !hideNav && <SoundscapePlayer />}
      {museOpen && (
        <MuseAssistant
          onClose={() => setMuseOpen(false)}
          onOpenScan={openScan}
        />
      )}
      {scanOpen && <ScanHub onClose={() => setScanOpen(false)} />}
    </div>
  );
}
