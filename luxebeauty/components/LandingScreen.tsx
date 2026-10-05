"use client";

function LampIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="36" rx="10" ry="2.5" fill="#1C2B1A" opacity="0.15" />
      <rect x="18.5" y="25" width="3" height="9" rx="1.5" fill="#1C2B1A" opacity="0.7" />
      <path d="M10 22 Q10 10 20 10 Q30 10 30 22 Z" fill="#1C2B1A" opacity="0.85" />
      <path d="M8 24 Q8 22 10 22 L30 22 Q32 22 32 24 L8 24 Z" fill="#1C2B1A" />
      <ellipse cx="20" cy="24" rx="12" ry="2" fill="#1C2B1A" opacity="0.6" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="1" y="1" width="8" height="3" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <rect x="1" y="1" width="3" height="8" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <rect x="19" y="1" width="8" height="3" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <rect x="24" y="1" width="3" height="8" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <rect x="1" y="24" width="8" height="3" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <rect x="1" y="19" width="3" height="8" rx="1" stroke="#C4968A" strokeWidth="1.5" fill="none" />
      <line x1="1" y1="14" x2="27" y2="14" stroke="#C4968A" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M6 22 Q6 8 22 4 Q22 18 6 22 Z" stroke="#C4968A" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M6 22 Q12 16 18 10" stroke="#C4968A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 2 L15.5 11 L24 12 L15.5 13.5 L14 22 L12.5 13.5 L4 12 L12.5 11 Z"
        stroke="#C4968A" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <circle cx="22" cy="5" r="1.5" stroke="#C4968A" strokeWidth="1" fill="none" />
      <circle cx="6" cy="22" r="1" stroke="#C4968A" strokeWidth="1" fill="none" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 23 C14 23 4 16 4 9.5 C4 6.5 6.5 4 9.5 4 C11.5 4 13 5 14 6.5 C15 5 16.5 4 18.5 4 C21.5 4 24 6.5 24 9.5 C24 16 14 23 14 23 Z"
        stroke="#C4968A" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  {
    icon: <ScanIcon />,
    title: "Identify Anything",
    desc: "A single photograph reveals the brand, the shade, the ingredient story.",
  },
  {
    icon: <LeafIcon />,
    title: "The Local Curator",
    desc: "Ethical alternatives crafted closer to home — same ritual, lighter footprint.",
  },
  {
    icon: <SparkleIcon />,
    title: "Your Vanity",
    desc: "A living archive of everything you own, arranged like an atelier.",
  },
  {
    icon: <HeartIcon />,
    title: "Whispered Wisdom",
    desc: "The Muse answers, never shouts — beauty knowledge for every skin, every budget.",
  },
];

export default function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen overflow-y-auto no-scrollbar" style={{ background: "#FAF6EF" }}>

      {/* ── Nav ── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LampIcon size={28} />
          <span style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.25rem",
            color: "#1C2B1A",
            letterSpacing: "-0.01em",
          }}>
            LuxeBeauty
          </span>
        </div>
        <button onClick={onNext} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.82rem",
          color: "#1C2B1A",
          background: "transparent",
          border: "1.5px solid rgba(28,43,26,0.35)",
          borderRadius: 50,
          padding: "8px 22px",
          cursor: "pointer",
          letterSpacing: "0.02em",
        }}>
          Enter
        </button>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: "36px 28px 52px" }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.68rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#3A5A3A",
          marginBottom: 24,
        }}>
          Elevating Your Beauty Journey
        </p>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "2.55rem",
          fontWeight: 400,
          color: "#1C2B1A",
          lineHeight: 1.14,
          marginBottom: 6,
        }}>
          Luxury is not a price.
        </h1>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.55rem",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#C4968A",
          lineHeight: 1.14,
          marginBottom: 32,
        }}>
          It is being seen.
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "1rem",
          color: "#1C2B1A",
          lineHeight: 1.65,
          marginBottom: 36,
          maxWidth: 360,
        }}>
          A beauty intelligence platform that identifies products, finds ethical alternatives, and makes beauty knowledge accessible to every skin tone, ability, and budget.
        </p>

        <button onClick={onNext} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.95rem",
          color: "white",
          background: "#C4968A",
          border: "none",
          borderRadius: 50,
          padding: "14px 28px",
          cursor: "pointer",
          marginBottom: 28,
        }}>
          Explore Now &nbsp;→
        </button>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: "#8A8070",
          letterSpacing: "0.02em",
        }}>
          Bienvenue · Welcome · Willkommen · أهلاً
        </p>
      </section>

      {/* ── Photo card ── */}
      <section style={{ padding: "0 20px 52px" }}>
        <div style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "linear-gradient(160deg, #D9C9B8 0%, #C4B4A4 30%, #B8A898 60%, #A89888 100%)",
          height: 380,
        }}>
          {/* Skin-tone gradient placeholder representing the model photo */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(170deg, #E8D4C0 0%, #C8A88A 25%, #B09070 55%, #D4B89A 80%, #C0A080 100%)",
          }} />
          {/* Subtle highlight */}
          <div style={{
            position: "absolute",
            top: 0,
            left: "20%",
            width: "60%",
            height: "50%",
            background: "radial-gradient(ellipse, rgba(255,245,235,0.55) 0%, transparent 70%)",
          }} />

          {/* Quote card */}
          <div style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            background: "rgba(250,246,239,0.88)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(196,150,138,0.2)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="5" r="3" fill="#C4968A" opacity="0.7" />
                <path d="M2 13 Q2 9 7 9 Q12 9 12 13" stroke="#C4968A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "#1C2B1A",
              lineHeight: 1.45,
            }}>
              "We whisper beauty secrets. We never shout."
            </p>
          </div>
        </div>
      </section>

      {/* ── Ritual / Features ── */}
      <section style={{ padding: "4px 28px 48px" }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#5A7A5A",
          marginBottom: 14,
        }}>
          The Ritual
        </p>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.1rem",
          fontWeight: 400,
          color: "#1C2B1A",
          lineHeight: 1.2,
          marginBottom: 48,
        }}>
          Four quiet powers, one elegant companion.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title}>
              <div style={{ marginBottom: 12 }}>{icon}</div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.55rem",
                fontWeight: 400,
                color: "#1C2B1A",
                marginBottom: 8,
                lineHeight: 1.25,
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.92rem",
                color: "#5A5040",
                lineHeight: 1.6,
              }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "60px 28px 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 32 }}>
          <LampIcon size={40} />
        </div>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.3rem",
          fontWeight: 400,
          color: "#1C2B1A",
          lineHeight: 1.2,
          marginBottom: 36,
        }}>
          The Muse is ready.<br />The world is waiting.
        </h2>

        <button onClick={onNext} style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.95rem",
          color: "white",
          background: "#1A4030",
          border: "none",
          borderRadius: 50,
          padding: "16px 40px",
          cursor: "pointer",
          letterSpacing: "0.02em",
          marginBottom: 56,
        }}>
          Begin Your Journey
        </button>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.62rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#8A8070",
        }}>
          LuxeBeauty — Editorial Beauty Intelligence
        </p>
      </section>

    </div>
  );
}

export function SwanLogo({ size = 80, color = "#0B3C26", glow = false }: { size?: number; color?: string; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={glow ? { filter: "drop-shadow(0 0 12px rgba(11,60,38,0.3))" } : undefined}>
      <ellipse cx="52" cy="62" rx="26" ry="18" fill={color} opacity="0.9" />
      <path d="M28 58 Q20 38 38 28 Q54 18 68 30 Q76 38 72 52"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 55 Q26 42 40 33 Q54 22 65 35"
        stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M52 44 Q56 32 62 22 Q66 14 62 10"
        stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="61" cy="9" rx="5" ry="4.5" fill={color} />
      <path d="M64 8.5 L72 9 L64 11" fill={color} opacity="0.7" />
      <circle cx="63" cy="8" r="1" fill="white" opacity="0.8" />
      <path d="M76 64 Q84 60 86 68 Q82 72 74 70" fill={color} opacity="0.6" />
      <path d="M26 76 Q52 80 78 76" stroke={color} strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
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
