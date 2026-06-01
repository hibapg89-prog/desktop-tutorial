"use client";

import { useState } from "react";

interface Props {
  onAllow: () => void;
  onSkip:  () => void;
}

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕"];

type State = "idle" | "requesting" | "granted" | "denied";

export default function NotificationPermissionScreen({ onAllow, onSkip }: Props) {
  const [state, setState] = useState<State>("idle");

  const handleAllow = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      onAllow();
      return;
    }
    setState("requesting");
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setState("granted");
        // Fire demo welcome notification via the service worker
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification("Bienvenue, Muse ✦", {
            body: "Votre rituel beauté commence ici. Bonne découverte.",
            icon: "/icons/icon.svg",
            tag: "luxebeauty-welcome",
          });
        }
        setTimeout(onAllow, 1400);
      } else {
        setState("denied");
        setTimeout(onAllow, 800);
      }
    } catch {
      onAllow();
    }
  };

  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Ambient gold halo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.14), transparent 60%)" }} />
        {state === "granted" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[90vw] h-[90vw] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(200,176,106,0.1), transparent 55%)", animation: "pulse 2s ease-in-out infinite" }} />
          </div>
        )}
      </div>

      {/* Moon phase progress — step 5 */}
      <div className="relative z-10 flex items-center justify-center gap-3 mb-10">
        {MOON_PHASES.map((phase, i) => (
          <span key={i} className="text-lg transition-all duration-500"
            style={{ opacity: i === 4 ? 1 : 0.3, transform: i === 4 ? "scale(1.3)" : "scale(1)" }}>
            {phase}
          </span>
        ))}
      </div>

      {/* Bell icon — morphs to checkmark on grant */}
      <div className="relative z-10 mb-8 transition-all duration-500"
        style={{ transform: state === "granted" ? "scale(1.1)" : "scale(1)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: state === "granted"
              ? "linear-gradient(135deg, rgba(200,176,106,0.3), rgba(200,176,106,0.1))"
              : "linear-gradient(135deg, rgba(200,176,106,0.12), rgba(200,176,106,0.04))",
            border: `1px solid rgba(200,176,106,${state === "granted" ? 0.6 : 0.3})`,
            boxShadow: state === "granted" ? "0 0 32px rgba(200,176,106,0.3)" : "none",
          }}>
          {state === "granted" ? (
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <path d="M2 11L10 19L26 3" stroke="#C8B06A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
              <path d="M15 1C15 1 7 5 7 14L5 25H25L23 14C23 5 15 1 15 1Z"
                stroke="#C8B06A" strokeWidth="1.4" fill="none" strokeLinejoin="round"
                style={{ animation: state === "requesting" ? "pulse 1s ease-in-out infinite" : "none" }} />
              <path d="M11 25C11 27.2 12.8 29 15 29C17.2 29 19 27.2 19 25"
                stroke="#C8B06A" strokeWidth="1.4" fill="none" />
              <circle cx="15" cy="2" r="1.8" fill="#C8B06A" opacity="0.7" />
              <path d="M8 13 Q10 9 14 8" stroke="#C8B06A" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Heading — changes on grant */}
      <div className="relative z-10 text-center mb-6 max-w-xs transition-all duration-500">
        {state === "granted" ? (
          <>
            <p className="font-sans text-[8px] tracking-[0.35em] uppercase text-[#C8B06A] mb-3">
              La Muse est éveillée ✦
            </p>
            <h2 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight mb-4">
              Vos secrets beauté<br />sont en route ✦
            </h2>
            <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed">
              Regardez votre montre — votre première notification Muse vient d'arriver.
            </p>
          </>
        ) : (
          <>
            <p className="font-sans text-[8px] tracking-[0.35em] uppercase text-[#C8B06A] mb-3">
              La Muse Vous Attend
            </p>
            <h2 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight mb-4">
              Permettre à La Muse de<br />vous chuchoter des secrets ?
            </h2>
            <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed">
              Éditions beauté du matin, nouvelles sorties et rappels de rituel — livrés avec intention, jamais de bruit.
            </p>
          </>
        )}
      </div>

      {/* Notification preview card */}
      {state !== "granted" && (
        <div className="relative z-10 w-full max-w-xs mb-10">
          <div className="rounded-2xl px-4 py-3"
            style={{
              background: "rgba(250,246,239,0.97)",
              border: "1px solid rgba(200,176,106,0.2)",
              boxShadow: "0 4px 20px rgba(11,60,38,0.08)",
            }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(11,60,38,0.08)" }}>
                <span className="text-sm text-[#0B3C26]">✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[9px] font-medium text-[#1C1C1C] tracking-wider mb-0.5">
                  LuxeBeauty · Muse du Matin · 8:00
                </p>
                <p className="font-cormorant text-sm italic text-[#8A8070] leading-snug">
                  "Votre rituel vous attend, chérie ✦"
                </p>
              </div>
            </div>
          </div>
          {/* Watch forwarding hint */}
          <p className="font-sans text-[8px] tracking-[0.12em] text-center text-[#8A8070] mt-2 opacity-70">
            ⌚ Transmis automatiquement à votre montre connectée
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="relative z-10 w-full max-w-xs space-y-3">
        {state !== "granted" && (
          <>
            <button onClick={handleAllow} disabled={state === "requesting"}
              className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.18em] uppercase cursor-pointer transition-all duration-300 press-scale"
              style={{
                background: "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)",
                color: "white",
                boxShadow: "0 4px 24px rgba(200,176,106,0.4)",
                opacity: state === "requesting" ? 0.7 : 1,
              }}>
              {state === "requesting" ? "Demande en cours..." : "Oui, chuchotez-moi ✦"}
            </button>
            <button onClick={onSkip}
              className="w-full py-3 text-center cursor-pointer opacity-50 hover:opacity-80 transition-opacity">
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#0B3C26]">
                Pas maintenant
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
