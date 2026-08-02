"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";
import { useTheme } from "./ThemeContext";
import { useCurrency, type Currency } from "./CurrencyContext";

interface Props {
  onBack: () => void;
  onAccessibility?: () => void;
  onNotifications?: () => void;
}

const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "EUR", label: "Euro",           symbol: "€" },
  { code: "USD", label: "Dollar",         symbol: "$" },
  { code: "GBP", label: "Livre Sterling", symbol: "£" },
];

const LANGUAGES = [
  { code: "FR", label: "Français", available: true  },
  { code: "EN", label: "English",       available: false },
  { code: "AR", label: "العربية",   available: false },
];

export default function SettingsScreen({ onBack, onAccessibility, onNotifications }: Props) {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={onBack}
          aria-label="Retour à l'écran précédent"
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer press-scale">
          ← Retour
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">Votre Espace</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Paramètres</h2>
        </div>
        <div className="opacity-20">
          <SwanLogo size={22} />
        </div>
      </div>

      <div className="divider-gold mx-5 mb-0" />

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-16 px-5 pt-6 space-y-6">

        {/* ── Apparence ── */}
        <section>
          <SectionLabel label="Apparence" icon="◈" />
          <div className="card-pearl rounded-2xl p-5 space-y-4">
            <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed">
              Choisissez l'ambiance visuelle qui accompagne votre rituel beauté.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ThemeOption
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon="☀"
                label="Lumière"
                desc="Satin & ivoire"
                accent="#C8B06A"
              />
              <ThemeOption
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon="◗"
                label="Nuit"
                desc="Velours profond"
                accent="#C8B06A"
              />
            </div>
          </div>
        </section>

        {/* ── Devise ── */}
        <section>
          <SectionLabel label="Devise" icon="✦" />
          <div className="card-pearl rounded-2xl p-5 space-y-4">
            <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed">
              Les prix s'afficheront dans la devise de votre choix.
            </p>
            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  aria-pressed={currency === c.code}
                  className="flex-1 py-3 rounded-xl font-sans text-[10px] tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer press-scale"
                  style={currency === c.code ? {
                    background: "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(200,176,106,0.4)",
                  } : {
                    background: "rgba(200,176,106,0.08)",
                    border: "1px solid rgba(200,176,106,0.2)",
                    color: "#8A8070",
                  }}>
                  <span className="block text-base leading-none mb-0.5">{c.symbol}</span>
                  <span className="block">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Langue ── */}
        <section>
          <SectionLabel label="Langue" icon="◇" />
          <div className="card-pearl rounded-2xl p-5 space-y-3">
            <p className="font-sans text-[10px] font-light text-[#8A8070] leading-relaxed">
              La terminologie beauté reste en français — notre signature de luxe.
            </p>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between py-3 px-4 rounded-xl transition-all"
                  style={{
                    background: lang.code === "FR" ? "rgba(200,176,106,0.1)" : "rgba(200,176,106,0.04)",
                    border: lang.code === "FR" ? "1px solid rgba(200,176,106,0.35)" : "1px solid rgba(200,176,106,0.1)",
                  }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: lang.code === "FR" ? "rgba(200,176,106,0.2)" : "transparent",
                        border: lang.code === "FR" ? "1px solid rgba(200,176,106,0.4)" : "1px solid rgba(200,176,106,0.15)",
                      }}>
                      <span className="font-sans text-[8px] font-medium" style={{ color: lang.code === "FR" ? "#C8B06A" : "#8A8070" }}>
                        {lang.code}
                      </span>
                    </div>
                    <span className="font-sans text-[11px] text-[#1C1C1C]">{lang.label}</span>
                  </div>
                  {lang.available ? (
                    <span className="font-sans text-[8px] tracking-[0.2em] text-[#C8B06A]">Actif ✦</span>
                  ) : (
                    <span className="font-sans text-[8px] tracking-[0.15em] text-[#8A8070] opacity-60">Bientôt</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Notifications ── */}
        {onNotifications && (
          <section>
            <SectionLabel label="Notifications" icon="○" />
            <button
              onClick={onNotifications}
              aria-label="Accéder aux préférences de notifications"
              className="card-pearl w-full rounded-2xl p-5 flex items-center justify-between cursor-pointer press-scale transition-all duration-200 hover:opacity-80">
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(11,60,38,0.07)", border: "1px solid rgba(11,60,38,0.12)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B3C26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-sans text-[11px] text-[#1C1C1C] leading-tight">Préférences de Notifications</p>
                  <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">Muse du Matin, Nouveautés, Rituels</p>
                </div>
              </div>
              <span className="font-sans text-[14px] text-[#C8B06A] opacity-60">›</span>
            </button>
          </section>
        )}

        {/* ── Accessibilité ── */}
        {onAccessibility && (
          <section>
            <SectionLabel label="Accessibilité" icon="◎" />
            <button
              onClick={onAccessibility}
              aria-label="Accéder aux paramètres d'accessibilité"
              className="card-pearl w-full rounded-2xl p-5 flex items-center justify-between cursor-pointer press-scale transition-all duration-200 hover:opacity-80">
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(11,60,38,0.07)", border: "1px solid rgba(11,60,38,0.12)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B3C26" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="4" r="2"/>
                    <path d="M12 6v6M9 9h6M9 21l3-6 3 6"/>
                    <path d="M6.5 11.5C5 13 4 15 4 17.5"/>
                    <path d="M17.5 11.5C19 13 20 15 20 17.5"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-sans text-[11px] text-[#1C1C1C] leading-tight">Paramètres d'Accessibilité</p>
                  <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">Mouvement, contraste, taille du texte</p>
                </div>
              </div>
              <span className="font-sans text-[14px] text-[#C8B06A] opacity-60">›</span>
            </button>
          </section>
        )}

        {/* ── Version ── */}
        <div className="text-center pt-4 pb-2">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-1">LuxeBeauty</p>
          <p className="font-sans text-[9px] text-[#8A8070] opacity-60">Version 1.0 · La Muse ✦</p>
        </div>

      </div>
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <span className="font-sans text-[10px] text-[#C8B06A]">{icon}</span>
      <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-[#8A8070]">{label}</p>
    </div>
  );
}

function ThemeOption({
  active, onClick, icon, label, desc, accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  desc: string;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl cursor-pointer transition-all duration-250 press-scale"
      style={active ? {
        background: "rgba(200,176,106,0.1)",
        border: `1.5px solid ${accent}`,
        boxShadow: `0 4px 16px rgba(200,176,106,0.15)`,
      } : {
        background: "rgba(200,176,106,0.04)",
        border: "1px solid rgba(200,176,106,0.15)",
      }}>
      <span className="text-xl" style={{ color: active ? accent : "#8A8070" }}>{icon}</span>
      <div className="text-center">
        <p className="font-sans text-[10px] font-medium" style={{ color: active ? "#1C1C1C" : "#8A8070" }}>{label}</p>
        <p className="font-sans text-[8px] mt-0.5" style={{ color: "#8A8070", opacity: 0.8 }}>{desc}</p>
      </div>
      {active && (
        <div className="w-4 h-1 rounded-full" style={{ background: accent }} />
      )}
    </button>
  );
}
