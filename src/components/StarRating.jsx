import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = 14, readOnly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={n <= value ? "fill-[#C8B06A] text-[#C8B06A]" : "text-[#043927]/20"}
          />
        </button>
      ))}
    </div>
  );
}