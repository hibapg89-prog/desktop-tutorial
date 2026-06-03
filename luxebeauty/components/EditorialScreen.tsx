"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

interface Props {
  onBack: () => void;
  onTutorial?: (id: string) => void;
}

const TABS = ["Makeup", "Skincare", "Hair", "Wellness"];

const CARDS = [
  { id: "t1", tab: "Makeup", title: "Smokey Monica Bellucci Inspired", category: "Tutorial",
    difficulty: "Intermediate", duration: 10, emoji: "👁️", saves: 847,
    gradient: "linear-gradient(145deg, #1A1A2E, #3A2A5A, #6A4A8A)", accent: "#9A70B8",
    creator: "Valentina Ricci", handle: "@valentina.mua", platform: "instagram" },
  { id: "t2", tab: "Makeup", title: "No-Makeup Luminous Glow", category: "How-To",
    difficulty: "Beginner", duration: 12, emoji: "✨", saves: 1203,
    gradient: "linear-gradient(145deg, #2A1A14, #5A3A2A, #C4968A)", accent: "#C4968A",
    creator: "Clémentine Sao", handle: "@clementine.glow", platform: "tiktok" },
  { id: "t3", tab: "Skincare", title: "Glass Skin 5-Step Ritual", category: "Routine",
    difficulty: "Beginner", duration: 15, emoji: "💧", saves: 2156,
    gradient: "linear-gradient(145deg, #0B3C26, #1A5C3A, #2D7A52)", accent: "#C8B06A",
    creator: "Yuna Choi", handle: "@yuna.skn", platform: "instagram" },
  { id: "t4", tab: "Skincare", title: "Retinol Evening Routine", category: "Advanced",
    difficulty: "Intermediate", duration: 20, emoji: "🌙", saves: 1845,
    gradient: "linear-gradient(145deg, #1A1A3A, #2A2A5A, #3A3A6A)", accent: "#A0A8D0",
    creator: "Dr. Amélie Fontaine", handle: "@dr.amelie.skin", platform: "instagram" },
  { id: "t5", tab: "Hair", title: "Curtain Bangs Blowout", category: "Style",
    difficulty: "Intermediate", duration: 20, emoji: "💨", saves: 934,
    gradient: "linear-gradient(145deg, #3A2A1A, #6A5A3A, #A09060)", accent: "#C8B06A",
    creator: "Isabelle Morel", handle: "@isabellecoiffure", platform: "tiktok" },
  { id: "t6", tab: "Hair", title: "Balayage at Home", category: "Colour",
    difficulty: "Expert", duration: 45, emoji: "🎨", saves: 2388,
    gradient: "linear-gradient(145deg, #2A1A0A, #5A3A1A, #8A6A3A)", accent: "#D4A060",
    creator: "Gabrielle Audet", handle: "@gabacolorist", platform: "youtube" },
  { id: "t7", tab: "Makeup", title: "French Manicure Moderne", category: "Classic",
    difficulty: "Beginner", duration: 25, emoji: "💅", saves: 1102,
    gradient: "linear-gradient(145deg, #3A1A1A, #6A3A4A, #B07890)", accent: "#C4968A",
    creator: "Naomi Park", handle: "@naominails_", platform: "instagram" },
  { id: "t8", tab: "Makeup", title: "Gel Soak-Off & Nail Rehab", category: "Care",
    difficulty: "Beginner", duration: 30, emoji: "🌸", saves: 788,
    gradient: "linear-gradient(145deg, #2A1A2A, #4A2A4A, #8A5A7A)", accent: "#D4A0C0",
    creator: "Léa Brun", handle: "@leamanicure", platform: "tiktok" },
  { id: "t9", tab: "Wellness", title: "Silk Body Oil Ritual", category: "Ritual",
    difficulty: "Beginner", duration: 10, emoji: "🌿", saves: 1567,
    gradient: "linear-gradient(145deg, #1A2A1A, #2A5A2A, #4A8A4A)", accent: "#C8B06A",
    creator: "Priya Sharma", handle: "@priyabodyritual", platform: "instagram" },
  { id: "t10", tab: "Wellness", title: "Dry Brush Detox Morning", category: "Ritual",
    difficulty: "Beginner", duration: 15, emoji: "✦", saves: 923,
    gradient: "linear-gradient(145deg, #2A1A0A, #5A3A2A, #8A6A4A)", accent: "#C8B06A",
    creator: "Emma Delacroix", handle: "@emmadelacroix.wellness", platform: "youtube" },
];

const COVER_H = [152, 136, 168, 144, 160, 132, 156, 140, 164, 138];

const DIFF_DOT: Record<string, string> = {
  Beginner: "#2A7A4A",
  Intermediate: "#C8B06A",
  Expert: "#C4968A",
};

export default function EditorialScreen({ onBack, onTutorial }: Props) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab]  = useState("Makeup");
  const [savedIds,  setSavedIds]   = useState<Set<string>>(new Set());

  const filtered = CARDS.filter(c => c.tab === activeTab);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedIds(s => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); }
      else { n.add(id); showToast("Saved to Mes Inspirations ✦", "💎"); }
      return n;
    });
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Curated</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">The Library</h2>
        </div>
        <div className="w-12" />
      </div>

      {/* Tab bar — pill chips, dusty rose */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full font-sans text-[9px] tracking-[0.18em] uppercase transition-all duration-200 cursor-pointer"
              style={activeTab === tab
                ? { background: "#C4968A", color: "#FFFFFF" }
                : { background: "rgba(196,150,138,0.12)", color: "rgba(196,150,138,0.7)" }
              }>
              {tab}
            </button>
          ))}
        </div>
        <div className="divider-gold mt-2" />
      </div>

      {/* Tutorial grid — masonry columns */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="columns-2 gap-3">
          {filtered.map((card, i) => (
            <button
              key={card.id}
              onClick={() => onTutorial?.(card.id)}
              className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-200 press-scale grid-item-anim break-inside-avoid mb-3 w-full"
              style={{ animationDelay: `${i * 0.06}s` }}>

              {/* Cover */}
              <div className="relative overflow-hidden" style={{ height: COVER_H[i % COVER_H.length] }}>
                <div className="absolute inset-0" style={{ background: card.gradient }} />

                {/* Floating emoji */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl" style={{ opacity: 0.22 }}>{card.emoji}</span>
                </div>

                {/* Gradient fade to bottom */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.52) 100%)" }} />

                {/* Difficulty dot */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: DIFF_DOT[card.difficulty] }} />
                  <span className="font-sans text-[7px] text-white opacity-85 tracking-wide">{card.difficulty}</span>
                </div>

                {/* Bookmark button */}
                <button
                  onClick={e => toggleSave(e, card.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all press-scale"
                  style={{
                    background: savedIds.has(card.id) ? `${card.accent}CC` : "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(8px)",
                  }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill={savedIds.has(card.id) ? "white" : "none"} stroke="white" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M1 1H9C9.3 1 9.5 1.2 9.5 1.5V11L5 8.5L0.5 11V1.5C0.5 1.2 0.7 1 1 1Z" />
                  </svg>
                </button>

                {/* Time + category chips */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="font-sans text-[7px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: `${card.accent}BB`, color: "white" }}>
                    {card.category}
                  </span>
                  <span className="font-sans text-[8px] text-white opacity-80">{card.duration} min</span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-3 pt-2.5 pb-3">
                <h3 className="font-serif text-[14px] font-normal text-[#0B3C26] leading-tight mb-1.5 group-hover:text-[#1A5C3A] transition-colors line-clamp-2">
                  {card.title}
                </h3>
                {/* Creator credit */}
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${card.accent}30` }}>
                    <span className="font-sans text-[6px]" style={{ color: card.accent }}>
                      {card.creator.charAt(0)}
                    </span>
                  </div>
                  <span className="font-sans text-[8px] text-[#8A8070] truncate">{card.handle}</span>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(11,60,38,0.2)" }} />
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="rgba(200,176,106,0.6)" strokeWidth="1">
                    <path d="M1 5L2.5 7L7 1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-sans text-[8px] text-[#C8B06A] flex-shrink-0">{card.saves.toLocaleString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Saves disclaimer */}
        <div className="mt-6 mb-2 px-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="divider-gold flex-1" />
            <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#C8B06A]">Creator Credits</p>
            <div className="divider-gold flex-1" />
          </div>
          <p className="font-sans text-[9px] text-[#B0A898] text-center leading-relaxed">
            All tutorials belong to their original creators.{"\n"}The Muse curates with full credit and respect.
          </p>
        </div>
      </div>
    </div>
  );
}
