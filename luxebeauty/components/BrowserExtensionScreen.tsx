"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; }

const FEATURES = [
  {
    id: "scan", icon: "◈", label: "Instant Scan",
    desc: "Scan any product on any website with one click",
    accent: "#C8B06A",
  },
  {
    id: "dupe", icon: "◇", label: "Find Dupes",
    desc: "Automatically surface affordable alternatives",
    accent: "#1A5C3A",
  },
  {
    id: "track", icon: "○", label: "Price Tracker",
    desc: "Get notified when luxury items drop in price",
    accent: "#C4968A",
  },
  {
    id: "vanity", icon: "✦", label: "Vanity Sync",
    desc: "Add products directly to your digital vanity",
    accent: "#5A7A9A",
  },
];

const BROWSERS = ["Chrome", "Safari", "Firefox", "Edge"];

export default function BrowserExtensionScreen({ onBack }: Props) {
  const [installed, setInstalled] = useState(false);
  const [activeBrowser, setActiveBrowser] = useState("Chrome");

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.5), transparent 65%)" }} />
        <div className="absolute bottom-[20%] left-[-5%] w-[40vw] h-[40vw] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(11,60,38,0.3), transparent 65%)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="opacity-20">
          <SwanLogo size={24} />
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-2 pb-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)", boxShadow: "0 4px 20px rgba(200,176,106,0.4)" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="6" stroke="white" strokeWidth="1.5" />
              <path d="M3 14 H25 M14 3 Q8 8 8 14 Q8 20 14 25 M14 3 Q20 8 20 14 Q20 20 14 25" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
            </svg>
          </div>
          <div>
            <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Tech Beauty</p>
            <h1 className="font-serif text-2xl font-normal text-[#1C1C1C] leading-tight">Browser Extension</h1>
          </div>
        </div>

        <p className="font-cormorant text-base italic font-light text-[#8A8070] tracking-wide leading-relaxed mb-1">
          Shop smarter. Discover dupes. Build your vanity — all without leaving your browser.
        </p>
      </div>

      <div className="divider-gold mx-6 mb-5" />

      {/* Features */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-8">
        <div className="space-y-3 mb-6">
          {FEATURES.map((f) => (
            <div key={f.id}
              className="card-pearl rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}>
                <span className="text-sm" style={{ color: f.accent }}>{f.icon}</span>
              </div>
              <div>
                <p className="font-serif text-sm font-normal text-[#1C1C1C] mb-0.5">{f.label}</p>
                <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Browser selector */}
        <div className="mb-5">
          <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#0B3C26] opacity-50 mb-3 px-1">
            Select your browser
          </p>
          <div className="flex gap-2">
            {BROWSERS.map(b => (
              <button
                key={b}
                onClick={() => setActiveBrowser(b)}
                className="flex-1 py-2 rounded-xl font-sans text-[9px] tracking-[0.1em] uppercase transition-all duration-200 cursor-pointer"
                style={{
                  background: activeBrowser === b ? "linear-gradient(145deg, #D4C07A, #C8B06A)" : "rgba(200,176,106,0.08)",
                  color: activeBrowser === b ? "white" : "rgba(11,60,38,0.5)",
                  border: activeBrowser === b ? "none" : "1px solid rgba(200,176,106,0.2)",
                  boxShadow: activeBrowser === b ? "0 2px 12px rgba(200,176,106,0.3)" : "none",
                }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setInstalled(i => !i)}
          className="w-full py-4 rounded-full font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          style={{
            background: installed
              ? "rgba(11,60,38,0.08)"
              : "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)",
            color: installed ? "#0B3C26" : "white",
            border: installed ? "1px solid rgba(11,60,38,0.2)" : "none",
            boxShadow: installed ? "none" : "0 4px 24px rgba(200,176,106,0.4)",
          }}>
          {installed ? "✓ Added to " + activeBrowser : "Add to " + activeBrowser}
        </button>

        {installed && (
          <p className="text-center font-sans text-[9px] text-[#0B3C26] opacity-60 mt-3 tracking-wide">
            Extension installed · Open any product page to begin
          </p>
        )}

        {/* Stats strip */}
        <div className="mt-6 card-pearl rounded-2xl p-4 flex justify-around">
          {[["2M+", "Installs"], ["4.9★", "Rating"], ["0.1s", "Scan speed"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <p className="font-serif text-xl font-normal text-[#C8B06A]">{val}</p>
              <p className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#8A8070] mt-0.5">{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
