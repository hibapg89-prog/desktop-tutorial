import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Send, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";

export default function SwapCard({ swap, user, onUpdated }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const isOwn = user && swap.created_by_id === user.id;
  const isOpen = (swap.status || "open") === "open";

  const markMatched = async () => {
    setBusy(true);
    try {
      await base44.entities.Swap.update(swap.id, { status: "matched" });
      onUpdated();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const requestSwap = async () => {
    try {
      await base44.entities.Notification.create({
        user_id: swap.created_by_id,
        type: "swap",
        title: `${user?.full_name || "A member"} wants to swap`,
        body: `Interest in your ${swap.offered_product_name}${swap.offered_shade ? ` · ${swap.offered_shade}` : ""}.`,
        product_id: swap.id,
        product_name: swap.offered_product_name,
        image_url: swap.offered_image_url || "",
        sender_id: user?.id || "",
        read: false,
      });
    } catch {
    }
    navigate(`/messages/${swap.created_by_id}`);
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 pt-3">
        <ArrowLeftRight size={13} color="#C8B06A" />
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#BC8F8F] font-light">Swap Proposal</p>
        <span className={`ml-auto text-[9px] tracking-wide uppercase px-2 py-0.5 rounded-full font-light ${isOpen ? "bg-[var(--color-border)] text-[var(--color-text-secondary)]" : "bg-[#C8B06A]/15 text-[#C8B06A]"}`}>
          {isOpen ? "Open" : "Matched"}
        </span>
      </div>

      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)]">
          {swap.offered_image_url ? (
            <img src={swap.offered_image_url} alt={swap.offered_product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><SwanLogo size={22} color="#043927" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] tracking-[0.15em] uppercase text-[#BC8F8F] font-light">{swap.offered_brand}</p>
          <p className="text-sm text-[var(--color-text-primary)] font-light truncate">
            {swap.offered_product_name}{swap.offered_shade ? ` · ${swap.offered_shade}` : ""}
          </p>
          <p className="text-[10px] tracking-wide uppercase text-[var(--color-text-muted)] font-light mt-1.5">Looking for</p>
          <p className="text-xs text-[var(--color-text-secondary)] font-light mt-0.5 line-clamp-2">{swap.looking_for}</p>
        </div>
      </div>

      <div className="px-3 pb-3 flex items-center justify-between">
        <span className="text-[10px] text-[var(--color-text-muted)] font-light">by {swap.author_name || "A Muse Member"}</span>
        {isOwn ? (
          isOpen ? (
            <button
              onClick={markMatched}
              disabled={busy}
              className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)] font-light hover:text-[var(--color-text-primary)]"
            >
              <CheckCircle2 size={11} color="#C8B06A" /> Mark matched
            </button>
          ) : (
            <span className="text-[10px] text-[#C8B06A] font-light">Matched ✓</span>
          )
        ) : (
          <button
            onClick={requestSwap}
            className="flex items-center gap-1 text-[10px] text-[#BC8F8F] font-light hover:underline"
          >
            <Send size={11} /> Message to swap
          </button>
        )}
      </div>
    </div>
  );
}