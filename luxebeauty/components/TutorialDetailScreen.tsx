"use client";

import { useState } from "react";
import { useToast } from "./ToastContext";

interface Props { tutorialId: string; onBack: () => void; }

interface Creator {
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube";
  avatarColor: string;
}

interface Tutorial {
  id: string; title: string; category: string;
  tab: string; difficulty: "Beginner" | "Intermediate" | "Expert";
  duration: number; saves: number; emoji: string;
  gradient: string; accent: string;
  description: string;
  materials: string[];
  steps: { emoji: string; text: string }[];
  creator: Creator;
}

const TUTORIALS: Tutorial[] = [
  {
    id: "t1", title: "Smokey Monica Bellucci Inspired", category: "Tutorial",
    tab: "Makeup", difficulty: "Intermediate", duration: 10, saves: 847,
    emoji: "👁️", gradient: "linear-gradient(145deg, #1A1A2E, #3A2A5A, #6A4A8A)", accent: "#9A70B8",
    description: "A deep, intense smokey eye inspired by Monica Bellucci's iconic screen looks. Layered brown and black tones create a smouldering effect that reads both editorial and wearable for evening.",
    materials: ["Chocolate brown pencil","Black pencil","Black eyeshadow","Medium brown powder eyeshadow","Beige eyeshadow","Mascara","False lashes","Fluffy blending brush","Precise liner brush"],
    creator: { name: "Valentina Ricci", handle: "@valentina.mua", platform: "instagram", avatarColor: "#9A70B8" },
    steps: [
      { emoji: "✏️", text: "Apply a chocolate brown pencil over the entire eyelid to create a creamy base." },
      { emoji: "🖌️", text: "Use a small brush to stretch and blend the pencil from the lash line upwards towards the crease." },
      { emoji: "✨", text: "Use a clean fluffy brush to diffuse the edges — no harsh lines." },
      { emoji: "👁️", text: "Apply the brown pencil along the lower lash line and blend with a precise brush for a smudged effect." },
      { emoji: "🖤", text: "Pat black eyeshadow over the brown base on the mobile lid to set the cream product." },
      { emoji: "🤎", text: "Apply a medium brown powder shade above the black in the crease for a seamless gradient." },
      { emoji: "🖤", text: "Apply black eyeshadow to the lower lash line over the brown pencil to lock the colour." },
      { emoji: "✨", text: "Use a black powder liner to create a subtle wing, connecting it to the lid shadow." },
      { emoji: "⭐", text: "Apply beige eyeshadow under the brow bone and inner corner to highlight and brighten." },
      { emoji: "✏️", text: "Tightline the upper and lower waterlines with a black pencil for added intensity." },
      { emoji: "💫", text: "Finish with mascara. Add false lashes for extra drama if desired." },
    ],
  },
  {
    id: "t2", title: "No-Makeup Luminous Glow", category: "How-To",
    tab: "Makeup", difficulty: "Beginner", duration: 12, saves: 1203,
    emoji: "✨", gradient: "linear-gradient(145deg, #2A1A14, #5A3A2A, #C4968A)", accent: "#C4968A",
    description: "Achieve that effortless 'your skin but better' finish. This luminous, barely-there technique uses skin-care-first principles to let your complexion shine through.",
    materials: ["Tinted moisturiser with SPF","Peach concealer","Clear brow gel","Champagne highlighter","Tubing mascara","Tinted lip balm"],
    creator: { name: "Clémentine Sao", handle: "@clementine.glow", platform: "tiktok", avatarColor: "#C4968A" },
    steps: [
      { emoji: "💧", text: "Mix two drops of hydrating serum into your tinted moisturiser for extra luminosity." },
      { emoji: "✨", text: "Press onto skin with fingers in a stippling motion — no brushes for a skin-like finish." },
      { emoji: "🎨", text: "Dot peach concealer only where needed (dark circles, redness) and blend softly." },
      { emoji: "⭐", text: "Swipe highlighter on cheekbones, bridge of nose, and inner corners of eyes." },
      { emoji: "👁️", text: "One coat of tubing mascara to define lashes without heaviness." },
      { emoji: "💋", text: "Finish with a tinted lip balm in your most flattering nude-pink." },
    ],
  },
  {
    id: "t3", title: "Glass Skin 5-Step Ritual", category: "Routine",
    tab: "Skincare", difficulty: "Beginner", duration: 15, saves: 2156,
    emoji: "💧", gradient: "linear-gradient(145deg, #0B3C26, #1A5C3A, #2D7A52)", accent: "#C8B06A",
    description: "Achieve the coveted Korean glass skin effect with this nourishing 5-step layering routine. The secret is in lightweight, hydrating products that build a dewy, reflective complexion.",
    materials: ["Low-pH gentle cleanser","Vitamin C serum","Hyaluronic acid essence","Barrier repair moisturiser","Mineral SPF 50"],
    creator: { name: "Yuna Choi", handle: "@yuna.skn", platform: "instagram", avatarColor: "#C8B06A" },
    steps: [
      { emoji: "🧼", text: "Double cleanse: oil cleanser first to remove makeup and sunscreen, then a gentle foaming wash." },
      { emoji: "💧", text: "While skin is still damp, press a thin layer of essence in for deep hydration." },
      { emoji: "✨", text: "Apply 3–4 drops of Vitamin C serum and press gently into skin with fingertips." },
      { emoji: "🌿", text: "Follow with hyaluronic acid — apply in thin layers, misting between each application." },
      { emoji: "🌙", text: "Seal with a barrier-repairing moisturiser rich in ceramides and peptides." },
    ],
  },
  {
    id: "t4", title: "Retinol Evening Routine", category: "Advanced",
    tab: "Skincare", difficulty: "Intermediate", duration: 20, saves: 1845,
    emoji: "🌙", gradient: "linear-gradient(145deg, #1A1A3A, #2A2A5A, #3A3A6A)", accent: "#A0A8D0",
    description: "A carefully sequenced retinol routine that maximises efficacy while minimising irritation. The buffer method makes retinol accessible even for sensitive skin.",
    materials: ["Gentle non-stripping cleanser","Niacinamide 10% serum","0.3% retinol serum","Rich peptide night cream","Eye cream with retinyl palmitate"],
    creator: { name: "Dr. Amélie Fontaine", handle: "@dr.amelie.skin", platform: "instagram", avatarColor: "#A0A8D0" },
    steps: [
      { emoji: "🧼", text: "Cleanse with a creamy, non-stripping formula — no acids on retinol nights." },
      { emoji: "⏳", text: "Wait 20 minutes for skin to fully dry. Moisture activates retinol and increases irritation." },
      { emoji: "✨", text: "Buffer method: apply moisturiser first, then layer retinol on top to reduce sensitivity." },
      { emoji: "🌿", text: "Gently smooth retinol over forehead, cheeks, and chin — avoid the eye and lip area." },
      { emoji: "💤", text: "Seal with a rich, occlusive peptide cream to support the barrier overnight." },
    ],
  },
  {
    id: "t5", title: "Curtain Bangs Blowout", category: "Style",
    tab: "Hair", difficulty: "Intermediate", duration: 20, saves: 934,
    emoji: "💨", gradient: "linear-gradient(145deg, #3A2A1A, #6A5A3A, #A09060)", accent: "#C8B06A",
    description: "Master the perfect curtain bangs blowout at home. This technique creates that effortless, face-framing 70s-inspired movement that works across all hair textures.",
    materials: ["Heat protectant spray","Round brush (medium)","Professional blow dryer","Small alligator clips","Lightweight finishing serum","Flexible hold hairspray"],
    creator: { name: "Isabelle Morel", handle: "@isabellecoiffure", platform: "tiktok", avatarColor: "#C8B06A" },
    steps: [
      { emoji: "💧", text: "Start with 80% dry hair — apply heat protectant evenly through the bangs." },
      { emoji: "✂️", text: "Part bangs down the middle and clip each side. Work one half at a time." },
      { emoji: "💨", text: "Direct airflow downward while rolling the round brush outward and away from the face." },
      { emoji: "✨", text: "Let each section cool on the brush before releasing — this sets the shape permanently." },
      { emoji: "🔄", text: "Mirror the motion on the other side to create symmetrical curtains." },
      { emoji: "✦", text: "Finish with a drop of smoothing serum through the ends and a light hold spray." },
    ],
  },
  {
    id: "t6", title: "Balayage at Home", category: "Colour",
    tab: "Hair", difficulty: "Expert", duration: 45, saves: 2388,
    emoji: "🎨", gradient: "linear-gradient(145deg, #2A1A0A, #5A3A1A, #8A6A3A)", accent: "#D4A060",
    description: "Achieve a professional balayage at home. Best for natural brunettes wanting sun-kissed highlights with an organic, grown-out root. Read through fully before you begin.",
    materials: ["Bleach powder (20 or 30 vol)","Developer","Purple toning shampoo","Bond treatment (Olaplex)","Foils or plastic wrap","Tint brush","Gloves","Colour-safe deep conditioner"],
    creator: { name: "Gabrielle Audet", handle: "@gabacolorist", platform: "youtube", avatarColor: "#D4A060" },
    steps: [
      { emoji: "🛡️", text: "Mix bond treatment into your bleach to protect hair integrity throughout." },
      { emoji: "✂️", text: "Section hair into 4 quadrants. Start at the bottom — place bleach 2 inches from roots." },
      { emoji: "🎨", text: "Use a sweeping, feathering motion rather than saturating fully — this creates the natural gradient." },
      { emoji: "📋", text: "Loosely wrap in foil and process 20–35 minutes, checking every 5 minutes." },
      { emoji: "🚿", text: "Rinse cool, then apply purple shampoo for 5 minutes to neutralise brassiness." },
      { emoji: "✨", text: "Deep condition for 15 minutes with a bond-repairing mask." },
      { emoji: "💛", text: "Style as usual — your natural root contrast creates the lived-in, sun-kissed finish." },
    ],
  },
  {
    id: "t7", title: "French Manicure Moderne", category: "Classic",
    tab: "Nails", difficulty: "Beginner", duration: 25, saves: 1102,
    emoji: "💅", gradient: "linear-gradient(145deg, #3A1A1A, #6A3A4A, #B07890)", accent: "#C4968A",
    description: "A modern take on the classic French — slightly thicker tips, sheer pink base, and a gently curved smile line that elongates the nail. Timeless with a contemporary twist.",
    materials: ["Nail file & buffer","Base coat","Sheer pink polish","White gel pen or fine tip brush","High-shine top coat","Cuticle oil"],
    creator: { name: "Naomi Park", handle: "@naominails_", platform: "instagram", avatarColor: "#C4968A" },
    steps: [
      { emoji: "💅", text: "File nails into a soft almond or squoval shape and buff the surface for a smooth base." },
      { emoji: "🌸", text: "Apply base coat and let dry completely — this protects nails and improves adhesion." },
      { emoji: "💧", text: "Apply two thin coats of sheer pink, letting each coat dry between applications." },
      { emoji: "✏️", text: "Draw the smile line with a white gel pen following the natural nail curve." },
      { emoji: "✨", text: "Seal with a thick layer of high-shine top coat — extend just over the tip to lock the white." },
      { emoji: "🌿", text: "Finish with cuticle oil massaged into the base and sides of each nail." },
    ],
  },
  {
    id: "t8", title: "Gel Soak-Off & Nail Rehab", category: "Care",
    tab: "Nails", difficulty: "Beginner", duration: 30, saves: 788,
    emoji: "🌸", gradient: "linear-gradient(145deg, #2A1A2A, #4A2A4A, #8A5A7A)", accent: "#D4A0C0",
    description: "Remove gel polish safely at home without damaging your natural nail, then rebuild with a nourishing strengthening routine.",
    materials: ["Pure acetone","Cotton pads","Aluminium foil","Cuticle pusher","Fine nail buffer","Keratin nail treatment","Cuticle oil"],
    creator: { name: "Léa Brun", handle: "@leamanicure", platform: "tiktok", avatarColor: "#D4A0C0" },
    steps: [
      { emoji: "✂️", text: "Lightly file the top coat only — break the seal without filing into the gel body." },
      { emoji: "🧴", text: "Soak cotton pads in acetone, place on each nail, and wrap tightly in foil." },
      { emoji: "⏳", text: "Wait 10–15 minutes. The gel should lift and slide off without force." },
      { emoji: "🌸", text: "Gently push off remaining gel with a cuticle pusher — never peel or scrape." },
      { emoji: "✨", text: "Buff gently to smooth the nail surface, then apply a strengthening keratin treatment." },
      { emoji: "🌿", text: "Massage cuticle oil generously and repeat daily to restore nail health." },
    ],
  },
  {
    id: "t9", title: "Silk Body Oil Ritual", category: "Ritual",
    tab: "Body", difficulty: "Beginner", duration: 10, saves: 1567,
    emoji: "🌿", gradient: "linear-gradient(145deg, #1A2A1A, #2A5A2A, #4A8A4A)", accent: "#C8B06A",
    description: "A luxurious daily body ritual that leaves skin silky, scented, and deeply nourished. The key step — applying to slightly damp skin — triples absorption.",
    materials: ["Dry body brush","Exfoliating sugar scrub","Luxury body oil (rose or sandalwood)","Warm shower","Soft towel"],
    creator: { name: "Priya Sharma", handle: "@priyabodyritual", platform: "instagram", avatarColor: "#C8B06A" },
    steps: [
      { emoji: "✦", text: "Dry brush in long strokes toward the heart before showering to stimulate circulation." },
      { emoji: "🚿", text: "Shower with warm (not hot) water — heat strips natural oils from the skin barrier." },
      { emoji: "🌸", text: "Apply sugar scrub to damp skin in circular motions — focus on elbows, knees, and heels." },
      { emoji: "💧", text: "Pat skin gently dry, leaving it slightly damp — this is the key step for oil absorption." },
      { emoji: "✨", text: "Warm 3–5 drops of body oil between your palms and press into skin rather than rubbing." },
    ],
  },
  {
    id: "t10", title: "Dry Brush Detox Morning", category: "Wellness",
    tab: "Body", difficulty: "Beginner", duration: 15, saves: 923,
    emoji: "✦", gradient: "linear-gradient(145deg, #2A1A0A, #5A3A2A, #8A6A4A)", accent: "#C8B06A",
    description: "Start your morning with this energising lymphatic dry brushing ritual. It stimulates circulation, exfoliates dead skin cells, and leaves you feeling genuinely awake.",
    materials: ["Natural bristle dry brush","Body oil or moisturiser"],
    creator: { name: "Emma Delacroix", handle: "@emmadelacroix.wellness", platform: "youtube", avatarColor: "#C8B06A" },
    steps: [
      { emoji: "🌅", text: "Begin at your feet — always brush in long strokes moving toward the heart." },
      { emoji: "✦", text: "Use firm but gentle pressure on the legs, working upward in overlapping strokes." },
      { emoji: "🔄", text: "For the stomach, use clockwise circular motions following the digestive tract direction." },
      { emoji: "💨", text: "Brush arms from hands to shoulders, then lightly across the chest." },
      { emoji: "🚿", text: "Follow with a cool shower to rinse and close pores." },
      { emoji: "✨", text: "Apply body oil or moisturiser immediately while skin is still slightly damp." },
    ],
  },
];

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#2A7A4A",
  Intermediate: "#C8B06A",
  Expert: "#C4968A",
};

export default function TutorialDetailScreen({ tutorialId, onBack }: Props) {
  const { showToast } = useToast();
  const tutorial = TUTORIALS.find(t => t.id === tutorialId) ?? TUTORIALS[0];

  const [wanna,    setWanna]    = useState(false);
  const [done,     setDone]     = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [note,     setNote]     = useState("");
  const [checked,  setChecked]  = useState<Set<number>>(new Set());

  const toggleMat = (i: number) => setChecked(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
    showToast("Saved to Mes Inspirations ✦", "💎");
  };

  const handleWanna = () => {
    const next = !wanna;
    setWanna(next);
    if (next) showToast("Added to Wanna Try ✦", "✨");
  };

  const handleDone = () => {
    const next = !done;
    setDone(next);
    if (next) showToast("Marked as Completed ✦", "✦");
  };

  const short = tutorial.description.length > 130;

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#0B3C26] opacity-40 mb-0.5">The Muse</p>
          <h2 className="font-serif text-lg font-normal text-[#1C1C1C]">Tutorial</h2>
        </div>
        <button onClick={handleSave}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer press-scale transition-all"
          style={{
            border: `1px solid ${saved ? tutorial.accent : "rgba(11,60,38,0.12)"}`,
            background: saved ? `${tutorial.accent}18` : "transparent",
          }}>
          <svg width="13" height="15" viewBox="0 0 13 15" fill={saved ? tutorial.accent : "none"} stroke={saved ? tutorial.accent : "#0B3C26"} strokeWidth="1.2" strokeLinecap="round">
            <path d="M1.5 1.5H11.5C11.8 1.5 12 1.7 12 2V13.5L6.5 10.5L1 13.5V2C1 1.7 1.2 1.5 1.5 1.5Z" />
          </svg>
        </button>
      </div>

      <div className="divider-gold mx-5 mb-0" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-10">

        {/* Cover */}
        <div className="mx-5 mt-4 mb-5 rounded-2xl overflow-hidden relative" style={{ height: "180px" }}>
          <div className="absolute inset-0" style={{ background: tutorial.gradient }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl" style={{ opacity: 0.22 }}>{tutorial.emoji}</span>
          </div>
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.55) 100%)" }} />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[7px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                style={{ background: `${tutorial.accent}CC`, color: "white" }}>
                {tutorial.category}
              </span>
              <span className="font-sans text-[7px] text-white opacity-80 tracking-wide">
                {tutorial.tab} · {tutorial.duration} min
              </span>
            </div>
            <span className="font-sans text-[8px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: `${DIFFICULTY_COLOR[tutorial.difficulty]}CC`, color: "white" }}>
              {tutorial.difficulty}
            </span>
          </div>
        </div>

        <div className="px-5">

          {/* Creator byline */}
          <div className="flex items-center gap-2.5 mb-4 px-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${tutorial.creator.avatarColor}30`, border: `1.5px solid ${tutorial.creator.avatarColor}50` }}>
              <span className="font-sans text-[9px] font-medium" style={{ color: tutorial.creator.avatarColor }}>
                {tutorial.creator.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[10px] font-medium text-[#1C1C1C] truncate">{tutorial.creator.name}</p>
              <p className="font-sans text-[9px] text-[#8A8070] truncate">{tutorial.creator.handle}</p>
            </div>
            <span className="font-sans text-[7px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(11,60,38,0.07)", color: "#0B3C26", border: "1px solid rgba(11,60,38,0.12)" }}>
              {PLATFORM_LABEL[tutorial.creator.platform]}
            </span>
          </div>

          {/* Title + saves */}
          <div className="flex items-start justify-between mb-4">
            <h1 className="font-serif text-[22px] font-normal text-[#1C1C1C] leading-tight flex-1 pr-4">
              {tutorial.title}
            </h1>
            <div className="flex items-center gap-1 flex-shrink-0 mt-1.5">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="#C8B06A">
                <path d="M1 1H10C10.5 1 11 1.4 11 2V12L5.5 9.5L0 12V2C0 1.4 0.5 1 1 1Z" />
              </svg>
              <span className="font-sans text-[9px] text-[#C8B06A] font-medium tracking-wide">
                {tutorial.saves.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status toggles */}
          <div className="flex gap-2.5 mb-5">
            <button onClick={handleWanna}
              className="flex-1 py-2.5 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.1em] uppercase transition-all duration-200"
              style={{
                background: wanna ? `${tutorial.accent}18` : "transparent",
                border: `1px solid ${wanna ? tutorial.accent : "rgba(11,60,38,0.18)"}`,
                color: wanna ? tutorial.accent : "rgba(11,60,38,0.55)",
              }}>
              {wanna ? "✦ Wanna Try" : "◇ Wanna Try"}
            </button>
            <button onClick={handleDone}
              className="flex-1 py-2.5 rounded-full cursor-pointer press-scale font-sans text-[9px] tracking-[0.1em] uppercase transition-all duration-200"
              style={{
                background: done ? "rgba(11,60,38,0.08)" : "transparent",
                border: `1px solid ${done ? "#0B3C26" : "rgba(11,60,38,0.18)"}`,
                color: done ? "#0B3C26" : "rgba(11,60,38,0.55)",
              }}>
              {done ? "✓ Completed" : "○ Completed?"}
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="font-sans text-[11px] text-[#5A5040] leading-relaxed">
              {expanded || !short
                ? tutorial.description
                : tutorial.description.slice(0, 130) + "…"}
            </p>
            {short && (
              <button onClick={() => setExpanded(e => !e)}
                className="font-sans text-[9px] tracking-[0.1em] uppercase text-[#C8B06A] mt-1.5 cursor-pointer hover:opacity-70 transition-opacity">
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          <div className="divider-gold mb-5" />

          {/* Materials */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-[16px] text-[#1C1C1C]">Materials Needed</h3>
              <span className="font-sans text-[9px] tracking-wide text-[#C8B06A]">
                {checked.size}/{tutorial.materials.length} ready
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {tutorial.materials.map((mat, i) => (
                <button key={i} onClick={() => toggleMat(i)}
                  className="flex items-center gap-3 text-left cursor-pointer press-scale w-full">
                  <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                    style={{
                      border: `1.5px solid ${checked.has(i) ? tutorial.accent : "rgba(200,176,106,0.45)"}`,
                      background: checked.has(i) ? `${tutorial.accent}18` : "transparent",
                    }}>
                    {checked.has(i) && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none" stroke={tutorial.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 3.5L3 5.5L8 1" />
                      </svg>
                    )}
                  </div>
                  <span className="font-sans text-[11px] text-[#5A5040] leading-snug"
                    style={{
                      textDecoration: checked.has(i) ? "line-through" : "none",
                      opacity: checked.has(i) ? 0.45 : 1,
                    }}>
                    {mat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gold mb-5" />

          {/* Steps */}
          <div className="mb-6">
            <h3 className="font-serif text-[16px] text-[#1C1C1C] mb-3">Steps</h3>
            <div className="flex flex-col gap-3.5">
              {tutorial.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: `${tutorial.accent}12`, border: `1px solid ${tutorial.accent}28` }}>
                    <span className="text-[11px]">{step.emoji}</span>
                  </div>
                  <div className="flex-1 pt-0.5">
                    <span className="font-sans text-[8px] tracking-[0.15em] uppercase text-[#C8B06A] mr-2">
                      Step {i + 1}
                    </span>
                    <p className="font-sans text-[11px] text-[#5A5040] leading-relaxed mt-0.5">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="divider-gold mb-5" />

          {/* Source credit */}
          <div className="mb-6">
            <h3 className="font-serif text-[16px] text-[#1C1C1C] mb-3">Mentioned In</h3>
            <div className="flex items-center gap-3 card-pearl rounded-xl p-3 cursor-pointer press-scale">
              {/* Reel thumbnail */}
              <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden relative"
                style={{ background: tutorial.gradient }}>
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <span className="text-xl">{tutorial.emoji}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.85)" }}>
                    <svg width="7" height="8" viewBox="0 0 7 8" fill="#0B3C26">
                      <path d="M1 1L6 4L1 7V1Z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Credit info */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[9px] tracking-[0.12em] uppercase text-[#C8B06A] mb-0.5">
                  {PLATFORM_LABEL[tutorial.creator.platform]} Reel
                </p>
                <p className="font-serif text-[13px] text-[#1C1C1C] leading-tight truncate">{tutorial.title}</p>
                <p className="font-sans text-[9px] text-[#8A8070] mt-0.5">by {tutorial.creator.name} · {tutorial.creator.handle}</p>
              </div>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="rgba(11,60,38,0.3)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M1 1L5 5L1 9" />
              </svg>
            </div>
            <p className="font-sans text-[8px] text-[#B0A898] mt-2 px-1 leading-relaxed">
              All tutorials are credited to their original creators. The Muse does not claim ownership of any linked content.
            </p>
          </div>

          <div className="divider-gold mb-5" />

          {/* My Notes */}
          <div className="mb-4">
            <h3 className="font-serif text-[16px] text-[#1C1C1C] mb-2.5">My Notes</h3>
            <div className="relative">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a personal note..."
                className="w-full py-3 px-4 pr-10 rounded-xl font-sans text-[11px] text-[#1C1C1C] placeholder:text-[#C0B8A8] outline-none"
                style={{
                  background: "rgba(255,253,250,0.85)",
                  border: "1px solid rgba(200,176,106,0.28)",
                }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-lg text-[#C8B06A] leading-none select-none">+</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
