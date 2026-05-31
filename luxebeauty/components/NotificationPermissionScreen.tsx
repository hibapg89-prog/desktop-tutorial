"use client";

interface Props {
  onAllow: () => void;
  onSkip:  () => void;
}

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕"];

export default function NotificationPermissionScreen({ onAllow, onSkip }: Props) {
  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8">

      {/* Ambient gold halo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,176,106,0.14), transparent 60%)" }} />
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

      {/* Bell icon */}
      <div className="relative z-10 mb-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(200,176,106,0.12), rgba(200,176,106,0.04))",
            border: "1px solid rgba(200,176,106,0.3)",
          }}>
          <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
            <path d="M15 1C15 1 7 5 7 14L5 25H25L23 14C23 5 15 1 15 1Z"
              stroke="#C8B06A" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
            <path d="M11 25C11 27.2 12.8 29 15 29C17.2 29 19 27.2 19 25"
              stroke="#C8B06A" strokeWidth="1.4" fill="none" />
            <circle cx="15" cy="2" r="1.8" fill="#C8B06A" opacity="0.7" />
            <path d="M8 13 Q10 9 14 8" stroke="#C8B06A" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="relative z-10 text-center mb-6 max-w-xs">
        <p className="font-sans text-[8px] tracking-[0.35em] uppercase text-[#C8B06A] mb-3">
          The Muse Awaits
        </p>
        <h2 className="font-serif text-3xl font-normal text-[#1C1C1C] leading-tight mb-4">
          Allow The Muse to<br />whisper beauty secrets?
        </h2>
        <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed">
          Morning beauty edits, new launches, and your personalised ritual reminders — delivered with intention, never noise.
        </p>
      </div>

      {/* Notification preview card */}
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
                LuxeBeauty · Morning Muse · 8:00
              </p>
              <p className="font-cormorant text-sm italic text-[#8A8070] leading-snug">
                "Your ritual awaits, chérie ✦"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 w-full max-w-xs space-y-3">
        <button onClick={onAllow}
          className="w-full py-4 rounded-full font-sans text-[11px] tracking-[0.18em] uppercase cursor-pointer transition-all duration-300"
          style={{
            background: "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)",
            color: "white",
            boxShadow: "0 4px 24px rgba(200,176,106,0.4)",
          }}>
          Yes, whisper to me ✦
        </button>
        <button onClick={onSkip}
          className="w-full py-3 text-center cursor-pointer opacity-50 hover:opacity-80 transition-opacity">
          <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#0B3C26]">
            Not right now
          </span>
        </button>
      </div>
    </div>
  );
}
