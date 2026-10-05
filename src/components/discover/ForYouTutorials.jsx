import { useState, useEffect } from "react";
import { BookOpen, Clock, Heart, Bookmark, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getUserPreferences } from "@/lib/userPreferences";
import SwanLogo from "@/components/SwanLogo";

export default function ForYouTutorials() {
  const [tutorials,    setTutorials]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [adoredIds,    setAdoredIds]    = useState(new Set());
  const [collectedIds, setCollectedIds] = useState(new Set());
  const [passedAlongId, setPassedAlongId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { tutorialCats } = await getUserPreferences();
        const all = await base44.entities.Tutorial.list("-saves_count", 20);
        let picks;
        if (tutorialCats.length) {
          const matched = all.filter((t) => tutorialCats.includes(t.category));
          picks = matched.length ? matched.slice(0, 6) : all.slice(0, 6);
        } else {
          picks = all.slice(0, 6);
        }
        setTutorials(picks);

        // Fire-and-forget: fetch Unsplash images for tutorials missing one
        picks.filter(t => !t.image_url).forEach(async (t) => {
          try {
            const res = await base44.functions.invoke('fetchContentImage', {
              entity_type: 'Tutorial', entity_id: t.id,
              title: t.title, category: t.category,
            });
            const r = res?.data || res;
            if (r?.image_url) {
              setTutorials(prev => prev.map(p => p.id === t.id ? { ...p, image_url: r.image_url } : p));
            }
          } catch {}
        });
      } catch {
        setTutorials([]);
      } finally {
        setLoading(false);
      }
    })();
    base44.auth.me().then((u) => {
      setAdoredIds(new Set(Array.isArray(u?.adored_tutorials) ? u.adored_tutorials : []));
      setCollectedIds(new Set(Array.isArray(u?.collected_tutorials) ? u.collected_tutorials : []));
    }).catch(() => {});
  }, []);

  const toggleAdore = async (tutorialId) => {
    const wasAdored = adoredIds.has(tutorialId);
    const next = new Set(adoredIds);
    wasAdored ? next.delete(tutorialId) : next.add(tutorialId);
    setAdoredIds(next);
    try {
      const u = await base44.auth.me();
      const arr = Array.isArray(u?.adored_tutorials) ? u.adored_tutorials : [];
      const updated = wasAdored
        ? arr.filter((id) => id !== tutorialId)
        : [...new Set([...arr, tutorialId])];
      await base44.auth.updateMe({ adored_tutorials: updated });
    } catch { /* keep optimistic state; don't revert */ }
  };

  const toggleCollect = async (tutorialId) => {
    const wasCollected = collectedIds.has(tutorialId);
    const next = new Set(collectedIds);
    wasCollected ? next.delete(tutorialId) : next.add(tutorialId);
    setCollectedIds(next);
    try {
      const u = await base44.auth.me();
      const arr = Array.isArray(u?.collected_tutorials) ? u.collected_tutorials : [];
      const updated = wasCollected
        ? arr.filter((id) => id !== tutorialId)
        : [...new Set([...arr, tutorialId])];
      await base44.auth.updateMe({ collected_tutorials: updated });
    } catch { /* keep optimistic state; don't revert */ }
  };

  const handlePassAlong = async (t) => {
    const url = `${window.location.origin}/tutorial/${t.id}`;
    const shareData = {
      title: t.title || "La Muse Ritual",
      text:  t.description ? t.description.slice(0, 100) + "…" : "A ritual from La Muse.",
      url,
    };
    let shared = false;
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shared = true;
      }
    } catch { /* share failed or user cancelled */ }
    if (!shared) {
      try { await navigator.clipboard.writeText(url); } catch {}
    }
    setPassedAlongId(t.id);
    setTimeout(() => setPassedAlongId(null), 2000);
  };

  if (!loading && !tutorials.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={14} color="#C8B06A" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Rituals For You</h2>
        </div>
        <Link
          to="/tutorials"
          className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-muted)] font-light"
        >
          All Rituals
        </Link>
      </div>

      <div className="-mx-5 px-5 overflow-x-auto hide-scrollbar">
        <div className="flex gap-3 w-max pb-1">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                >
                  <div className="h-36 bg-[var(--color-bg-elevated)] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-2 bg-[var(--color-border)] rounded animate-pulse w-16" />
                    <div className="h-3 bg-[var(--color-border)] rounded animate-pulse w-full" />
                    <div className="h-3 bg-[var(--color-border)] rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))
            : tutorials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex-shrink-0 w-40 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex flex-col"
                >
                  <Link to={`/tutorial/${t.id}`} className="block">
                    <div className="h-36 relative overflow-hidden">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                          <SwanLogo size={28} color="#043927" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                      {t.is_muse_original && (
                        <span className="absolute top-2 left-2 text-[8px] tracking-[0.1em] uppercase bg-[#C8B06A] text-white px-1.5 py-0.5 rounded-full font-light">
                          Muse
                        </span>
                      )}
                      {t.duration_minutes && (
                        <span className="absolute bottom-2 right-2 text-[9px] text-white/80 font-light flex items-center gap-0.5">
                          <Clock size={8} strokeWidth={1.5} /> {t.duration_minutes}m
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] tracking-[0.12em] uppercase text-[#BC8F8F] font-light truncate">
                        {t.category}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-primary)] font-light leading-snug mt-0.5 line-clamp-2">
                        {t.title}
                      </p>
                      {t.difficulty && (
                        <p className="text-[9px] text-[var(--color-text-muted)] font-light mt-1.5">
                          {t.difficulty}
                        </p>
                      )}
                    </div>
                  </Link>

                  {/* Compact engagement bar */}
                  <div className="px-2.5 pb-2.5 pt-1 flex items-center gap-1.5 mt-auto">
                    <button
                      onClick={() => toggleAdore(t.id)}
                      aria-label={adoredIds.has(t.id) ? "Un-adore" : "Adore"}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                        adoredIds.has(t.id) ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"
                      }`}
                    >
                      <Heart size={11} strokeWidth={1.5} color={adoredIds.has(t.id) ? "white" : "var(--color-text-muted)"} fill={adoredIds.has(t.id) ? "white" : "none"} />
                    </button>
                    <button
                      onClick={() => toggleCollect(t.id)}
                      aria-label={collectedIds.has(t.id) ? "Un-collect" : "Collect"}
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                        collectedIds.has(t.id) ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"
                      }`}
                    >
                      <Bookmark size={11} strokeWidth={1.5} color={collectedIds.has(t.id) ? "white" : "var(--color-text-muted)"} fill={collectedIds.has(t.id) ? "white" : "none"} />
                    </button>
                    <button
                      onClick={() => handlePassAlong(t)}
                      aria-label="Pass Along"
                      className={`flex-1 py-2 rounded-xl flex items-center justify-center border transition-all ${
                        passedAlongId === t.id ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"
                      }`}
                    >
                      <Share2 size={11} strokeWidth={1.5} color={passedAlongId === t.id ? "white" : "var(--color-text-muted)"} />
                    </button>
                  </div>
                </motion.div>
              ))}
          <div className="flex-shrink-0 w-2" />
        </div>
      </div>
    </div>
  );
}
