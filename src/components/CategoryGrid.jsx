import { Link } from "react-router-dom";

// The 12-tile reference grid image (4-4-4 layout).
const GRID_IMAGE =
  "https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/e0271d2fe_IMG_4513.jpg";

// 12 tiles in reading order; each becomes an invisible click zone over the image.
const TILES = [
  { label: "Makeup", to: "/explore/makeup" },
  { label: "Fragrance", to: "/explore/fragrance" },
  { label: "Intimate Care", to: "/explore/intimate-care" },
  { label: "Skincare", to: "/explore/skincare" },
  { label: "Haircare", to: "/explore/haircare" },
  { label: "Body", to: "/explore/body" },
  { label: "Nails", to: "/explore/nails" },
  { label: "Devices", to: "/explore/devices" },
  { label: "Tools", to: "/explore/tools" },
  { label: "Pet Care", to: "/explore/pet-care" },
  { label: "Cosmetic Bags & Cases", to: "/explore/cosmetic-bags-cases" },
  { label: "Men's", to: "/explore/mens" },
];

export default function CategoryGrid() {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      <img
        src={GRID_IMAGE}
        alt="The Muse — Categories"
        className="w-full h-auto block"
      />
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
        {TILES.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            aria-label={t.label}
            className="block"
          />
        ))}
      </div>
    </div>
  );
}