import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, ScanLine, Sparkles, Droplets, Repeat2, Mic, MicOff, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SwanLogo from "./SwanLogo";
import { base44 } from "@/api/base44Client";
import CategoryProductCard from "@/components/CategoryProductCard";

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

// When The Muse mentions a navigatable feature, render a tappable chip below the bubble.
const NAV_HINTS = [
  { pattern: /local curator/i,          label: "Open The Local Curator",  route: "/local-curator", icon: Search, isLocalCurator: true },
  { pattern: /your vanity\b/i,          label: "Go to My Vanity",         route: "/vanity" },
  { pattern: /\btutorials?\b/i,         label: "Browse Tutorials",        route: "/tutorials" },
  { pattern: /\bscan\b.*product/i,      label: "Open Scanner",            action: "scan" },
  { pattern: /\bfor you\b/i,            label: "Go to For You",           route: "/for-you" },
  { pattern: /\bshopping list\b/i,      label: "Open Shopping List",      route: "/shopping-list" },
  { pattern: /\bingredient alert/i,     label: "Ingredient Alerts",       route: "/ingredient-alerts" },
];

function detectNavHint(text) {
  for (const h of NAV_HINTS) {
    if (h.pattern.test(text)) return h;
  }
  return null;
}

export default function MuseAssistant({ onClose, onOpenScan, productId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [thinking, setThinking] = useState(false);
  const [greeted, setGreeted]   = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const recognitionRef = useRef(null);
  const navigate     = useNavigate();

  const hasSpeech = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

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

  // Clean up speech recognition when unmounting
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const startListening = useCallback(() => {
    if (!hasSpeech || listening) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      // Auto-send after a brief moment so user sees the transcription
      setTimeout(() => {
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: transcript }]);
        sendText(transcript);
      }, 400);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [hasSpeech, listening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const sendText = async (text) => {
    if (!text.trim() || thinking) return;
    setThinking(true);
    try {
      const history = messages.slice(-8).map(m =>
        ({ role: m.role === "user" ? "user" : "muse", text: m.text })
      );

      const res = await base44.functions.museAssistant({
        message: text.trim(),
        history,
      });
      const data = res?.data || res;

      const reply = data?.reply || "";
      const products = Array.isArray(data?.products) ? data.products.filter(Boolean) : [];
      setMessages(prev => [...prev, { role: "muse", text: reply, navHint: detectNavHint(reply), products }]);
    } catch {
      setMessages(prev => [...prev, { role: "muse", text: "Something distracted me for a moment — please try again, chérie." }]);
    }
    setThinking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const send = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    await sendText(trimmed);
  };

  const handleQuick = async ({ id, prompt }) => {
    if (id === "scan") { onClose(); onOpenScan(); return; }
    await send(prompt);
  };

  const handleNavHint = (hint) => {
    if (hint.action === "scan") { onClose(); onOpenScan(); return; }
    if (hint.isLocalCurator) {
      onClose();
      navigate(productId ? `/local-curator/${productId}` : "/local-curator");
      return;
    }
    if (hint.route) { onClose(); navigate(hint.route); }
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
              <p className="text-[0.5625rem] tracking-[0.22em] uppercase text-[#C5A070] font-light mt-0.5">Your beauty guide</p>
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
            {messages.map((msg, i) => {
              const HintIcon = msg.navHint?.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mb-4 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start items-start"}`}>
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
                  </div>

                  {/* Navigation chip — appears below Muse messages that mention a feature */}
                  {msg.role === "muse" && msg.navHint && (
                    <motion.button
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => handleNavHint(msg.navHint)}
                      className="ml-7 mt-2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-light tracking-wide transition-all active:scale-[0.96]"
                      style={{
                        background: msg.navHint.isLocalCurator
                          ? "rgba(200,176,106,0.18)"
                          : "rgba(197,160,112,0.12)",
                        border: `1px solid ${msg.navHint.isLocalCurator ? "rgba(200,176,106,0.55)" : "rgba(197,160,112,0.35)"}`,
                        color: "var(--color-accent-gold)",
                        boxShadow: msg.navHint.isLocalCurator ? "0 2px 8px rgba(200,176,106,0.15)" : "none",
                      }}
                    >
                      {HintIcon && <HintIcon size={12} strokeWidth={1.8} />}
                      <span>{msg.navHint.label}</span>
                      <span className="opacity-50">→</span>
                    </motion.button>
                  )}
                  {msg.role === "muse" && msg.products?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-xs">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            try {
                              base44.entities.ScanLog.create({
                                scan_method: "muse",
                                status: "success",
                                product_id: product.id,
                                brand: product.brand || "",
                                name: product.name || "",
                                category: product.category || "",
                              });
                            } catch {}
                          }}
                        >
                          <CategoryProductCard product={product} variant="default" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

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

          {/* Empty state — ghost swan fills the void on fresh open */}
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div style={{ opacity: 0.06 }}>
                <SwanLogo size={80} color="var(--color-text-primary)" />
              </div>
            </motion.div>
          )}

          {/* Quick actions — only shown on fresh open */}
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="mt-1 mb-4"
            >
              <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-[var(--color-text-secondary)] mb-3 ml-0.5 font-light">
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
            className="text-center text-[0.6875rem] mb-2"
            style={{ color: "rgba(139,115,85,0.42)", fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            General beauty guidance only — not medical advice.
          </p>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: "var(--color-bg-elevated)", border: "1px solid rgba(229,217,192,0.8)" }}>

            {/* Mic button — only shown when SpeechRecognition is available */}
            {hasSpeech && (
              <motion.button
                onClick={listening ? stopListening : startListening}
                disabled={thinking}
                whileTap={{ scale: 0.9 }}
                aria-label={listening ? "Stop listening" : "Speak to The Muse"}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: listening ? "rgba(197,160,112,0.2)" : "transparent" }}
              >
                <AnimatePresence mode="wait">
                  {listening ? (
                    <motion.div
                      key="listening"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                    >
                      <motion.div
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      >
                        <MicOff size={14} color="#C5A070" strokeWidth={1.6} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                    >
                      <Mic size={14} color="rgba(var(--color-text-primary-rgb), 0.35)" strokeWidth={1.6} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={listening ? "Listening..." : "Ask The Muse anything..."}
              aria-label="Ask The Muse anything"
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] outline-none font-light"
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
