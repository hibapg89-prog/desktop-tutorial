// Extracts caption and image from an Instagram post/reel via Apify.
// Uses the same apify~instagram-post-scraper actor as the TikTok pipeline's
// Instagram fallback, but as a dedicated function for cleaner routing.
// Requires APIFY_TOKEN secret.

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN');
const APIFY_BASE  = 'https://api.apify.com/v2';

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractInstagramContent] url:', url);

    if (!APIFY_TOKEN) {
      console.error('[extractInstagramContent] APIFY_TOKEN not set');
      return Response.json({ success: false, error: 'Instagram scraping not configured.' });
    }

    // ── PRIMARY: Apify Instagram scraper ────────────────────────────────────
    try {
      const res = await fetch(
        `${APIFY_BASE}/acts/apify~instagram-post-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
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

      console.log('[extractInstagramContent] caption:', caption.slice(0, 200));
      return Response.json({
        success: true,
        caption,
        thumbnailUrl,
        platform: 'instagram',
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
