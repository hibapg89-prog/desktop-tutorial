import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { SUBCATEGORY_GRIDS } from "@/lib/subcategoryGrids";

export default function SubcategoryGrid() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const grid = SUBCATEGORY_GRIDS[slug];

  if (!grid) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-serif text-xl text-[var(--color-text-primary)] mb-2">Collection not found</p>
        <button onClick={() => navigate(-1)} className="text-xs text-[#BC8F8F] underline mt-2">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border)]"
        >
          <ChevronLeft size={18} color="var(--color-text-primary)" />
        </button>
        <h1 className="font-serif text-xl font-light tracking-wide text-[var(--color-text-primary)]">{grid.title}</h1>
      </div>

      <div className="px-5 pb-24">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={grid.image}
            alt={grid.title}
            className="w-full h-auto block"
          />
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
              gridTemplateRows: grid.rowsTemplate || `repeat(${grid.rows}, 1fr)`,
            }}
          >
            {grid.cells.map((cell, i) => {
              const style = {};
              if (cell.row) style.gridRow = cell.row;
              if (cell.col) style.gridColumn = `${cell.col} / span ${cell.colSpan || 1}`;
              else if (cell.span === "full") style.gridColumn = "1 / -1";
              return (
                <Link
                  key={i}
                  to={`/category/${encodeURIComponent(cell.category)}?sub=${encodeURIComponent(cell.subcategory)}`}
                  aria-label={cell.label}
                  className="block"
                  style={style}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}