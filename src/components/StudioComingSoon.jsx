import { X } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import { motion } from "framer-motion";

export default function StudioComingSoon({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mx-5 w-full max-w-sm bg-[var(--color-bg)] rounded-3xl px-8 py-14 flex flex-col items-center text-center"
        style={{ boxShadow: "0 24px 64px rgba(11,60,38,0.22), 0 0 0 1px rgba(200,176,106,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-text-primary)]/[0.08] hover:bg-[var(--color-text-primary)]/[0.14] transition-colors"
          aria-label="Close"
        >
          <X size={14} color="var(--color-text-primary)" />
        </button>

        {/* ── Swan medallion ── */}
        <div className="mb-8">
          <SwanLogo size={96} className="opacity-90" />
        </div>

        {/* ── Headline ── */}
        <h1 className="font-serif text-[2.6rem] leading-none text-[var(--color-text-primary)] font-light tracking-wide mb-3">
          Le Studio
        </h1>

        {/* ── Coming Soon ── */}
        <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--color-text-primary)] font-light mb-6">
          Coming Soon
        </p>

        {/* ── Gold rule ── */}
        <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#C8B06A]/60 to-transparent mb-6" />

        {/* ── Supporting line ── */}
        <p className="text-[13px] text-[var(--color-text-primary)] opacity-[0.45] font-light leading-relaxed max-w-[210px] tracking-wide">
          Your virtual mirror is being polished to perfection.
        </p>
      </motion.div>
    </div>
  );
}
