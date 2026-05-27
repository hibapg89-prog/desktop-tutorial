"use client";

export default function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-between relative overflow-hidden px-8 pt-14 pb-12">

      {/* Ambient pearlescent orbs */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(240,232,204,0.8), transparent 65%)" }} />
        <div className="absolute bottom-[-5%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.5), transparent 65%)" }} />
        <div className="absolute top-[40%] right-[15%] w-[30vw] h-[30vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.6), transparent 70%)" }} />
      </div>

      {/* Top label */}
      <div className="anim-up w-full flex justify-center">
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-[#0B3C26] opacity-60">
          Membership Concierge
        </p>
      </div>

      {/* Swan logo — center hero */}
      <div className="anim-up-d1 flex flex-col items-center text-center relative z-10 flex-1 justify-center">
        <div className="anim-float mb-8">
          <SwanLogo size={120} />
        </div>
        <h1 className="font-serif text-4xl font-normal text-[#1C1C1C] leading-[1.15] mb-5 max-w-xs">
          Your personal curator<br />
          <em className="font-cormorant italic font-light">is preparing fresh</em><br />
          inspirations.
        </h1>
        <p className="font-sans text-sm font-light text-[#C4968A] tracking-wide mb-10">
          Please allow us a moment to tailor<br />your exclusive selections.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          <button onClick={onNext} className="btn-rose py-4 rounded-full cursor-pointer">
            Explore Benefits
          </button>
          <button onClick={onNext}
            className="font-sans text-[10px] tracking-[0.22em] uppercase text-[#0B3C26] py-3 cursor-pointer hover:opacity-70 transition-opacity">
            Notify Me When Ready
          </button>
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
