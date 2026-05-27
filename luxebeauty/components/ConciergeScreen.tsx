"use client";

import { SwanLogo } from "./LandingScreen";

interface Props { onNext: () => void; }

export default function ConciergeScreen({ onNext }: Props) {
  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-between relative overflow-hidden px-8 pt-14 pb-12">

      {/* Ambient pearlescent orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(240,232,204,0.8), transparent 65%)" }} />
        <div className="absolute bottom-[-5%] right-[-10%] w-[45vw] h-[45vw] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(196,150,138,0.5), transparent 65%)" }} />
        <div className="absolute top-[40%] right-[15%] w-[30vw] h-[30vw] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.6), transparent 70%)" }} />
        <div className="absolute top-[60%] left-[8%] w-[20vw] h-[20vw] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.4), transparent 65%)" }} />
      </div>

      {/* Top label */}
      <div className="anim-up w-full flex justify-center">
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-[#0B3C26] opacity-60">
          Membership Concierge
        </p>
      </div>

      {/* Swan logo — center hero with iridescent glow */}
      <div className="anim-up-d1 flex flex-col items-center text-center relative z-10 flex-1 justify-center">
        <div className="anim-float mb-8 relative">
          {/* Iridescent glow behind swan */}
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(200,176,106,0.25) 0%, rgba(196,150,138,0.15) 40%, transparent 70%)",
              transform: "scale(1.8)",
              filter: "blur(20px)",
            }} />
          <SwanLogo size={120} glow />
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
