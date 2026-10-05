"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SwanLogo } from "./LandingScreen";
import {
  processMuseMessage,
  validateInput,
  INPUT_MAX_LENGTH,
  QUICK_ACTIONS,
  isSessionLimitReached,
  SESSION_LIMIT_MESSAGE,
  type UserTier,
  type QuickAction,
} from "../lib/museLogic";

interface Props { onNext: () => void; }

interface ChatMessage {
  id: string;
  role: "muse" | "user";
  text: string;
  timestamp: number;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "muse",
  text: "Ma douce, bienvenue dans ton univers beauté.\nJe suis La Muse — ta compagne de lumière.\n\nParle-moi de ce qui touche à ta beauté.",
  timestamp: Date.now(),
};

export default function ConciergeScreen({ onNext }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [userTier] = useState<UserTier>("seeker");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMuseResponse = (text: string) => {
    setIsTyping(true);
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const msg: ChatMessage = {
        id: `muse-${Date.now()}`,
        role: "muse",
        text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const validation = validateInput(trimmed);
    if (!validation.valid) return;

    if (isSessionLimitReached(userTier, userMessageCount)) {
      addMuseResponse(SESSION_LIMIT_MESSAGE);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setUserMessageCount((c) => c + 1);

    const response = processMuseMessage(trimmed);
    addMuseResponse(response.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= INPUT_MAX_LENGTH && !val.includes("\n")) {
      setInput(val);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: action.label,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setUserMessageCount((c) => c + 1);
    addMuseResponse(action.response);
  };

  const handleMuseButtonDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowQuickActions(true);
    }, 500);
  };

  const handleMuseButtonUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#FAF7F2" }}>

      {/* Header */}
      <div className="relative z-10 px-6 pt-8 pb-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(200,176,106,0.2)" }}>
        <button
          onClick={onNext}
          className="font-sans text-[9px] tracking-[0.22em] uppercase transition-opacity cursor-pointer"
          style={{ color: "#0B3C26", opacity: 0.5 }}>
          ← Retour
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-serif text-lg font-normal" style={{ color: "#1C1C1C" }}>
            The Muse
          </h1>
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase" style={{ color: "#C8B06A", opacity: 0.7 }}>
            Your beauty companion
          </p>
        </div>
        <div className="opacity-20">
          <SwanLogo size={22} />
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5"
        style={{ scrollBehavior: "smooth" }}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="absolute inset-0 z-30 flex items-end justify-center"
          style={{ background: "rgba(250,247,242,0.92)" }}>
          <div className="w-full px-5 pb-8 pt-4">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-center mb-4"
              style={{ color: "#C8B06A" }}>
              Rituels Rapides
            </p>
            <div className="flex flex-col gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="rounded-xl px-4 py-3 flex items-center gap-3 text-left cursor-pointer transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(200,176,106,0.3)",
                  }}>
                  <span className="text-base" style={{ color: "#C8B06A" }}>{action.icon}</span>
                  <span className="font-serif text-sm" style={{ color: "#2A2A2A" }}>{action.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowQuickActions(false)}
              className="w-full mt-4 py-3 rounded-full font-sans text-xs tracking-[0.15em] uppercase cursor-pointer"
              style={{ color: "#C8B06A", border: "1px solid rgba(200,176,106,0.3)" }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="relative z-20 px-4 pb-6 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(200,176,106,0.25)", background: "#FAF7F2" }}>
        <div className="flex items-center gap-2">
          {/* Muse Button (long press for quick actions) */}
          <button
            onMouseDown={handleMuseButtonDown}
            onMouseUp={handleMuseButtonUp}
            onMouseLeave={handleMuseButtonUp}
            onTouchStart={handleMuseButtonDown}
            onTouchEnd={handleMuseButtonUp}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(200,176,106,0.15), rgba(200,176,106,0.05))",
              border: "1px solid rgba(200,176,106,0.35)",
              boxShadow: "0 0 12px rgba(200,176,106,0.15)",
            }}
            title="Maintenir pour les rituels rapides">
            <SwanLogo size={14} />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask The Muse…"
              maxLength={INPUT_MAX_LENGTH}
              className="w-full py-2.5 px-4 rounded-full font-sans text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(200,176,106,0.3)",
                color: "#2A2A2A",
              }}
            />
            {input.length > 150 && (
              <span className="absolute right-12 top-1/2 -translate-y-1/2 font-sans text-[9px]"
                style={{ color: input.length >= INPUT_MAX_LENGTH ? "#c44" : "#C8B06A" }}>
                {INPUT_MAX_LENGTH - input.length}
              </span>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-200"
            style={{
              background: input.trim()
                ? "linear-gradient(145deg, #D4C07A, #C8B06A, #A89050)"
                : "rgba(200,176,106,0.15)",
              opacity: input.trim() ? 1 : 0.5,
              cursor: input.trim() ? "pointer" : "not-allowed",
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke={input.trim() ? "white" : "#C8B06A"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMuse = message.role === "muse";

  return (
    <div className={`flex ${isMuse ? "justify-start" : "justify-end"} muse-message-appear`}>
      <div
        className="max-w-[82%] rounded-2xl px-4 py-3"
        style={isMuse ? {
          background: "transparent",
          border: "1px solid rgba(200,176,106,0.4)",
          color: "#2A2A2A",
        } : {
          background: "rgba(11,60,38,0.08)",
          border: "none",
          color: "#0B3C26",
        }}>
        <p className="font-serif text-[14px] leading-relaxed whitespace-pre-line">
          {message.text}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start muse-message-appear">
      <div className="rounded-2xl px-4 py-3"
        style={{ background: "transparent", border: "1px solid rgba(200,176,106,0.4)" }}>
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C8B06A", animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C8B06A", animationDelay: "200ms" }} />
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C8B06A", animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
