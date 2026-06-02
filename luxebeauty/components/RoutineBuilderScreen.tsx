"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  category: "skincare" | "makeup" | "hair" | "body";
  actif: string | null;
  duration: number; // seconds; 0 = no timer
}

interface Step {
  productId: string;
  name: string;
  brand: string;
  emoji: string;
  actif: string | null;
  duration: number;
  done: boolean;
}

interface Ritual {
  id: string;
  name: string;
  type: "morning" | "evening" | "custom";
  icon: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  steps: Step[];
  completions: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCT_LIBRARY: Product[] = [
  { id: "cleanser",    name: "Nettoyant Doux",      brand: "CeraVe",          emoji: "💧", category: "skincare", actif: null,          duration: 60  },
  { id: "oil-clean",   name: "Huile Démaquillante",  brand: "DHC",             emoji: "🌹", category: "skincare", actif: null,          duration: 90  },
  { id: "toner",       name: "Tonique Éclat",        brand: "Pixi",            emoji: "✨", category: "skincare", actif: null,          duration: 30  },
  { id: "vitc",        name: "Sérum Vitamine C",     brand: "SkinCeuticals",   emoji: "🍋", category: "skincare", actif: "vitamin-c",   duration: 60  },
  { id: "spf",         name: "SPF 50+ Fluide",       brand: "La Roche-Posay",  emoji: "☀️", category: "skincare", actif: null,          duration: 60  },
  { id: "retinol",     name: "Sérum Rétinol 0.5%",  brand: "The Ordinary",    emoji: "⭐", category: "skincare", actif: "retinol",     duration: 90  },
  { id: "aha",         name: "Exfoliant AHA 10%",    brand: "NARS",            emoji: "🌊", category: "skincare", actif: "aha",         duration: 600 },
  { id: "niacin",      name: "Sérum Niacinamide",    brand: "Paula's Choice",  emoji: "💎", category: "skincare", actif: "niacinamide", duration: 60  },
  { id: "hyalur",      name: "Sérum Hyaluronique",   brand: "Vichy",           emoji: "💧", category: "skincare", actif: "hyaluronic",  duration: 60  },
  { id: "barrier",     name: "Crème Barrière",       brand: "COSRX",           emoji: "🛡️", category: "skincare", actif: null,          duration: 60  },
  { id: "mask",        name: "Masque Hydratant",     brand: "Tatcha",          emoji: "🎭", category: "skincare", actif: null,          duration: 1200},
  { id: "eye",         name: "Contour des Yeux",     brand: "Kiehl's",         emoji: "👁️", category: "skincare", actif: null,          duration: 60  },
  { id: "lip",         name: "Soin des Lèvres",      brand: "Laneige",         emoji: "🌸", category: "makeup",   actif: null,          duration: 30  },
  { id: "hair-oil",    name: "Huile Capillaire",     brand: "Olaplex",         emoji: "💫", category: "hair",     actif: null,          duration: 300 },
  { id: "body-lotion", name: "Lotion Corps",         brand: "Nécessaire",      emoji: "🍃", category: "body",     actif: null,          duration: 120 },
  { id: "dry-brush",   name: "Brossage à Sec",       brand: "The Muse",        emoji: "🌿", category: "body",     actif: null,          duration: 300 },
  { id: "gua-sha",     name: "Rituel Gua Sha",       brand: "Mount Lai",       emoji: "🪨", category: "body",     actif: null,          duration: 300 },
  { id: "roller",      name: "Roller Quartz Rose",   brand: "Herbivore",       emoji: "💜", category: "body",     actif: null,          duration: 180 },
];

const CONFLICTS = [
  { actifs: ["retinol", "vitamin-c"],   warning: "Rétinol + Vitamine C ensemble peuvent irriter. Place la Vitamine C le matin, le Rétinol le soir.", level: "high"   },
  { actifs: ["aha", "retinol"],         warning: "AHA + Rétinol : double exfoliation agressive. Alterne-les plutôt que de les combiner.",             level: "high"   },
  { actifs: ["niacinamide", "vitamin-c"], warning: "Niacinamide + Vitamine C peuvent se neutraliser. Applique-les à 20 min d'intervalle.",           level: "medium" },
  { actifs: ["aha", "vitamin-c"],       warning: "AHA + Vitamine C : acidité forte combinée. Commence doucement et observe ta peau.",                 level: "medium" },
] as const;

const PAIRINGS = [
  { afterActif: "retinol",   emoji: "🛡️", suggestion: "Crème Barrière",    reason: "Le rétinol assèche — une crème barrière protège ton microbiome cutané." },
  { afterActif: "vitamin-c", emoji: "☀️", suggestion: "SPF 50+",           reason: "La Vitamine C est photo-sensibilisante. Le SPF après est indispensable." },
  { afterActif: "aha",       emoji: "💧", suggestion: "Sérum Hyaluronique", reason: "Après l'exfoliation, la peau absorbe mieux les actifs hydratants." },
];

const CUSTOM_ICONS = ["🌟", "🌺", "🧘‍♀️", "🛁", "💆", "🌿", "🏋️‍♀️", "☕"];
const PROD_CATS = [
  { id: "all",      label: "Tout" },
  { id: "skincare", label: "Visage" },
  { id: "body",     label: "Corps" },
  { id: "hair",     label: "Cheveux" },
  { id: "makeup",   label: "Maquillage" },
];

function makeStep(p: Product): Step {
  return { productId: p.id, name: p.name, brand: p.brand, emoji: p.emoji, actif: p.actif, duration: p.duration, done: false };
}

function detectConflicts(steps: Step[]) {
  const actifs = steps.map(s => s.actif).filter(Boolean) as string[];
  return CONFLICTS.filter(c => c.actifs.every(a => actifs.includes(a)));
}

function detectPairings(steps: Step[]) {
  const actifs = steps.map(s => s.actif).filter(Boolean) as string[];
  const existingIds = steps.map(s => s.productId);
  return PAIRINGS.filter(p => actifs.includes(p.afterActif) && !existingIds.includes(p.afterActif === "retinol" ? "barrier" : p.afterActif === "vitamin-c" ? "spf" : "hyalur"));
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const INITIAL_RITUALS: Ritual[] = [
  {
    id: "morning",
    name: "Rituel de l'Aube",
    type: "morning",
    icon: "☀️",
    gradient: "linear-gradient(145deg, #FFFBEA 0%, #FFE580 50%, #FFCF40 100%)",
    textColor: "#5A4200",
    accentColor: "#C8A400",
    steps: [
      makeStep(PRODUCT_LIBRARY[0]),
      makeStep(PRODUCT_LIBRARY[2]),
      makeStep(PRODUCT_LIBRARY[3]),
      makeStep(PRODUCT_LIBRARY[4]),
    ],
    completions: 12,
  },
  {
    id: "evening",
    name: "Rituel du Crépuscule",
    type: "evening",
    icon: "🌙",
    gradient: "linear-gradient(145deg, #1E1030 0%, #2D1850 50%, #1A0E3A 100%)",
    textColor: "#C8B8F0",
    accentColor: "#9070E0",
    steps: [
      makeStep(PRODUCT_LIBRARY[1]),
      makeStep(PRODUCT_LIBRARY[0]),
      makeStep(PRODUCT_LIBRARY[2]),
      makeStep(PRODUCT_LIBRARY[5]),
      makeStep(PRODUCT_LIBRARY[9]),
    ],
    completions: 8,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void;
}

type View = "home" | "editor" | "active";

export default function RoutineBuilderScreen({ onBack }: Props) {
  const [view, setView]               = useState<View>("home");
  const [rituals, setRituals]         = useState<Ritual[]>(INITIAL_RITUALS);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [newName, setNewName]         = useState("");
  const [newIcon, setNewIcon]         = useState("🌟");
  const [prodFilter, setProdFilter]   = useState("all");
  const [activeStep, setActiveStep]   = useState(0);
  const [timer, setTimer]             = useState(0);
  const [timerTotal, setTimerTotal]   = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completed, setCompleted]     = useState(false);

  const ritual = rituals.find(r => r.id === selectedId) ?? null;

  // ── Timer countdown ──
  useEffect(() => {
    if (!timerRunning) return;
    if (timer <= 0) { setTimerRunning(false); return; }
    const id = setInterval(() => setTimer(t => (t <= 1 ? (setTimerRunning(false), 0) : t - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning, timer]);

  // ── Derived ──
  const conflicts = ritual ? detectConflicts(ritual.steps) : [];
  const pairings  = ritual ? detectPairings(ritual.steps)  : [];
  const filteredLib = PRODUCT_LIBRARY.filter(p => prodFilter === "all" || p.category === prodFilter);
  const existingIds = ritual?.steps.map(s => s.productId) ?? [];

  // ── Mutation helpers ──
  const updateRitual = (id: string, updater: (r: Ritual) => Ritual) =>
    setRituals(rs => rs.map(r => r.id === id ? updater(r) : r));

  const addStep = (product: Product) => {
    if (!selectedId || existingIds.includes(product.id)) return;
    updateRitual(selectedId, r => ({ ...r, steps: [...r.steps, makeStep(product)] }));
  };

  const removeStep = (idx: number) => {
    if (!selectedId) return;
    updateRitual(selectedId, r => ({ ...r, steps: r.steps.filter((_, i) => i !== idx) }));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    if (!selectedId) return;
    updateRitual(selectedId, r => {
      const steps = [...r.steps];
      const target = idx + dir;
      if (target < 0 || target >= steps.length) return r;
      [steps[idx], steps[target]] = [steps[target], steps[idx]];
      return { ...r, steps };
    });
  };

  const openEditor = (id: string) => {
    setSelectedId(id);
    setView("editor");
    setShowAddSheet(false);
  };

  const startRitual = () => {
    if (!ritual || ritual.steps.length === 0) return;
    setActiveStep(0);
    setCompleted(false);
    updateRitual(ritual.id, r => ({ ...r, steps: r.steps.map(s => ({ ...s, done: false })) }));
    const firstDur = ritual.steps[0].duration;
    setTimer(firstDur);
    setTimerTotal(firstDur);
    setTimerRunning(false);
    setView("active");
  };

  const nextStep = () => {
    if (!ritual) return;
    setTimerRunning(false);
    const next = activeStep + 1;
    if (next >= ritual.steps.length) {
      updateRitual(ritual.id, r => ({ ...r, completions: r.completions + 1, steps: r.steps.map(s => ({ ...s, done: true })) }));
      setCompleted(true);
    } else {
      updateRitual(ritual.id, r => ({ ...r, steps: r.steps.map((s, i) => i === activeStep ? { ...s, done: true } : s) }));
      setActiveStep(next);
      const dur = ritual.steps[next].duration;
      setTimer(dur);
      setTimerTotal(dur);
    }
  };

  const createRitual = () => {
    if (!newName.trim()) return;
    const id = `custom-${Date.now()}`;
    const newRitual: Ritual = {
      id,
      name: newName.trim(),
      type: "custom",
      icon: newIcon,
      gradient: "linear-gradient(145deg, #F5F0EA 0%, #EDE5D8 100%)",
      textColor: "#5A4A38",
      accentColor: "#C8B06A",
      steps: [],
      completions: 0,
    };
    setRituals(rs => [...rs, newRitual]);
    setNewName("");
    setNewIcon("🌟");
    setShowCreate(false);
    openEditor(id);
  };

  // ─── CIRCUMFERENCE for SVG timer ───
  const R = 44;
  const CIRC = 2 * Math.PI * R;
  const progress = timerTotal > 0 ? timer / timerTotal : 0;
  const dashOffset = CIRC * (1 - progress);

  // ─── VIEWS ──────────────────────────────────────────────────────────────────

  // ── HOME ──
  if (view === "home") return (
    <div className="min-h-screen no-scrollbar overflow-y-auto" style={{ background: "linear-gradient(180deg, #FAF7F2 0%, #F5EEE8 100%)" }}>
      <style>{`
        @keyframes ritualFade { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .ritual-fade { animation: ritualFade 0.6s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        @keyframes shimmer { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .shimmer { animation: shimmer 2.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="px-5 pt-safe-top pt-6 pb-5" style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}>
        <button onClick={onBack} className="mb-5 w-8 h-8 flex items-center justify-center rounded-full press-scale" style={{ background: "rgba(11,60,38,0.08)" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="#0B3C26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <div className="text-center">
          <div className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: "#C8B06A" }}>The Muse · Rituels Sacrés</div>
          <h1 className="font-serif text-[30px] font-light leading-tight mb-2" style={{ color: "#1A0E0A", letterSpacing: "0.02em" }}>
            The Muse Rituals
          </h1>
          <p className="font-sans text-xs leading-relaxed" style={{ color: "#8A7A6A" }}>
            Transforme tes soins en rituels quotidiens.<br />
            Ta beauté mérite de la constance.
          </p>
        </div>

        {/* Gold divider */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="h-px w-14 opacity-25" style={{ background: "linear-gradient(90deg, transparent, #C8B06A)" }}/>
          <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: "#C8B06A" }}/>
          <div className="w-1 h-1 rounded-full opacity-30" style={{ background: "#C8B06A" }}/>
          <div className="w-1.5 h-1.5 rounded-full opacity-50" style={{ background: "#C8B06A" }}/>
          <div className="h-px w-14 opacity-25" style={{ background: "linear-gradient(90deg, #C8B06A, transparent)" }}/>
        </div>
      </div>

      <div className="px-4 pb-28 space-y-4">

        {/* Morning ritual card */}
        <button
          onClick={() => openEditor("morning")}
          className="w-full rounded-3xl overflow-hidden press-scale ritual-fade text-left"
          style={{ animationDelay: "0.05s", boxShadow: "0 8px 32px rgba(200,164,0,0.25)" }}
        >
          <div className="relative h-44 flex flex-col justify-between p-5" style={{ background: INITIAL_RITUALS[0].gradient }}>
            {/* Decorative glow */}
            <div className="absolute top-4 right-4 text-5xl opacity-30 shimmer">☀️</div>
            <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-15 blur-2xl" style={{ background: "#FFD060" }}/>

            <div>
              <div className="font-sans text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(90,66,0,0.7)" }}>Rituel du Matin</div>
              <div className="font-serif text-2xl font-light" style={{ color: "#3A2A00" }}>Rituel de l'Aube</div>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex gap-1">
                {INITIAL_RITUALS[0].steps.slice(0, 4).map((s, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.6)" }}>
                    {s.emoji}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <div className="font-serif text-lg font-medium" style={{ color: "#3A2A00" }}>{INITIAL_RITUALS[0].steps.length} étapes</div>
                <div className="font-sans text-[9px]" style={{ color: "rgba(90,66,0,0.6)" }}>{rituals.find(r=>r.id==="morning")?.completions ?? 0} × complété</div>
              </div>
            </div>
          </div>
        </button>

        {/* Evening ritual card */}
        <button
          onClick={() => openEditor("evening")}
          className="w-full rounded-3xl overflow-hidden press-scale ritual-fade text-left"
          style={{ animationDelay: "0.12s", boxShadow: "0 8px 32px rgba(90,40,160,0.35)" }}
        >
          <div className="relative h-44 flex flex-col justify-between p-5" style={{ background: INITIAL_RITUALS[1].gradient }}>
            {/* Stars */}
            {["top-3 right-8", "top-8 right-16", "top-6 right-4"].map((pos, i) => (
              <div key={i} className={`absolute ${pos} text-xs opacity-40 shimmer`} style={{ animationDelay: `${i*0.8}s`, color: "#C8B8F0" }}>✦</div>
            ))}
            <div className="absolute top-4 right-4 text-5xl opacity-25 shimmer" style={{ animationDelay: "0.5s" }}>🌙</div>

            <div>
              <div className="font-sans text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(200,184,240,0.7)" }}>Rituel du Soir</div>
              <div className="font-serif text-2xl font-light" style={{ color: "#E8DCFF" }}>Rituel du Crépuscule</div>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex gap-1">
                {INITIAL_RITUALS[1].steps.slice(0, 5).map((s, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(200,184,240,0.3)" }}>
                    {s.emoji}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <div className="font-serif text-lg font-medium" style={{ color: "#C8B8F0" }}>{INITIAL_RITUALS[1].steps.length} étapes</div>
                <div className="font-sans text-[9px]" style={{ color: "rgba(200,184,240,0.5)" }}>{rituals.find(r=>r.id==="evening")?.completions ?? 0} × complété</div>
              </div>
            </div>
          </div>
        </button>

        {/* Custom rituals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 opacity-20" style={{ background: "#C8B06A" }}/>
              <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C8B06A" }}>Mes Rituels</span>
            </div>
            <button
              onClick={() => setShowCreate(v => !v)}
              className="font-sans text-[11px] press-scale flex items-center gap-1"
              style={{ color: "#C8B06A" }}
            >
              <span className="text-lg leading-none">+</span> Créer
            </button>
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="rounded-2xl p-4 mb-3 ritual-fade" style={{ background: "white", border: "1px solid rgba(200,176,106,0.2)", boxShadow: "0 2px 12px rgba(200,176,106,0.1)" }}>
              <div className="font-sans text-[9px] tracking-widest uppercase mb-3" style={{ color: "#C8B06A" }}>Nouveau Rituel</div>

              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nom de ton rituel..."
                className="w-full font-serif text-sm outline-none bg-transparent mb-3 pb-2"
                style={{ color: "#1A0E0A", borderBottom: "1px solid rgba(200,176,106,0.3)" }}
              />

              <div className="flex gap-2 mb-3 flex-wrap">
                {CUSTOM_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewIcon(icon)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xl press-scale transition-all"
                    style={{ background: newIcon === icon ? "rgba(200,176,106,0.2)" : "transparent", border: `1.5px solid ${newIcon === icon ? "#C8B06A" : "rgba(200,176,106,0.15)"}` }}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <button
                onClick={createRitual}
                disabled={!newName.trim()}
                className="w-full py-2.5 rounded-xl font-sans text-xs font-medium press-scale transition-all"
                style={{ background: newName.trim() ? "#0B3C26" : "rgba(11,60,38,0.1)", color: newName.trim() ? "#FAF7F2" : "#8AAA98" }}
              >
                Créer le Rituel {newIcon}
              </button>
            </div>
          )}

          {/* Custom ritual cards */}
          {rituals.filter(r => r.type === "custom").length === 0 && !showCreate ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(200,176,106,0.06)", border: "1px dashed rgba(200,176,106,0.3)" }}>
              <div className="text-2xl mb-2">🌟</div>
              <div className="font-serif text-sm" style={{ color: "#9A8A78" }}>Crée ton premier rituel personnalisé</div>
              <div className="font-sans text-[10px] mt-1" style={{ color: "#B8A898" }}>Dimanche Self-Care, Pré-Soirée, Post-Gym...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rituals.filter(r => r.type === "custom").map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => openEditor(r.id)}
                  className="rounded-2xl p-4 text-left press-scale ritual-fade"
                  style={{ animationDelay: `${0.2 + i * 0.07}s`, background: r.gradient, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className="font-serif text-sm leading-tight mb-1" style={{ color: r.textColor }}>{r.name}</div>
                  <div className="font-sans text-[9px]" style={{ color: r.accentColor }}>{r.steps.length} étape{r.steps.length !== 1 ? "s" : ""}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Muse tip */}
        <div className="rounded-xl p-3 flex gap-2" style={{ background: "rgba(200,176,106,0.08)", border: "1px solid rgba(200,176,106,0.15)" }}>
          <div className="text-sm flex-none mt-0.5">✦</div>
          <p className="font-sans text-[10px] leading-relaxed" style={{ color: "#8A7A6A" }}>
            <span style={{ color: "#C8B06A" }}>Conseil Muse :</span> La régularité prime sur la perfection. Un rituel de 3 étapes fait chaque soir vaut mieux qu'un rituel de 10 fait une fois par semaine.
          </p>
        </div>
      </div>
    </div>
  );

  // ── EDITOR ──
  if (view === "editor" && ritual) return (
    <div className="min-h-screen no-scrollbar overflow-y-auto" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes sheetUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
        .sheet-up { animation: sheetUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Ritual hero */}
      <div className="relative h-36 flex flex-col justify-between px-5 pt-safe-top pt-4 pb-4"
        style={{ background: ritual.gradient, paddingTop: "max(16px, env(safe-area-inset-top))" }}>
        <button onClick={() => setView("home")} className="w-8 h-8 flex items-center justify-center rounded-full press-scale" style={{ background: "rgba(255,255,255,0.3)" }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke={ritual.textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div>
          <div className="font-sans text-[9px] tracking-widest uppercase mb-0.5" style={{ color: ritual.accentColor, opacity: 0.8 }}>
            {ritual.type === "morning" ? "Rituel du Matin" : ritual.type === "evening" ? "Rituel du Soir" : "Rituel Personnalisé"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ritual.icon}</span>
            <span className="font-serif text-xl" style={{ color: ritual.textColor }}>{ritual.name}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-36 space-y-4 mt-4">

        {/* Conflict warnings */}
        {conflicts.map((c, i) => (
          <div key={i} className="rounded-xl p-3 flex gap-2" style={{ background: c.level === "high" ? "rgba(232,115,74,0.1)" : "rgba(200,168,74,0.1)", border: `1px solid ${c.level === "high" ? "rgba(232,115,74,0.3)" : "rgba(200,168,74,0.3)"}` }}>
            <div className="text-sm flex-none">{c.level === "high" ? "⚠️" : "💡"}</div>
            <p className="font-sans text-[10px] leading-relaxed" style={{ color: c.level === "high" ? "#8A3A20" : "#7A6020" }}>
              <span className="font-medium">Alerte Actifs :</span> {c.warning}
            </p>
          </div>
        ))}

        {/* Pairing suggestions */}
        {pairings.map((p, i) => (
          <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(11,60,38,0.05)", border: "1px solid rgba(11,60,38,0.1)" }}>
            <div className="text-xl">{p.emoji}</div>
            <div className="flex-1">
              <div className="font-sans text-[9px] tracking-widest uppercase mb-0.5" style={{ color: "#4A7C5F" }}>Muse Suggère</div>
              <div className="font-serif text-sm" style={{ color: "#0B1F14" }}>{p.suggestion}</div>
              <div className="font-sans text-[9px] mt-0.5" style={{ color: "#6A8A78" }}>{p.reason}</div>
            </div>
            <button
              onClick={() => { const prod = PRODUCT_LIBRARY.find(pr => pr.name === p.suggestion || (p.afterActif === "retinol" && pr.id === "barrier") || (p.afterActif === "vitamin-c" && pr.id === "spf") || (p.afterActif === "aha" && pr.id === "hyalur")); if (prod) addStep(prod); }}
              className="px-2.5 py-1 rounded-full font-sans text-[9px] press-scale"
              style={{ background: "#0B3C26", color: "#FAF7F2" }}
            >
              + Ajouter
            </button>
          </div>
        ))}

        {/* Steps list */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 opacity-15" style={{ background: "#0B3C26" }}/>
            <span className="font-sans text-[9px] tracking-[0.3em] uppercase" style={{ color: "#4A7C5F" }}>
              {ritual.steps.length} Étape{ritual.steps.length !== 1 ? "s" : ""}
            </span>
            <div className="h-px flex-1 opacity-15" style={{ background: "#0B3C26" }}/>
          </div>

          {ritual.steps.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(11,60,38,0.03)", border: "1px dashed rgba(11,60,38,0.15)" }}>
              <div className="text-2xl mb-2">✦</div>
              <div className="font-serif text-sm" style={{ color: "#8A9A90" }}>Ton rituel est vide</div>
              <div className="font-sans text-[10px] mt-1" style={{ color: "#AABAA8" }}>Ajoute des produits pour commencer</div>
            </div>
          ) : (
            <div className="space-y-2">
              {ritual.steps.map((step, idx) => (
                <div key={`${step.productId}-${idx}`} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "white", border: "1px solid rgba(11,60,38,0.07)", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  {/* Step number */}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-none font-sans text-[10px] font-semibold" style={{ background: "rgba(11,60,38,0.08)", color: "#0B3C26" }}>
                    {idx + 1}
                  </div>

                  {/* Emoji */}
                  <div className="text-xl flex-none">{step.emoji}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-sm leading-tight" style={{ color: "#1A2A20" }}>{step.name}</div>
                    <div className="font-sans text-[9px]" style={{ color: "#8AA898" }}>
                      {step.brand}
                      {step.duration > 0 && <span style={{ color: "#C8B06A" }}> · {formatTime(step.duration)}</span>}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 flex-none">
                    <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded press-scale opacity-60 disabled:opacity-20" style={{ color: "#4A7C5F" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                    </button>
                    <button onClick={() => moveStep(idx, 1)} disabled={idx === ritual.steps.length - 1} className="w-6 h-6 flex items-center justify-center rounded press-scale opacity-60 disabled:opacity-20" style={{ color: "#4A7C5F" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <button onClick={() => removeStep(idx)} className="w-6 h-6 flex items-center justify-center rounded press-scale" style={{ color: "#C4968A" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add step button */}
          <button
            onClick={() => setShowAddSheet(v => !v)}
            className="w-full mt-3 py-3 rounded-xl font-sans text-xs flex items-center justify-center gap-2 press-scale transition-all"
            style={{ background: showAddSheet ? "#0B3C26" : "rgba(11,60,38,0.06)", color: showAddSheet ? "#FAF7F2" : "#0B3C26", border: "1px dashed rgba(11,60,38,0.2)" }}
          >
            <span className="text-base leading-none">{showAddSheet ? "✕" : "+"}</span>
            {showAddSheet ? "Fermer" : "Ajouter une étape"}
          </button>
        </div>

        {/* Product picker sheet */}
        {showAddSheet && (
          <div className="rounded-2xl overflow-hidden sheet-up" style={{ background: "white", border: "1px solid rgba(11,60,38,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="px-4 pt-4 pb-2">
              <div className="font-sans text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "#4A7C5F" }}>Bibliothèque de Produits</div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {PROD_CATS.map(c => (
                  <button key={c.id} onClick={() => setProdFilter(c.id)} className="flex-none px-3 py-1 rounded-full font-sans text-[10px] whitespace-nowrap press-scale" style={{ background: prodFilter === c.id ? "#0B3C26" : "rgba(11,60,38,0.06)", color: prodFilter === c.id ? "#FAF7F2" : "#4A7C5F" }}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto no-scrollbar">
              {filteredLib.map(product => {
                const inRitual = existingIds.includes(product.id);
                return (
                  <div key={product.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(11,60,38,0.05)" }}>
                    <div className="text-xl flex-none">{product.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif text-sm" style={{ color: "#1A2A20" }}>{product.name}</div>
                      <div className="font-sans text-[9px]" style={{ color: "#8AA898" }}>
                        {product.brand}
                        {product.duration > 0 && <span style={{ color: "#C8B06A" }}> · {formatTime(product.duration)}</span>}
                        {product.actif && <span style={{ color: "#4A7C5F" }}> · {product.actif}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => addStep(product)}
                      disabled={inRitual}
                      className="flex-none px-3 py-1 rounded-full font-sans text-[10px] press-scale"
                      style={{ background: inRitual ? "rgba(11,60,38,0.06)" : "#0B3C26", color: inRitual ? "#8AA898" : "#FAF7F2" }}
                    >
                      {inRitual ? "✓ Ajouté" : "+ Ajouter"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Start ritual CTA */}
      {ritual.steps.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-3" style={{ background: "linear-gradient(transparent, #FAFAF8 40%)" }}>
          <button
            onClick={startRitual}
            className="w-full py-4 rounded-2xl font-serif text-base press-scale"
            style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A)", color: "#FAF7F2", boxShadow: "0 4px 20px rgba(11,60,38,0.4)" }}
          >
            Commencer {ritual.icon} {ritual.name}
          </button>
        </div>
      )}
    </div>
  );

  // ── ACTIVE RITUAL ──
  if (view === "active" && ritual) {
    const currentStep = ritual.steps[activeStep];
    const isDark = ritual.type === "evening";

    return (
      <div className="min-h-screen flex flex-col" style={{ background: ritual.gradient }}>
        <style>{`
          @keyframes stepIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
          .step-in { animation: stepIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
          @keyframes confetti { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(-80px) rotate(360deg);opacity:0} }
          .confetti-piece { animation: confetti 1.2s ease-out both; }
        `}</style>

        {completed ? (
          /* ── COMPLETION ── */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            {/* Confetti */}
            <div className="relative mb-6">
              {["#C8B06A", "#9070E0", "#C4968A", "#4A7C5F", "#FFCF40"].map((color, i) => (
                <div key={i} className="absolute w-2 h-2 rounded-full confetti-piece"
                  style={{ background: color, left: `${20 + i*15}%`, top: "0", animationDelay: `${i * 0.1}s` }}/>
              ))}
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                style={{ background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)" }}>
                ✦
              </div>
            </div>

            <div className="font-sans text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: ritual.accentColor, opacity: 0.9 }}>Rituel Accompli</div>
            <div className="font-serif text-3xl font-light mb-2" style={{ color: ritual.textColor }}>Magnifique !</div>
            <p className="font-sans text-xs leading-relaxed mb-8" style={{ color: ritual.textColor, opacity: 0.8 }}>
              Tu as complété {ritual.steps.length} étapes de ton {ritual.name}.<br/>
              Complété {ritual.completions} fois au total — continue comme ça ! ✦
            </p>

            <button
              onClick={() => { setCompleted(false); setView("editor"); }}
              className="px-8 py-3.5 rounded-full font-serif text-sm press-scale"
              style={{ background: "rgba(255,255,255,0.9)", color: ritual.textColor, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
            >
              Retour au Rituel
            </button>
          </div>
        ) : currentStep ? (
          /* ── STEP VIEW ── */
          <div className="flex-1 flex flex-col" style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 mb-6">
              <button onClick={() => setView("editor")} className="w-8 h-8 flex items-center justify-center rounded-full press-scale" style={{ background: "rgba(255,255,255,0.2)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke={ritual.textColor} strokeWidth="2" strokeLinecap="round"/></svg>
              </button>

              {/* Progress */}
              <div className="flex gap-1">
                {ritual.steps.map((_, i) => (
                  <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === activeStep ? "20px" : "6px", height: "6px", background: i <= activeStep ? (isDark ? "#C8B8F0" : "#5A4200") : "rgba(255,255,255,0.3)" }}/>
                ))}
              </div>

              <div className="font-sans text-[10px]" style={{ color: ritual.textColor, opacity: 0.7 }}>
                {activeStep + 1}/{ritual.steps.length}
              </div>
            </div>

            {/* Step card */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="step-in w-full rounded-3xl p-6 flex flex-col items-center text-center" key={activeStep}
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}>

                <div className="text-7xl mb-4">{currentStep.emoji}</div>

                <div className="font-sans text-[9px] tracking-widest uppercase mb-1" style={{ color: ritual.accentColor, opacity: 0.9 }}>
                  Étape {activeStep + 1}
                </div>
                <div className="font-serif text-2xl font-light mb-1" style={{ color: ritual.textColor }}>
                  {currentStep.name}
                </div>
                <div className="font-sans text-xs mb-4" style={{ color: ritual.textColor, opacity: 0.6 }}>
                  {currentStep.brand}
                </div>

                {/* Timer section */}
                {currentStep.duration > 0 && (
                  <div className="flex flex-col items-center gap-3">
                    {/* SVG Circular timer */}
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/>
                        {/* Progress */}
                        <circle
                          cx="50" cy="50" r={R} fill="none"
                          stroke={isDark ? "#C8B8F0" : "#C8A400"}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={CIRC}
                          strokeDashoffset={timerRunning || timer < timerTotal ? dashOffset : 0}
                          transform="rotate(-90 50 50)"
                          style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="font-serif text-xl" style={{ color: ritual.textColor }}>
                          {timer > 0 ? formatTime(timer) : "✓"}
                        </div>
                      </div>
                    </div>

                    {!timerRunning && timer === currentStep.duration && (
                      <button
                        onClick={() => { setTimerTotal(currentStep.duration); setTimerRunning(true); }}
                        className="px-5 py-2 rounded-full font-sans text-xs press-scale"
                        style={{ background: "rgba(255,255,255,0.25)", color: ritual.textColor, border: "1px solid rgba(255,255,255,0.4)" }}
                      >
                        ▶ Démarrer le minuteur
                      </button>
                    )}
                    {timerRunning && (
                      <button
                        onClick={() => setTimerRunning(false)}
                        className="px-5 py-2 rounded-full font-sans text-xs press-scale"
                        style={{ background: "rgba(255,255,255,0.2)", color: ritual.textColor }}
                      >
                        ⏸ Pause
                      </button>
                    )}
                    {!timerRunning && timer > 0 && timer < currentStep.duration && (
                      <button
                        onClick={() => setTimerRunning(true)}
                        className="px-5 py-2 rounded-full font-sans text-xs press-scale"
                        style={{ background: "rgba(255,255,255,0.25)", color: ritual.textColor }}
                      >
                        ▶ Reprendre
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Next button */}
            <div className="px-5 pb-12 pt-4">
              <button
                onClick={nextStep}
                className="w-full py-4 rounded-2xl font-serif text-base press-scale"
                style={{ background: "rgba(255,255,255,0.25)", color: ritual.textColor, border: "1px solid rgba(255,255,255,0.4)" }}
              >
                {activeStep < ritual.steps.length - 1 ? `Étape suivante →` : "Terminer le Rituel ✦"}
              </button>
              <button
                onClick={nextStep}
                className="w-full mt-2 font-sans text-xs press-scale text-center"
                style={{ color: ritual.textColor, opacity: 0.5 }}
              >
                Passer cette étape
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
