"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

interface Props {
  onBack: () => void;
}

export default function CurationScreen({ onBack }: Props) {
  const [view, setView] = useState<"split" | "compare">("split");
  const { showToast } = useToast();

  const handleCTA = () => {
    showToast("Comparaison sauvegardée dans ta Vanity ✦", "♡");
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
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">
            ✦ Discover Your Alternative
          </p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">L&apos;Alternative Idéale</h2>
        </div>
        <div className="flex gap-1">
          {(["split", "compare"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`font-sans text-[8px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full transition-all cursor-pointer
                ${view === v
                  ? "bg-[#0B3C26] text-[rgba(240,232,204,0.95)]"
                  : "text-[#0B3C26] opacity-40"}`}>
              {v === "split" ? "Aperçu" : "Comparer"}
            </button>
          ))}
        </div>
      </div>

      <div className="divider-gold mx-6 mb-4" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {view === "split" ? <SplitView /> : <CompareView />}

        {/* Muse Verdict Panel — visible in both views */}
        <div className="px-4 pb-2 mt-1">
          <div className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(145deg, rgba(11,60,38,0.04), rgba(200,176,106,0.07))",
              border: "1px solid rgba(200,176,106,0.22)",
            }}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs" style={{ color: "#C8B06A" }}>✦</span>
              <p className="font-sans text-[7px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>
                The Muse is Curating
              </p>
            </div>
            <p className="font-cormorant text-[14px] italic font-light text-[#0B3C26] leading-relaxed mb-3">
              &ldquo;Une formule artisanale qui capture l&apos;essence du luxe à une fraction du prix. La philosophie de soin est identique — seule l&apos;étiquette change.&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2D7A52]" />
                <span className="font-sans text-[9px] text-[#2D7A52]">92% d&apos;équivalence formule</span>
              </div>
              <div className="px-3 py-1 rounded-full"
                style={{ background: "rgba(11,60,38,0.07)", border: "1px solid rgba(11,60,38,0.14)" }}>
                <span className="font-sans text-[8px] tracking-[0.08em] text-[#0B3C26]">
                  Économisez €28
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-32" />
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20"
        style={{
          background: "rgba(250,246,239,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(200,176,106,0.15)",
        }}>
        <button onClick={handleCTA} className="btn-gold w-full py-4 rounded-full cursor-pointer">
          {view === "split" ? "Sauvegarder dans ma Vanity" : "Valider mon Choix"}
        </button>
      </div>
    </div>
  );
}

function SplitView() {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#0B3C26] text-center">
          Le Luxe Parisien
        </p>
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#2D7A52] text-center">
          L&apos;Alternative Artisanale
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Luxury */}
        <div className="card-pearl rounded-3xl overflow-hidden p-4 flex flex-col items-center text-center">
          <div className="w-full h-36 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #FAF0E0, #EDE5CC)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 60% 30%, #C8B06A, transparent 60%)" }} />
            <LuxuryLipstick />
          </div>
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#C8B06A] mb-1">
            Charlotte Tilbury
          </p>
          <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-2">
            Matte Revolution
          </p>
          <p className="font-cormorant text-xs italic text-[#8A8070] mb-3 leading-tight">
            &ldquo;Icône absolue<br />du rouge à lèvres&rdquo;
          </p>
          <div className="font-serif text-base text-[#0B3C26] font-normal mb-3">€52</div>
          <div className="w-full space-y-1.5">
            {["Pigments haute couture", "Tenue 12h", "Formule soin"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8B06A] flex-shrink-0" />
                <span className="font-sans text-[9px] text-[#8A8070] text-left">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artisan */}
        <div className="iridescent-card rounded-3xl overflow-hidden p-4 flex flex-col items-center text-center">
          <div className="w-full h-36 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #EAF0E8, #D8E8D0)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "radial-gradient(circle at 40% 40%, #1A5C3A, transparent 60%)" }} />
            <ArtisanLipstick />
          </div>
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#1A5C3A] mb-1">
            Maison Verte
          </p>
          <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-2">
            Rouge Botanique
          </p>
          <p className="font-cormorant text-xs italic text-[#8A8070] mb-3 leading-tight">
            &ldquo;Formule naturelle<br />façonnée à la main&rdquo;
          </p>
          <div className="font-serif text-base text-[#0B3C26] font-normal mb-3">€24</div>
          <div className="w-full space-y-1.5">
            {["100% naturel", "Certifié bio", "Vegan"].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1A5C3A] flex-shrink-0" />
                <span className="font-sans text-[9px] text-[#8A8070] text-left">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareView() {
  const metrics = [
    { label: "Pigmentation", luxury: "Ultra-intense", local: "Intense naturelle", luxVal: 95, locVal: 82 },
    { label: "Tenue", luxury: "12 heures", local: "8–10 heures", luxVal: 92, locVal: 75 },
    { label: "Formule Clean", luxury: "Conventionnelle", local: "100% naturelle", luxVal: 42, locVal: 96 },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3 mb-4 text-center">
        <div className="card-pearl rounded-2xl py-3 px-4">
          <p className="font-sans text-[7px] tracking-[0.2em] uppercase text-[#C8B06A] mb-0.5">Le Luxe</p>
          <p className="font-serif text-sm text-[#1C1C1C]">Matte Revolution</p>
        </div>
        <div className="iridescent-card rounded-2xl py-3 px-4">
          <p className="font-sans text-[7px] tracking-[0.2em] uppercase text-[#1A5C3A] mb-0.5">
            L&apos;Alternative Artisanale
          </p>
          <p className="font-serif text-sm text-[#1C1C1C]">Rouge Botanique</p>
        </div>
      </div>

      {metrics.map((m) => (
        <div key={m.label} className="card-pearl rounded-2xl p-4 mb-3">
          <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] mb-3 opacity-65">
            {m.label}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-sans text-[9px] text-[#8A8070] mb-1.5">{m.luxury}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(200,176,106,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.luxVal}%`, background: "linear-gradient(90deg, #C8B06A, #E8D8A8)" }} />
              </div>
              <p className="font-sans text-[8px] text-[#C8B06A] mt-1 text-right">{m.luxVal}%</p>
            </div>
            <div>
              <p className="font-sans text-[9px] text-[#8A8070] mb-1.5">{m.local}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(11,60,38,0.08)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${m.locVal}%`, background: "linear-gradient(90deg, #0B3C26, #2D7A52)" }} />
              </div>
              <p className="font-sans text-[8px] text-[#0B3C26] mt-1 text-right">{m.locVal}%</p>
            </div>
          </div>
        </div>
      ))}

      {/* Price comparison */}
      <div className="card-pearl rounded-2xl p-4 mb-3">
        <p className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] mb-3 opacity-65">
          Investissement
        </p>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="font-serif text-xl text-[#C8B06A]">€52</p>
            <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">Matte Revolution</p>
          </div>
          <div>
            <p className="font-serif text-xl text-[#0B3C26]">€24</p>
            <p className="font-sans text-[9px] text-[#2D7A52] mt-0.5 font-medium">Économisez €28</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LuxuryLipstick() {
  return (
    <svg width="48" height="88" viewBox="0 0 48 88" fill="none">
      <rect x="12" y="30" width="24" height="50" rx="2.5" fill="url(#curatorLuxGold)" />
      <rect x="14" y="38" width="20" height="22" rx="1" fill="rgba(11,60,38,0.07)" stroke="rgba(200,176,106,0.25)" strokeWidth="0.5" />
      <text x="24" y="52" textAnchor="middle" fill="#0B3C26" fontSize="3.5" fontFamily="serif" opacity="0.55" letterSpacing="0.3">CT</text>
      <rect x="10" y="76" width="28" height="5" rx="1.5" fill="#A89050" />
      <rect x="16" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.22)" />
      <rect x="14" y="6" width="20" height="28" rx="1" fill="#8B3A3A" />
      <path d="M14 6 Q24 -2 34 6" fill="#8B3A3A" />
      <path d="M16 4 Q20 -1 23 3" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeLinecap="round" fill="none" />
      <rect x="12" y="30" width="24" height="4" rx="1" fill="#C8B06A" />
      <defs>
        <linearGradient id="curatorLuxGold" x1="12" y1="30" x2="36" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4C07A" />
          <stop offset="50%" stopColor="#E8D898" />
          <stop offset="100%" stopColor="#A89050" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ArtisanLipstick() {
  return (
    <svg width="48" height="88" viewBox="0 0 48 88" fill="none">
      <rect x="12" y="30" width="24" height="50" rx="2.5" fill="url(#curatorArtGreen)" />
      <rect x="14" y="38" width="20" height="22" rx="1" fill="rgba(11,60,38,0.05)" stroke="rgba(26,92,58,0.2)" strokeWidth="0.5" />
      <text x="24" y="52" textAnchor="middle" fill="#0B3C26" fontSize="3.5" fontFamily="serif" opacity="0.55" letterSpacing="0.3">MV</text>
      <rect x="10" y="76" width="28" height="5" rx="1.5" fill="#2D7A52" />
      <rect x="16" y="32" width="4" height="20" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="14" y="6" width="20" height="28" rx="1" fill="#C4504A" />
      <path d="M14 6 Q24 -2 34 6" fill="#C4504A" />
      <path d="M16 4 Q20 -1 23 3" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeLinecap="round" fill="none" />
      <rect x="12" y="30" width="24" height="4" rx="1" fill="#1A5C3A" />
      <path d="M8 52 Q12 48 12 54 Z" fill="#1A5C3A" opacity="0.45" />
      <path d="M40 48 Q36 44 36 50 Z" fill="#1A5C3A" opacity="0.45" />
      <defs>
        <linearGradient id="curatorArtGreen" x1="12" y1="30" x2="36" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D0E8C8" />
          <stop offset="50%" stopColor="#E8F4E0" />
          <stop offset="100%" stopColor="#B0D4A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
