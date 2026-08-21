import { Image } from "@/components/ui/image";
import { getGradient } from "@/lib/categoryGradients";

/**
 * getImageStatus — resolves the effective image status for a product.
 * Prefers the stored `image_status` field; infers a sensible value for
 * legacy records that predate the field.
 */
export function getImageStatus(product) {
  if (!product) return "missing";
  if (product.image_status) return product.image_status;
  const url = product.image_url || "";
  if (!url) return "pending";
  if (url.includes("base44.app/api/") || url.includes("/files/")) return "pending";
  return "verified";
}

const STATUS_CONFIG = {
  pending:  { color: "#C8B06A", label: "Pending" },
  verified: { color: "#3A8A6A", label: "Verified" },
  missing:  { color: "#BC8F8F", label: "Missing" },
};

function StatusChip({ status }) {
  const { color, label } = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  return (
    <div
      className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full pointer-events-none"
      style={{
        background: "rgba(253,245,230,0.82)",
        backdropFilter: "blur(4px)",
        padding: "1px 5px",
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: 5, height: 5, background: color }}
      />
      <span
        className="leading-none font-light tracking-wide whitespace-nowrap"
        style={{ fontSize: 7, color }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * ProductImage — renders a product image with a three-stage fallback chain:
 *   1. product.image_url  (user photo, or web-fetched for photoless scans)
 *   2. product.fallback_image_url  (web-fetched backup)
 *   3. Category-colored gradient with brand name overlaid
 *
 * Also overlays a discreet image-status chip (pending / verified / missing)
 * so the user can see at a glance whether the background fetcher has run.
 * Pass `showStatus={false}` to hide the chip.
 */
export default function ProductImage({ product, className, fittingType = "fill", alt, showStatus = true, ...props }) {
  const primary = product?.image_url;
  const fallback = product?.fallback_image_url;
  const status = getImageStatus(product);
  // Only show the chip for saved product records (AI picks have no id).
  const renderChip = showStatus && product?.id;

  const renderMedia = () => {
    // No image at all → gradient
    if (!primary && !fallback) {
      return <CategoryGradient product={product} className="w-full h-full" alt={alt} />;
    }
    // Only fallback exists
    if (!primary && fallback) {
      return (
        <Image
          src={fallback}
          fittingType={fittingType}
          className="w-full h-full"
          alt={alt || product?.name}
          {...props}
        />
      );
    }
    // Both exist → primary with fallback as backup
    return (
      <Image
        src={primary}
        fallbackSrc={fallback}
        fittingType={fittingType}
        className="w-full h-full"
        alt={alt || product?.name}
        {...props}
      />
    );
  };

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      {renderMedia()}
      {renderChip && <StatusChip status={status} />}
    </div>
  );
}

/**
 * CategoryGradient — the final fallback: a Muse-palette gradient keyed to
 * the product category, with the brand name overlaid in Cormorant Garamond.
 * Exported so non-Product surfaces (e.g. AI recommendations) can reuse it.
 */
export function CategoryGradient({ product, className, alt }) {
  const g = getGradient(product?.category);
  const label = product?.brand || product?.name || "";

  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      role="img"
      aria-label={alt || label}
    >
      {label && (
        <span
          className="text-center px-2 leading-tight"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "0.875rem",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: g.label,
            opacity: 0.55,
            maxWidth: "80%",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}