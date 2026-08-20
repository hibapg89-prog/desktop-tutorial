import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TABS = ["MAKEUP", "SKINCARE", "HAIR", "WELLNESS"];

const SAMPLE_TUTORIALS = [
  // ── MAKEUP ──────────────────────────────────────────────────────────────────
  {
    id: "sample-1",
    title: "MET GALA GLAM",
    category: "Makeup",
    difficulty: "Advanced",
    duration_minutes: 30,
    image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  {
    id: "sample-2",
    title: "SMOKEY EYE MASTERY",
    category: "Makeup",
    difficulty: "Intermediate",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&q=80",
    aspect: "4/5",
  },
  {
    id: "sample-3",
    title: "CLEAN GIRL AESTHETIC",
    category: "Makeup",
    difficulty: "Beginner",
    duration_minutes: 8,
    image_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80",
    aspect: "2/3",
    is_muse_original: true,
  },
  {
    id: "sample-8",
    title: "THE NATURAL ARCH",
    category: "Makeup",
    difficulty: "Intermediate",
    duration_minutes: 8,
    image_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  {
    id: "sample-11",
    title: "FRENCH GIRL FLUSH",
    category: "Makeup",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80",
    aspect: "4/5",
    is_muse_original: true,
  },
  // ── SKINCARE ────────────────────────────────────────────────────────────────
  {
    id: "sample-4",
    title: "DOUBLE CLEANSE METHOD",
    category: "Skincare",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  {
    id: "sample-5",
    title: "GLASS SKIN RITUAL",
    category: "Skincare",
    difficulty: "Intermediate",
    duration_minutes: 20,
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    aspect: "4/5",
    is_muse_original: true,
  },
  {
    id: "sample-12",
    title: "RETINOL DECODED",
    category: "Skincare",
    difficulty: "Intermediate",
    duration_minutes: 15,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80",
    aspect: "2/3",
    is_muse_original: true,
  },
  {
    id: "sample-13",
    title: "GUA SHA CEREMONY",
    category: "Skincare",
    difficulty: "Beginner",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  // ── HAIR ────────────────────────────────────────────────────────────────────
  {
    id: "sample-6",
    title: "SILK HAIR THERAPY",
    category: "Hair",
    difficulty: "Beginner",
    duration_minutes: 15,
    image_url: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=500&q=80",
    aspect: "4/5",
    is_muse_original: true,
  },
  {
    id: "sample-14",
    title: "THE BLOWOUT EFFECT",
    category: "Hair",
    difficulty: "Intermediate",
    duration_minutes: 25,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  {
    id: "sample-15",
    title: "CURL DEFINITION RITUAL",
    category: "Hair",
    difficulty: "Beginner",
    duration_minutes: 20,
    image_url: "https://images.unsplash.com/photo-1605980625600-88e30e6c9d38?w=500&q=80",
    aspect: "2/3",
    is_muse_original: true,
  },
  // ── WELLNESS ────────────────────────────────────────────────────────────────
  {
    id: "sample-7",
    title: "MORNING LIGHT RITUAL",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80",
    aspect: "3/4",
    is_muse_original: true,
  },
  {
    id: "sample-16",
    title: "THE ICE RITUAL",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=80",
    aspect: "4/5",
    is_muse_original: true,
  },
  {
    id: "sample-17",
    title: "BODY OIL CEREMONY",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 12,
    image_url: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=500&q=80",
    aspect: "2/3",
    is_muse_original: true,
  },
];

export default function Tutorials() {
  const [activeTab, setActiveTab] = useState("MAKEUP");
  const [dbTutorials, setDbTutorials] = useState([]);

  useEffect(() => {
    base44.entities.Tutorial.list("-created_date", 20).then(setDbTutorials).catch(() => {});
  }, []);

  const allTutorials = [
    ...SAMPLE_TUTORIALS,
    ...dbTutorials.map((t) => ({ ...t, id: t.id })),
  ];

  const filtered = allTutorials.filter((t) =>
    activeTab === "MAKEUP"   ? t.category === "Makeup"   :
    activeTab === "SKINCARE" ? t.category === "Skincare" :
    activeTab === "HAIR"     ? t.category === "Hair"     :
                               t.category === "Wellness"
  );

  const col1 = filtered.filter((_, i) => i % 2 === 0);
  const col2 = filtered.filter((_, i) => i % 2 === 1);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header banner with live tutorial count */}
      <div className="px-5 pt-14 pb-4">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/8fab7b99a_IMG_4556.jpeg"
            alt="The Edit — Tutorials"
            className="w-full h-auto block"
            draggable={false}
          />
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full border border-[#C5A059]/70 bg-[#0A3D2A]/40 backdrop-blur-sm"
            aria-label="Back"
          >
            <ChevronLeft size={18} color="#C5A059" />
          </button>
          {/* Live tutorial count */}
          {allTutorials.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F1E9]/85 backdrop-blur-sm border border-[#B8A882]/50">
              <span className="text-xs font-light text-[#2D362E]">{allTutorials.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Gold divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/30 to-transparent mb-8" />

      {/* Tabs */}
      <div className="flex justify-center px-6 gap-2.5 mb-12 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-7 py-2.5 rounded-full text-[10px] tracking-[0.26em] font-light transition-all border ${
              activeTab === tab
                ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                : "bg-transparent text-[var(--color-text-primary)]/65 border-[#C8B06A]/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Editorial Masonry */}
      <div className="px-5 pb-28">
        <div className="flex gap-5 max-w-2xl mx-auto">
          {/* Column 1 */}
          <div className="flex-1 flex flex-col gap-8">
            {col1.map((tutorial, i) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} index={i * 2} />
            ))}
          </div>
          {/* Column 2 — offset for stagger */}
          <div className="flex-1 flex flex-col gap-8 mt-14">
            {col2.map((tutorial, i) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} index={i * 2 + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TutorialCard({ tutorial, index }) {
  const [aspired, setAspired] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.4), ease: "easeOut" }}
    >
      <div>
        {/* Full-width Photo */}
        <Link to={`/tutorial/${tutorial.id}`} className="block">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{ aspectRatio: tutorial.aspect || "3/4" }}
          >
            <img
              src={tutorial.image_url}
              alt={tutorial.title}
              className="w-full h-full object-cover"
            />
            {/* Subtle bottom gradient for depth */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
            {/* Difficulty badge */}
            {tutorial.difficulty && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-[var(--color-bg)]/90 text-[var(--color-text-primary)] text-[8px] tracking-[0.22em] uppercase font-light rounded-full">
                  {tutorial.difficulty}
                </span>
              </div>
            )}
            {/* Muse Original badge */}
            {tutorial.is_muse_original && (
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 bg-[var(--color-accent-gold)] text-white text-[8px] tracking-[0.15em] uppercase font-light rounded-full">
                  Muse
                </span>
              </div>
            )}
          </div>

          {/* Editorial caption block */}
          <div className="pt-5 pb-2">
            <p className="text-[8px] tracking-[0.34em] text-[var(--color-accent-gold)] uppercase font-light mb-2">
              {tutorial.category}
            </p>
            <h2 className="font-serif text-[19px] text-[var(--color-text-primary)] font-light leading-[1.25] tracking-[0.02em]">
              {tutorial.title}
            </h2>
          </div>
        </Link>

        {/* Footer: time + aspire heart */}
        <div className="pb-5 pt-2 flex items-center justify-between border-b border-[#C8B06A]/25">
          <p className="text-[9px] text-primary-45 font-light tracking-[0.18em] uppercase">
            {tutorial.duration_minutes ? `${tutorial.duration_minutes} min read` : ""}
          </p>
          <button
            onClick={() => setAspired((v) => !v)}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              aspired ? "bg-[#C8B06A]/15" : "bg-transparent"
            }`}
            aria-label="Aspire"
          >
            <Heart
              size={13}
              color={aspired ? "#C8B06A" : "var(--color-text-primary)"}
              fill={aspired ? "#C8B06A" : "none"}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}