import { base44 } from "@/api/base44Client";

// Maps product categories → tutorial categories
const TUTORIAL_CAT_MAP = {
  Makeup: "Makeup",
  Skincare: "Skincare",
  Haircare: "Hair",
  Body: "Wellness",
  Fragrance: "Wellness",
  "Men's Grooming": "Wellness",
};

// Maps product categories → venue service types
const SERVICE_TYPE_MAP = {
  Skincare: ["Spa", "Beauty Clinic", "Wellness"],
  Haircare: ["Hairdresser"],
  Makeup: ["Salon", "Beauty Clinic"],
  Body: ["Wellness", "Spa"],
  Nails: ["Nail Bar"],
  Fragrance: ["Wellness"],
  "Men's Grooming": ["Salon"],
};

// Builds a preference profile from the user's scan history and saved vanity items.
export async function getUserPreferences() {
  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) {
    return { categories: [], brands: [], tutorialCats: [], serviceTypes: [] };
  }

  const myProducts = await base44.entities.Product.filter({ created_by_id: me.id });
  const categories = [...new Set(myProducts.map((p) => p.category).filter(Boolean))];
  const brands = [...new Set(myProducts.map((p) => p.brand).filter(Boolean))].slice(0, 8);
  const tutorialCats = [...new Set(categories.map((c) => TUTORIAL_CAT_MAP[c]).filter(Boolean))];
  const serviceTypes = [...new Set(categories.flatMap((c) => SERVICE_TYPE_MAP[c] || []))];

  return { categories, brands, tutorialCats, serviceTypes };
}