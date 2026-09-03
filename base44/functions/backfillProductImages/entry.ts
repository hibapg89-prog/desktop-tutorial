import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { findValidProductImage } from '../../shared/fetchProductImage.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const BATCH = 20;
    const products = await base44.asServiceRole.entities.Product.list('-created_date', BATCH);
    const BAD_PATH_TOKENS = ['swatch', 'chart', 'infographic', 'grid', 'texture', 'collage', 'ingredient'];
    const needsImage = (p) => {
      // Never overwrite a product the user or scan pipeline already verified.
      if (p.image_status === 'verified' && p.image_url) return false;
      const url = (p.image_url || '').toLowerCase();
      if (!url) return true;
      if (url.includes('base44.app/api/') || url.includes('/files/')) return true;
      return BAD_PATH_TOKENS.some((tok) => url.includes(tok));
    };
    const toFix = products.filter(needsImage);
    const lookups = await Promise.all(toFix.map(async (p) => ({ p, imageUrl: await findValidProductImage(base44.asServiceRole, p.brand, p.name, p.shade) })));

    let filled = 0, checked = 0, markedMissing = 0;
    for (const { p, imageUrl } of lookups) {
      checked++;
      try {
        if (imageUrl) {
          await base44.asServiceRole.entities.Product.update(p.id, { image_url: imageUrl, image_status: 'verified' });
          filled++;
        } else {
          if (p.image_status !== 'verified') await base44.asServiceRole.entities.Product.update(p.id, { image_status: 'missing' });
          markedMissing++;
        }
      } catch {}
    }
    return Response.json({ status: 'ok', checked, filled, markedMissing });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}