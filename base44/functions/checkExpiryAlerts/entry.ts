import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const THRESHOLD_DAYS = 30;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const products = await base44.asServiceRole.entities.Product.filter({ category: 'Skincare', in_vanity: true }, 'expiry_date', 200);
    const existing = await base44.asServiceRole.entities.Notification.filter({ type: 'expiry' }, '-created_date', 500);
    const notifiedProductIds = new Set(existing.map((n) => n.product_id).filter(Boolean));

    let alerted = 0;
    for (const p of products) {
      if (!p.expiry_date || !p.created_by_id) continue;
      if (notifiedProductIds.has(p.id)) continue;
      const expiry = new Date(p.expiry_date + 'T00:00:00');
      const days = Math.floor((expiry.getTime() - today.getTime()) / 86400000);
      if (days < 0 || days > THRESHOLD_DAYS) continue;
      const productLabel = ((p.brand || '') + ' ' + (p.name || '')).trim();
      const title = days <= 0 ? productLabel + ' has expired' : productLabel + ' expires in ' + days + ' day' + (days !== 1 ? 's' : '');
      const body = days <= 0
        ? 'This skincare product has passed its expiration date — time to replace it.'
        : 'Your skincare product expires on ' + expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '. Use it soon or plan a replacement.';
      try {
        await base44.asServiceRole.entities.Notification.create({ user_id: p.created_by_id, type: 'expiry', title, body, product_id: p.id, product_name: productLabel, image_url: p.image_url || '', read: false });
        alerted++;
      } catch {}
    }
    return Response.json({ status: 'ok', checked: products.length, alerted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});