import { useState } from "react";
import { Check, Copy, X, Users, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ScanShareSheet({ product, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/product/${product.id}`;
  const shareText = `${product.brand} — ${product.name}${product.shade ? ` · ${product.shade}` : ""}`;
  const msg = encodeURIComponent(`${shareText} — ${shareUrl}`);

  const copyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = `${shareText} — ${shareUrl}`;
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none;";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => { setCopied(false); onClose(); }, 1600);
  };

  const shareVia = (platform) => {
    const links = {
      whatsapp: `https://wa.me/?text=${msg}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    };
    if (links[platform]) window.open(links[platform], "_blank");
    onClose();
  };

  const postToCircle = () => {
    onClose();
    navigate("/community", { state: { prefillProduct: product } });
  };

  const sendInDM = () => {
    onClose();
    navigate("/messages", { state: { shareProduct: product } });
  };

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{ background: "rgba(4,57,39,0.18)", backdropFilter: "blur(3px)" }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg)] rounded-t-3xl"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 20px)" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-[var(--color-border)]" />
          </div>

          <div className="px-6 pt-3 pb-2">
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[var(--color-text-muted)] font-light">Share</p>
                <p className="text-sm text-[var(--color-text-primary)] font-light mt-0.5 truncate">
                  {product.brand} — {product.name}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
                <X size={14} color="#043927" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-4">
              {/* Post to Circle (Community Feed) */}
              <button
                onClick={postToCircle}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
              >
                <div className="w-8 h-8 rounded-full bg-[#C8B06A]/15 flex items-center justify-center">
                  <Users size={15} color="#043927" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-light text-[var(--color-text-primary)]">Post to Circle</p>
                  <p className="text-[10px] text-primary-40 font-light">Share in the community feed</p>
                </div>
              </button>

              {/* Send in DM */}
              <button
                onClick={sendInDM}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
              >
                <div className="w-8 h-8 rounded-full bg-[#BC8F8F]/15 flex items-center justify-center">
                  <MessageCircle size={15} color="#043927" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-light text-[var(--color-text-primary)]">Send in DM</p>
                  <p className="text-[10px] text-primary-40 font-light">Share with a Muse member</p>
                </div>
              </button>

              {/* Copy link */}
              <button
                onClick={copyLink}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
                  copied ? "bg-[#043927] border-[#043927]" : "bg-[var(--color-bg-elevated)] border-[var(--color-border)]"
                }`}
              >
                {copied ? <Check size={16} color="#FDF5E6" /> : <Copy size={16} color="#043927" />}
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
            </div>

            <p className="text-center text-[10px] text-[var(--color-text-muted)] font-light tracking-wide italic">
              Share this with someone who would love it
            </p>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
