import { useState } from "react";
import { X, Link as LinkIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Makeup", "Skincare", "Hair", "Wellness"];

/**
 * AddEditFromLink — paste a tutorial/video link, The Muse extracts the
 * tutorial content (title, category, steps, materials, image) and saves
 * it as a Tutorial entity so it appears in the editorial grid.
 */
export default function AddEditFromLink({ onClose, onCreated }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 8 : p));
    }, 400);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a luxury beauty editorial assistant. A user has shared a link to a beauty tutorial: "${trimmed}"

Search the web for the content of this tutorial (it may be a YouTube video, Instagram post, TikTok, blog article, or brand tutorial page). Extract the tutorial details.

Return a JSON object with:
- title: a concise, elegant editorial title (uppercase, max 6 words) capturing the tutorial's essence
- category: one of ${CATEGORIES.join(", ")} — pick the CORRECT category (hair tutorial → "Hair", skincare routine → "Skincare", makeup look → "Makeup", meditation/fitness/wellness → "Wellness")
- difficulty: "Beginner", "Intermediate", or "Advanced"
- duration_minutes: estimated minutes to complete the tutorial (number)
- description: 2-3 elegant editorial sentences describing the tutorial
- image_url: a representative, contextually accurate image URL from the tutorial's source page (e.g. YouTube thumbnail, blog hero image). The image MUST visually represent the tutorial topic — e.g. a hair tutorial should show hair/haircare, a makeup tutorial should show makeup. Do NOT use generic images of phones, hands, or unrelated objects.
- materials: an array of 5-10 product/material names needed
- steps: an array of 5-10 clear, numbered instruction steps
- creator_source: the creator or source name (e.g. "Lisa Eldridge", "Vogue", "YouTube")
- creator_platform: the platform (e.g. "YouTube", "Instagram", "TikTok", "Blog")

CRITICAL: The image_url MUST be contextually accurate for the tutorial topic. A hair tutorial image must show hair. A makeup tutorial image must show makeup. Never use an image of a phone, hands, or unrelated objects.`,
        model: "gemini_3_flash",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            category: { type: "string" },
            difficulty: { type: "string" },
            duration_minutes: { type: "number" },
            description: { type: "string" },
            image_url: { type: "string" },
            materials: { type: "array", items: { type: "string" } },
            steps: { type: "array", items: { type: "string" } },
            creator_source: { type: "string" },
            creator_platform: { type: "string" },
          },
        },
      });

      clearInterval(interval);
      setProgress(100);

      if (!result?.title || !result?.category) {
        throw new Error("Could not extract tutorial content");
      }

      const tutorial = await base44.entities.Tutorial.create({
        title: result.title,
        category: CATEGORIES.includes(result.category) ? result.category : "Makeup",
        difficulty: result.difficulty || "Beginner",
        duration_minutes: result.duration_minutes || 10,
        description: result.description || "",
        image_url: result.image_url || "",
        materials: result.materials || [],
        steps: result.steps || [],
        creator_source: result.creator_source || "",
        creator_platform: result.creator_platform || "",
        is_muse_original: false,
        is_collected: true,
        tags: ["link"],
      });

      setTimeout(() => {
        setLoading(false);
        onClose();
        onCreated?.();
        navigate(`/tutorial/${tutorial.id}`);
      }, 600);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setProgress(0);
      setError("The Muse couldn't extract a tutorial from this link. Try a YouTube, Instagram, or blog tutorial link.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(13,26,20,0.78)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full max-w-sm mx-5 rounded-3xl p-8"
          style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}
        >
          {!loading && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)]"
            >
              <X size={14} color="var(--color-text-primary)" />
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="swan-float mb-4">
                <Sparkles size={32} color="var(--color-accent-gold)" />
              </div>
              <h3 className="font-serif text-lg text-[var(--color-text-primary)] mb-1">The Muse is reading</h3>
              <p className="text-sm text-primary-45 italic mb-8">extracting your tutorial...</p>
              <div className="w-full max-w-[240px] h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent-gold)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                style={{ background: "var(--color-bg-elevated)" }}
              >
                <LinkIcon size={20} color="var(--color-accent-gold)" />
              </div>
              <h3 className="font-serif text-xl text-[var(--color-text-primary)] text-center mb-1">Add an Edit</h3>
              <p className="text-sm text-primary-45 text-center italic mb-6">
                Paste a tutorial link — YouTube, Instagram, blog
              </p>

              <div className="w-full border border-[var(--color-border)] rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
                <LinkIcon size={16} color="var(--color-text-primary)" />
                <input
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a tutorial link..."
                  className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none placeholder:text-primary-30 font-light"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {error && (
                <p className="text-xs text-[var(--color-text-primary)]/60 italic mb-4 text-center px-4">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-[#043927] text-[#FDF5E6] text-xs tracking-[0.25em] uppercase rounded-full font-light"
              >
                Extract with The Muse
              </button>
              <p className="text-[10px] text-primary-30 mt-4 text-center italic leading-relaxed">
                The Muse will read the tutorial, write editorial steps,<br />and choose a fitting cover image
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
