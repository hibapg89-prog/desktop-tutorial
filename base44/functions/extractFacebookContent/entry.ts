// Extracts post text from a Facebook URL via og: meta tag scraping.
// No API key required — Facebook serves og: meta tags for public posts
// when fetched with the facebookexternalhit User-Agent (their own crawler).
// Handles facebook.com/posts, /videos, /reel, /photo, and share links.

const UA_FB   = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const UA_BOT  = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const UA_FULL = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  return html.match(re2)?.[1] || null;
}

async function tryFetch(url: string, ua: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractFacebookContent] url:', url);

    // Try three User-Agents in order — FB crawler UA gets the richest og: tags
    let html: string | null = null;
    for (const ua of [UA_FB, UA_BOT, UA_FULL]) {
      html = await tryFetch(url, ua);
      if (html && html.length > 500) break;
    }

    if (!html) {
      return Response.json({ success: false, error: 'Could not reach Facebook.' });
    }

    console.log('[extractFacebookContent] page size:', html.length);

    // ── METHOD A: og: meta tags ──────────────────────────────────────────────
    const ogTitle       = metaContent(html, 'og:title');
    const ogDescription = metaContent(html, 'og:description');
    const ogImage       = metaContent(html, 'og:image');

    if (ogDescription && ogDescription.length > 5) {
      const caption = [ogTitle, ogDescription].filter(Boolean).join('\n\n');
      console.log('[extractFacebookContent] og: caption:', caption.slice(0, 200));
      return Response.json({
        success: true,
        caption,
        thumbnailUrl: ogImage || null,
        platform: 'facebook',
      });
    }

    // og:title alone (some posts only have a title)
    if (ogTitle && ogTitle.length > 10) {
      console.log('[extractFacebookContent] og:title only caption:', ogTitle);
      return Response.json({
        success: true,
        caption: ogTitle,
        thumbnailUrl: ogImage || null,
        platform: 'facebook',
      });
    }

    // ── METHOD B: JSON-LD ────────────────────────────────────────────────────
    const ldMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (ldMatches) {
      for (const ldBlock of ldMatches) {
        const jsonStr = ldBlock.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
          const ld = JSON.parse(jsonStr);
          const desc = ld?.description || ld?.articleBody || (Array.isArray(ld) ? ld[0]?.description : null);
          if (desc && desc.length > 5) {
            const thumb = ld?.image?.url || ld?.image || null;
            console.log('[extractFacebookContent] ld+json caption:', desc.slice(0, 200));
            return Response.json({
              success: true,
              caption: desc,
              thumbnailUrl: typeof thumb === 'string' ? thumb : null,
              platform: 'facebook',
            });
          }
        } catch {}
      }
    }

    console.error('[extractFacebookContent] no caption found');
    return Response.json({
      success: false,
      error: 'Could not read this post — it may be private, require login, or have no text content.',
    });
  } catch (error) {
    console.error('[extractFacebookContent] error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
