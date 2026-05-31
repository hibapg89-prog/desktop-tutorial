"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; onVanity?: () => void; onProfile?: () => void; }

// ─── Location data ──────────────────────────────────────────────────────────────

interface Location {
  id: string; name: string; type: string; since: string;
  address: string; description: string;
  gradient: string; accent: string; emoji: string;
  x: string; y: string; rotation: number;
  circleRecommended: boolean; hiddenGem: boolean;
  exclusive: string;
  communityNotes: string[];
}

const LOCATIONS: Location[] = [
  {
    id: "rosedale", name: "The Rosedale Retreat", type: "Spa", since: "Est. 1920",
    address: "12 Rue de la Paix, 1er",
    description: "Un spa privé aux méthodes héritées des grands instituts parisiens du début du siècle.",
    gradient: "linear-gradient(145deg, #0B3C26, #1A5C3A, #2D7A52)",
    accent: "#2A7A4A", emoji: "🌿", x: "14%", y: "22%", rotation: -4,
    circleRecommended: true, hiddenGem: false,
    exclusive: "Soin Signature The Muse — 90 min — Accès membres",
    communityNotes: ["Ambiance incroyable, on s'y sent royale 💎", "Demandez le massage aux pierres chaudes"],
  },
  {
    id: "maison", name: "Maison de Beauté", type: "Institut", since: "Est. 2008",
    address: "45 Avenue des Fleurs, 8ème",
    description: "L'adresse incontournable pour les soins du visage haute couture de la saison.",
    gradient: "linear-gradient(145deg, #3A1A2A, #6A3A5A, #9A6A8A)",
    accent: "#C4968A", emoji: "✨", x: "62%", y: "16%", rotation: 3,
    circleRecommended: true, hiddenGem: false,
    exclusive: "Facial Lumière — Protocole exclusif The Muse 60 min",
    communityNotes: ["La meilleure esthéticienne de la ville 🌸", "Réservez 3 semaines à l'avance"],
  },
  {
    id: "atelier", name: "Atelier Lumière", type: "Coiffeur", since: "Est. 2015",
    address: "7 Passage des Artistes, 3ème",
    description: "Salon confidentiel spécialisé en colorations végétales et coupes architecturales.",
    gradient: "linear-gradient(145deg, #2A2A1A, #5A5A2A, #9A8A3A)",
    accent: "#C8B06A", emoji: "🎨", x: "40%", y: "50%", rotation: -2,
    circleRecommended: false, hiddenGem: true,
    exclusive: "Consultation Couleur The Muse — 30 min offerts",
    communityNotes: ["Un trésor caché 🎨", "Colorations végétales qui tiennent parfaitement"],
  },
  {
    id: "pharmacie", name: "La Pharmacie Royale", type: "Parapharmacie", since: "Est. 1887",
    address: "3 Place du Palais, 1er",
    description: "Pharmacie historique avec des préparations magistrales et des soins sur-mesure.",
    gradient: "linear-gradient(145deg, #1A2A2A, #2A4A5A, #3A6A8A)",
    accent: "#4A8AB8", emoji: "⚗️", x: "70%", y: "58%", rotation: 5,
    circleRecommended: false, hiddenGem: true,
    exclusive: "Préparation magistrale sur-mesure — Sur ordonnance The Muse",
    communityNotes: ["Le pharmacien est un génie 💊", "Les crèmes magistrales valent le détour"],
  },
  {
    id: "studio", name: "Studio Éclat", type: "Maquillage", since: "Est. 2019",
    address: "28 Rue Dorée, 11ème",
    description: "Studio indépendant de maquillage artistique — sessions privées uniquement.",
    gradient: "linear-gradient(145deg, #2A1A2A, #4A2A5A, #7A4A8A)",
    accent: "#9A70B8", emoji: "💜", x: "24%", y: "68%", rotation: -6,
    circleRecommended: true, hiddenGem: true,
    exclusive: "Session Signature 2h — Membres Lumière uniquement",
    communityNotes: ["Une artiste incroyable ✦", "Le résultat dépasse toutes les attentes"],
  },
  {
    id: "sanctuaire", name: "Le Sanctuaire Muse", type: "Spa VIP", since: "The Muse Exclusive",
    address: "1 Allée du Mystère — Sur invitation",
    description: "L'adresse la plus exclusive de notre réseau. Accessible aux membres Lumière uniquement.",
    gradient: "linear-gradient(145deg, #0B3C26, #1A5C3A, #C8B06A)",
    accent: "#C8B06A", emoji: "✦", x: "50%", y: "32%", rotation: 1,
    circleRecommended: true, hiddenGem: false,
    exclusive: "L'Expérience Muse Totale — Sur réservation privée",
    communityNotes: ["✦ Unique au monde ✦", "Une expérience qui change la vie"],
  },
];

const FILTERS = ["Tous", "Spa", "Institut", "Coiffeur", "Parapharmacie", "Maquillage"];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function BeautyMapScreen({ onBack, onVanity, onProfile }: Props) {
  const { showToast } = useToast();
  const [filter,       setFilter]      = useState("Tous");
  const [selected,     setSelected]    = useState<Location | null>(null);
  const [flipped,      setFlipped]     = useState(false);
  const [hiddenGems,   setHiddenGems]  = useState(false);
  const [stamped,      setStamped]     = useState<Set<string>>(new Set());
  const [concierge,    setConcierge]   = useState(false);
  const [chatMsg,      setChatMsg]     = useState("");
  const [chatSent,     setChatSent]    = useState(false);

  const visible = LOCATIONS.filter(l => {
    if (hiddenGems && !l.hiddenGem) return false;
    if (filter !== "Tous" && l.type !== filter) return false;
    return true;
  });

  const handlePin = (loc: Location) => {
    setSelected(loc);
    setFlipped(false);
  };

  const handleStamp = () => {
    if (!selected) return;
    setStamped(s => { const n = new Set(s); n.add(selected.id); return n; });
    showToast(`${selected.name} tamponné dans votre Journal ✦`, "📍");
    if (onProfile) setTimeout(() => showToast("Distinction débloquée : Exploratrice ✦", "💎"), 1200);
  };

  const handleConciergeMsg = () => {
    if (!chatMsg.trim()) return;
    setChatSent(true);
    setChatMsg("");
    showToast("Message envoyé au Concierge ✦", "✦");
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: "#F5EDD8" }}>

      <style>{`
        @keyframes mapUnfold {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pinDrop {
          0%   { transform: translateY(-12px) scale(0.8); opacity: 0; }
          60%  { transform: translateY(3px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes flipCard {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
        .map-canvas { animation: mapUnfold 0.5s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .pin-anim   { animation: pinDrop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sheet-up   { animation: sheetUp 0.38s cubic-bezier(0.34,1.2,0.64,1) both; }
        .flip-inner { transition: transform 0.5s ease; transform-style: preserve-3d; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .flip-back { transform: rotateY(180deg); }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(245,237,216,0.95)", borderBottom: "1px solid rgba(184,168,120,0.3)" }}>
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: "#5A4A28" }}>
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[7px] tracking-[0.35em] uppercase mb-0.5" style={{ color: "#8A7848" }}>
            Cartographie du Raffinement
          </p>
          <h2 className="font-serif text-lg font-normal" style={{ color: "#2A1E0A" }}>Luxury Beauty Services</h2>
        </div>

        {/* Hidden Gems toggle */}
        <button
          onClick={() => { setHiddenGems(h => !h); setSelected(null); }}
          className="flex flex-col items-center gap-0.5 cursor-pointer press-scale transition-all"
          style={{ opacity: hiddenGems ? 1 : 0.45 }}>
          <span className="text-base" style={{ color: "#C8B06A" }}>◈</span>
          <span className="font-sans text-[6px] tracking-[0.1em] uppercase" style={{ color: hiddenGems ? "#C8B06A" : "#8A7848" }}>
            Gems
          </span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-2.5 flex-shrink-0 overflow-x-auto no-scrollbar flex gap-2"
        style={{ borderBottom: "1px solid rgba(184,168,120,0.2)" }}>
        {FILTERS.map(f => (
          <button key={f}
            onClick={() => { setFilter(f); setSelected(null); }}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full cursor-pointer press-scale font-sans text-[8px] tracking-[0.1em] uppercase transition-all duration-200"
            style={{
              background: filter === f ? "#0B3C26" : "rgba(184,168,120,0.2)",
              color: filter === f ? "rgba(240,232,204,0.95)" : "#5A4A28",
              border: `1px solid ${filter === f ? "#0B3C26" : "rgba(184,168,120,0.4)"}`,
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* ── Parchment Map ── */}
      <div className="flex-1 relative overflow-hidden map-canvas" style={{ minHeight: "320px" }}>

        {/* SVG street map */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice">
          {/* Parchment base */}
          <rect width="400" height="520" fill="#F5EDD8" />
          {/* Subtle aged texture */}
          <rect width="400" height="520" fill="url(#parchmentNoise)" opacity="0.04" />
          <defs>
            <pattern id="parchmentNoise" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="2" height="2" fill="#8A7848" opacity="0.3" />
              <rect x="2" y="2" width="2" height="2" fill="#8A7848" opacity="0.15" />
            </pattern>
          </defs>

          {/* Main avenues */}
          <line x1="0" y1="140" x2="400" y2="140" stroke="#B8A878" strokeWidth="2.5" />
          <line x1="0" y1="260" x2="400" y2="260" stroke="#B8A878" strokeWidth="3" />
          <line x1="0" y1="380" x2="400" y2="380" stroke="#B8A878" strokeWidth="2" />
          <line x1="100" y1="0" x2="100" y2="520" stroke="#B8A878" strokeWidth="2" />
          <line x1="220" y1="0" x2="220" y2="520" stroke="#B8A878" strokeWidth="2.5" />
          <line x1="330" y1="0" x2="330" y2="520" stroke="#B8A878" strokeWidth="2" />

          {/* Secondary streets */}
          <line x1="0" y1="80" x2="400" y2="80" stroke="#C8B878" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#C8B878" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="320" x2="400" y2="320" stroke="#C8B878" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="440" x2="400" y2="440" stroke="#C8B878" strokeWidth="1" opacity="0.6" />
          <line x1="55" y1="0" x2="55" y2="520" stroke="#C8B878" strokeWidth="1" opacity="0.5" />
          <line x1="160" y1="0" x2="160" y2="520" stroke="#C8B878" strokeWidth="1" opacity="0.5" />
          <line x1="280" y1="0" x2="280" y2="520" stroke="#C8B878" strokeWidth="1" opacity="0.5" />
          <line x1="370" y1="0" x2="370" y2="520" stroke="#C8B878" strokeWidth="1" opacity="0.5" />

          {/* Diagonal "grande avenue" */}
          <line x1="0" y1="180" x2="160" y2="80" stroke="#B8A878" strokeWidth="1.5" opacity="0.8" />
          <line x1="240" y1="300" x2="400" y2="200" stroke="#B8A878" strokeWidth="1.5" opacity="0.8" />

          {/* City blocks */}
          <rect x="102" y="142" width="56" height="56" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="162" y="82" width="56" height="56" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="222" y="142" width="56" height="116" fill="rgba(184,168,120,0.08)" rx="2" />
          <rect x="102" y="262" width="116" height="56" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="332" y="142" width="56" height="116" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="56" y="382" width="42" height="56" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="162" y="382" width="56" height="56" fill="rgba(184,168,120,0.1)" rx="2" />
          <rect x="282" y="382" width="46" height="56" fill="rgba(184,168,120,0.1)" rx="2" />

          {/* Street labels */}
          <text x="200" y="254" fontFamily="serif" fontSize="8" fill="#8A7848" textAnchor="middle" opacity="0.8">
            Avenue du Raffinement
          </text>
          <text x="220" y="276" fontFamily="serif" fontSize="7" fill="#8A7848" textAnchor="middle" opacity="0.6" transform="rotate(90,220,276)">
            Rue de la Beauté
          </text>
          <text x="100" y="134" fontFamily="serif" fontSize="7" fill="#8A7848" textAnchor="middle" opacity="0.6" transform="rotate(90,100,134)">
            Boulevard Lumière
          </text>
          <text x="200" y="72" fontFamily="serif" fontSize="7" fill="#8A7848" textAnchor="middle" opacity="0.6">
            Rue des Fleurs
          </text>

          {/* Decorative border */}
          <rect x="6" y="6" width="388" height="508" fill="none" stroke="#B8A878" strokeWidth="1" opacity="0.4" rx="2" />
          <rect x="10" y="10" width="380" height="500" fill="none" stroke="#B8A878" strokeWidth="0.5" opacity="0.25" rx="1" />

          {/* Title cartouche */}
          <rect x="130" y="460" width="140" height="44" fill="rgba(245,237,216,0.9)" rx="4" stroke="#B8A878" strokeWidth="0.8" />
          <text x="200" y="476" fontFamily="serif" fontSize="7" fill="#8A7848" textAnchor="middle" opacity="0.7">Cartography of Refinement</text>
          <text x="200" y="490" fontFamily="serif" fontSize="6" fill="#8A7848" textAnchor="middle" opacity="0.5">Luxury Beauty Services</text>

          {/* Compass rose — top right */}
          <g transform="translate(358, 52)">
            <circle cx="0" cy="0" r="22" fill="rgba(245,237,216,0.95)" stroke="#B8A878" strokeWidth="1" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#B8A878" strokeWidth="0.5" opacity="0.5" />
            {/* Cardinal points */}
            <polygon points="0,-20 3,-8 0,-12 -3,-8" fill="#0B3C26" opacity="0.8" />
            <polygon points="0,20 3,8 0,12 -3,8" fill="#8A7848" opacity="0.6" />
            <polygon points="-20,0 -8,-3 -12,0 -8,3" fill="#8A7848" opacity="0.6" />
            <polygon points="20,0 8,-3 12,0 8,3" fill="#8A7848" opacity="0.6" />
            {/* Emerald jewel center */}
            <circle cx="0" cy="0" r="5" fill="#0B3C26" />
            <circle cx="0" cy="0" r="3" fill="#2A7A4A" opacity="0.8" />
            <circle cx="-1" cy="-1" r="1" fill="rgba(255,255,255,0.5)" />
            {/* N label */}
            <text x="0" y="-24" fontFamily="serif" fontSize="7" fill="#0B3C26" textAnchor="middle" fontWeight="bold">N</text>
          </g>
        </svg>

        {/* Location pins */}
        {visible.map((loc, i) => (
          <button
            key={loc.id}
            onClick={() => handlePin(loc)}
            className="absolute cursor-pointer press-scale pin-anim"
            style={{
              left: loc.x, top: loc.y,
              transform: `rotate(${loc.rotation}deg)`,
              animationDelay: `${i * 0.07}s`,
              zIndex: selected?.id === loc.id ? 10 : 1,
            }}>
            {/* Polaroid card */}
            <div className="relative"
              style={{
                width: "68px",
                background: "rgba(255,253,248,0.97)",
                boxShadow: selected?.id === loc.id
                  ? `0 6px 20px rgba(0,0,0,0.3), 0 0 0 2px ${loc.accent}`
                  : "0 3px 10px rgba(0,0,0,0.2)",
                borderRadius: "3px",
                padding: "4px 4px 10px",
              }}>
              {/* Photo area */}
              <div className="w-full rounded-sm overflow-hidden flex items-center justify-center relative"
                style={{ height: "50px", background: loc.gradient }}>
                <span className="text-xl opacity-40">{loc.emoji}</span>
                {/* Stamp overlay */}
                {stamped.has(loc.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center rotate-[-15deg] opacity-80"
                      style={{ borderColor: "#C8B06A", color: "#C8B06A" }}>
                      <span className="font-sans text-[8px] font-bold">✦</span>
                    </div>
                  </div>
                )}
                {/* Circle badge */}
                {loc.circleRecommended && (
                  <div className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ background: "#C4968A", border: "1px solid white" }}>
                    <span className="font-sans text-[5px] text-white">◈</span>
                  </div>
                )}
                {/* Hidden gem badge */}
                {loc.hiddenGem && (
                  <div className="absolute top-1 left-1 w-3 h-3 rounded-full flex items-center justify-center"
                    style={{ background: "#C8B06A", border: "1px solid white" }}>
                    <span className="font-sans text-[5px] text-white">✦</span>
                  </div>
                )}
              </div>
              {/* Caption */}
              <p className="font-sans text-center leading-tight mt-1"
                style={{ fontSize: "5px", color: "#5A4A28", letterSpacing: "0.05em" }}>
                {loc.name.split(" ").slice(0, 3).join(" ")}
              </p>
            </div>
          </button>
        ))}

        {/* Hidden Gems mode overlay hint */}
        {hiddenGems && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(200,176,106,0.9)", backdropFilter: "blur(8px)" }}>
            <span className="font-sans text-[8px] tracking-[0.12em] uppercase text-white">◈ Mode Hidden Gems</span>
          </div>
        )}
      </div>

      {/* ── Selected location panel ── */}
      {selected && (
        <div className="flex-shrink-0 sheet-up"
          style={{ background: "#FAF7F2", borderTop: "1px solid rgba(184,168,120,0.4)" }}>

          <div style={{ perspective: "1000px" }} className="mx-4 mt-4 mb-3">
            <div className={`flip-inner relative ${flipped ? "flipped" : ""}`}
              style={{ height: "180px" }}>

              {/* ── Card Front ── */}
              <div className="flip-front absolute inset-0 rounded-2xl overflow-hidden"
                style={{ background: selected.gradient }}>
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-[7px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${selected.accent}CC`, color: "white" }}>
                          {selected.type}
                        </span>
                        <span className="font-sans text-[7px] text-white opacity-70">{selected.since}</span>
                      </div>
                      <h3 className="font-serif text-[17px] text-white leading-tight">{selected.name}</h3>
                      <p className="font-sans text-[8px] text-white opacity-70 mt-0.5">{selected.address}</p>
                    </div>
                    <button onClick={() => setFlipped(true)}
                      className="flex-shrink-0 px-2.5 py-1.5 rounded-full cursor-pointer press-scale font-sans text-[7px] tracking-[0.1em] uppercase"
                      style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(8px)" }}>
                      Avis ✦
                    </button>
                  </div>
                </div>
                {/* Stamp if visited */}
                {stamped.has(selected.id) && (
                  <div className="absolute top-3 right-3 w-10 h-10 rounded-full border-2 flex items-center justify-center rotate-[-12deg]"
                    style={{ borderColor: "#C8B06A", background: "rgba(200,176,106,0.15)" }}>
                    <span className="font-serif text-[10px]" style={{ color: "#C8B06A" }}>✦</span>
                  </div>
                )}
              </div>

              {/* ── Card Back ── */}
              <div className="flip-back absolute inset-0 rounded-2xl overflow-hidden card-pearl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A]">Community Notes</p>
                  <button onClick={() => setFlipped(false)}
                    className="font-sans text-[8px] text-[#0B3C26] opacity-40 cursor-pointer">← Retour</button>
                </div>
                {selected.communityNotes.map((note, i) => (
                  <p key={i} className="font-sans text-[10px] text-[#5A5040] leading-relaxed mb-1.5">"{note}"</p>
                ))}
                <div className="mt-3 p-2.5 rounded-xl"
                  style={{ background: "rgba(200,176,106,0.1)", border: "1px solid rgba(200,176,106,0.3)" }}>
                  <p className="font-sans text-[7px] tracking-[0.15em] uppercase text-[#C8B06A] mb-1">✦ Exclusif The Muse</p>
                  <p className="font-sans text-[9px] text-[#1C1C1C] leading-relaxed">{selected.exclusive}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="font-sans text-[10px] text-[#8A8070] leading-relaxed mx-4 mb-3 line-clamp-2">
            {selected.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2.5 mx-4 mb-4">
            <button
              onClick={handleStamp}
              className="flex-1 py-2.5 rounded-full cursor-pointer press-scale font-sans text-[8px] tracking-[0.12em] uppercase transition-all duration-200"
              style={{
                background: stamped.has(selected.id) ? "rgba(200,176,106,0.15)" : "transparent",
                border: `1px solid ${stamped.has(selected.id) ? "#C8B06A" : "rgba(11,60,38,0.2)"}`,
                color: stamped.has(selected.id) ? "#C8B06A" : "rgba(11,60,38,0.6)",
              }}>
              {stamped.has(selected.id) ? "✦ Visité" : "📍 J'y suis allée"}
            </button>
            <button
              onClick={() => { setConcierge(true); setChatSent(false); }}
              className="flex-1 py-2.5 rounded-full cursor-pointer press-scale btn-emerald font-sans text-[8px] tracking-[0.12em] uppercase">
              Book via Concierge
            </button>
          </div>

          {/* Close */}
          <button onClick={() => setSelected(null)}
            className="w-full pb-3 font-sans text-[8px] tracking-[0.12em] uppercase text-center cursor-pointer opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "#5A4A28" }}>
            ✕ Fermer
          </button>
        </div>
      )}

      {/* ── Concierge chat overlay ── */}
      {concierge && (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end"
          style={{ background: "rgba(11,30,20,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setConcierge(false)}>
          <div className="mx-3 mb-3 rounded-3xl overflow-hidden"
            style={{ background: "#FAF7F2", boxShadow: "0 -8px 40px rgba(11,60,38,0.25)" }}
            onClick={e => e.stopPropagation()}>

            {/* Chat header */}
            <div className="px-5 pt-5 pb-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(200,176,106,0.2)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(200,176,106,0.3), rgba(200,176,106,0.1))", border: "1px solid rgba(200,176,106,0.4)" }}>
                <SwanLogo size={20} color="#C8B06A" />
              </div>
              <div className="flex-1">
                <p className="font-serif text-[14px] text-[#1C1C1C]">Concierge The Muse</p>
                <p className="font-sans text-[8px] text-[#C8B06A] tracking-wide">● En ligne — Prêt à réserver</p>
              </div>
              <button onClick={() => setConcierge(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer opacity-40"
                style={{ border: "1px solid rgba(11,60,38,0.2)" }}>
                <span className="font-sans text-[10px]">✕</span>
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 space-y-3" style={{ minHeight: "130px" }}>
              {/* Concierge message */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(200,176,106,0.2)" }}>
                  <span className="font-sans text-[8px] text-[#C8B06A]">✦</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]"
                  style={{ background: "rgba(11,60,38,0.07)" }}>
                  <p className="font-sans text-[10px] text-[#1C1C1C] leading-relaxed">
                    Bonjour, je suis votre Concierge The Muse ✦ Je prends en charge votre réservation chez{" "}
                    <span className="font-medium" style={{ color: "#0B3C26" }}>
                      {selected?.name ?? "cet établissement"}
                    </span>. Quelle date vous conviendrait ?
                  </p>
                </div>
              </div>

              {chatSent && (
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%]"
                    style={{ background: "#0B3C26" }}>
                    <p className="font-sans text-[10px] text-[rgba(240,232,204,0.9)] leading-relaxed">
                      Message envoyé ✦
                    </p>
                  </div>
                </div>
              )}

              {chatSent && (
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(200,176,106,0.2)" }}>
                    <span className="font-sans text-[8px] text-[#C8B06A]">✦</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]"
                    style={{ background: "rgba(11,60,38,0.07)" }}>
                    <p className="font-sans text-[10px] text-[#1C1C1C] leading-relaxed">
                      Parfait ✦ Je vous confirme une disponibilité sous 24h. Vous recevrez une notification de La Muse dès confirmation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {!chatSent && (
              <div className="px-4 pb-5 pt-2 flex gap-2.5 items-center"
                style={{ borderTop: "1px solid rgba(200,176,106,0.15)" }}>
                <input
                  type="text"
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleConciergeMsg()}
                  placeholder="Votre message au Concierge..."
                  className="flex-1 py-2.5 px-4 rounded-full font-sans text-[11px] text-[#1C1C1C] placeholder:text-[#C0B8A8] outline-none"
                  style={{ background: "rgba(255,253,250,0.9)", border: "1px solid rgba(200,176,106,0.28)" }}
                />
                <button
                  onClick={handleConciergeMsg}
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer press-scale flex-shrink-0"
                  style={{ background: "#0B3C26" }}>
                  <svg width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="rgba(240,232,204,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 6H13M8 1L13 6L8 11" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
