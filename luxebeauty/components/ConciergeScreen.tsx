"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onNext: () => void; }

const STEPS = [
  {
    id: "purpose",
    question: "Que cherchez-vous chez LuxeBeauty ?",
    sub: "Nous personnalisons votre expérience autour de ce qui vous inspire vraiment",
    options: [
      { id: "discover", icon: "✦", label: "Découvrir",              desc: "Explorer les tendances et les nouveautés" },
      { id: "shop",     icon: "◈", label: "Shopper",                desc: "Trouver et acquérir les beautés de luxe" },
      { id: "dupes",    icon: "◇", label: "L'Alternative Artisanale", desc: "Le luxe accessible, sans compromis" },
      { id: "routine",  icon: "○", label: "Affiner Mon Rituel",     desc: "Construire le rituel beauté parfait" },
    ],
  },
  {
    id: "vibe",
    question: "Quelle est votre signature beauté ?",
    sub: "Votre esthétique guide chacune de nos recommandations",
    options: [
      { id: "minimal",  icon: "—", label: "Minimaliste", desc: "Épuré, sans effort, infiniment raffiné" },
      { id: "bold",     icon: "◆", label: "Audacieuse",  desc: "Looks affirmés, couleur sans retenue" },
      { id: "natural",  icon: "◯", label: "Naturelle",   desc: "La peau d'abord, les ingrédients en vedette" },
      { id: "creative", icon: "⊞", label: "Créative",    desc: "Expérimentale et avant-garde" },
    ],
  },
  {
    id: "cadence",
    question: "Comment renouvelez-vous votre rituel ?",
    sub: "Pour vous proposer les lancements et éditions saisonnières au moment juste",
    options: [
      { id: "daily",    icon: "∞", label: "Rituel quotidien",       desc: "Toujours en quête de nouveautés" },
      { id: "weekly",   icon: "◇", label: "Plaisirs de la semaine", desc: "Quelques indulgences par semaine" },
      { id: "monthly",  icon: "○", label: "Indulgence mensuelle",   desc: "Des choix intentionnels et réfléchis" },
      { id: "seasonal", icon: "✦", label: "Au fil des saisons",     desc: "Les grands renouvellements saisonniers" },
    ],
  },
];

export default function ConciergeScreen({ onNext }: Props) {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [exiting, setExiting]     = useState(false);

  const current   = STEPS[step];
  const selected  = answers[current.id] ?? null;
  const isLast    = step === STEPS.length - 1;

  const choose = (id: string) => setAnswers(a => ({ ...a, [current.id]: id }));

  const advance = () => {
    if (!selected) return;
    if (isLast) { onNext(); return; }
    setExiting(true);
    setTimeout(() => { setStep(s => s + 1); setExiting(false); }, 260);
  };

  const goBack = () => {
    if (step === 0) return;
    setExiting(true);
    setTimeout(() => { setStep(s => s - 1); setExiting(false); }, 260);
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(240,232,204,0.8), transparent 65%)" }} />
        <div className="absolute bottom-[-5%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.5), transparent 65%)" }} />
        <div className="absolute top-[45%] right-[10%] w-[30vw] h-[30vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.5), transparent 70%)" }} />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={goBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] transition-opacity cursor-pointer"
          style={{ opacity: step === 0 ? 0 : 0.5, pointerEvents: step === 0 ? "none" : "auto" }}>
          ← Retour
        </button>
        <div className="opacity-20">
          <SwanLogo size={22} />
        </div>
      </div>

      {/* Moon phase progress */}
      <div className="relative z-10 px-6 mb-8 flex-shrink-0">
        <div className="flex items-center justify-center gap-4">
          {(["🌑", "🌒", "🌓"] as const).map((phase, i) => (
            <span key={i} className="text-2xl transition-all duration-500"
              style={{
                opacity:    i <= step ? 1 : 0.22,
                transform:  i === step ? "scale(1.35)" : "scale(1)",
                filter:     i < step ? "saturate(0.6) brightness(0.9)" : "none",
              }}>
              {phase}
            </span>
          ))}
        </div>
        <p className="font-sans text-[8px] tracking-[0.22em] uppercase text-[#C8B06A] mt-2 text-center">
          Votre Rituel Beauté · {step + 1} sur {STEPS.length}
        </p>
      </div>

      {/* Question */}
      <div
        className="relative z-10 px-6 mb-7 flex-shrink-0 transition-all duration-260"
        style={{ opacity: exiting ? 0 : 1, transform: exiting ? "translateY(-8px)" : "translateY(0)" }}>
        <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-3">
          Votre Concierge Beauté
        </p>
        <h2 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight mb-2">
          {current.question}
        </h2>
        <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed">
          {current.sub}
        </p>
      </div>

      {/* Options */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-5 pb-36 transition-all duration-260"
        style={{ opacity: exiting ? 0 : 1, transform: exiting ? "translateY(10px)" : "translateY(0)" }}>
        <div className="flex flex-col gap-2.5">
          {current.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => choose(opt.id)}
                className="card-pearl rounded-2xl px-5 py-4 flex items-center gap-4 text-left cursor-pointer transition-all duration-200 group"
                style={isSelected ? {
                  border: "1.5px solid #0B3C26",
                  background: "rgba(11,60,38,0.04)",
                } : {}}>

                {/* Icon bubble */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: isSelected ? "rgba(11,60,38,0.12)" : "rgba(200,176,106,0.1)",
                    border: isSelected ? "1px solid rgba(11,60,38,0.2)" : "1px solid rgba(200,176,106,0.2)",
                  }}>
                  <span className="text-base transition-colors"
                    style={{ color: isSelected ? "#0B3C26" : "#C8B06A" }}>
                    {opt.icon}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="font-serif text-base font-normal text-[#1C1C1C] leading-tight">
                    {opt.label}
                  </p>
                  <p className="font-sans text-[10px] font-light text-[#8A8070] mt-0.5">
                    {opt.desc}
                  </p>
                </div>

                {/* Radio indicator */}
                <div
                  className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    borderColor: isSelected ? "#0B3C26" : "rgba(11,60,38,0.2)",
                    background: isSelected ? "#0B3C26" : "transparent",
                  }}>
                  {isSelected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-12 pt-8"
        style={{ background: "linear-gradient(to top, rgba(250,246,239,1) 55%, transparent)" }}>
        <button
          onClick={advance}
          disabled={!selected}
          className="w-full py-4 rounded-full font-sans text-sm tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer"
          style={{
            background: selected
              ? "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)"
              : "rgba(200,176,106,0.2)",
            color: selected ? "white" : "rgba(200,176,106,0.5)",
            boxShadow: selected ? "0 4px 24px rgba(200,176,106,0.4)" : "none",
            cursor: selected ? "pointer" : "not-allowed",
          }}>
          {isLast ? "Commencer Mon Voyage ✦" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
