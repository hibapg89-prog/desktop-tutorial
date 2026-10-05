import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const catMap: Record<string, string> = { Makeup: 'Makeup', Skincare: 'Skincare', Haircare: 'Hair', Body: 'Wellness', Fragrance: 'Wellness', "Men's Grooming": 'Wellness' };

    const allProducts = await base44.asServiceRole.entities.Product.list('-created_date', 500);
    const byUser: Record<string, any[]> = {};
    for (const p of allProducts) {
      if (!p.created_by_id) continue;
      if (!byUser[p.created_by_id]) byUser[p.created_by_id] = [];
      byUser[p.created_by_id].push(p);
    }

    const existing = await base44.asServiceRole.entities.Notification.filter({ type: 'recommendation' }, '-created_date', 500);
    const notifiedProductIds = new Set(existing.map((n) => n.product_id || '').filter((id) => id && !id.startsWith('tut_')));
    const notifiedTutorialIds = new Set(existing.map((n) => (n.product_id || '').replace('tut_', '')).filter((id) => id));

    const allTutorials = await base44.asServiceRole.entities.Tutorial.list('-saves_count', 50);
    let alerted = 0;
    const userIds = Object.keys(byUser);

    for (const userId of userIds) {
      const userProducts = byUser[userId];
      const userProductIds = new Set(userProducts.map((p) => p.id));
      const productCats = [...new Set(userProducts.map((p) => p.category).filter(Boolean))];
      const preferredTutorialCats = [...new Set(productCats.map((c) => catMap[c]).filter(Boolean))];

      const productMatches = allProducts.filter((p) => p.created_by_id !== userId && productCats.includes(p.category) && !userProductIds.has(p.id) && !notifiedProductIds.has(p.id));
      if (productMatches.length > 0) {
        const p = productMatches[0];
        const label = ((p.brand || '') + ' ' + (p.name || '')).trim();
        try {
          await base44.asServiceRole.entities.Notification.create({ user_id: userId, type: 'recommendation', title: 'A New Product Match', body: 'Based on your scan history, The Muse found ' + label + ' — a ' + (p.category || '') + ' match for your taste.', product_id: p.id, product_name: label, image_url: p.image_url || '', read: false });
          notifiedProductIds.add(p.id);
          alerted++;
        } catch {}
      }

      const tutorialMatches = allTutorials.filter((t) => preferredTutorialCats.includes(t.category) && !notifiedTutorialIds.has(t.id));
      if (tutorialMatches.length > 0) {
        const t = tutorialMatches[0];
        try {
          await base44.asServiceRole.entities.Notification.create({ user_id: userId, type: 'recommendation', title: 'A New Ritual For You', body: 'Based on your vanity, The Muse curated "' + t.title + '" — a ' + t.category + ' ritual you will love.', product_id: 'tut_' + t.id, product_name: t.title, image_url: t.image_url || '', read: false });
          notifiedTutorialIds.add(t.id);
          alerted++;
        } catch {}
      }
    }
    return Response.json({ status: 'ok', users: userIds.length, alerted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});