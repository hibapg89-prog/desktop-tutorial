import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import SwanLogo from "@/components/SwanLogo";
import { formatPrice } from "@/utils/locale";

export default function CategoryProductCard({ product, variant = "default" }) {
  const hasImage = !!product.image_url;
  const priceLabel = product.price ? formatPrice(product.price) : null;
  const displayName = product.brand && product.name?.startsWith(product.brand)
    ? product.name.slice(product.brand.length).trim()
    : product.name;

  if (variant === "shop") {
    const shopUrl = product.source_url || (product.where_to_buy ? product.where_to_buy : null);
    return (
      <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] overflow-hidden flex flex-col">
        <div className="aspect-square bg-[var(--color-bg-elevated)] flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <SwanLogo size={30} color="#C8B06A" />
          )}
        </div>
        <div className="p-2 flex flex-col gap-0.5">
          {product.brand && (
            <p className="text-[8px] text-primary-50 uppercase tracking-wide font-light truncate">{product.brand}</p>
          )}
          <p className="text-[10px] text-[var(--color-text-primary)] font-light leading-tight truncate">{product.name}</p>
          {priceLabel && <p className="text-[10px] text-[var(--color-text-primary)] font-medium">{priceLabel}</p>}
          <Link
            to={product.id ? `/product/${product.id}` : "#"}
            className="block mt-1.5 py-1.5 bg-[#003629] text-white text-[9px] tracking-[0.15em] uppercase text-center rounded"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={product.id ? `/product/${product.id}` : "#"}
      className="block rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] overflow-hidden relative"
      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(200,176,106,0.18), transparent 60%)" }}
      />
      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[var(--color-bg-surface)] flex items-center justify-center z-10">
        <MoreHorizontal size={12} color="var(--color-text-primary)" />
      </div>
      <div className="aspect-square bg-[var(--color-bg-elevated)] flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <img src={product.image_url} alt={product.name} className="block w-full h-full object-cover" />
        ) : (
          <SwanLogo size={30} color="#C8B06A" />
        )}
      </div>
      <div className="px-2 pb-2 pt-1 relative z-10">
        {product.brand && (
          <p className="text-[8px] text-primary-50 uppercase tracking-wide font-light truncate">{product.brand}</p>
        )}
        <p className="text-[10px] text-[var(--color-text-primary)] font-light leading-tight truncate">{displayName}</p>
        {priceLabel && <p className="text-[10px] text-[var(--color-text-primary)] font-medium mt-0.5">{priceLabel}</p>}
      </div>
    </Link>
  );
}
