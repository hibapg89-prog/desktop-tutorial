// Category → Muse-palette gradient mapping for product image fallbacks.
// Each category gets a distinct two-tone gradient drawn from the Muse
// design system: champagne, emerald, dusty rose, gold, satin.

export const CATEGORY_GRADIENTS = {
  Makeup:              { from: "#C08A82", to: "#F6EFDF", label: "#5C2A3B" },
  Fragrance:           { from: "#1F4A3A", to: "#C9B58A", label: "#F6EFDF" },
  Skincare:            { from: "#1F4A3A", to: "#F4ECDA", label: "#043927" },
  Haircare:            { from: "#C9B58A", to: "#F6EFDF", label: "#5C4A2E" },
  Body:                { from: "#F6EFDF", to: "#C08A82", label: "#5C2A3B" },
  Nails:               { from: "#C08A82", to: "#C9B58A", label: "#3D2A2E" },
  Devices:             { from: "#1F4A3A", to: "#E5E4E2", label: "#043927" },
  Accessories:         { from: "#C9B58A", to: "#C08A82", label: "#3D2A2E" },
  "Men's Grooming":    { from: "#1F4A3A", to: "#C9B58A", label: "#F6EFDF" },
  "Pet Care":          { from: "#1F4A3A", to: "#F4ECDA", label: "#043927" },
  "Intimate Hygiene":  { from: "#C08A82", to: "#F6EFDF", label: "#5C2A3B" },
};

export const DEFAULT_GRADIENT = { from: "#F6EFDF", to: "#C9B58A", label: "#043927" };

export function getGradient(category) {
  return CATEGORY_GRADIENTS[category] || DEFAULT_GRADIENT;
}