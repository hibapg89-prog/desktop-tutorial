import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const products = await base44.asServiceRole.entities.Product.filter({ in_shopping_list: true }, '-updated_date', 200);
    const restricted = await base44.asServiceRole.entities.RestrictedIngredient.list('-created_date', 500);
    const byUser = new Map();
    for (const r of restricted) {
      if (!r.created_by_id || !r.name) continue;
      if (!byUser.has(r.created_by_id)) byUser.set(r.created_by_id, []);
      byUser.get(r.created_by_id).push(r.name.toLowerCase().trim());
    }

    const existing = await base44.asServiceRole.entities.Notification.filter({ type: 'allergen' }, '-created_date', 500);
    const notifiedProductIds = new Set(existing.map((n) => n.product_id).filter(Boolean));

    let alerted = 0;
    for (const p of products) {
      if (!p.ingredients || !p.created_by_id) continue;
      if (notifiedProductIds.has(p.id)) continue;
      const userAllergens = byUser.get(p.created_by_id) || [];
      if (userAllergens.length === 0) continue;
      const ingredientsLower = p.ingredients.toLowerCase();
      const matched = userAllergens.find((a) => a && ingredientsLower.includes(a));
      if (!matched) continue;
      const productLabel = ((p.brand || '') + ' ' + (p.name || '')).trim();
      try {
        await base44.asServiceRole.entities.Notification.create({ user_id: p.created_by_id, type: 'allergen', title: 'Allergen alert: ' + matched, body: productLabel + ' on your shopping list contains "' + matched + '", which you flagged as an allergen or restricted ingredient.', product_id: p.id, product_name: productLabel, image_url: p.image_url || '', read: false });
        alerted++;
      } catch {}
    }
    return Response.json({ status: 'ok', checked: products.length, alerted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});