"use client";

export default function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 pt-14 pb-12">

      {/* Ambient pearlescent orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-8%] left-[-5%] w-[60vw] h-[60vw] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, rgba(240,232,204,0.8), transparent 65%)" }} />
        <div className="absolute bottom-[-5%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.5), transparent 65%)" }} />
        <div className="absolute top-[35%] right-[12%] w-[35vw] h-[35vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.6), transparent 70%)" }} />
        <div className="absolute bottom-[20%] left-[5%] w-[25vw] h-[25vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.4), transparent 65%)" }} />
      </div>

      {/* Floating product silhouettes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Perfume bottle top-right */}
        <div className="absolute top-[12%] right-[8%] opacity-20 anim-float" style={{ animationDelay: "0.3s" }}>
          <svg width="36" height="60" viewBox="0 0 36 60" fill="none">
            <rect x="6" y="16" width="24" height="40" rx="4" fill="#C8B06A" />
            <rect x="10" y="10" width="16" height="8" rx="2" fill="#A89050" />
            <circle cx="18" cy="8" r="4" fill="#C8B06A" />
            <rect x="11" y="24" width="14" height="22" rx="2" fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>
        {/* Cream jar bottom-left */}
        <div className="absolute bottom-[22%] left-[6%] opacity-15 anim-float" style={{ animationDelay: "1.2s" }}>
          <svg width="48" height="36" viewBox="0 0 48 36" fill="none">
            <ellipse cx="24" cy="30" rx="22" ry="6" fill="#C8B06A" opacity="0.6" />
            <rect x="2" y="14" width="44" height="18" rx="3" fill="#E8D8A8" />
            <ellipse cx="24" cy="14" rx="22" ry="6" fill="#F0E8CC" />
            <ellipse cx="24" cy="14" rx="16" ry="4" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
        {/* Lipstick mid-left */}
        <div className="absolute top-[45%] left-[4%] opacity-18 anim-float" style={{ animationDelay: "0.8s" }}>
          <svg width="22" height="52" viewBox="0 0 22 52" fill="none">
            <rect x="4" y="22" width="14" height="26" rx="2" fill="#C8B06A" />
            <rect x="6" y="24" width="10" height="14" fill="#C4968A" />
            <path d="M6 24 Q11 16 16 24" fill="#C4968A" />
            <rect x="3" y="42" width="16" height="8" rx="1" fill="#A89050" />
          </svg>
        </div>
        {/* Serum dropper top-left */}
        <div className="absolute top-[18%] left-[10%] opacity-12 anim-float" style={{ animationDelay: "2s" }}>
          <svg width="20" height="56" viewBox="0 0 20 56" fill="none">
            <rect x="6" y="18" width="8" height="32" rx="4" fill="rgba(11,60,38,0.3)" stroke="#C8B06A" strokeWidth="0.5" />
            <path d="M10 50 L10 56" stroke="#C8B06A" strokeWidth="1" />
            <ellipse cx="10" cy="10" rx="7" ry="9" fill="#E8D8A8" />
          </svg>
        </div>
        {/* Brush bottom-right */}
        <div className="absolute bottom-[15%] right-[10%] opacity-15 anim-float" style={{ animationDelay: "1.6s" }}>
          <svg width="16" height="64" viewBox="0 0 16 64" fill="none">
            <rect x="5" y="0" width="6" height="40" rx="1" fill="#C8B06A" />
            <ellipse cx="8" cy="52" rx="5" ry="12" fill="#8A7A5A" opacity="0.6" />
            <rect x="6" y="38" width="4" height="6" fill="#A89050" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">

        {/* Brand mark */}
        <div className="anim-up mb-1 flex flex-col items-center gap-1.5">
          <p className="font-sans text-[7px] tracking-[0.55em] uppercase text-[#C8B06A] opacity-70">
            The Muse
          </p>
          <p className="font-sans text-[8px] tracking-[0.38em] uppercase text-[#0B3C26] opacity-35">
            Bienvenue · Welcome · Willkommen
          </p>
        </div>

        {/* Swan */}
        <div className="anim-up-d1 anim-float my-7">
          <SwanLogo size={136} glow />
        </div>

        {/* Heading */}
        <div className="anim-up-d2">
          <h1 className="font-serif text-[2.4rem] font-normal text-[#0B3C26] leading-[1.12] mb-4">
            Elevating Your<br />Beauty Journey
          </h1>
          <div className="divider-gold my-4 mx-6" />
          <p className="font-cormorant text-[1.15rem] italic font-light text-[#8A8070] tracking-wide mb-9">
            Your world of curated luxury awaits
          </p>
        </div>

        {/* CTA */}
        <div className="anim-up-d3 w-full space-y-4">
          <button onClick={onNext}
            className="btn-gold w-full py-4 rounded-full cursor-pointer text-sm">
            Begin Your Ritual
          </button>
          <div className="text-center">
            <button onClick={onNext}
              className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-25 hover:opacity-55 transition-opacity cursor-pointer">
              Explore as Guest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function SwanLogo({ size = 80, color = "#0B3C26", glow = false }: { size?: number; color?: string; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={glow ? { filter: "drop-shadow(0 0 12px rgba(11,60,38,0.3))" } : undefined}>
      {/* Body */}
      <ellipse cx="52" cy="62" rx="26" ry="18" fill={color} opacity="0.9" />
      {/* Wing upper curve */}
      <path d="M28 58 Q20 38 38 28 Q54 18 68 30 Q76 38 72 52"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Wing detail */}
      <path d="M32 55 Q26 42 40 33 Q54 22 65 35"
        stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Neck */}
      <path d="M52 44 Q56 32 62 22 Q66 14 62 10"
        stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="61" cy="9" rx="5" ry="4.5" fill={color} />
      {/* Beak */}
      <path d="M64 8.5 L72 9 L64 11" fill={color} opacity="0.7" />
      {/* Eye */}
      <circle cx="63" cy="8" r="1" fill="white" opacity="0.8" />
      {/* Tail */}
      <path d="M76 64 Q84 60 86 68 Q82 72 74 70" fill={color} opacity="0.6" />
      {/* Water reflection line */}
      <path d="M26 76 Q52 80 78 76" stroke={color} strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
      {/* Gold accent ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#goldRing)" strokeWidth="0.5" fill="none" opacity="0.3" />
      <defs>
        <linearGradient id="goldRing" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C8B06A" />
          <stop offset="50%" stopColor="#E8D8A8" />
          <stop offset="100%" stopColor="#C8B06A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
