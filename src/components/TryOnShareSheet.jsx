import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Check, Camera, Send, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function TryOnShareSheet({ capturedUrl, shade, category, onRetake, onDone }) {
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(null);
  const [communityDone, setCommunityDone] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);
  const [convos, setConvos] = useState([]);
  const [names, setNames] = useState({});
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => {});
  }, []);

  const dataUrlToFile = async () => {
    const blob = await fetch(capturedUrl).then((r) => r.blob());
    return new File([blob], "muse-studio.jpg", { type: "image/jpeg" });
  };

  const shareToCommunity = async () => {
    setBusy("community");
    try {
      const file = await dataUrlToFile();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.CommunityPost.create({
        brand: "The Muse Studio",
        name: shade ? shade.name : "Virtual Try-On",
        category: category === "lipstick" ? "Lipstick" : "Eyeshadow",
        image_url: file_url,
        review_text: shade
          ? `Tried ${shade.name} (${category}) in The Muse Studio.`
          : "Virtual try-on from The Muse Studio.",
        author_name: me?.full_name || "Muse Member",
      });
      setCommunityDone(true);
    } catch {}
    setBusy(null);
  };

  const loadRecipients = async () => {
    if (!me) return;
    setLoadingConvos(true);
    try {
      const all = await base44.entities.Message.list("-created_date", 100);
      const others = [...new Set(
        all.map((m) => (m.sender_id === me.id ? m.recipient_id : m.sender_id))
      )].filter(Boolean);
      const nameMap = {};
      await Promise.all(
        others.map(async (oid) => {
          try {
            const ou = await base44.entities.User.get(oid);
            nameMap[oid] = ou?.full_name || ou?.email || "Muse Member";
          } catch {
            nameMap[oid] = "Muse Member";
          }
        })
      );
      setNames(nameMap);
      setConvos(others);
    } catch {}
    setLoadingConvos(false);
  };

  const sendTo = async (recipientId) => {
    setBusy("message");
    try {
      const file = await dataUrlToFile();
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Message.create({
        recipient_id: recipientId,
        body: shade ? `Muse Studio look — ${shade.name}` : "Muse Studio look",
        image_url: file_url,
      });
      setSentTo(recipientId);
    } catch {}
    setBusy(null);
  };

  const initial = (name) => (name?.[0] || "M").toUpperCase();

  return (
    <div className="w-full h-full flex flex-col items-center pt-10 px-6 overflow-y-auto"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
    >
      {/* Preview image */}
      <div className="w-full max-w-[220px] aspect-[3/4] rounded-2xl overflow-hidden mb-6 flex-shrink-0"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
      >
        <img src={capturedUrl} alt="Muse Studio capture" className="w-full h-full object-cover" />
      </div>

      {/* Shade label */}
      {shade && (
        <div className="flex items-center gap-2 mb-5">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: shade.hex }} />
          <span className="text-[9px] tracking-[0.2em] uppercase text-white/50">{shade.name}</span>
        </div>
      )}

      {communityDone || sentTo ? (
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(200,176,106,0.15)", border: "1px solid rgba(200,176,106,0.3)" }}
          >
            <Check size={24} color="#C8B06A" />
          </div>
          <p className="font-serif text-lg text-white font-light">
            {communityDone ? "Shared to Community" : "Sent!"}
          </p>
          <p className="text-[9px] tracking-[0.15em] uppercase text-white/40 mt-1">
            {communityDone ? "Your look is live" : "Message delivered"}
          </p>
        </div>
      ) : showRecipients ? (
        <div className="w-full flex-1">
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/40 mb-3 text-center">Send to</p>
          {loadingConvos ? (
            <p className="text-sm text-white/40 italic text-center py-4">Loading…</p>
          ) : convos.length === 0 ? (
            <p className="text-xs text-white/40 text-center py-4 max-w-[220px] mx-auto leading-relaxed">
              No conversations yet. Message a member from Community first.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 hide-scrollbar">
              {convos.map((oid) => (
                <button
                  key={oid}
                  onClick={() => sendTo(oid)}
                  disabled={busy === "message"}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "#043927" }}
                  >
                    <span className="text-xs font-serif" style={{ color: "#C8B06A" }}>{initial(names[oid])}</span>
                  </div>
                  <span className="text-sm text-white/80 font-light flex-1 truncate">{names[oid] || "Muse Member"}</span>
                  <Send size={14} color="rgba(200,176,106,0.6)" />
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowRecipients(false)}
            className="mt-3 flex items-center gap-1.5 text-xs text-white/50"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-[260px]">
          <button
            onClick={shareToCommunity}
            disabled={busy === "community"}
            className="flex items-center justify-center gap-2 py-3.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-light transition-opacity"
            style={{ background: "#043927", color: "#FDF5E6", border: "1px solid rgba(200,176,106,0.2)" }}
          >
            <Users size={14} /> {busy === "community" ? "Sharing…" : "Share to Community"}
          </button>
          <button
            onClick={() => { setShowRecipients(true); loadRecipients(); }}
            disabled={busy === "message"}
            className="flex items-center justify-center gap-2 py-3.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-light"
            style={{ background: "#C8B06A", color: "#0A1A12" }}
          >
            <MessageCircle size={14} /> Send in Message
          </button>
        </div>
      )}

      {/* ── Retake / Done — always visible, prominently styled ── */}
      <div className="flex gap-3 mt-6 flex-shrink-0">
        {!communityDone && !sentTo && (
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[0.18em] uppercase"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <Camera size={13} /> Retake
          </button>
        )}
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] tracking-[0.18em] uppercase"
          style={{
            background: "rgba(200,176,106,0.12)",
            border: "1px solid rgba(200,176,106,0.35)",
            color: "#C8B06A",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}