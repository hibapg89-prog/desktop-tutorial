import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";

export default function ScanResults() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const products = state?.products || [];

  if (products.length === 0) {
    navigate("/home", { replace: true });
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-page-gradient)" }}
    >
      {/* Marble shimmer overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 25%, rgba(200,176,106,0.09) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 65%, rgba(200,176,106,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 5%,  rgba(255,255,255,0.50) 0%, transparent 45%)
          `,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity active:opacity-60"
          style={{ background: "rgba(11,60,38,0.07)" }}
          aria-label="Back"
        >
          <ArrowLeft size={18} color="var(--color-text-primary)" />
        </button>
        <SwanLogo className="h-8" />
        <div className="w-10" />
      </div>

      {/* Title block */}
      <div className="relative z-10 text-center px-6 mb-6">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-2"
          style={{ color: "var(--color-accent-gold)" }}
        >
          Scan Session
        </p>
        <h1
          className="text-[2rem] leading-tight"
          style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--color-text-primary)", fontWeight: 400 }}
        >
          Your Finds
        </h1>
        <p className="text-sm font-light mt-1" style={{ color: "var(--color-text-primary)", opacity: 0.45 }}>
          {products.length} {products.length === 1 ? "product" : "products"} identified
        </p>
      </div>

      {/* Gold rule — shelf edge */}
      <div className="relative z-10 mx-5 mb-6">
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C8B06A50, #C8B06A90, #C8B06A50, transparent)",
          }}
        />
      </div>

      {/* Product cards */}
      <div className="relative z-10 flex-1 px-5 pb-12 flex flex-col gap-3">
        {products.map((product, i) => (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.38, ease: "easeOut" }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="w-full text-left"
          >
            <div
              className="rounded-2xl px-5 py-4 flex items-center gap-4 active:scale-[0.985] transition-transform"
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid rgba(200,176,106,0.22)",
                boxShadow: "0 2px 18px rgba(11,60,38,0.06), 0 1px 4px rgba(200,176,106,0.12)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Initial avatar */}
              <div
                className="w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid rgba(200,176,106,0.28)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.5rem",
                    color: "var(--color-accent-gold)",
                    lineHeight: 1,
                  }}
                >
                  {product.brand?.[0]?.toUpperCase() || "?"}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold tracking-[0.14em] uppercase truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {product.brand}
                </p>
                <p
                  className="mt-0.5 leading-snug line-clamp-2"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.05rem",
                    color: "var(--color-text-primary)",
                    fontWeight: 400,
                  }}
                >
                  {product.name}
                  {product.shade ? ` — ${product.shade}` : ""}
                </p>
                {product.category && (
                  <p
                    className="text-[11px] mt-1 font-light"
                    style={{ color: "var(--color-text-primary)", opacity: 0.42 }}
                  >
                    {product.category}
                  </p>
                )}
              </div>

              {/* Arrow pill — intentional brand CTA */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#0B3C26" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6h8M6 2l4 4-4 4"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom shelf edge */}
      <div className="relative z-10 mx-5 mb-3">
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C8B06A50, #C8B06A90, #C8B06A50, transparent)",
          }}
        />
      </div>

      {/* Footer hint */}
      <p
        className="relative z-10 text-center text-[10px] pb-10 tracking-[0.12em] uppercase"
        style={{ color: "var(--color-text-primary)", opacity: 0.28 }}
      >
        Tap a product to explore
      </p>
    </div>
  );
}
