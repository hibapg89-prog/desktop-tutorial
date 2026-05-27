"use client";

interface Props { onBack: () => void; }

const REVIEWS = [
  {
    id: "1",
    product: "Charlotte Tilbury Matte Revolution",
    reviewer: "Amélie D.",
    rating: 5,
    text: "Absolute perfection. The shade Rouge Vin lasts all day without drying.",
    productGradient: "linear-gradient(145deg, #8B3A3A, #C4968A)",
    faceColor: "#E8C0A0",
    initials: "AD",
  },
  {
    id: "2",
    product: "La Mer Crème de la Mer",
    reviewer: "Sophie M.",
    rating: 5,
    text: "Worth every penny. My skin has never felt so deeply nourished.",
    productGradient: "linear-gradient(145deg, #C8B06A, #E8D898)",
    faceColor: "#D4A888",
    initials: "SM",
  },
  {
    id: "3",
    product: "YSL Black Opium",
    reviewer: "Isabelle R.",
    rating: 4,
    text: "Intoxicating scent. My signature fragrance for evening events.",
    productGradient: "linear-gradient(145deg, #1A1A2A, #3A2A5A)",
    faceColor: "#C8A080",
    initials: "IR",
  },
  {
    id: "4",
    product: "Dior Backstage Palette",
    reviewer: "Claire L.",
    rating: 5,
    text: "Professional quality. The pigmentation is extraordinary.",
    productGradient: "linear-gradient(145deg, #5A3828, #C4A882)",
    faceColor: "#E0C0A0",
    initials: "CL",
  },
];

const EDITOR_PICKS = [
  {
    id: "1", name: "Sulwhasoo First Care", brand: "Sulwhasoo",
    productGradient: "linear-gradient(145deg, #A8B898, #1A5C3A)",
    faceGradient: "linear-gradient(145deg, #D4C0A8, #B89880)",
    tag: "Editor's Favourite",
  },
  {
    id: "2", name: "NARS Sheer Glow", brand: "NARS",
    productGradient: "linear-gradient(145deg, #C4968A, #8A5A50)",
    faceGradient: "linear-gradient(145deg, #E8C8A8, #C8A888)",
    tag: "Best Seller",
  },
  {
    id: "3", name: "Chanel No. 5 L'Eau", brand: "Chanel",
    productGradient: "linear-gradient(145deg, #E8D898, #C8B06A)",
    faceGradient: "linear-gradient(145deg, #F0D8C0, #D4B898)",
    tag: "Icon",
  },
  {
    id: "4", name: "Tatcha Dewy Skin Cream", brand: "Tatcha",
    productGradient: "linear-gradient(145deg, #D8E8D0, #1A5C3A)",
    faceGradient: "linear-gradient(145deg, #E0C8B0, #C8A890)",
    tag: "Bestseller",
  },
];

export default function ReviewsScreen({ onBack }: Props) {
  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Community</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Reviews</h2>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">

        {/* Section 1: Member Reviews */}
        <div className="mb-6">
          <div className="px-6 mb-3 flex items-center justify-between">
            <div>
              <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-0.5">Community</p>
              <h3 className="font-serif text-lg font-normal text-[#1C1C1C]">Curated Member Reviews</h3>
            </div>
            <button className="font-sans text-[9px] tracking-[0.15em] uppercase text-[#0B3C26] opacity-40 hover:opacity-80 transition-opacity cursor-pointer">
              All →
            </button>
          </div>

          {/* Horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto px-6 pb-3 scrollbar-hide"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
            {REVIEWS.map(r => (
              <div key={r.id}
                className="card-pearl rounded-2xl p-4 flex-shrink-0 w-64 flex flex-col gap-3">

                {/* Product image */}
                <div className="h-24 rounded-xl overflow-hidden relative flex-shrink-0">
                  <div className="absolute inset-0" style={{ background: r.productGradient }} />
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <ProductIconSVG />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="font-sans text-[7px] tracking-wide text-white opacity-70">
                      {r.product.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>
                </div>

                {/* Reviewer */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-sans text-[9px] font-medium text-white"
                    style={{ background: r.faceColor }}>
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[10px] font-medium text-[#1C1C1C] truncate">{r.reviewer}</p>
                    {/* Star rating — emerald filled squares */}
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i}
                          className="w-2.5 h-2.5 rounded-[2px]"
                          style={{ background: i < r.rating ? "#0B3C26" : "rgba(11,60,38,0.12)" }} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="font-sans text-[10px] font-light text-[#5A5040] leading-relaxed line-clamp-2">
                  &ldquo;{r.text}&rdquo;
                </p>

                <p className="font-sans text-[8px] tracking-wide text-[#0B3C26] opacity-50 truncate">{r.product}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="divider-gold flex-1" />
            <span className="font-sans text-[7px] tracking-[0.3em] uppercase text-[#C8B06A]">✦</span>
            <div className="divider-gold flex-1" />
          </div>
        </div>

        {/* Section 2: Editor's Picks */}
        <div className="px-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A] mb-0.5">Curated by The Muse</p>
              <h3 className="font-serif text-lg font-normal text-[#1C1C1C]">Editor&apos;s Picks</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EDITOR_PICKS.map(pick => (
              <div key={pick.id}
                className="card-pearl rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200">

                {/* Split image: product | face */}
                <div className="h-32 flex overflow-hidden">
                  <div className="flex-1 relative">
                    <div className="absolute inset-0" style={{ background: pick.productGradient }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-25">
                      <ProductIconSVG />
                    </div>
                  </div>
                  <div className="w-px bg-[rgba(200,176,106,0.2)]" />
                  <div className="flex-1 relative">
                    <div className="absolute inset-0" style={{ background: pick.faceGradient }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <SmallFaceSVG />
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <span className="font-sans text-[7px] tracking-[0.15em] uppercase text-[#C8B06A]">{pick.tag}</span>
                  <p className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mt-0.5">{pick.name}</p>
                  <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">{pick.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductIconSVG() {
  return (
    <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
      <rect x="12" y="18" width="16" height="32" rx="8" fill="white" />
      <ellipse cx="20" cy="12" rx="10" ry="12" fill="white" />
    </svg>
  );
}

function SmallFaceSVG() {
  return (
    <svg width="50" height="70" viewBox="0 0 50 70" fill="none">
      <ellipse cx="25" cy="30" rx="16" ry="20" fill="rgba(255,255,255,0.5)" />
      <path d="M9 22 Q9 6 25 4 Q41 6 41 22" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="18" cy="29" rx="3" ry="2" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="32" cy="29" rx="3" ry="2" fill="rgba(255,255,255,0.4)" />
      <path d="M18 42 Q25 47 32 42" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="20" y="49" width="10" height="14" rx="4" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
