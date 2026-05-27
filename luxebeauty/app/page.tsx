"use client";

import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import BeautyProfileScreen from "@/components/BeautyProfileScreen";
import CategoryHomeScreen from "@/components/CategoryHomeScreen";
import VanityScreen from "@/components/VanityScreen";
import ProductGridScreen from "@/components/ProductGridScreen";
import ScanScreen from "@/components/ScanScreen";
import VoiceScreen from "@/components/VoiceScreen";

type Screen = "landing" | "profile" | "home" | "vanity" | "products" | "scan" | "voice";
const dots: Screen[] = ["landing", "profile", "home", "vanity", "products"];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const idx = dots.indexOf(screen);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {screen === "landing"  && <LandingScreen onNext={() => setScreen("profile")} />}
      {screen === "profile"  && <BeautyProfileScreen onNext={() => setScreen("home")} onBack={() => setScreen("landing")} />}
      {screen === "home"     && (
        <CategoryHomeScreen
          onVanity={() => setScreen("vanity")}
          onProducts={() => setScreen("products")}
          onScan={() => setScreen("scan")}
          onVoice={() => setScreen("voice")}
          onBack={() => setScreen("profile")}
        />
      )}
      {screen === "vanity"   && <VanityScreen onBack={() => setScreen("home")} />}
      {screen === "products" && <ProductGridScreen onBack={() => setScreen("home")} />}
      {screen === "scan"     && <ScanScreen onBack={() => setScreen("home")} />}
      {screen === "voice"    && <VoiceScreen onBack={() => setScreen("home")} />}

      {/* Progress dots (only on main 5 screens) */}
      {idx >= 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 z-50 pointer-events-none">
          {dots.map((s, i) => (
            <div key={s} className={`dot ${i === idx ? "on" : "off"}`} />
          ))}
        </div>
      )}
    </main>
  );
}
