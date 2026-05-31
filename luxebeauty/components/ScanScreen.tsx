"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props { onBack: () => void; onMuseMirror?: () => void; }

const product = {
  name: "Éclat Botanique Serum",
  brand: "The Muse",
  desc: "Clarifying facial serum",
};

export default function ScanScreen({ onBack, onMuseMirror }: Props) {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <SwanLogo size={32} glow />
        <h2 className="font-serif text-xl text-[#1C1C1C]">Scan & Discover</h2>
        <button onClick={onBack} className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Home
        </button>
      </div>

      <div className="divider-gold mx-6 mb-6" />

      {/* Scan viewport */}
      <div className="mx-6 flex-1 flex flex-col">
        <div className="relative rounded-3xl overflow-hidden flex-1 min-h-[300px] max-h-[400px]"
          style={{
            background: "linear-gradient(145deg, rgba(240,235,220,0.8), rgba(220,215,200,0.6))",
            border: "1px solid rgba(200,176,106,0.25)",
          }}>

          {/* Corner brackets (viewfinder) */}
          {[["top-3 left-3", "border-t border-l"], ["top-3 right-3", "border-t border-r"],
            ["bottom-3 left-3", "border-b border-l"], ["bottom-3 right-3", "border-b border-r"]].map(([pos, borders], i) => (
            <div key={i} className={`absolute ${pos} w-6 h-6 ${borders} rounded-sm`}
              style={{ borderColor: "#0B3C26", opacity: 0.6 }} />
          ))}

          {/* Scan line animation */}
          {!scanned && <div className="scan-line" />}

          {/* Product visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Bottle silhouette */}
              <div className="w-20 h-36 rounded-t-full rounded-b-lg flex items-center justify-center relative"
                style={{ background: "linear-gradient(145deg, #1A5C3A, #0B3C26)" }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-8 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="w-14 h-20 rounded-lg flex items-center justify-center mx-auto mt-6"
                  style={{ background: "rgba(11,60,38,0.9)", border: "1px solid rgba(200,176,106,0.3)" }}>
                  <div className="text-center px-1">
                    <SwanLogo size={18} color="#C8B06A" />
                    <p className="font-cormorant text-[7px] text-[#C8B06A] tracking-widest mt-1 leading-tight">
                      ÉCLAT<br />BOTANIQUE<br />SÉRUM
                    </p>
                  </div>
                </div>
                {/* Gold cap */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-5 rounded-full"
                  style={{ background: "linear-gradient(180deg, #E8D8A8, #C8B06A)" }} />
              </div>

              {/* Scan glow */}
              {!scanned && (
                <div className="absolute inset-0 rounded-t-full rounded-b-lg"
                  style={{ background: "rgba(11,60,38,0.08)", border: "1px solid rgba(11,60,38,0.2)", animation: "pulse 1.5s ease-in-out infinite" }} />
              )}
            </div>
          </div>

          {/* Detected label */}
          {scanned && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="card-pearl rounded-xl px-4 py-3 text-center">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#C8B06A] mb-0.5">Identified</p>
                <p className="font-serif text-base text-[#1C1C1C]">{product.name}</p>
                <p className="font-sans text-[10px] text-[#8A8070] font-light">{product.brand} · {product.desc}</p>
              </div>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-6 mb-2">
          <p className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#8A8070] mb-1">{scanned ? "Product Identified" : "Point camera at product"}</p>
          <h3 className="font-serif text-2xl text-[#1C1C1C] font-normal">{product.name}</h3>
          <p className="font-sans text-xs text-[#8A8070] font-light mt-0.5">{product.brand}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4 mb-24">
          <button
            onClick={() => setScanned(true)}
            className={`flex-1 py-3.5 rounded-full cursor-pointer ${scanned ? "btn-ghost" : "btn-emerald"}`}>
            {scanned ? "Scan Again" : "Tap to Scan"}
          </button>
          {scanned && (
            <button onClick={onBack} className="flex-1 btn-rose py-3.5 rounded-full cursor-pointer">
              Add to Vanity
            </button>
          )}
        </div>
        {onMuseMirror && (
          <button onClick={onMuseMirror}
            className="w-full mt-3 py-3 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.18em] uppercase flex items-center justify-center gap-2"
            style={{ border: "1px solid rgba(200,176,106,0.3)", color: "#C8B06A", background: "rgba(200,176,106,0.06)" }}>
            <span>◈</span> Try On Virtually — Muse Mirror
          </button>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-2 pb-6 pt-3"
        style={{ background: "rgba(250,246,239,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(200,176,106,0.15)" }}>
        <div className="flex justify-around">
          {["Home", "Scan", "Routine", "Profile"].map((t, i) => (
            <button key={t} onClick={i !== 1 ? onBack : undefined}
              className={`nav-tab ${i === 1 ? "active" : ""} cursor-pointer`}>
              <div className="nav-line" />
              <span className="text-base">{["⌂", "⊞", "☰", "◯"][i]}</span>
              <span>{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
