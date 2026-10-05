"use client";

import { useState } from "react";
import { SwanLogo } from "./LandingScreen";

interface Props {
  onPaste: () => void;
  onBack: () => void;
}

export default function PasteLinkScreen({ onPaste, onBack }: Props) {
  const [link, setLink] = useState("");

  return (
    <div className="satin-pearlescent min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.4), transparent 65%)" }} />
        <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.4), transparent 65%)" }} />
      </div>

      {/* Back */}
      <button onClick={onBack}
        className="absolute top-10 left-6 font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
        ← Back
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-sm">

        {/* Swan + title */}
        <div className="anim-up mb-2">
          <SwanLogo size={40} />
        </div>
        <div className="anim-up-d1 mb-8">
          <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-[#0B3C26] opacity-50 mb-1">
            Link Discovery
          </p>
          <h2 className="font-serif text-2xl font-normal text-[#1C1C1C]">
            Paste a Link
          </h2>
          <p className="font-cormorant text-base italic font-light text-[#8A8070] mt-1">
            Discover beauty secrets from any page
          </p>
        </div>

        {/* Input pill */}
        <div className="anim-up-d2 w-full mb-6">
          <div className="relative">
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Paste link to discover beauty secrets"
              className="w-full py-4 px-6 rounded-full font-sans text-sm text-[#1C1C1C] outline-none placeholder-[rgba(11,60,38,0.3)] transition-all"
              style={{
                background: "rgba(255,253,248,0.9)",
                border: "1px solid rgba(200,176,106,0.3)",
                boxShadow: "0 4px 20px rgba(11,60,38,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            />
            {link && (
              <button onClick={() => setLink("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8070] cursor-pointer opacity-50 hover:opacity-100">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Social icons */}
        <div className="anim-up-d3 flex items-center gap-4 mb-8">
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#8A8070] mr-1">From</p>
          {[
            { label: "IG", bg: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", title: "Instagram" },
            { label: "TT", bg: "#000000", title: "TikTok" },
            { label: "YT", bg: "#FF0000", title: "YouTube" },
            { label: "PT", bg: "#E60023", title: "Pinterest" },
          ].map((s) => (
            <button
              key={s.title}
              title={s.title}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg"
              style={{ background: s.bg }}>
              <span className="font-sans text-[8px] font-medium text-white tracking-wide">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Paste button */}
        <div className="anim-up-d4 w-full">
          <button
            onClick={onPaste}
            className="btn-rose w-full py-4 rounded-full cursor-pointer text-sm">
            Paste &amp; Discover
          </button>
          <p className="font-sans text-[9px] text-[#8A8070] mt-4 tracking-wide opacity-60">
            We'll identify any beauty product from the link
          </p>
        </div>
      </div>
    </div>
  );
}
