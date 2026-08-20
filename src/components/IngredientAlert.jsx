import { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function IngredientAlert({ product }) {
  const [restricted, setRestricted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.RestrictedIngredient.list()
      .then(setRestricted)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !restricted.length) return null;

  const haystack = `${product.ingredients || ""} ${product.description || ""}`.toLowerCase();

  const matches = restricted.filter((r) => {
    const name = (r.name || "").trim().toLowerCase();
    return name && haystack.includes(name);
  });

  if (!matches.length) return null;

  const allergyMatches     = matches.filter((m) => m.type === "allergy");
  const restrictedMatches  = matches.filter((m) => m.type === "restricted");
  const hasAllergy         = allergyMatches.length > 0;

  return (
    <div className="space-y-2">
      {/* ── Allergy alert (higher severity) ── */}
      {allergyMatches.length > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: "rgba(188,100,80,0.06)",
            borderColor: "rgba(188,100,80,0.35)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(188,100,80,0.12)", border: "1px solid rgba(188,100,80,0.3)" }}
            >
              <ShieldAlert size={16} strokeWidth={1.5} color="#B85440" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] tracking-[0.2em] uppercase font-light mb-1"
                style={{ color: "#B85440" }}
              >
                Allergen alert
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-light leading-relaxed mb-3">
                This product may contain{" "}
                {allergyMatches.length === 1 ? "an ingredient" : "ingredients"} you've
                flagged as an allergy:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allergyMatches.map((m) => (
                  <span
                    key={m.id}
                    className="text-[11px] font-light px-2.5 py-1 rounded-full capitalize"
                    style={{
                      background: "rgba(188,100,80,0.10)",
                      color: "#B85440",
                      border: "1px solid rgba(188,100,80,0.3)",
                    }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] font-light mt-3 leading-relaxed italic">
                Always verify the full ingredient label before use. Not medical advice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Restricted ingredient notice (lower severity) ── */}
      {restrictedMatches.length > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            background: "rgba(200,176,106,0.06)",
            borderColor: "rgba(200,176,106,0.28)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(200,176,106,0.10)", border: "1px solid rgba(200,176,106,0.25)" }}
            >
              <AlertTriangle size={15} strokeWidth={1.5} color="#8B7240" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] tracking-[0.2em] uppercase font-light mb-1"
                style={{ color: "#8B7240" }}
              >
                Restricted ingredient{restrictedMatches.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-light leading-relaxed mb-3">
                {restrictedMatches.length === 1
                  ? "Contains an ingredient you prefer to avoid:"
                  : `Contains ${restrictedMatches.length} ingredients you prefer to avoid:`}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {restrictedMatches.map((m) => (
                  <span
                    key={m.id}
                    className="text-[11px] font-light px-2.5 py-1 rounded-full capitalize"
                    style={{
                      background: "rgba(200,176,106,0.10)",
                      color: "#8B7240",
                      border: "1px solid rgba(200,176,106,0.25)",
                    }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage link ── */}
      <Link
        to="/ingredient-alerts"
        className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
      >
        <span className="text-[10px] tracking-[0.15em] uppercase font-light text-[var(--color-text-muted)]">
          Manage your ingredient watchlist
        </span>
        <ChevronRight size={12} strokeWidth={1.5} color="#C8B06A" />
      </Link>
    </div>
  );
}
