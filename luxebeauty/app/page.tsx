"use client";

import { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import BeautyProfileScreen from "@/components/BeautyProfileScreen";
import CategoryHomeScreen from "@/components/CategoryHomeScreen";
import VanityScreen from "@/components/VanityScreen";
import ProductGridScreen from "@/components/ProductGridScreen";

type Screen = "landing" | "profile" | "home" | "vanity" | "products";
const screens: Screen[] = ["landing", "profile", "home", "vanity", "products"];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");

  const idx = screens.indexOf(screen);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {screen === "landing" && <LandingScreen onNext={() => setScreen("profile")} />}
      {screen === "profile" && (
        <BeautyProfileScreen
          onNext={() => setScreen("home")}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "home" && (
        <CategoryHomeScreen
          onVanity={() => setScreen("vanity")}
          onProducts={() => setScreen("products")}
          onBack={() => setScreen("profile")}
        />
      )}
      {screen === "vanity" && <VanityScreen onBack={() => setScreen("home")} />}
      {screen === "products" && <ProductGridScreen onBack={() => setScreen("home")} />}

      {/* Progress dots */}
      <div className="fixed bottom-7 left-0 right-0 flex items-center justify-center gap-2 z-50 pointer-events-none">
        {screens.map((s, i) => (
          <div
            key={s}
            style={{ width: i === idx ? "20px" : "7px" }}
            className={`nav-dot ${i === idx ? "active" : ""}`}
          />
        ))}
      </div>
    </main>
  );
}
