import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const BATCH = 10;
    const products = await base44.asServiceRole.entities.Product.filter({ in_shopping_list: true }, 'last_price_checked', BATCH);
    const lookups = await Promise.all(products.map(async (p) => {
      const brandLower = (p.brand || '').toLowerCase();
      if (!p.brand || brandLower === 'not identified' || brandLower.startsWith('not identified')) {
        try { await base44.asServiceRole.entities.Product.update(p.id, { last_price_checked: new Date().toISOString() }); } catch {}
        return { p, priceData: null };
      }
      try {
        const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: 'You are a retail price tracker. Find the current retail price in USD of this beauty product at major online retailers (Sephora, Ulta, Amazon, the brand official site). If it is currently discounted or on sale, report the sale price as current_price and set on_sale true. Use your web search to verify real current pricing. Product brand: ' + (p.brand || '') + '. Product name: ' + (p.name || '') + '. Shade: ' + (p.shade || 'n/a') + '. Retailer hints: ' + (p.where_to_buy || 'any major beauty retailer') + '.',
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: { type: 'object', properties: { current_price: { type: 'number' }, on_sale: { type: 'boolean' }, sale_price: { type: 'number' }, original_price: { type: 'number' }, retailer: { type: 'string' } } }
        });
        return { p, priceData: res };
      } catch { return { p, priceData: null }; }
    }));

    const now = new Date().toISOString();
    let checked = 0, alerted = 0;
    for (const { p, priceData } of lookups) {
      checked++;
      if (!priceData || typeof priceData.current_price !== 'number' || priceData.current_price <= 0) {
        await base44.asServiceRole.entities.Product.update(p.id, { last_price_checked: now });
        continue;
      }
      const currentPrice = priceData.current_price;
      const baseline = typeof p.price === 'number' && p.price > 0 ? p.price : (typeof priceData.original_price === 'number' && priceData.original_price > 0 ? priceData.original_price : currentPrice);
      const prevLow = typeof p.lowest_price === 'number' && p.lowest_price > 0 ? p.lowest_price : baseline;
      const isDrop = currentPrice < prevLow * 0.95;
      const update: any = { current_price: currentPrice, last_price_checked: now };
      if (currentPrice < prevLow) update.lowest_price = currentPrice;
      if (isDrop) { update.on_sale = true; update.last_sale_price = currentPrice; update.sale_discount_pct = Math.round(((baseline - currentPrice) / baseline) * 100); }
      else if (currentPrice >= baseline * 0.98) update.on_sale = false;
      await base44.asServiceRole.entities.Product.update(p.id, update);
      if (isDrop && p.created_by_id) {
        const discountPct = update.sale_discount_pct;
        try { await base44.asServiceRole.entities.Notification.create({ user_id: p.created_by_id, type: 'price_drop', title: (p.brand || '') + ' ' + (p.name || '') + ' is on sale', body: 'Now $' + currentPrice.toFixed(2) + ' (was $' + baseline.toFixed(2) + ') — ' + discountPct + '% off at ' + (priceData.retailer || 'a major retailer') + '.', product_id: p.id, product_name: (p.brand || '') + ' ' + (p.name || ''), image_url: p.image_url || '', price_now: currentPrice, was_price: baseline, discount_pct: discountPct, read: false }); } catch {}
        let userEmail = null;
        try { const owner = await base44.asServiceRole.entities.User.get(p.created_by_id); userEmail = owner?.email || null; } catch {}
        if (userEmail) {
          try { await base44.asServiceRole.integrations.Core.SendEmail({ to: userEmail, subject: (p.brand || '') + ' ' + (p.name || '') + ' is on sale', body: 'Good news — a product you scanned is now on sale.\n\n' + (p.brand || '') + ' ' + (p.name || '') + '\nNow $' + currentPrice.toFixed(2) + ' (was $' + baseline.toFixed(2) + ') — ' + discountPct + '% off at ' + (priceData.retailer || 'a major retailer') + '.\n\nOpen The Muse to view it.' }); } catch {}
        }
        alerted++;
      }
    }
    return Response.json({ status: 'ok', checked, alerted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});