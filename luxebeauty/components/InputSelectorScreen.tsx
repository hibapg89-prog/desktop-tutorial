"use client";

import { SwanLogo } from "./LandingScreen";

interface Props {
  onCamera: () => void;
  onGallery: () => void;
  onLink: () => void;
  onVoice: () => void;
  onBack: () => void;
}

export default function InputSelectorScreen({ onCamera, onGallery, onLink, onVoice, onBack }: Props) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #082A1B, #0B3C26, #0D4A2E)" }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.8), transparent 65%)" }} />
      </div>

      {/* Back button */}
      <div className="px-6 pt-12 pb-4 flex items-center flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.25em] uppercase text-[rgba(240,232,204,0.6)] hover:text-[rgba(240,232,204,1)] transition-colors cursor-pointer">
          ← Back
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-8 px-6">
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-[rgba(200,176,106,0.7)] mb-2">
          Choose Your Input
        </p>
        <h2 className="font-serif text-2xl font-normal text-[rgba(240,232,204,0.95)]">
          Discover Beauty
        </h2>
      </div>

      {/* Icon grid */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xs">

          {/* Top row: 3 tiles */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <TileButton icon={<CameraIcon />} label="Camera" onClick={onCamera} />
            <TileButton icon={<GalleryIcon />} label="Gallery" onClick={onGallery} />
            <TileButton icon={<LinkIcon />} label="Link" onClick={onLink} />
          </div>

          {/* Center swan button */}
          <div className="flex justify-center my-4">
            <button onClick={onCamera}
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(145deg, #C8B06A, #A89050)",
                boxShadow: "0 8px 40px rgba(200,176,106,0.5), 0 0 0 1px rgba(200,176,106,0.3)",
              }}>
              <SwanLogo size={48} color="rgba(255,253,248,0.95)" />
            </button>
          </div>

          {/* Bottom row: 2 tiles */}
          <div className="grid grid-cols-2 gap-3">
            <TileButton icon={<AudioIcon />} label="Audio" onClick={onVoice} />
            <TileButton icon={<EffectsIcon />} label="Effects" onClick={onCamera} />
          </div>
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}

function TileButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="rounded-2xl flex flex-col items-center justify-center gap-2 py-5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: "rgba(250,246,239,0.95)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: "1px solid rgba(200,176,106,0.2)",
      }}>
      <div className="text-[#0B3C26]">{icon}</div>
      <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#0B3C26] font-medium">{label}</span>
    </button>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#0B3C26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8C2 6.9 2.9 6 4 6H6L8 3H20L22 6H24C25.1 6 26 6.9 26 8V22C26 23.1 25.1 24 24 24H4C2.9 24 2 23.1 2 22V8Z" />
      <circle cx="14" cy="15" r="4" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#0B3C26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="22" height="22" rx="3" />
      <path d="M3 19L9 13L13 17L18 11L25 19" />
      <circle cx="9.5" cy="9.5" r="2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#0B3C26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 18L18 10" />
      <path d="M16 8L20 4C21.1 4 22 4.9 22 6V10L20 12" />
      <path d="M12 20L10 22C9.1 22 8 21.1 8 20V16L6 14" />
      <path d="M6 14L4 12C4 10.9 4.9 10 6 10L10 10L12 12" />
      <path d="M22 18L20 16" />
    </svg>
  );
}

function AudioIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#0B3C26" strokeWidth="1.5" strokeLinecap="round">
      <rect x="9" y="3" width="10" height="14" rx="5" />
      <path d="M5 14C5 19.5 8.9 24 14 24C19.1 24 23 19.5 23 14" />
      <line x1="14" y1="24" x2="14" y2="27" />
      <line x1="10" y1="27" x2="18" y2="27" />
    </svg>
  );
}

function EffectsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#0B3C26" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 3L16.5 9.5L23 12L16.5 14.5L14 21L11.5 14.5L5 12L11.5 9.5L14 3Z" />
      <path d="M22 18L23 20L25 21L23 22L22 24L21 22L19 21L21 20L22 18Z" />
      <path d="M6 4L7 6L9 7L7 8L6 10L5 8L3 7L5 6L6 4Z" />
    </svg>
  );
}
