// Extracts caption and image from a Pinterest pin by scraping og: meta tags.
// No API key required — uses a realistic browser User-Agent to fetch the pin page.
// Handles pin.it short links and all pinterest.* country TLDs via redirect following.

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function metaContent(html: string, property: string): string | null {
  // Match both property="..." and name="..." variants, single or double quotes
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1];
  // Also try content first, then property
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  return html.match(re2)?.[1] || null;
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractPinterestContent] url:', url);

    // Fetch the pin page — follow redirects to handle pin.it short links and country TLDs
    let html: string;
    let finalUrl: string;
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: AbortSignal.timeout(14000),
      });
      finalUrl = res.url || url;
      if (!res.ok) {
        console.error('[extractPinterestContent] HTTP error:', res.status, finalUrl);
        return Response.json({ success: false, error: `Pinterest returned ${res.status}.` });
      }
      html = await res.text();
    } catch (err) {
      console.error('[extractPinterestContent] fetch error:', err?.message || String(err));
      return Response.json({ success: false, error: 'Could not reach Pinterest.' });
    }

    console.log('[extractPinterestContent] page size:', html.length, 'finalUrl:', finalUrl);

    // ── METHOD A: og: meta tags ──────────────────────────────────────────────
    const ogTitle       = metaContent(html, 'og:title');
    const ogDescription = metaContent(html, 'og:description');
    const ogImage       = metaContent(html, 'og:image');

    if (ogTitle || ogDescription) {
      const caption = [ogTitle, ogDescription].filter(Boolean).join('\n\n');
      console.log('[extractPinterestContent] og: caption:', caption.slice(0, 200));
      return Response.json({
        success: true,
        caption,
        thumbnailUrl: ogImage || null,
        platform: 'pinterest',
      });
    }

    // ── METHOD B: JSON-LD structured data ────────────────────────────────────
    const ldMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (ldMatches) {
      for (const ldBlock of ldMatches) {
        const jsonStr = ldBlock.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
          const ld = JSON.parse(jsonStr);
          const desc = ld?.description || (Array.isArray(ld) ? ld[0]?.description : null);
          const name = ld?.name || (Array.isArray(ld) ? ld[0]?.name : null);
          if (desc || name) {
            const caption = [name, desc].filter(Boolean).join('\n\n');
            const thumb   = ld?.image?.url || ld?.image || (Array.isArray(ld) ? ld[0]?.image?.url : null) || null;
            console.log('[extractPinterestContent] ld+json caption:', caption.slice(0, 200));
            return Response.json({
              success: true,
              caption,
              thumbnailUrl: typeof thumb === 'string' ? thumb : null,
              platform: 'pinterest',
            });
          }
        } catch {}
      }
    }

    // ── METHOD C: title tag fallback ─────────────────────────────────────────
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1] && titleMatch[1].trim().length > 5) {
      const caption = titleMatch[1].trim();
      console.log('[extractPinterestContent] <title> caption:', caption);
      return Response.json({
        success: true,
        caption,
        thumbnailUrl: null,
        platform: 'pinterest',
      });
    }

    console.error('[extractPinterestContent] no caption found in page');
    return Response.json({ success: false, error: 'Could not read pin content — the pin may be private or behind a login.' });
  } catch (error) {
    console.error('[extractPinterestContent] top-level error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
