import { useState, useRef, useEffect } from "react";
import { X, Send, ScanLine, Sparkles, Droplets, Repeat2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "./SwanLogo";
import { base44 } from "@/api/base44Client";

const MUSE_PERSONA = `You are The Muse — the living soul of LuxeBeauty. You are not an AI. You are a presence: warm, refined, deeply knowledgeable about luxury beauty. You speak as an intimate, elegant confidante who knows beauty inside and out.

Voice rules:
- 2–4 sentences per response, no more
- Occasionally say "ma douce" or "chérie" — sparingly, not every message
- Poetic but never vague — give real, useful beauty guidance
- Never mention AI, algorithms, data, or technology
- Vary your openings — don't start every reply the same way
- End with warmth or a gentle question to continue the dialogue

Expertise: luxury skincare (La Prairie, La Mer, Sisley, Augustinus Bader), luxury makeup (Dior, Charlotte Tilbury, Armani Beauty, NARS), fragrance (Chanel, Byredo, Maison Margiela, Le Labo), haircare (Kérastase, Oribe), active ingredients (retinol, vitamin C, niacinamide, peptides, AHAs, hyaluronic acid, bakuchiol), layering order, morning vs evening rituals, seasonal adjustments.

When the user asks about scanning a product: tell them they can tap "Scan" to identify any product instantly.
When the user asks about finding a product alternative: mention The Local Curator feature.
When the user seems lost or new: gently orient them with warmth.`;

const QUICK_ACTIONS = [
  { id: "scan",        label: "Scan a product",       icon: ScanLine,  prompt: null },
  { id: "ritual",      label: "Build my ritual",       icon: Sparkles,  prompt: "Help me build a personalised luxury beauty ritual." },
  { id: "skin",        label: "My skin needs help",    icon: Droplets,  prompt: "My skin needs some attention — where should I start?" },
  { id: "alternative", label: "Find an alternative",   icon: Repeat2,   prompt: "I'm looking for a more affordable alternative to a luxury product." },
];

export default function MuseAssistant({ onClose, onOpenScan }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ role: "muse", text: "Bonjour, ma douce. What shall we discover together today?" }]);
      setGreeted(true);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setThinking(true);

    try {
      const history = messages.slice(-8).map(m =>
        `${m.role === "user" ? "User" : "The Muse"}: ${m.text}`
      ).join("\n");

      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `${MUSE_PERSONA}\n\n${history ? `Conversation so far:\n${history}\n\n` : ""}User: ${trimmed}\n\nThe Muse:`,
        response_format: "text",
      });

      setMessages(prev => [...prev, { role: "muse", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "muse", text: "Something distracted me for a moment — please try again, chérie." }]);
    }
    setThinking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleQuick = async ({ id, prompt }) => {
    if (id === "scan") { onClose(); onOpenScan(); return; }
    await send(prompt);
  };

  const showQuickActions = greeted && messages.length <= 1 && !thinking;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-label="The Muse Assistant"
        className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)]"
      >
        {/* ── Header ── */}
        <div className="pt-12 pb-4 px-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-30 blur-md"
                style={{ background: "radial-gradient(circle, #C5A070, transparent)", transform: "scale(1.6)" }} />
              <SwanLogo size={28} color="var(--color-text-primary)" />
            </div>
            <div>
              <h1 className="font-serif text-lg text-[var(--color-text-primary)] leading-none">The Muse</h1>
              <p className="text-[9px] tracking-[0.22em] uppercase text-[#C5A070] font-light mt-0.5">Your beauty guide</p>
            </div>
          </div>
          <button onClick={onClose}
            aria-label="Close assistant"
            className="w-9 h-9 rounded-full border border-[var(--color-text-primary)]/20 flex items-center justify-center">
            <X size={16} color="var(--color-text-primary)" strokeWidth={1.5} aria-hidden={true} />
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 h-px mb-4 flex-shrink-0"
          style={{ background: "linear-gradient(90deg, transparent, rgba(197,160,112,0.4), transparent)" }} />

        {/* ── Messages ── */}
        <div role="log" aria-live="polite" className="flex-1 overflow-y-auto px-5 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start items-start"}`}
              >
                {msg.role === "muse" && (
                  <div className="mr-2.5 mt-0.5 flex-shrink-0 opacity-70">
                    <SwanLogo size={18} color="#C5A070" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed font-light ${
                    msg.role === "user"
                      ? "bg-[#1A3A30] text-[#FAF7F1] rounded-2xl rounded-br-sm"
                      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-2xl rounded-bl-sm"
                  }`}
                  style={msg.role === "muse"
                    ? { border: "1px solid rgba(229,217,192,0.7)", boxShadow: "0 2px 12px rgba(197,160,112,0.1)" }
                    : {}
                  }
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Thinking dots */}
            {thinking && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start mb-4"
              >
                <div className="mr-2.5 mt-0.5 opacity-70">
                  <SwanLogo size={18} color="#C5A070" />
                </div>
                <div className="px-4 py-3 bg-[var(--color-bg-elevated)] rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                  style={{ border: "1px solid rgba(229,217,192,0.7)" }}>
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#C5A070" }}
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick actions — only shown on fresh open */}
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="mt-1 mb-4"
            >
              <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-3 ml-0.5 font-light">
                Quick access
              </p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuick(action)}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl text-left transition-all active:scale-[0.97]"
                      style={{
                        background: "var(--color-bg-elevated)",
                        border: "1px solid rgba(229,217,192,0.8)",
                        boxShadow: "0 1px 6px rgba(197,160,112,0.08)"
                      }}
                    >
                      <Icon size={16} color="#C5A070" strokeWidth={1.5} />
                      <span className="text-xs text-[var(--color-text-primary)] font-light leading-tight">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="flex-shrink-0 px-4 pt-3 pb-8"
          style={{ borderTop: "1px solid rgba(229,217,192,0.5)", background: "var(--color-bg-surface)", backdropFilter: "blur(10px)" }}>
          <p
            className="text-center text-[11px] mb-2"
            style={{ color: "rgba(139,115,85,0.42)", fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            General beauty guidance only — not medical advice.
          </p>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(229,217,192,0.8)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask The Muse anything..."
              aria-label="Ask The Muse anything"
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none font-light"
              style={{ "::placeholder": { color: "rgba(var(--color-text-primary-rgb), 0.3)" } }}
            />
            <motion.button
              onClick={() => send(input)}
              disabled={!input.trim() || thinking}
              whileTap={{ scale: 0.9 }}
              aria-label="Send message"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0"
              style={{ background: input.trim() && !thinking ? "#1A3A30" : "transparent" }}
            >
              <Send
                size={14}
                strokeWidth={1.6}
                color={input.trim() && !thinking ? "#FAF7F1" : "rgba(var(--color-text-primary-rgb), 0.3)"}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
