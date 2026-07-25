"use client";

import { useEffect, useRef, useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import ConciergeScreen from "@/components/ConciergeScreen";
import BeautyProfileScreen from "@/components/BeautyProfileScreen";
import InputSelectorScreen from "@/components/InputSelectorScreen";
import GalleryPickerScreen from "@/components/GalleryPickerScreen";
import AnalysisLoadingScreen from "@/components/AnalysisLoadingScreen";
import ProductCardScreen from "@/components/ProductCardScreen";
import ProductGridScreen from "@/components/ProductGridScreen";
import CurationScreen from "@/components/CurationScreen";
import PasteLinkScreen from "@/components/PasteLinkScreen";
import CategoryHomeScreen from "@/components/CategoryHomeScreen";
import VanityScreen from "@/components/VanityScreen";
import ScanScreen from "@/components/ScanScreen";
import VoiceScreen from "@/components/VoiceScreen";
import EditorialScreen from "@/components/EditorialScreen";
import ReviewsScreen from "@/components/ReviewsScreen";
import AccessibilityScreen from "@/components/AccessibilityScreen";
import BrowserExtensionScreen from "@/components/BrowserExtensionScreen";
import HaircareScreen from "@/components/HaircareScreen";
import BodyScreen from "@/components/BodyScreen";
import SearchScreen from "@/components/SearchScreen";
import WellnessScreen from "@/components/WellnessScreen";
import NotificationPermissionScreen from "@/components/NotificationPermissionScreen";
import FirstMuseRevealScreen from "@/components/FirstMuseRevealScreen";
import SocialScreen from "@/components/SocialScreen";
import NotificationsScreen from "@/components/NotificationsScreen";
import ProfileScreen from "@/components/ProfileScreen";
import MuseMirrorScreen from "@/components/MuseMirrorScreen";
import MuseBoxScreen from "@/components/MuseBoxScreen";
import TutorialDetailScreen from "@/components/TutorialDetailScreen";
import { ToastProvider } from "@/components/ToastContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeContext";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { A11yProvider } from "@/components/AccessibilityContext";
import SettingsScreen from "@/components/SettingsScreen";
import { VanityItem, INITIAL_VANITY_ITEMS } from "@/components/VanityScreen";
import SoundscapePlayer from "@/components/SoundscapePlayer";
import BeautyMapScreen from "@/components/BeautyMapScreen";
import IntimateScreen from "@/components/IntimateScreen";
import ParapharmacyScreen from "@/components/ParapharmacyScreen";
import RoutineBuilderScreen from "@/components/RoutineBuilderScreen";

type Screen =
  | "landing"
  | "concierge"
  | "beauty-profile"
  | "input-selector"
  | "gallery"
  | "loading"
  | "product-card"
  | "product-grid"
  | "curator"
  | "paste-link"
  | "home"
  | "vanity"
  | "scan"
  | "voice"
  | "editorial"
  | "reviews"
  | "accessibility"
  | "extension"
  | "haircare"
  | "body"
  | "search"
  | "wellness"
  | "intimate"
  | "parapharmacy"
  | "notification-permission"
  | "first-muse-reveal"
  | "social"
  | "notifications"
  | "profile"
  | "muse-mirror"
  | "muse-box"
  | "tutorial-detail"
  | "map"
  | "routine"
  | "settings";

const mainDots: Screen[] = ["landing", "concierge", "beauty-profile", "home", "vanity", "scan", "editorial"];

export default function Home() {
  const [history, setHistory]       = useState<Screen[]>(["landing"]);
  const [navKey, setNavKey]         = useState(0);
  const direction                   = useRef<"fwd" | "back">("fwd");
  const [vanityItems,    setVanityItems]    = useState<VanityItem[]>(INITIAL_VANITY_ITEMS);
  const [tutorialId,     setTutorialId]     = useState<string>("");

  // Skip onboarding for returning users
  useEffect(() => {
    if (localStorage.getItem("luxe-onboarded") === "true") {
      setHistory(["home"]);
    }
  }, []);

  const screen = history[history.length - 1];
  const idx    = mainDots.indexOf(screen);

  const go = (s: Screen) => {
    direction.current = "fwd";
    setNavKey(k => k + 1);
    setHistory(h => [...h, s]);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    direction.current = "back";
    setNavKey(k => k + 1);
    setHistory(h => h.slice(0, -1));
  };

  const transitionClass = direction.current === "fwd" ? "screen-enter-fwd" : "screen-enter-back";

  return (
    <ErrorBoundary>
    <A11yProvider>
    <ThemeProvider>
    <CurrencyProvider>
    <ToastProvider>
    <main className="relative min-h-screen overflow-hidden">

      <SoundscapePlayer position="top" />

      <div key={navKey} className={transitionClass}>
        {screen === "landing" && (
          <LandingScreen onNext={() => go("concierge")} />
        )}
        {screen === "concierge" && (
          <ConciergeScreen onNext={() => go("beauty-profile")} />
        )}
        {screen === "beauty-profile" && (
          <BeautyProfileScreen
            onNext={() => go("notification-permission")}
            onBack={goBack}
          />
        )}
        {screen === "notification-permission" && (
          <NotificationPermissionScreen
            onAllow={() => go("first-muse-reveal")}
            onSkip={() => go("first-muse-reveal")}
          />
        )}
        {screen === "first-muse-reveal" && (
          <FirstMuseRevealScreen onEnter={() => {
            localStorage.setItem("luxe-onboarded", "true");
            go("home");
          }} />
        )}
        {screen === "input-selector" && (
          <InputSelectorScreen
            onCamera={() => go("loading")}
            onGallery={() => go("gallery")}
            onLink={() => go("paste-link")}
            onVoice={() => go("voice")}
            onBack={goBack}
          />
        )}
        {screen === "gallery" && (
          <GalleryPickerScreen
            onNext={() => go("loading")}
            onCancel={goBack}
          />
        )}
        {screen === "loading" && (
          <AnalysisLoadingScreen onDone={() => go("product-card")} />
        )}
        {screen === "product-card" && (
          <ProductCardScreen
            onCuratorReveal={() => go("curator")}
            onBack={goBack}
            onSave={(item) => setVanityItems(prev => [item, ...prev])}
          />
        )}
        {screen === "product-grid" && (
          <ProductGridScreen onBack={goBack} />
        )}
        {screen === "curator" && (
          <CurationScreen onBack={goBack} />
        )}
        {screen === "paste-link" && (
          <PasteLinkScreen
            onPaste={() => go("loading")}
            onBack={goBack}
          />
        )}
        {screen === "home" && (
          <CategoryHomeScreen
            onVanity={() => go("vanity")}
            onProducts={() => go("product-grid")}
            onScan={() => go("scan")}
            onVoice={() => go("voice")}
            onBack={goBack}
            onInput={() => go("input-selector")}
            onEditorial={() => go("editorial")}
            onReviews={() => go("reviews")}
            onAccessibility={() => go("accessibility")}
            onExtension={() => go("extension")}
            onHaircare={() => go("haircare")}
            onBody={() => go("body")}
            onSearch={() => go("search")}
            onWellness={() => go("wellness")}
            onIntimate={() => go("intimate")}
            onParapharmacy={() => go("parapharmacy")}
            onSocial={() => go("social")}
            onProfile={() => go("profile")}
            onNotifications={() => go("notifications")}
            onMuseBox={() => go("muse-box")}
            onMap={() => go("map")}
            onRoutine={() => go("routine")}
          />
        )}
        {screen === "vanity" && (
          <VanityScreen
            onBack={goBack}
            items={vanityItems}
            onReorder={setVanityItems}
          />
        )}
        {screen === "scan" && (
          <ScanScreen onBack={goBack} onMuseMirror={() => go("muse-mirror")} onAnalysis={() => go("loading")} />
        )}
        {screen === "voice" && (
          <VoiceScreen onBack={goBack} />
        )}
        {screen === "editorial" && (
          <EditorialScreen
            onBack={goBack}
            onTutorial={(id) => { setTutorialId(id); go("tutorial-detail"); }}
          />
        )}
        {screen === "tutorial-detail" && (
          <TutorialDetailScreen tutorialId={tutorialId} onBack={goBack} />
        )}
        {screen === "reviews" && (
          <ReviewsScreen onBack={goBack} />
        )}
        {screen === "accessibility" && (
          <AccessibilityScreen onBack={goBack} />
        )}
        {screen === "extension" && (
          <BrowserExtensionScreen onBack={goBack} />
        )}
        {screen === "haircare" && (
          <HaircareScreen onBack={goBack} />
        )}
        {screen === "body" && (
          <BodyScreen onBack={goBack} />
        )}
        {screen === "search" && (
          <SearchScreen onBack={goBack} onScan={() => go("scan")} />
        )}
        {screen === "wellness" && (
          <WellnessScreen onBack={goBack} />
        )}
        {screen === "intimate" && (
          <IntimateScreen onBack={goBack} />
        )}
        {screen === "parapharmacy" && (
          <ParapharmacyScreen onBack={goBack} />
        )}
        {screen === "social" && (
          <SocialScreen onBack={goBack} />
        )}
        {screen === "notifications" && (
          <NotificationsScreen onBack={goBack} />
        )}
        {screen === "profile" && (
          <ProfileScreen
            onBack={goBack}
            onVanity={() => go("vanity")}
            onSocial={() => go("social")}
            onSettings={() => go("settings")}
            onEditProfile={() => go("beauty-profile")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen onBack={goBack} onAccessibility={() => go("accessibility")} />
        )}
        {screen === "muse-mirror" && (
          <MuseMirrorScreen onBack={goBack} />
        )}
        {screen === "muse-box" && (
          <MuseBoxScreen onBack={goBack} onSocial={() => go("social")} />
        )}
        {screen === "map" && (
          <BeautyMapScreen onBack={goBack} onVanity={() => go("vanity")} onProfile={() => go("profile")} />
        )}
        {screen === "routine" && (
          <RoutineBuilderScreen onBack={goBack} />
        )}
      </div>

      {/* Progress dots — only on main screens */}
      {idx >= 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 z-50 pointer-events-none">
          {mainDots.map((s, i) => (
            <div key={s} className={`dot ${i === idx ? "on" : "off"}`} />
          ))}
        </div>
      )}
    </main>
    </ToastProvider>
    </CurrencyProvider>
    </ThemeProvider>
    </A11yProvider>
    </ErrorBoundary>
  );
}
