import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

async function fetchRealPrice(product: any, countryCode = 'us') {
  const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY');
  if (!SERPAPI_KEY) return null;

  const query = [product.brand, product.name, product.shade].filter(Boolean).join(' ');
  const gl = (countryCode || 'us').toLowerCase();
  const url = `https://serpapi.com/search?engine=google_shopping&q=${encodeURIComponent(query)}&gl=${gl}&api_key=${SERPAPI_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results: any[] = Array.isArray(data.shopping_results) ? data.shopping_results : [];
    if (results.length === 0) return null;

    // Pick the result with the lowest valid extracted_price
    const valid = results.filter(r => typeof r.extracted_price === 'number' && r.extracted_price > 0);
    if (valid.length === 0) return null;
    valid.sort((a, b) => a.extracted_price - b.extracted_price);
    const best = valid[0];

    const current_price: number = best.extracted_price;
    const original_price: number | undefined = typeof best.extracted_original_price === 'number' && best.extracted_original_price > current_price
      ? best.extracted_original_price
      : undefined;
    const on_sale = original_price !== undefined && original_price > current_price;

    return {
      current_price,
      original_price: original_price ?? current_price,
      on_sale,
      retailer: best.source || null,
      retailer_url: best.link || null,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  const SERPAPI_KEY = Deno.env.get('SERPAPI_KEY');
  if (!SERPAPI_KEY) {
    return Response.json({ paused: true, message: 'Price checking is paused: SERPAPI_KEY environment variable is not set.' });
  }

  try {
    const base44 = createClientFromRequest(req);
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    } catch {}

    const BATCH = 10;
    const products = await base44.asServiceRole.entities.Product.filter({ in_shopping_list: true }, 'last_price_checked', BATCH);

    const lookups = await Promise.all(products.map(async (p: any) => {
      const brandLower = (p.brand || '').toLowerCase();
      if (!p.brand || brandLower === 'not identified' || brandLower.startsWith('not identified')) {
        try { await base44.asServiceRole.entities.Product.update(p.id, { last_price_checked: new Date().toISOString() }); } catch {}
        return { p, priceData: null };
      }
      const priceData = await fetchRealPrice(p);
      return { p, priceData };
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
      const baseline = typeof p.price === 'number' && p.price > 0
        ? p.price
        : (typeof priceData.original_price === 'number' && priceData.original_price > 0 ? priceData.original_price : currentPrice);
      const prevLow = typeof p.lowest_price === 'number' && p.lowest_price > 0 ? p.lowest_price : baseline;
      const isDrop = currentPrice < prevLow * 0.95;

      const update: any = { current_price: currentPrice, last_price_checked: now };
      if (currentPrice < prevLow) update.lowest_price = currentPrice;
      if (isDrop) {
        update.on_sale = true;
        update.last_sale_price = currentPrice;
        update.sale_discount_pct = Math.round(((baseline - currentPrice) / baseline) * 100);
      } else if (currentPrice >= baseline * 0.98) {
        update.on_sale = false;
      }

      // Auto-populate retailer_links from SerpApi when a URL is returned
      if (priceData.retailer_url && priceData.retailer) {
        const existingLinks: any[] = Array.isArray(p.retailer_links) ? p.retailer_links : [];
        const alreadyHasUs = existingLinks.some(l => (l.country || '').toUpperCase() === 'US');
        if (!alreadyHasUs) {
          update.retailer_links = [...existingLinks, { country: 'US', retailer: priceData.retailer, url: priceData.retailer_url }];
        }
      }

      await base44.asServiceRole.entities.Product.update(p.id, update);

      if (isDrop && p.created_by_id) {
        const discountPct = update.sale_discount_pct;
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_id: p.created_by_id,
            type: 'price_drop',
            title: (p.brand || '') + ' ' + (p.name || '') + ' is on sale',
            body: 'Now $' + currentPrice.toFixed(2) + ' (was $' + baseline.toFixed(2) + ') — ' + discountPct + '% off at ' + (priceData.retailer || 'a major retailer') + '.',
            product_id: p.id,
            product_name: (p.brand || '') + ' ' + (p.name || ''),
            image_url: p.image_url || '',
            price_now: currentPrice,
            was_price: baseline,
            discount_pct: discountPct,
            read: false,
          });
        } catch {}

        let userEmail = null;
        try { const owner = await base44.asServiceRole.entities.User.get(p.created_by_id); userEmail = owner?.email || null; } catch {}
        if (userEmail) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: (p.brand || '') + ' ' + (p.name || '') + ' is on sale',
              body: 'Good news — a product you scanned is now on sale.\n\n' + (p.brand || '') + ' ' + (p.name || '') + '\nNow $' + currentPrice.toFixed(2) + ' (was $' + baseline.toFixed(2) + ') — ' + discountPct + '% off at ' + (priceData.retailer || 'a major retailer') + '.\n\nOpen The Muse to view it.',
            });
          } catch {}
        }
        alerted++;
      }
    }

    return Response.json({ status: 'ok', checked, alerted });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
