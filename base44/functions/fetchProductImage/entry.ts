import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findValidProductImage, proxyImageToWixMedia } from '../../shared/fetchProductImage.ts';

// Scan-time image enrichment: fetches a verified product image URL and
// stores it as the product's image_url. Called from ScanHub after a product
// is created, and from per-card manual re-fetch. Validates URLs via real HTTP
// fetch so dead links are never stored. Sets image_status so the UI chip can
// reflect the outcome, and returns a success flag so the frontend can toast
// on failure.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { product_id, brand, name, shade } = body || {};

    if (!product_id || !brand) {
      return Response.json({ error: 'product_id and brand are required' }, { status: 400 });
    }

    const imageUrl = await findValidProductImage(base44, brand, name, shade);

    if (imageUrl) {
      // Proxy through Wix Media for responsive sizing + WebP optimization.
      // Falls back to the direct URL if the upload fails.
      const proxiedUrl = await proxyImageToWixMedia(base44.asServiceRole, imageUrl);
      const finalUrl = proxiedUrl || imageUrl;
      await base44.entities.Product.update(product_id, {
        image_url: finalUrl,
        image_status: 'verified',
      });
      return Response.json({ success: true, image_url: finalUrl, image_status: 'verified', proxied: !!proxiedUrl });
    }

    // No valid image found — mark missing so the UI chip flips from pending.
    try {
      await base44.entities.Product.update(product_id, { image_status: 'missing' });
    } catch {}
    return Response.json({ success: false, image_url: null, image_status: 'missing' });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}
