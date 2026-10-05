import { useState } from "react";
import { Feather } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { CATEGORY_SUBCATEGORIES } from "@/lib/subcategoryMap";
import { normalizeBrand } from "@/utils/brandNormalizer";

const CATEGORY_LIST = Object.keys(CATEGORY_SUBCATEGORIES);

export default function ManualProductEntry({ onClose }) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [shade, setShade] = useState("");
  const [category, setCategory] = useState("Makeup");
  const [subcategory, setSubcategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const subcategories = CATEGORY_SUBCATEGORIES[category] || [];

  const handleSubmit = async () => {
    if (!brand.trim() || !name.trim()) {
      setError("Brand and product name are required.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const normBrand = normalizeBrand(brand.trim());
      const prod = await base44.entities.Product.create({
        brand: normBrand,
        name: name.trim(),
        shade: shade.trim() || null,
        category,
        subcategory: subcategory || null,
        scan_method: "manual",
      });
      // Fire-and-forget: fetch a real product image
      try {
        await base44.functions.invoke('fetchProductImage', {
          product_id: prod.id, brand: normBrand, name: name.trim(), shade: shade.trim() || null,
        });
      } catch {}
      try {
        await base44.entities.ScanLog.create({
          scan_method: "manual", status: "success", product_id: prod.id,
          brand: normBrand, name: name.trim(), shade: shade.trim() || null, product_count: 1,
        });
      } catch {}
      onClose();
      navigate(`/product/${prod.id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  const inputClass = "w-full border border-[#1A3A30]/25 rounded-2xl px-4 py-3 bg-white/60 text-sm text-[#1A3A30] outline-none placeholder:text-[#1A3A30]/30 font-light";
  const labelClass = "text-[9px] tracking-[0.22em] uppercase text-[#1A3A30]/50 font-light mb-1.5 block";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center px-8 w-full max-w-sm"
    >
      <div className="mb-5">
        <Feather size={26} strokeWidth={1.3} color="#1A3A30" />
      </div>
      <h3 className="font-serif text-2xl text-[#1A3A30] text-center mb-1">Manual Entry</h3>
      <p className="text-sm text-[#8B7355] text-center mb-7 italic">Add a product by hand</p>

      <div className="w-full mb-3">
        <label className={labelClass}>Brand</label>
        <input
          autoFocus
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Charlotte Tilbury"
          className={inputClass}
        />
      </div>

      <div className="w-full mb-3">
        <label className={labelClass}>Product Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Pillow Talk Lipstick"
          className={inputClass}
        />
      </div>

      <div className="w-full mb-3">
        <label className={labelClass}>Shade (optional)</label>
        <input
          value={shade}
          onChange={(e) => setShade(e.target.value)}
          placeholder="e.g. Pillow Talk"
          className={inputClass}
        />
      </div>

      <div className="w-full mb-3">
        <label className={labelClass}>Category</label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
          className={`${inputClass} appearance-none`}
        >
          {CATEGORY_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {subcategories.length > 0 && (
        <div className="w-full mb-6">
          <label className={labelClass}>Subcategory (optional)</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            <option value="">—</option>
            {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
      )}

      {error && <p className="text-xs text-red-700/70 mb-4 text-center italic">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full py-3.5 bg-[#1A3A30] text-[#FDF7EF] text-xs tracking-[0.25em] uppercase rounded-full font-light disabled:opacity-50"
      >
        {isSaving ? "Saving..." : "Add to Collection"}
      </button>
      <button onClick={onClose} className="mt-4 text-xs text-[#1A3A30]/40 underline">Back</button>
    </motion.div>
  );
}
