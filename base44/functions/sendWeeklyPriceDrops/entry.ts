import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function utf8ToB64(str) { return btoa(unescape(encodeURIComponent(str))); }

function buildRawMessage({ fromName, fromEmail, to, subject, html }) {
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@luxebeauty.app>`;
  const lines = [`From: ${fromName} <${fromEmail}>`, `To: ${to}`, `Subject: =?UTF-8?B?${utf8ToB64(subject)}?=`, `Date: ${new Date().toUTCString()}`, `Message-ID: ${messageId}`, `MIME-Version: 1.0`, `Content-Type: text/html; charset=UTF-8`, `Content-Transfer-Encoding: base64`, ``, utf8ToB64(html)];
  return btoa(lines.join('\r\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fmtPrice(n) { return n == null ? '—' : `$${Number(n).toFixed(2)}`; }

function buildReportHtml(drops) {
  const rows = drops.map((d) => `<tr><td style="padding:14px 0;border-bottom:1px solid #F0E6D6;"><div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;color:#043927;line-height:1.3;">${d.product_name || 'A favourite'}</div><div style="font-size:10px;color:#BC8F8F;letter-spacing:0.12em;text-transform:uppercase;margin-top:4px;">${d.discount_pct ? `Down ${Math.round(d.discount_pct)}%` : 'Price drop'}</div></td><td style="padding:14px 0;border-bottom:1px solid #F0E6D6;text-align:right;vertical-align:middle;white-space:nowrap;"><span style="text-decoration:line-through;color:#9a8f80;font-size:12px;margin-right:10px;">${fmtPrice(d.was_price)}</span><span style="font-family:'Cormorant Garamond',Georgia,serif;color:#C8B06A;font-size:20px;">${fmtPrice(d.price_now)}</span></td></tr>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#FDF5E6;"><div style="max-width:520px;margin:0 auto;background:#FDF5E6;padding:36px 28px 32px;"><div style="text-align:center;margin-bottom:30px;"><div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;color:#043927;letter-spacing:0.02em;font-weight:300;">The Muse</div><div style="font-size:9px;letter-spacing:0.42em;color:#C8B06A;text-transform:uppercase;margin-top:7px;">Weekly Price Drop Edit</div><div style="height:1px;background:#C8B06A;width:54px;margin:14px auto 0;"></div></div><p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:#043927;font-style:italic;text-align:center;line-height:1.5;margin:0 0 26px;">${drops.length} of your favourites ${drops.length > 1 ? 'have' : 'has'} quietly slipped to a better price this week.</p><table style="width:100%;border-collapse:collapse;">${rows}</table><div style="text-align:center;margin-top:34px;"><a href="https://luxebeauty.app/shopping-list" style="display:inline-block;padding:12px 30px;background:#043927;color:#FDF5E6;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;text-decoration:none;border-radius:999px;">Open Your Shopping List</a></div><p style="text-align:center;font-size:10px;color:#9a8f80;margin-top:30px;letter-spacing:0.06em;">Curated by The Muse · LuxeBeauty</p></div></body></html>`;
}

async function fetchPrice(base44, p) {
  const brandLower = (p.brand || '').toLowerCase();
  if (!p.brand || brandLower === 'not identified' || brandLower.startsWith('not identified')) return null;
  try {
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: 'You are a retail price tracker. Find the current retail price in USD of this beauty product at major online retailers (Sephora, Ulta, Amazon, the brand official site). If it is currently discounted or on sale, report the sale price as current_price and set on_sale true. Use your web search to verify real current pricing. Product brand: ' + (p.brand || '') + '. Product name: ' + (p.name || '') + '. Shade: ' + (p.shade || 'n/a') + '. Retailer hints: ' + (p.where_to_buy || 'any major beauty retailer') + '.', add_context_from_internet: true, model: 'gemini_3_flash', response_json_schema: { type: 'object', properties: { current_price: { type: 'number' }, on_sale: { type: 'boolean' }, sale_price: { type: 'number' }, original_price: { type: 'number' }, retailer: { type: 'string' } } } });
    return res;
  } catch { return null; }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    try { const user = await base44.auth.me(); if (user && user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 }); } catch {}

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const authHeader = { Authorization: `Bearer ${accessToken}` };
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: authHeader });
    const profile = await profileRes.json();
    const fromEmail = profile.emailAddress;
    if (!fromEmail) return Response.json({ error: 'Could not resolve Gmail sender address' }, { status: 500 });

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const notifications = await base44.asServiceRole.entities.Notification.filter({ type: 'price_drop' });
    const recent = (notifications || []).filter((n) => new Date(n.created_date) >= since);

    const shoppingItems = await base44.asServiceRole.entities.Product.filter({ in_shopping_list: true });
    const now = new Date().toISOString();
    const shoppingDrops = [];

    if (shoppingItems.length > 0) {
      const lookups = await Promise.all(shoppingItems.map(async (p) => ({ p, priceData: await fetchPrice(base44, p) })));
      for (const { p, priceData } of lookups) {
        if (!priceData || typeof priceData.current_price !== 'number' || priceData.current_price <= 0) {
          if (p.id) { try { await base44.asServiceRole.entities.Product.update(p.id, { last_price_checked: now }); } catch {} }
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
        try { await base44.asServiceRole.entities.Product.update(p.id, update); } catch {}
        if (isDrop && p.created_by_id) {
          const discountPct = update.sale_discount_pct;
          const drop = { user_id: p.created_by_id, type: 'price_drop', title: (p.brand || '') + ' ' + (p.name || '') + ' is on sale', body: 'Now $' + currentPrice.toFixed(2) + ' (was $' + baseline.toFixed(2) + ') — ' + discountPct + '% off at ' + (priceData.retailer || 'a major retailer') + '.', product_id: p.id, product_name: (p.brand || '') + ' ' + (p.name || ''), image_url: p.image_url || '', price_now: currentPrice, was_price: baseline, discount_pct: discountPct, read: false };
          try { await base44.asServiceRole.entities.Notification.create(drop); } catch {}
          shoppingDrops.push(drop);
        }
      }
    }

    const seen = new Set();
    const allDrops = [];
    for (const n of [...recent, ...shoppingDrops]) {
      const key = n.product_id || n.title + '|' + (n.user_id || '');
      if (seen.has(key)) continue;
      seen.add(key);
      allDrops.push(n);
    }
    if (allDrops.length === 0) return Response.json({ sent: 0, message: 'No price drops this week', shoppingChecked: shoppingItems.length });

    const byUser: Record<string, any[]> = {};
    for (const n of allDrops) { if (!n.user_id) continue; (byUser[n.user_id] ||= []).push(n); }
    const userIds = Object.keys(byUser);
    let sent = 0;
    const failures = [];
    for (const uid of userIds) {
      let email = null;
      try { const u = await base44.asServiceRole.entities.User.get(uid); email = u?.email; } catch {}
      if (!email) { failures.push({ user_id: uid, reason: 'no email' }); continue; }
      const drops = byUser[uid].sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
      const subject = `Your Weekly Edit — ${drops.length} Price Drop${drops.length > 1 ? 's' : ''}`;
      const html = buildReportHtml(drops);
      const raw = buildRawMessage({ fromName: 'The Muse · LuxeBeauty', fromEmail, to: email, subject, html });
      const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', { method: 'POST', headers: { ...authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }) });
      if (sendRes.ok) sent++;
      else failures.push({ user_id: uid, reason: await sendRes.text() });
    }
    return Response.json({ sent, recipients: userIds.length, shoppingChecked: shoppingItems.length, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}