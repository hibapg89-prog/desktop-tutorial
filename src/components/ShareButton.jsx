import { useState } from "react";
import { Share2, Check, Copy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/utils/locale";

export default function ShareButton({ product, title, text, url, size = 14, className = "" }) {
  const [showSheet, setShowSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildContent = () => {
    if (product) {
      const shareUrl = `${window.location.origin}/product/${product.id}`;
      const shareTitle = `${product.brand} ${product.name}`;
      const shareText =
        `${product.brand} — ${product.name}` +
        (product.shade ? ` · ${product.shade}` : "") +
        (product.price ? ` · ${formatPrice(product.price)}` : "");
      return { shareUrl, shareTitle, shareText };
    }
    return {
      shareTitle: title || "LuxeBeauty",
      shareUrl: url || window.location.href,
      shareText: text || "",
    };
  };

  const share = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { shareUrl, shareTitle, shareText } = buildContent();
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: `${shareText}\n${shareUrl}`, url: shareUrl });
        return;
      } catch {
        // user cancelled or API unavailable — fall through to sheet
      }
    }
    setShowSheet(true);
  };

  const copyLink = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const { shareUrl, shareText } = buildContent();
    const fullText = `${shareText} — ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      // execCommand fallback for restricted contexts
      const ta = document.createElement("textarea");
      ta.value = fullText;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); setShowSheet(false); }, 1600);
  };

  const shareVia = (platform) => {
    const { shareUrl, shareText } = buildContent();
    const msg = encodeURIComponent(`${shareText} — ${shareUrl}`);
    const links = {
      whatsapp: `https://wa.me/?text=${msg}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      sms: `sms:?body=${msg}`,
    };
    if (links[platform]) window.open(links[platform], "_blank");
    setShowSheet(false);
  };

  return (
    <>
      <button
        onClick={share}
        aria-label="Share"
        className={`flex items-center justify-center rounded-full transition-colors ${className}`}
      >
        {copied
          ? <Check size={size} color="var(--color-text-muted)" />
          : <Share2 size={size} color="var(--color-text-muted)" />}
      </button>

      <AnimatePresence>
        {showSheet && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[65]"
              style={{ background: "rgba(4,57,39,0.18)", backdropFilter: "blur(3px)" }}
              onClick={(e) => { e.stopPropagation(); setShowSheet(false); }}
            />

            {/* Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-[var(--color-bg)] rounded-t-3xl"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-8 h-1 rounded-full bg-[var(--color-border)]" />
              </div>

              <div className="px-6 pt-3 pb-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] font-light">Share</p>
                    {product && (
                      <p className="text-sm text-[var(--color-text-primary)] font-light mt-0.5 truncate">
                        {product.brand} — {product.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setShowSheet(false); }}
                    className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0"
                  >
                    <X size={14} color="#043927" />
                  </button>
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2.5 mb-4">
                  {/* Copy link */}
                  <button
                    onClick={copyLink}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                      copied
                        ? "bg-[#043927] border-[#043927]"
                        : "bg-[var(--color-bg-elevated)] border-[var(--color-border)]"
                    }`}
                  >
                    {copied
                      ? <Check size={16} color="#FDF5E6" />
                      : <Copy size={16} color="#043927" />}
                    <span className={`text-sm font-light ${copied ? "text-[#FDF5E6]" : "text-[var(--color-text-primary)]"}`}>
                      {copied ? "Link copied!" : "Copy link"}
                    </span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => shareVia("whatsapp")}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                  >
                    <span className="text-lg leading-none">💬</span>
                    <span className="text-sm font-light text-[var(--color-text-primary)]">WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => shareVia("telegram")}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                  >
                    <span className="text-lg leading-none">✈️</span>
                    <span className="text-sm font-light text-[var(--color-text-primary)]">Telegram</span>
                  </button>

                  {/* iMessage / SMS */}
                  <button
                    onClick={() => shareVia("sms")}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                  >
                    <span className="text-lg leading-none">💌</span>
                    <span className="text-sm font-light text-[var(--color-text-primary)]">Message</span>
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-center text-[10px] text-[var(--color-text-muted)] font-light tracking-wide italic">
                  Share this with someone who would love it
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}