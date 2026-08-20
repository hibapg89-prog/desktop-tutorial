import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Instagram } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TryOnHistory({ refreshKey }) {
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await base44.entities.TryOnLook.list("-created_date", 50);
      setLooks(data);
    } catch {
      setLooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const toggleFav = async (look) => {
    await base44.entities.TryOnLook.update(look.id, { is_favorite: !look.is_favorite });
    setLooks((prev) => prev.map((l) => (l.id === look.id ? { ...l, is_favorite: !l.is_favorite } : l)));
  };

  const remove = async (look) => {
    await base44.entities.TryOnLook.delete(look.id);
    setLooks((prev) => prev.filter((l) => l.id !== look.id));
  };

  const shareToInstagram = (look) => {
    const canvas = document.createElement("canvas");
    const w = 1080, h = 1080;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#F6EFDF");
    grad.addColorStop(0.5, "#F4ECDA");
    grad.addColorStop(1, "#F6EFDF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Shade swatch
    const cx = w / 2, cy = h / 2 - 80;
    ctx.beginPath();
    ctx.arc(cx, cy, 180, 0, Math.PI * 2);
    ctx.fillStyle = look.shade_hex;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.stroke();

    // Shade name
    ctx.font = "600 56px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#1A3A30";
    ctx.textAlign = "center";
    ctx.fillText(look.shade_name, cx, cy + 280);

    // Category
    ctx.font = "400 26px Inter, sans-serif";
    ctx.fillStyle = "#8B7355";
    ctx.fillText(look.category.toUpperCase(), cx, cy + 325);

    // Branding
    ctx.font = "400 34px 'Cormorant Garamond', Georgia, serif";
    ctx.fillStyle = "#C5A070";
    ctx.fillText("The Muse Studio", cx, h - 80);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `muse-studio-${look.shade_name}.jpg`, { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "The Muse Studio",
            text: `Trying ${look.shade_name} (${look.category}) in The Muse Studio ✨`,
          });
          return;
        } catch {}
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `muse-studio-${look.shade_name}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/jpeg", 0.9);
  };

  if (loading) {
    return <p className="text-sm text-[#8B7355] italic py-8 text-center">Loading your looks...</p>;
  }

  if (!looks.length) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-4">
        <p className="text-sm text-[#8B7355] italic mb-2">No saved looks yet</p>
        <p className="text-xs text-[#8B7355]/70 max-w-[220px] leading-relaxed">
          Try on a shade in the Studio and tap "Save Look" to build your collection.
        </p>
      </div>
    );
  }

  const favorites = looks.filter((l) => l.is_favorite);
  const others = looks.filter((l) => !l.is_favorite);

  const renderCard = (look) => (
    <motion.div
      key={look.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div
        className="relative w-full aspect-square rounded-2xl flex items-center justify-center"
        style={{ background: "#EFE9DC", border: "1px solid rgba(26,58,48,0.12)" }}
      >
        <div
          className="w-12 h-12 rounded-full"
          style={{
            background: look.shade_hex,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          }}
        />
        <button onClick={() => toggleFav(look)} className="absolute top-1.5 right-1.5">
          <Heart
            size={14}
            className={look.is_favorite ? "fill-[#C8102E] text-[#C8102E]" : "text-[#1A3A30]/40"}
          />
        </button>
        <button onClick={() => remove(look)} className="absolute top-1.5 left-1.5">
          <Trash2 size={13} color="rgba(26,58,48,0.4)" />
        </button>
      </div>
      <span className="text-[9px] tracking-[0.08em] text-[#1A3A30]/70 font-light mt-1.5 text-center leading-tight">
        {look.shade_name}
      </span>
      <span className="text-[8px] tracking-[0.1em] uppercase text-[#8B7355]/60">{look.category}</span>
      <button
        onClick={() => shareToInstagram(look)}
        className="mt-1.5 flex items-center gap-1 text-[8px] tracking-[0.12em] uppercase text-[#1A3A30]/55 font-light hover:text-[#1A3A30] transition-colors"
      >
        <Instagram size={10} /> Share
      </button>
    </motion.div>
  );

  return (
    <div className="w-full">
      {favorites.length > 0 && (
        <>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#C5A070] mb-3">Favorites</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {favorites.map(renderCard)}
          </div>
        </>
      )}
      {others.length > 0 && (
        <>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8B7355]/60 mb-3">All Saved Looks</p>
          <div className="grid grid-cols-3 gap-3">
            {others.map(renderCard)}
          </div>
        </>
      )}
    </div>
  );
}