"use client";

import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import ConciergeScreen from "@/components/ConciergeScreen";
import InputSelectorScreen from "@/components/InputSelectorScreen";
import GalleryPickerScreen from "@/components/GalleryPickerScreen";
import AnalysisLoadingScreen from "@/components/AnalysisLoadingScreen";
import ProductCardScreen from "@/components/ProductCardScreen";
import DupeScreen from "@/components/DupeScreen";
import PasteLinkScreen from "@/components/PasteLinkScreen";
import CategoryHomeScreen from "@/components/CategoryHomeScreen";
import VanityScreen from "@/components/VanityScreen";
import ScanScreen from "@/components/ScanScreen";
import VoiceScreen from "@/components/VoiceScreen";
import EditorialScreen from "@/components/EditorialScreen";
import ReviewsScreen from "@/components/ReviewsScreen";
import AccessibilityScreen from "@/components/AccessibilityScreen";
import BrowserExtensionScreen from "@/components/BrowserExtensionScreen";

type Screen =
  | "landing"
  | "concierge"
  | "input-selector"
  | "gallery"
  | "loading"
  | "product-card"
  | "dupe"
  | "paste-link"
  | "home"
  | "vanity"
  | "scan"
  | "voice"
  | "editorial"
  | "reviews"
  | "accessibility"
  | "extension";

const mainDots: Screen[] = ["landing", "home", "vanity", "scan", "editorial"];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const idx = mainDots.indexOf(screen);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {screen === "landing" && (
        <LandingScreen onNext={() => setScreen("concierge")} />
      )}
      {screen === "concierge" && (
        <ConciergeScreen onNext={() => setScreen("home")} />
      )}
      {screen === "input-selector" && (
        <InputSelectorScreen
          onCamera={() => setScreen("loading")}
          onGallery={() => setScreen("gallery")}
          onLink={() => setScreen("paste-link")}
          onVoice={() => setScreen("voice")}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "gallery" && (
        <GalleryPickerScreen
          onNext={() => setScreen("loading")}
          onCancel={() => setScreen("input-selector")}
        />
      )}
      {screen === "loading" && (
        <AnalysisLoadingScreen onDone={() => setScreen("product-card")} />
      )}
      {screen === "product-card" && (
        <ProductCardScreen
          onDupe={() => setScreen("dupe")}
          onBack={() => setScreen("home")}
        />
      )}
      {screen === "dupe" && (
        <DupeScreen onBack={() => setScreen("product-card")} />
      )}
      {screen === "paste-link" && (
        <PasteLinkScreen
          onPaste={() => setScreen("loading")}
          onBack={() => setScreen("input-selector")}
        />
      )}
      {screen === "home" && (
        <CategoryHomeScreen
          onVanity={() => setScreen("vanity")}
          onProducts={() => setScreen("product-card")}
          onScan={() => setScreen("scan")}
          onVoice={() => setScreen("voice")}
          onBack={() => setScreen("concierge")}
          onInput={() => setScreen("input-selector")}
          onEditorial={() => setScreen("editorial")}
          onReviews={() => setScreen("reviews")}
          onAccessibility={() => setScreen("accessibility")}
          onExtension={() => setScreen("extension")}
        />
      )}
      {screen === "vanity" && (
        <VanityScreen onBack={() => setScreen("home")} />
      )}
      {screen === "scan" && (
        <ScanScreen onBack={() => setScreen("home")} />
      )}
      {screen === "voice" && (
        <VoiceScreen onBack={() => setScreen("home")} />
      )}
      {screen === "editorial" && (
        <EditorialScreen onBack={() => setScreen("home")} />
      )}
      {screen === "reviews" && (
        <ReviewsScreen onBack={() => setScreen("home")} />
      )}
      {screen === "accessibility" && (
        <AccessibilityScreen onBack={() => setScreen("home")} />
      )}
      {screen === "extension" && (
        <BrowserExtensionScreen onBack={() => setScreen("home")} />
      )}

      {/* Progress dots — only on main screens */}
      {idx >= 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 z-50 pointer-events-none">
          {mainDots.map((s, i) => (
            <div key={s} className={`dot ${i === idx ? "on" : "off"}`} />
          ))}
        </div>
      )}
    </main>
  );
}
