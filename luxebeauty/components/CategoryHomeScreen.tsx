"use client";

interface Props {
  onVanity: () => void;
  onProducts: () => void;
  onBack: () => void;
}

const categories = [
  { id: "muse", label: "The Muse", emoji: "✦", color: "#C9A96E", bg: "#FAF0E0", desc: "Your curator" },
  { id: "makeup", label: "Makeup", emoji: "💄", color: "#C4A0A0", bg: "#FDF5F5", desc: "Color & beauty" },
  { id: "skincare", label: "Skincare", emoji: "✿", color: "#8AA89A", bg: "#F2F8F5", desc: "Glow routines" },
  { id: "haircare", label: "Haircare", emoji: "◉", color: "#B4A4C0", bg: "#F8F4FC", desc: "Lush locks" },
  { id: "fragrance", label: "Fragrance", emoji: "◇", color: "#C0A898", bg: "#FDF8F4", desc: "Signature scents" },
  { id: "body", label: "Body", emoji: "❧", color: "#A0B4B0", bg: "#F4F9F8", desc: "Head to toe" },
  { id: "nails", label: "Nails", emoji: "◈", color: "#C4A4A8", bg: "#FDF4F5", desc: "Polish & art" },
  { id: "devices", label: "Devices", emoji: "⬡", color: "#9AB0C0", bg: "#F4F8FB", desc: "Tech beauty" },
  { id: "accessories", label: "Accessories", emoji: "∗", color: "#C0B490", bg: "#FAF8F0", desc: "Finishing touch" },
];

export default function CategoryHomeScreen({ onVanity, onProducts, onBack }: Props) {
  return (
    <div className="marble-bg min-h-screen overflow-y-auto">

      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex items-center justify-between">
        <div>
          <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-[#C9A96E] mb-1">Home Screen</p>
          <h2 className="font-display text-3xl font-normal text-[#2C2C2C]">Your World</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onVanity}
            className="btn-outline-gold px-4 py-2.5 rounded-full text-[10px] tracking-widest cursor-pointer"
          >
            My Vanity
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 pb-20 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={cat.id === "muse" ? onVanity : onProducts}
            className={`rounded-3xl overflow-hidden relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg text-left group
              ${cat.id === "muse" ? "col-span-2 h-36" : "h-44"}`}
            style={{
              background: cat.bg,
              border: "1px solid rgba(201,169,110,0.15)",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 80% 20%, ${cat.color}18, transparent 60%)`,
              }}
            />

            <div className="relative z-10 p-5 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-2xl" style={{ color: cat.color }}>{cat.emoji}</span>
                <span className="font-jost text-[9px] tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: cat.color }}>
                  Shop →
                </span>
              </div>

              <div>
                <p className="font-display text-xl font-normal text-[#2C2C2C] mb-0.5">{cat.label}</p>
                <p className="font-jost text-xs text-[#8A7F74]">{cat.desc}</p>
              </div>
            </div>

            {/* Gold accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${cat.color}60, transparent)` }}
            />
          </button>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-12 left-0 right-0 px-6">
        <div className="max-w-sm mx-auto flex justify-center gap-8">
          <button onClick={onBack}
            className="font-jost text-[10px] tracking-[0.15em] uppercase text-[#8A7F74] hover:text-[#C9A96E] transition-colors cursor-pointer">
            Profile
          </button>
          <div className="w-px bg-[#C9A96E] opacity-30" />
          <button onClick={onVanity}
            className="font-jost text-[10px] tracking-[0.15em] uppercase text-[#8A7F74] hover:text-[#C9A96E] transition-colors cursor-pointer">
            Vanity
          </button>
          <div className="w-px bg-[#C9A96E] opacity-30" />
          <button onClick={onProducts}
            className="font-jost text-[10px] tracking-[0.15em] uppercase text-[#8A7F74] hover:text-[#C9A96E] transition-colors cursor-pointer">
            Shop
          </button>
        </div>
      </div>
    </div>
  );
}
