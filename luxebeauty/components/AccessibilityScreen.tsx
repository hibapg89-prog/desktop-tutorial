"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";
import { useToast } from "./ToastContext";

interface Props { onBack: () => void; }

interface ToggleState {
  calmMode:      boolean;
  guidedPath:    boolean;
  highContrast:  boolean;
  screenReader:  boolean;
  largeType:     boolean;
  voiceOver:     boolean;
}

export default function AccessibilityScreen({ onBack }: Props) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<ToggleState>({
    calmMode:     true,
    guidedPath:   false,
    highContrast: false,
    screenReader: false,
    largeType:    false,
    voiceOver:    false,
  });

  const toggle = (key: keyof ToggleState) =>
    setSettings(s => ({ ...s, [key]: !s[key] }));

  const save = () => showToast("Paramètres sauvegardés ✦", "◈");

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer press-scale">
          ← Retour
        </button>
        <div className="opacity-25">
          <SwanLogo size={26} />
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pb-5 flex-shrink-0">
        <h1 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight">
          Paramètres<br />d'Accessibilité
        </h1>
      </div>

      <div className="divider-gold mx-6 mb-6" />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 space-y-8">

        {/* ── Calm Mode ── */}
        <section>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C] mb-3">Mode Serein</h2>
          <div className="flex items-start gap-4 mb-4">
            <Toggle
              on={settings.calmMode}
              onToggle={() => toggle("calmMode")}
            />
            <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed flex-1 pt-0.5">
              Réduit les stimuli visuels et sonores pour une expérience apaisante. Inclut le mouvement réduit.
            </p>
          </div>
          <OutlineButton
            label={settings.calmMode ? "Mode Serein Actif ✦" : "Activer le Mode Serein"}
            active={settings.calmMode}
            onClick={() => toggle("calmMode")}
          />
        </section>

        {/* ── Guided Path ── */}
        <section>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C] mb-3">Parcours Guidé</h2>
          <div className="flex items-start gap-4 mb-4">
            <Toggle
              on={settings.guidedPath}
              onToggle={() => toggle("guidedPath")}
            />
            <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed flex-1 pt-0.5">
              Navigation étape par étape avec indicateurs de focus clairs et repères auditifs doux.
            </p>
          </div>
          <OutlineButton
            label={settings.guidedPath ? "Parcours Guidé Actif ✦" : "Activer le Parcours Guidé"}
            active={settings.guidedPath}
            onClick={() => toggle("guidedPath")}
          />
        </section>

        {/* ── Display & Sound ── */}
        <section>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C] mb-4">Affichage & Son</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">

            <ToggleRow
              label="Texte Haute Contraste"
              desc="Améliore la lisibilité sur tous les fonds."
              on={settings.highContrast}
              onToggle={() => toggle("highContrast")}
            />
            <ToggleRow
              label="Lecteur d'Écran"
              desc="Compatibilité totale avec les technologies d'assistance."
              on={settings.screenReader}
              onToggle={() => toggle("screenReader")}
            />
            <ToggleRow
              label="Grande Typographie"
              desc="Augmente la taille du texte dans toute l'application."
              on={settings.largeType}
              onToggle={() => toggle("largeType")}
            />
            <ToggleRow
              label="VoiceOver / TalkBack"
              desc="Descriptions audio et repères temporels activés."
              on={settings.voiceOver}
              onToggle={() => toggle("voiceOver")}
            />

          </div>
        </section>

      </div>

      {/* Fixed Save button */}
      <div className="panel-bottom fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 z-20"
        style={{ background: "rgba(250,246,239,0.97)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <button
          onClick={save}
          className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 press-scale"
          style={{
            border: "1.5px solid #0B3C26",
            background: "transparent",
            color: "#0B3C26",
          }}>
          Sauvegarder les Paramètres
        </button>
      </div>
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex-shrink-0 cursor-pointer press-scale"
      aria-label={on ? "Désactiver" : "Activer"}
      style={{ outline: "none" }}>
      <div
        className="relative transition-all duration-300"
        style={{
          width: "46px",
          height: "26px",
          borderRadius: "13px",
          background: on
            ? "linear-gradient(145deg, #2D7A52, #0B3C26)"
            : "rgba(200,176,106,0.15)",
          border: on ? "none" : "1px solid rgba(200,176,106,0.3)",
          boxShadow: on ? "0 2px 8px rgba(11,60,38,0.3)" : "none",
        }}>
        <div
          className="absolute top-[3px] rounded-full transition-all duration-300"
          style={{
            width: "20px",
            height: "20px",
            background: on ? "white" : "rgba(200,176,106,0.5)",
            left: on ? "23px" : "3px",
            boxShadow: on ? "0 1px 4px rgba(0,0,0,0.2)" : "none",
          }}
        />
      </div>
    </button>
  );
}

/* ── Outline CTA button ── */
function OutlineButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 press-scale"
      style={{
        border: `1.5px solid ${active ? "#0B3C26" : "rgba(11,60,38,0.25)"}`,
        background: active ? "rgba(11,60,38,0.04)" : "transparent",
        color: active ? "#0B3C26" : "rgba(11,60,38,0.45)",
      }}>
      {label}
    </button>
  );
}

/* ── Inline toggle row for Display & Sound grid ── */
function ToggleRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3">
      <Toggle on={on} onToggle={onToggle} />
      <div>
        <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight">{label}</p>
        <p className="font-sans text-[9px] font-light text-[#8A8070] mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
