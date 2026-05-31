"use client";

import { SwanLogo } from "./LandingScreen";

interface Props {
  onVanity: () => void;
  onProducts: () => void;
  onScan: () => void;
  onVoice: () => void;
  onBack: () => void;
  onInput?: () => void;
  onEditorial?: () => void;
  onReviews?: () => void;
  onAccessibility?: () => void;
  onExtension?: () => void;
  onHaircare?: () => void;
  onBody?: () => void;
  onSearch?: () => void;
  onWellness?: () => void;
  onIntimate?: () => void;
  onParapharmacy?: () => void;
  onSocial?: () => void;
  onNotifications?: () => void;
}

const categories = [
  {
    id: "muse", label: "The Muse", sub: "Your curator",
    gradient: "linear-gradient(135deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A", icon: "✦",
  },
  {
    id: "makeup", label: "Makeup", sub: "Color & beauty",
    gradient: "linear-gradient(135deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A", icon: "◈",
  },
  {
    id: "skincare", label: "Skincare", sub: "Glow routines",
    gradient: "linear-gradient(135deg, #C0D8B0, #688850, #A8C890)",
    accent: "#1A5C3A", icon: "◇",
  },
  {
    id: "haircare", label: "Haircare", sub: "Lush locks",
    gradient: "linear-gradient(135deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060", icon: "〜",
  },
  {
    id: "fragrance", label: "Fragrance", sub: "Signature scents",
    gradient: "linear-gradient(135deg, #F0E0B0, #C8A040, #E8D098)",
    accent: "#C8B06A", icon: "○",
  },
  {
    id: "body", label: "Body", sub: "Head to toe",
    gradient: "linear-gradient(135deg, #F0ECE4, #D8CDB8, #EAE4D8)",
    accent: "#8A7A6A", icon: "◯",
  },
  {
    id: "nails", label: "Nails", sub: "Polish & art",
    gradient: "linear-gradient(135deg, #E8C0C8, #B06870, #D8A0A8)",
    accent: "#B07880", icon: "◆",
  },
  {
    id: "devices", label: "Devices", sub: "Tech beauty",
    gradient: "linear-gradient(135deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A", icon: "⊞",
  },
  {
    id: "accessories", label: "Accessories", sub: "Finishing touch",
    gradient: "linear-gradient(135deg, #E8E0C8, #C0B080, #EAE0C0)",
    accent: "#A09070", icon: "◇",
  },
  {
    id: "parapharmacy", label: "Parapharmacy", sub: "Libre service",
    gradient: "linear-gradient(135deg, #E0EEE8, #88B8A0, #C0DED0)",
    accent: "#3A7A5A", icon: "✚",
  },
  {
    id: "intimate", label: "Intimate Wellness", sub: "Care & pleasure",
    gradient: "linear-gradient(135deg, #F0D0E0, #C87898, #D8A0C0)",
    accent: "#B06880", icon: "◯",
  },
  {
    id: "wellness", label: "Wellness", sub: "Health from within",
    gradient: "linear-gradient(135deg, #D8E8D0, #70A860, #B8D8A8)",
    accent: "#2A6A3A", icon: "◈",
  },
];

const navTabs = ["Home", "Scan", "Routine", "Profile"];

export default function CategoryHomeScreen({
  onVanity, onProducts, onScan, onVoice, onBack,
  onInput, onEditorial, onReviews, onAccessibility, onExtension,
  onHaircare, onBody, onSearch, onWellness, onIntimate, onParapharmacy,
  onSocial, onNotifications,
}: Props) {
  const handleCatClick = (id: string) => {
    if (id === "muse")          return onVanity();
    if (id === "skincare")      return onScan();
    if (id === "makeup")        return onEditorial      ? onEditorial()      : onProducts();
    if (id === "fragrance")     return onReviews        ? onReviews()        : onProducts();
    if (id === "devices")       return onExtension      ? onExtension()      : onProducts();
    if (id === "accessories")   return onAccessibility  ? onAccessibility()  : onProducts();
    if (id === "haircare")      return onHaircare       ? onHaircare()       : onProducts();
    if (id === "body")          return onBody           ? onBody()           : onProducts();
    if (id === "wellness")      return onWellness       ? onWellness()       : onProducts();
    if (id === "intimate")      return onIntimate       ? onIntimate()       : onProducts();
    if (id === "parapharmacy")  return onParapharmacy   ? onParapharmacy()   : onProducts();
    return onProducts();
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onNotifications ?? (() => {})} className="cursor-pointer">
          <SwanLogo size={30} />
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">
            Discover
          </p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Your World</h2>
        </div>
        <button onClick={onSearch || onInput || onScan}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(11,60,38,0.06)]"
          style={{ border: "1px solid rgba(11,60,38,0.12)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#0B3C26" strokeWidth="1.2" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M11 11L14 14" />
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-3" />

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-24">
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => handleCatClick(cat.id)}
              className={`card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group relative
                ${cat.id === "muse" ? "col-span-2 h-24" : "h-32"}`}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              {/* Gradient background image */}
              <div className="absolute inset-0"
                style={{ background: cat.gradient, opacity: 0.55 }} />

              {/* Product icon/pattern overlay */}
              <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
                <span className="text-4xl opacity-10" style={{ color: cat.accent }}>
                  {cat.icon}
                </span>
              </div>

              {/* Hover accent */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse at 80% 20%, ${cat.accent}20, transparent 60%)` }} />

              {/* Content */}
              <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div>
                  {cat.id === "muse" ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[7px] tracking-[0.25em] uppercase mb-0.5"
                          style={{ color: cat.accent }}>
                          {cat.sub}
                        </p>
                        <p className="font-serif text-xl font-normal text-[#1C1C1C]">{cat.label}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: `${cat.accent}20`, border: `1px solid ${cat.accent}40` }}>
                        <span className="text-xs" style={{ color: cat.accent }}>{cat.icon}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mb-2"
                        style={{ background: `${cat.accent}20`, border: `1px solid ${cat.accent}30` }}>
                        <span className="text-[9px]" style={{ color: cat.accent }}>{cat.icon}</span>
                      </div>
                      <p className="font-sans text-[7px] tracking-[0.15em] uppercase mb-0.5 opacity-60"
                        style={{ color: cat.accent }}>
                        {cat.sub}
                      </p>
                      <p className="font-serif text-base font-normal text-[#1C1C1C] leading-tight">{cat.label}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)` }} />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {navTabs.map((tab, i) => (
            <button key={tab}
              onClick={i === 0 ? () => {} : i === 1 ? onScan : i === 3 ? (onSocial ?? onBack) : onProducts}
              className={`nav-tab ${i === 0 ? "active" : ""}`}>
              <div className="nav-line" />
              <NavIcon idx={i} />
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavIcon({ idx }: { idx: number }) {
  if (idx === 0) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <path d="M2 8L9 2L16 8V15C16 15.6 15.6 16 15 16H12V12H6V16H3C2.4 16 2 15.6 2 15V8Z" />
    </svg>
  );
  if (idx === 1) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="11" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="11" width="5" height="5" rx="1" />
      <path d="M11 12H13M13 12H16M13 12V11M13 12V16" />
    </svg>
  );
  if (idx === 2) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 6H12M6 9H12M6 12H9" />
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="9" cy="6" r="3" />
      <path d="M3 16C3 13.2 5.7 11 9 11C12.3 11 15 13.2 15 16" />
    </svg>
  );
}
