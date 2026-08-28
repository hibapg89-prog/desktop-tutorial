import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findValidProductImage } from '../../shared/fetchProductImage.ts';

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
      await base44.entities.Product.update(product_id, { image_url: imageUrl, image_status: 'verified' });
      return Response.json({ success: true, image_url: imageUrl, image_status: 'verified' });
    }

    try { await base44.entities.Product.update(product_id, { image_status: 'missing' }); } catch {}
    return Response.json({ success: false, image_url: null, image_status: 'missing' });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
}