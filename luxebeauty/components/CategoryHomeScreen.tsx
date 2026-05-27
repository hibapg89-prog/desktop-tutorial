"use client";

import { SwanLogo } from "./LandingScreen";

interface Props {
  onVanity: () => void;
  onProducts: () => void;
  onScan: () => void;
  onVoice: () => void;
  onBack: () => void;
}

const categories = [
  { id: "muse",        label: "The Muse",     sub: "Your curator",     accent: "#0B3C26" },
  { id: "makeup",      label: "Makeup",        sub: "Color & beauty",   accent: "#C4968A" },
  { id: "skincare",    label: "Skincare",      sub: "Glow routines",    accent: "#1A5C3A" },
  { id: "haircare",    label: "Haircare",      sub: "Lush locks",       accent: "#8A6A90" },
  { id: "fragrance",   label: "Fragrance",     sub: "Signature scents", accent: "#C8B06A" },
  { id: "body",        label: "Body",          sub: "Head to toe",      accent: "#6A8A7A" },
  { id: "nails",       label: "Nails",         sub: "Polish & art",     accent: "#B07880" },
  { id: "devices",     label: "Devices",       sub: "Tech beauty",      accent: "#5A7A9A" },
  { id: "accessories", label: "Accessories",   sub: "Finishing touch",  accent: "#A09070" },
];

const navTabs = [
  { id: "home",    label: "Home",    icon: HomeIcon },
  { id: "scan",    label: "Scan",    icon: ScanIcon },
  { id: "routine", label: "Routine", icon: RoutineIcon },
  { id: "profile", label: "Profile", icon: ProfileIcon },
];

export default function CategoryHomeScreen({ onVanity, onProducts, onScan, onVoice, onBack }: Props) {
  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <SwanLogo size={34} />
        <div className="text-center">
          <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#0B3C26] opacity-50 mb-0.5">
            Discover
          </p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Your World</h2>
        </div>
        <button onClick={onVoice}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(11,60,38,0.06)]"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <MicIcon />
        </button>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={cat.id === "muse" ? onVanity : cat.id === "skincare" ? onScan : onProducts}
              className={`card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group relative
                ${cat.id === "muse" ? "col-span-2 h-28" : "h-36"}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse at 80% 20%, ${cat.accent}10, transparent 65%)` }} />

              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center opacity-60"
                    style={{ background: `${cat.accent}18`, border: `1px solid ${cat.accent}30` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.accent }} />
                  </div>
                  <span className="font-sans text-[8px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                    style={{ color: cat.accent }}>
                    View →
                  </span>
                </div>
                <div>
                  <p className="font-serif text-lg font-normal text-[#1C1C1C] leading-tight">{cat.label}</p>
                  <p className="font-sans text-[10px] text-[#8A8070] font-light mt-0.5">{cat.sub}</p>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-5 right-5 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}50, transparent)` }} />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {navTabs.map((tab, i) => (
            <button key={tab.id}
              onClick={i === 1 ? onScan : i === 3 ? onBack : onProducts}
              className={`nav-tab ${i === 0 ? "active" : ""}`}>
              <div className="nav-line" />
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M2 8L9 2L16 8V15C16 15.6 15.6 16 15 16H12V12H6V16H3C2.4 16 2 15.6 2 15V8Z"/>
  </svg>;
}
function ScanIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <rect x="2" y="2" width="5" height="5" rx="1"/>
    <rect x="11" y="2" width="5" height="5" rx="1"/>
    <rect x="2" y="11" width="5" height="5" rx="1"/>
    <path d="M11 12H13M13 12H16M13 12V11M13 12V16" />
  </svg>;
}
function RoutineIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <rect x="3" y="2" width="12" height="14" rx="2"/>
    <path d="M6 6H12M6 9H12M6 12H9"/>
  </svg>;
}
function ProfileIcon() {
  return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="9" cy="6" r="3"/>
    <path d="M3 16C3 13.2 5.7 11 9 11C12.3 11 15 13.2 15 16"/>
  </svg>;
}
function MicIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0B3C26" strokeWidth="1.2" strokeLinecap="round">
    <rect x="4.5" y="1" width="5" height="8" rx="2.5"/>
    <path d="M2 7.5C2 10.5 4.7 13 7 13C9.3 13 12 10.5 12 7.5"/>
    <line x1="7" y1="13" x2="7" y2="13.5"/>
  </svg>;
}
