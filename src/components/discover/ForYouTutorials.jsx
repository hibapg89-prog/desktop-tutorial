import { useState, useEffect } from "react";
import { BookOpen, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getUserPreferences } from "@/lib/userPreferences";
import SwanLogo from "@/components/SwanLogo";

export default function ForYouTutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { tutorialCats } = await getUserPreferences();
        if (!tutorialCats.length) {
          setTutorials([]);
          return;
        }
        const all = await base44.entities.Tutorial.list("-saves_count", 20);
        const matched = all.filter((t) => tutorialCats.includes(t.category));
        setTutorials(matched.slice(0, 6));
      } catch {
        setTutorials([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
                  className="flex-shrink-0 w-40"
                >
                  <Link
                    to={`/tutorial/${t.id}`}
                    className="block rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
                  >
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
                </motion.div>
              ))}
          <div className="flex-shrink-0 w-2" />
        </div>
      </div>
    </div>
  );
}
