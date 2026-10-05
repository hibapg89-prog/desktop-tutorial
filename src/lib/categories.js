import { CATEGORY_SUBCATEGORIES } from "./subcategoryMap";

export const CATEGORIES = [
  {
    name: "Fragrance",
    label: "Fragrance",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Fragrance"] || [],
  },
  {
    name: "Makeup",
    label: "Makeup",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Makeup"] || [],
  },
  {
    name: "Skincare",
    label: "Skincare",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Skincare"] || [],
  },
  {
    name: "Haircare",
    label: "Haircare",
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Haircare"] || [],
  },
  {
    name: "Body",
    label: "Body",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Body"] || [],
  },
  {
    name: "Nails",
    label: "Nails",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Nails"] || [],
  },
  {
    name: "Devices",
    label: "Devices",
    image: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Devices"] || [],
  },
  {
    name: "Accessories",
    label: "Accessories",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Accessories"] || [],
    special: "luxury-tools",
  },
  {
    name: "Men's Grooming",
    label: "Men's",
    image: "https://images.unsplash.com/photo-1621607505796-4a0ef9e9b6bc?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Men's Grooming"] || [],
  },
  {
    name: "Intimate Hygiene",
    label: "Intimate Care",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80",
    subcategories: CATEGORY_SUBCATEGORIES["Intimate Hygiene"] || [],
    special: "intimate",
  },
  {
    name: "Pet Care",
    label: "Pet Care",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
    cardImage: "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/402f44042_IMG_3916.jpeg",
    subcategories: CATEGORY_SUBCATEGORIES["Pet Care"] || [],
  },
];
