use client";

import { useState, useEffect } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";

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
  onProfile?: () => void;
  onNotifications?: () => void;
  onMuseBox?: () => void;
  onMap?: () => void;
  onRoutine?: () => void;
}

const categories = [
  {
    id: "muse", label: "The Muse", sub: "Your curator",
    gradient: "linear-gradient(135deg, #E8D898, #C8A840, #F0E8CC)",
    accent: "#C8B06A", icon: "🦢",
  },
  {
    id: "carte", label: "La Carte", sub: "Cartographie du Raffinement",
    gradient: "linear-gradient(135deg, #D8E8D0, #88B890, #C0D8B8)",
    accent: "#0B3C26", icon: "🧭",
  },
  {
    id: "makeup", label: "Makeup", sub: "Color & beauty",
    gradient: "linear-gradient(135deg, #F0C0B0, #C87870, #E8A898)",
    accent: "#C4968A", icon: "💄",
  },
  {
    id: "skincare", label: "Skincare", sub: "Glow routines",
    gradient: "linear-gradient(135deg, #C0D8B8, #688850, #A8C890)",
    accent: "#1A5C3A", icon: "✨",
  },
  {
    id: "haircare", label: "Haircare", sub: "Lush locks",
    gradient: "linear-gradient(135deg, #E8DCC8, #C0A880, #F0E8D8)",
    accent: "#A08060", icon: "💇",
  },
  {
    id: "fragrance", label: "Fragrance", sub: "Signature scents",
    gradient: "linear-gradient(135deg, #F0E0B0, #C8A040, #E8D098)",
    accent: "#C8B06A", icon: "🌸",
  },
  {
    id: "body", label: "Body", sub: "Head to toe",
    gradient: "linear-gradient(135deg, #F0ECE4, #D8CDB8, #EAE4D8)",
    accent: "#8A7A6A", icon: "🧴",
  },
  {
    id: "nails", label: "Nails", sub: "Polish & art",
    gradient: "linear-gradient(135deg, #E8C0C8, #B06870, #D8A0A8)",
    accent: "#B07880", icon: "💅",
  },
  {
    id: "devices", label: "Devices", sub: "Tech beauty",
    gradient: "linear-gradient(135deg, #D8E0E8, #90A8B8, #C0CED8)",
    accent: "#5A7A9A", icon: "🔧",
  },
  {
    id: "accessories", label: "Accessories", sub: "Finishing touch",
    gradient: "linear-gradient(135deg, #E8E0C8, #C0B080, #EAE0C0)",
    accent: "#A09070", icon: "🎀",
  },
  {
    id: "parapharmacy", label: "Parapharmacy", sub: "Libre service",
    gradient: "linear-gradient(135deg, #E0EEE8, #88B8A0, #C0DED0)",
    accent: "#3A7A5A", icon: "🧪",
  },
  {
    id: "intimate", label: "Intimate Wellness", sub: "Care & pleasure",
    gradient: "linear-gradient(135deg, #F0D0E0, #C87898, #D8A0C0)",
    accent: "#B06880", icon: "🌿",
  },
  {
    id: "wellness", label: "Wellness", sub: "Health from within",
    gradient: "linear-gradient(135deg, #D8E8D0, #70A860, #B8D8A8)",
    accent: "#2A6A3A", icon: "🧘",
  },
  {
    id: "rituels", label: "Mes Rituels", sub: "Routines sacrées",
    gradient: "linear-gradient(135deg, #1E1030, #3D2060, #C8A840)",
    accent: "#C8B06A", icon: "🌙",
  },
];

const TIPS = [
  "Appliquez votre sérum sur peau légèrement humide pour une absorption optimale 🦢",
  "Le SPF est le seul anti-âge prouvé — ne jamais l'oublier, même en hiver 💄",
  "Massez votre contour des yeux de l'intérieur vers l'extérieur pour drainer le liquide ✨",
  "Une brosse à cheveux propre = une chevelure plus saine. Lavez-la chaque semaine 🦢",
  "Alternez vos shampooings — votre cuir chevelu s'adapte et s'équilibre 🧘",
  "L'huile de jojoba imite le sébum naturel — idéale pour tous les types de peau 🦢",
  "Dormez sur une taie en soie pour préserver votre peau et vos cheveux la nuit 💄",
];

const TOUR_STEPS = [
  {
    title: "Bienvenue dans The Muse 🦢",
    body: "Votre univers beauté commence ici. Explorez les catégories pour découvrir produits, tutoriels et adresses exclusives.",
    highlight: "grid",
    icon: "swan",
  },
  {
    title: "La Boussole Émeraude",
    body: "Appuyez sur le cygne en haut pour vos notifications. Votre guide personnel est toujours à portée de main.",
    highlight: "header",
    icon: "💄",
  },
  {
    title: "Votre Vanité",
    body: "Sauvegardez vos produits favoris dans votre Vanité. Scannez, explorez, et construisez votre collection idéale.",
    highlight: "nav",
    icon: "✨",
  },
  {
    title: "La Muse vous guide 🦢",
    body: "Ce bouton cygne flottant est votre guide personnel. Appuyez dessus à tout moment pour naviguer ou découvrir un conseil du jour.",
    highlight: "fab",
    icon: "swan",
  },
];

const navTabs = ["Home", "Scan", "Routine", "Profile"];

const FEATURED = [
  { title: "Rouge à Lèvres", sub: "Édition Automne", cat: "Makeup", gradient: "linear-gradient(135deg, #F0C0B0, #C87870, #E8A898)", accent: "#C4968A" },
  { title: "Soin du Regard", sub: "Rituel contour", cat: "Skincare", gradient: "linear-gradient(135deg, #C0D8B8, #2D7A52, #A8C890)", accent: "#2D7A52" },
  { title: "Eau de Parfum", sub: "Signature florale", cat: "Fragrance", gradient: "linear-gradient(135deg, #F0E0B0, #C8A040, #EAD898)", accent: "#C8B06A" },
  { title: "Soin Corps", sub: "Éclat et nutrition", cat: "Corps", gradient: "linear-gradient(135deg, #F0ECE4, #D8CDB8, #EAE4D8)", accent: "#8A7A6A" },
  { title: "Rituel Nocturne", sub: "Maison Verte", cat: "Ritual", gradient: "linear-gradient(135deg, #1E1030, #3D2060, #C8A840)", accent: "#C8B06A" },
];

export default function CategoryHomeScreen({
  onVanity, onProducts, onScan, onVoice, onBack,
  onInput, onEditorial, onReviews, onAccessibility, onExtension,
  onHaircare, onBody, onSearch, onWellness, onIntimate, onParapharmacy,
  onSocial, onProfile, onNotifications, onMuseBox, onMap, onRoutine,
}: Props) {
  const { showToast } = useToast();
  const [guideOpen,  setGuideOpen]  = useState(false);
  const [tourStep,   setTourStep]   = useState(-1);
  const [tourDone,   setTourDone]   = useState(false);
  const [tipIdx]                    = useState(() => Math.floor(Math.random() * TIPS.length));
  const [profileLine, setProfileLine] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("luxe-profile");
      if (stored) {
        const p = JSON.parse(stored) as { skin?: string; picks?: string[] };
        const parts: string[] = [];
        if (p.skin) parts.push(p.skin);
        if (p.picks?.length) parts.push(p.picks[0]);
        if (parts.length) setProfileLine(parts.join(" • "));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (!tourDone) setTourStep(0); }, 800);
    return () => clearTimeout(t);
  }, [tourDone]);

  const handleCatClick = (id: string) => {
    if (id === "muse")          return onVanity();
    if (id === "carte")         return onMap ? onMap() : onProducts();
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
    if (id === "rituels")       return onRoutine        ? onRoutine()        : onProducts();
    return onProducts();
  };

  const dismissTour = () => { setTourDone(true); setTourStep(-1); };

  const quickNav = [
    { icon: "💄", label: "Ma Vanité",      action: onVanity },
    { icon: "✨", label: "La Carte",       action: onMap ?? onProducts },
    { icon: "🦢", label: "Inspirations",   action: onEditorial ?? onProducts },
    { icon: "🌸", label: "Muse Box",       action: onMuseBox ?? onProducts },
    { icon: "🔧", label: "Scanner",        action: onScan },
  ];

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* ── Immersive Tour Experience ── */}
      {!tourDone && tourStep >= 0 && (
        <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center text-center px-8 satin-bg animate-in fade-in duration-700">
          
          {/* Ambient orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, rgba(200,176,106,0.4), transparent 70%)" }} />
            <div className="absolute bottom-[-5%] right-[-5%] w-[60vw] h-[60vw] rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(11,60,38,0.3), transparent 70%)" }} />
          </div>

          <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
            {/* Icon */}
            <div className="mb-10 anim-float">
              {TOUR_STEPS[tourStep].icon === "swan"
                ? <SwanLogo size={80} glow />
                : <span className="text-5xl" style={{ color: "#0B3C26" }}>{TOUR_STEPS[tourStep].icon}</span>}
            </div>

            {/* Content */}
            <div className="mb-12">
              <h2 className="font-serif text-3xl font-normal text-[#0B3C26] leading-tight mb-4">
                {TOUR_STEPS[tourStep].title}
              </h2>
              <div className="divider-gold w-12 mx-auto mb-6" />
              <p className="font-cormorant text-xl italic font-light text-[#8A8070] leading-relaxed">
                {TOUR_STEPS[tourStep].body}
              </p>
            </div>

            {/* Moon Phase Dots */}
            <div className="flex justify-center gap-2.5 mb-12">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className="transition-all duration-500"
                  style={{
                    width: i === tourStep ? "10px" : "10px",
                    height: "10px",
                    borderRadius: "50%",
                    border: "1px solid #C8B06A",
                    background: i === tourStep ? "#C8B06A" : "transparent",
                    opacity: i === tourStep ? 1 : 0.4,
                    boxShadow: i === tourStep ? "0 0 10px rgba(200,176,106,0.5)" : "none"
                  }} />
              ))}
            </div>

            {/* Actions */}
            <div className="w-full space-y-4">
              <button
                onClick={() => {
                  if (tourStep < TOUR_STEPS.length - 1) setTourStep(s => s + 1);
                  else dismissTour();
                }}
                className="btn-gold w-full py-4 rounded-full cursor-pointer text-sm tracking-widest uppercase shadow-lg">
                {tourStep < TOUR_STEPS.length - 1 ? "Continuer" : "Entrer dans l'Atelier"}
              </button>
              
              <button onClick={dismissTour}
                className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#0B3C26] opacity-30 hover:opacity-100 transition-opacity cursor-pointer">
                Passer la visite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── La Muse guide sheet ── */}
      {guideOpen && (
        <div className="fixed inset-0 z-[400] flex flex-col justify-end"
          style={{ background: "rgba(11,30,20,0.55)", backdropFilter: "blur(6px)" }}
          onClick={() => setGuideOpen(false)}>
          <div className="mx-3 mb-3 card-pearl rounded-3xl px-5 pt-5 pb-6"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 -8px 40px rgba(11,60,38,0.2)" }}>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(200,176,106,0.3), rgba(200,176,106,0.1))", border: "1px solid rgba(200,176,106,0.4)" }}>
                <SwanLogo size={20} color="#C8B06A" />
              </div>
              <div>
                <p className="font-serif text-[15px] text-[#1C1C1C]">La Muse</p>
                <p className="font-sans text-[9px] text-[#8A8070] tracking-wide">Votre guide beauté personnel</p>
              </div>
              <button onClick={() => setGuideOpen(false)}
                className="ml-auto w-7 h-7 rounded-full flex items-center justify-center cursor-pointer opacity-40 hover:opacity-80"
                style={{ border: "1px solid rgba(11,60,38,0.2)" }}>
                <span className="font-sans text-[10px]">✕</span>
              </button>
            </div>

            {/* Greeting */}
            <div className="rounded-2xl px-4 py-3 mb-4"
              style={{ background: "rgba(11,60,38,0.05)", border: "1px solid rgba(11,60,38,0.08)" }}>
              <p className="font-cormorant italic text-[14px] text-[#0B3C26] leading-relaxed">
                "Où souhaitez-vous aller aujourd'hui ?"
              </p>
            </div>

            {/* Quick nav grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quickNav.map(({ icon, label, action }) => (
                <button key={label}
                  onClick={() => { setGuideOpen(false); action?.(); }}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-2xl cursor-pointer press-scale transition-all"
                  style={{ background: "rgba(200,176,106,0.08)", border: "1px solid rgba(200,176,106,0.2)" }}>
                  <span className="font-sans text-base text-[#C8B06A]">{icon}</span>
                  <span className="font-sans text-[7px] tracking-[0.08em] text-[#5A5040] text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>

            {/* Conseil du jour */}
            <div className="divider-gold mb-3" />
            <div className="flex items-start gap-2.5">
              <span className="text-[#C8B06A] text-sm flex-shrink-0 mt-0.5">🦢</span>
              <div>
                <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#C8B06A] mb-1">Conseil du Jour</p>
                <p className="font-sans text-[10px] text-[#5A5040] leading-relaxed italic">{TIPS[tipIdx]}</p>
              </div>
            </div>

            {/* Restart tour */}
            <button
              onClick={() => { setGuideOpen(false); setTourDone(false); setTourStep(0); }}
              className="w-full mt-4 py-2 rounded-full cursor-pointer font-sans text-[8px] tracking-[0.15em] uppercase text-center transition-opacity hover:opacity-70"
              style={{ color: "rgba(11,60,38,0.4)" }}>
              Revoir la visite guidée →
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onNotifications ?? (() => {})} className="cursor-pointer">
          <SwanLogo size={30} />
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.28em] uppercase text-[#C8B06A] mb-0.5">
            {profileLine ? `🦢 ${profileLine}` : "🦢 Bienvenue, Muse"}
          </p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Votre Univers</h2>
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

      {/* ── Featured editorial strip ── */}
      <div className="px-3 mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="font-sans text-[7px] tracking-[0.22em] uppercase text-[#C8B06A]">Éditorial du Moment</p>
          <button onClick={onEditorial ?? onProducts}
            className="font-sans text-[7px] tracking-[0.15em] uppercase cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: "rgba(11,60,38,0.4)" }}>
            Tout voir →
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
          {FEATURED.map((item, i) => (
            <button key={i} onClick={onEditorial ?? onProducts}
              className="flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer press-scale relative"
              style={{ width: 128, height: 76, background: item.gradient, border: "1px solid rgba(200,176,106,0.18)" }}>
              <div className="absolute inset-0 flex flex-col justify-end p-3 text-left">
                <p className="font-sans text-[6px] tracking-[0.2em] uppercase mb-0.5" style={{ color: item.accent }}>{item.cat}</p>
                <p className="font-serif text-[12px] text-[#1C1C1C] leading-tight">{item.title}</p>
                <p className="font-sans text-[7px] text-[#5A5040] opacity-70 mt-0.5">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Category grid ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-32">
        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => handleCatClick(cat.id)}
              className={`card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group relative grid-item-anim
                ${cat.id === "muse" || cat.id === "carte" ? "col-span-2 h-24" : "h-32"}`}
              style={{ animationDelay: `${i * 0.045}s` }}
            >
              <div className="absolute inset-0" style={{ background: cat.gradient, opacity: 0.55 }} />

              <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
                <span className="text-4xl opacity-10" style={{ color: cat.accent }}>{cat.icon}</span>
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(ellipse at 80% 20%, ${cat.accent}20, transparent 60%)` }} />

              <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div>
                  {cat.id === "muse" || cat.id === "carte" ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-[7px] tracking-[0.25em] uppercase mb-0.5" style={{ color: cat.accent }}>
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

              <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${cat.accent}60, transparent)` }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Floating Swan FAB ── */}
      <div className="fixed bottom-[76px] left-0 right-0 flex justify-center z-30 pointer-events-none">
        <button
          onClick={() => setGuideOpen(g => !g)}
          className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center cursor-pointer press-scale transition-all duration-300"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,252,248,0.98), rgba(240,235,218,0.92), rgba(220,210,185,0.88))",
            boxShadow: guideOpen
              ? "0 0 0 3px rgba(200,176,106,0.5), 0 8px 32px rgba(200,176,106,0.4), 0 2px 8px rgba(11,60,38,0.15)"
              : "0 0 0 1.5px rgba(200,176,106,0.35), 0 6px 24px rgba(11,60,38,0.18), 0 2px 8px rgba(200,176,106,0.2)",
            border: "1px solid rgba(200,176,106,0.4)",
          }}>
          <SwanLogo size={26} color="#C8B06A" />
        </button>
      </div>

      {/* ── Bottom nav ── */}
      <div className="panel-bottom fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {navTabs.map((tab, i) => (
            <button key={tab}
              onClick={i === 0 ? () => {} : i === 1 ? onScan : i === 2 ? (onRoutine ?? onProducts) : (onProfile ?? onSocial ?? onBack)}
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
