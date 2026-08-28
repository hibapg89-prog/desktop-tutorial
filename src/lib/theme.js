const DARK = {
  "--color-bg":               "#0D1A14",
  "--color-bg-surface":       "#152B1E",
  "--color-bg-elevated":      "#1C3828",
  "--color-text-primary":     "#EFE9DC",
  "--color-text-secondary":   "#B8A88A",
  "--color-text-muted":       "#7A6F60",
  "--color-accent-gold":      "#D4B96E",
  "--color-border":           "#2E4E3A",
  "--color-border-subtle":    "#1C3020",
  "--color-text-primary-rgb": "239, 233, 220",
  "--color-text-gold-rgb":    "212, 185, 110",
  "--color-scrim-loading":    "rgba(13,26,20,0.72)",
};

const LIGHT = {
  "--color-bg":               "#FDF5E6",
  "--color-bg-surface":       "#F5EEE2",
  "--color-bg-elevated":      "#EFE9DC",
  "--color-text-primary":     "#043927",
  "--color-text-secondary":   "#5A7A6A",
  "--color-text-muted":       "#B8B0A8",
  "--color-accent-gold":      "#C8B06A",
  "--color-border":           "#E5E4E2",
  "--color-border-subtle":    "#EDE7DA",
  "--color-text-primary-rgb": "4, 57, 39",
  "--color-text-gold-rgb":    "200, 176, 106",
  "--color-scrim-loading":    "transparent",
};

/**
 * Apply theme tokens directly as inline CSS custom properties on <html>.
 * Inline styles win every specificity battle — works even when the preview
 * environment overrides the data-theme attribute externally.
 */
export function applyTheme(isDark) {
  const root = document.documentElement;
  root.setAttribute("data-theme", isDark ? "dark" : "light");
  const tokens = isDark ? DARK : LIGHT;
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
}
