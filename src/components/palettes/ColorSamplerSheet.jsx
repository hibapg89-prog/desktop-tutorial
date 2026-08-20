import { useState, useEffect, useRef } from "react";
import { Pipette, X, Upload, Image as ImageIcon, Plus, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function ColorSamplerSheet({ onClose, onAddShade, paletteCategory }) {
  const [source, setSource] = useState("upload");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [vanityProducts, setVanityProducts] = useState([]);
  const [loadingVanity, setLoadingVanity] = useState(true);
  const [sampledHex, setSampledHex] = useState(null);
  const [shadeName, setShadeName] = useState("");
  const [sampleError, setSampleError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    base44
      .auth.me()
      .then((me) =>
        base44.entities.Product.filter({ in_vanity: true, created_by_id: me.id })
      )
      .then((list) => {
        setVanityProducts(
          Array.isArray(list) ? list.filter((p) => p.image_url) : []
        );
      })
      .catch(() => setVanityProducts([]))
      .finally(() => setLoadingVanity(false));
  }, []);

  // Draw image to canvas once it loads and canvas is mounted
  useEffect(() => {
    if (imageObj && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const maxW = 400,
        maxH = 320;
      const scale = Math.min(maxW / imageObj.width, maxH / imageObj.height, 1);
      canvas.width = imageObj.width * scale;
      canvas.height = imageObj.height * scale;
      ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
    }
  }, [imageObj]);

  const loadImage = (url) => {
    setSampledHex(null);
    setSampleError(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImageObj(img);
    img.onerror = () => {
      setSampleError("Could not load this image for sampling.");
      setImageObj(null);
    };
    img.src = url;
    setImageUrl(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadImage(url);
  };

  const handleCanvasTap = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    try {
      const ctx = canvas.getContext("2d");
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex =
        "#" +
        [pixel[0], pixel[1], pixel[2]]
          .map((c) => c.toString(16).padStart(2, "0"))
          .join("");
      setSampledHex(hex);
      setSampleError(null);
      if (!shadeName) setShadeName(`Sampled ${hex.toUpperCase()}`);
    } catch (err) {
      setSampleError(
        "This image is protected — try uploading a copy of the image instead."
      );
    }
  };

  const resetImage = () => {
    setImageObj(null);
    setImageUrl(null);
    setSampledHex(null);
    setShadeName("");
    setSampleError(null);
  };

  const addToPalette = () => {
    if (!sampledHex) return;
    onAddShade({
      name: shadeName.trim() || `Sampled ${sampledHex.toUpperCase()}`,
      hex: sampledHex,
      category: paletteCategory === "mixed" ? "lipstick" : paletteCategory,
    });
    setSampledHex(null);
    setShadeName("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-[var(--color-bg)] rounded-t-3xl px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pipette size={18} color="var(--color-accent-gold)" strokeWidth={1.5} />
            <h3 className="font-serif text-[1.25rem] font-light text-[var(--color-text-primary)]">
              Color Sampler
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={18} color="var(--color-text-primary)" strokeWidth={1.5} />
          </button>
        </div>

        {/* Source tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setSource("upload");
              resetImage();
            }}
            className={`flex-1 py-2.5 rounded-xl text-[0.5625rem] tracking-[0.15em] uppercase font-light transition-all flex items-center justify-center gap-1.5 ${
              source === "upload"
                ? "bg-[#043927] text-[#FDF5E6]"
                : "bg-[var(--color-bg-surface)] text-primary-50 border border-[var(--color-border)]"
            }`}
          >
            <Upload size={11} /> Upload
          </button>
          <button
            onClick={() => {
              setSource("vanity");
              resetImage();
            }}
            className={`flex-1 py-2.5 rounded-xl text-[0.5625rem] tracking-[0.15em] uppercase font-light transition-all flex items-center justify-center gap-1.5 ${
              source === "vanity"
                ? "bg-[#043927] text-[#FDF5E6]"
                : "bg-[var(--color-bg-surface)] text-primary-50 border border-[var(--color-border)]"
            }`}
          >
            <ImageIcon size={11} /> My Vanity
          </button>
        </div>

        {source === "upload" && !imageUrl && (
          <label className="block">
            <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] py-12 text-center bg-[var(--color-bg-surface)] cursor-pointer">
              <Upload size={28} color="var(--color-accent-gold)" className="mx-auto mb-3 opacity-60" />
              <p className="text-[0.6875rem] text-primary-40 font-light">
                Tap to choose an image
              </p>
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        )}

        {source === "vanity" && !imageUrl && (
          <>
            {loadingVanity ? (
              <div className="flex justify-center py-8">
                <div className="swan-float">
                  <SwanLogo size={28} color="var(--color-accent-gold)" />
                </div>
              </div>
            ) : vanityProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-8 text-center bg-[var(--color-bg-surface)]">
                <p className="text-[0.6875rem] text-primary-40 font-light italic">
                  No product images in your vanity yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {vanityProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadImage(p.image_url)}
                    className="aspect-square rounded-xl overflow-hidden border border-[var(--color-border)]"
                  >
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {imageUrl && (
          <div>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasTap}
              className="w-full rounded-2xl border border-[var(--color-border)] touch-none cursor-crosshair"
              style={{ maxHeight: 320 }}
            />
            <p className="text-[0.5625rem] text-primary-40 font-light text-center mt-2 italic">
              Tap anywhere on the image to sample a color
            </p>
            <button
              onClick={resetImage}
              className="mt-2 text-[0.5625rem] tracking-[0.12em] uppercase text-primary-50 font-light underline underline-offset-2"
            >
              Choose another image
            </button>
          </div>
        )}

        {sampleError && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <AlertCircle size={14} color="#d97706" className="flex-shrink-0 mt-0.5" />
            <p className="text-[0.625rem] text-amber-700 font-light leading-relaxed">
              {sampleError}
            </p>
          </div>
        )}

        {/* Sampled color preview */}
        <AnimatePresence>
          {sampledHex && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex-shrink-0 border border-white/30"
                  style={{ background: sampledHex }}
                />
                <div className="flex-1">
                  <p className="text-[0.5rem] tracking-[0.15em] uppercase text-primary-40 font-light">
                    Sampled Color
                  </p>
                  <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light">
                    {sampledHex.toUpperCase()}
                  </p>
                </div>
              </div>
              <input
                value={shadeName}
                onChange={(e) => setShadeName(e.target.value)}
                placeholder="Name this shade…"
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 mb-3"
              />
              <button
                onClick={addToPalette}
                className="w-full py-3 bg-[#043927] text-[#FDF5E6] text-[0.5625rem] tracking-[0.25em] uppercase rounded-full font-light flex items-center justify-center gap-2"
              >
                <Plus size={12} strokeWidth={2} />
                Add to Palette
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}