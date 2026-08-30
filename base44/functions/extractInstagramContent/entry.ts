// Extracts caption and image from an Instagram post/reel.
// Pipeline:
//   1. Googlebot UA og: scrape — free, instant, no credits needed
//   2. Apify apify~instagram-scraper — paid fallback when og: scrape returns nothing
// Requires APIFY_TOKEN secret for step 2.

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN');
const APIFY_BASE  = 'https://api.apify.com/v2';

// ── Step 1: Googlebot og: scrape ─────────────────────────────────────────────
// Instagram serves og:description (the caption) to known crawlers.
async function scrapeOgInstagram(url) {
  const UAs = [
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  ];
  for (const ua of UAs) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(12000),
        redirect: 'follow',
      });
      if (!res.ok) continue;
      const html = await res.text();

      const extract = (prop) => {
        const re = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i');
        const alt = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i');
        return html.match(re)?.[1] || html.match(alt)?.[1] || null;
      };

      const description = extract('og:description');
      const image       = extract('og:image') || extract('twitter:image');

      if (description && description.length > 5) {
        console.log(`[extractInstagramContent] og: scrape succeeded with UA: ${ua.slice(0, 30)}`);
        return { caption: description, thumbnailUrl: image };
      }
    } catch (err) {
      console.warn('[extractInstagramContent] og: scrape attempt failed:', err?.message);
    }
  }
  return null;
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractInstagramContent] url:', url);

    // ── Step 1: free Googlebot og: scrape ────────────────────────────────────
    const ogResult = await scrapeOgInstagram(url);
    if (ogResult?.caption) {
      console.log('[extractInstagramContent] og: caption:', ogResult.caption.slice(0, 200));
      return Response.json({
        success: true,
        caption: ogResult.caption,
        thumbnailUrl: ogResult.thumbnailUrl || null,
        platform: 'instagram',
        method: 'og',
      });
    }

    console.log('[extractInstagramContent] og: scrape returned no caption, trying Apify...');

    if (!APIFY_TOKEN) {
      console.error('[extractInstagramContent] APIFY_TOKEN not set — cannot fall back to Apify');
      return Response.json({ success: false, error: 'Instagram scraping not configured.' });
    }

    // ── Step 2: Apify instagram-scraper ──────────────────────────────────────
    // NOTE: actor changed from apify~instagram-post-scraper (deprecated, now requires
    // username field) to apify~instagram-scraper which still accepts directUrls.
    try {
      const res = await fetch(
        `${APIFY_BASE}/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directUrls: [url],
            resultsType: 'posts',
            resultsLimit: 1,
          }),
          signal: AbortSignal.timeout(100000),
        }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error('[extractInstagramContent] Apify HTTP error:', res.status, body.slice(0, 200));
        return Response.json({ success: false, error: `Apify returned ${res.status}.` });
      }

      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : null;

      if (!item) {
        console.error('[extractInstagramContent] Apify returned no items');
        return Response.json({
          success: false,
          error: 'Could not read this post. It may be private or the account may require a follow.',
        });
      }

      const caption      = item.caption || item.alt || item.accessibility_caption || '';
      const thumbnailUrl = item.displayUrl || item.thumbnailUrl || item.previewUrl || null;

      if (!caption) {
        console.error('[extractInstagramContent] Apify item had no caption');
        return Response.json({
          success: false,
          error: 'This post has no text caption — try a post that mentions product names.',
        });
      }

      console.log('[extractInstagramContent] Apify caption:', caption.slice(0, 200));
      return Response.json({
        success: true,
        caption,
        thumbnailUrl,
        platform: 'instagram',
        method: 'apify',
      });
    } catch (err) {
      console.error('[extractInstagramContent] Apify error:', err?.message || String(err));
      return Response.json({ success: false, error: err?.message || String(err) });
    }
  } catch (error) {
    console.error('[extractInstagramContent] top-level error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
