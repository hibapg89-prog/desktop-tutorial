"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface A11ySettings {
  calmMode:     boolean; // reduces all motion / animations
  guidedPath:   boolean; // enhanced visible focus rings
  highContrast: boolean; // bolder borders + darker secondary text
  largeType:    boolean; // increases font sizes app-wide
  screenReader: boolean; // structural ARIA hint (consumed by components)
  voiceOver:    boolean; // same as screenReader — platform alias
}

const DEFAULTS: A11ySettings = {
  calmMode:     false,
  guidedPath:   false,
  highContrast: false,
  largeType:    false,
  screenReader: false,
  voiceOver:    false,
};

interface A11yContextValue {
  settings: A11ySettings;
  update: (key: keyof A11ySettings, val: boolean) => void;
}

const A11yContext = createContext<A11yContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

function applyToDOM(s: A11ySettings) {
  const html = document.documentElement;
  html.setAttribute("data-calm-mode",     String(s.calmMode));
  html.setAttribute("data-large-type",    String(s.largeType));
  html.setAttribute("data-high-contrast", String(s.highContrast));
  html.setAttribute("data-guided-path",   String(s.guidedPath));
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("luxe-a11y");
      if (stored) {
        const parsed = JSON.parse(stored) as A11ySettings;
        setSettings(parsed);
        applyToDOM(parsed);
      }
    } catch {}
  }, []);

  function update(key: keyof A11ySettings, val: boolean) {
    setSettings(prev => {
      const next = { ...prev, [key]: val };
      try { localStorage.setItem("luxe-a11y", JSON.stringify(next)); } catch {}
      applyToDOM(next);
      return next;
    });
  }

  return (
    <A11yContext.Provider value={{ settings, update }}>
      {children}
    </A11yContext.Provider>
  );
}

export const useA11y = () => useContext(A11yContext);
