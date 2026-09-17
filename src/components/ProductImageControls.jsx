import { useState, useRef } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * ProductImageControls — small overlay buttons for per-card image actions:
 *   • Refresh  — re-triggers the fetchProductImage backend function for this
 *                product. Flips status to pending, then verified/missing.
 *   • Upload   — opens the device file picker, uploads via UploadFile, and
 *                sets the photo as image_url immediately (temporary override;
 *                the weekly auto-fetcher may still replace it later).
 *
 * Props:
 *   product    — the product record (needs id, brand, name, shade)
 *   onUpdated  — callback(updatedProduct) to lift state changes to the parent
 *   showRefresh— show the refresh button (default true)
 *   size       — "sm" (default) | "xs"
 */
export default function ProductImageControls({
  product,
  onUpdated,
  showRefresh = true,
  size = "sm",
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  const dim = size === "xs" ? 24 : 28;
  const iconSize = size === "xs" ? 11 : 13;

  const stop = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
  };

  const handleRefresh = async (e) => {
    stop(e);
    if (refreshing || !product?.id) return;
    setRefreshing(true);
    // Optimistically flip to pending so the chip animates.
    onUpdated?.({ ...product, image_status: "pending" });
    try {
      const res = await base44.functions.invoke("fetchProductImage", {
        product_id: product.id,
        brand: product.brand,
        name: product.name,
        shade: product.shade,
      });
      if (res?.image_url) {
        onUpdated?.({ ...product, image_url: res.image_url, image_status: "verified" });
        toast({ title: "Image refreshed", description: "A new photo was found." });
      } else {
        onUpdated?.({ ...product, image_status: "missing" });
        toast({
          title: "No image found",
          description: "The Muse couldn't find a photo — try uploading your own.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch {
      onUpdated?.({ ...product, image_status: "missing" });
      toast({ title: "Refresh failed", variant: "destructive", duration: 5000 });
    }
    setRefreshing(false);
  };

  const handleUploadClick = (e) => {
    stop(e);
    if (uploading) return;
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !product?.id) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Product.update(product.id, {
        image_url: file_url,
        image_status: "verified",
      });
      onUpdated?.({ ...product, image_url: file_url, image_status: "verified" });
      toast({ title: "Photo updated", description: "Your image is now displayed." });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const btnStyle = {
    width: dim,
    height: dim,
    background: "rgba(253,245,230,0.82)",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(var(--color-text-primary-rgb), 0.16)",
  };

  return (
    <div className="flex items-center gap-1">
      {showRefresh && (
        <button
          onClick={handleRefresh}
          disabled={refreshing || uploading}
          aria-label="Re-fetch image"
          className="rounded-full flex items-center justify-center disabled:opacity-50"
          style={btnStyle}
        >
          <RefreshCw
            size={iconSize}
            color="var(--color-text-primary)"
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      )}
      <button
        onClick={handleUploadClick}
        disabled={refreshing || uploading}
        aria-label="Upload photo"
        className="rounded-full flex items-center justify-center disabled:opacity-50"
        style={btnStyle}
      >
        <Upload size={iconSize} color="var(--color-text-primary)" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}