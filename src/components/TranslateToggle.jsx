import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { getLocale } from "@/utils/locale";

/**
 * Renders text with an on-demand translation toggle for non-English users.
 * English users see the text as-is with no extra UI.
 * Translation is cached in component state for the session.
 */
export default function TranslateToggle({ text, className = "", italic = false }) {
  const [translated, setTranslated]           = useState(null);
  const [isTranslating, setIsTranslating]     = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const locale = getLocale();
  const textClass = `${className}${italic ? " italic" : ""}`;

  // English users — render plain text, no toggle
  if (locale.isEnglish || !text) {
    return <p className={textClass}>{text}</p>;
  }

  const handleToggle = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    // Already translated — just flip back
    if (translated) {
      setShowTranslation(true);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to ${locale.languageName}. Return only the translated text, with no introduction, no explanation, and no quotation marks:\n\n${text}`,
      });
      // InvokeLLM may return an object; extract string if needed
      const str = typeof result === "string" ? result : JSON.stringify(result);
      setTranslated(str);
      setShowTranslation(true);
    } catch {
      // Fail silently — keep showing original
    }
    setIsTranslating(false);
  };

  return (
    <div>
      <p className={textClass}>
        {showTranslation && translated ? translated : text}
      </p>
      <button
        onClick={handleToggle}
        disabled={isTranslating}
        className="mt-2 text-[10px] text-[#043927]/35 font-light tracking-wide underline underline-offset-2 hover:text-[#043927]/60 transition-colors"
      >
        {isTranslating
          ? `Translating to ${locale.languageName}...`
          : showTranslation
          ? "Read in English"
          : `Read in ${locale.languageName}`}
      </button>
    </div>
  );
}
