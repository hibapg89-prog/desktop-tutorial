// Harvests multiple frame image URLs from a social video so the vision model can
// catch products that appear partway through a reel — not just on the cover.
//
// YouTube: 4 free timestamped thumbnails (img.youtube.com/vi/ID/0.jpg…3.jpg) —
//          genuinely different frames, no video download needed.
// All other platforms: the cover/og:image (1 frame). ffmpeg is not available in
//          the Deno runtime, so we gracefully fall back to whatever preview
//          frames the platform exposes, per the PRD's fallback clause.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const GOOGLEBOT_UA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';

function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '');
    if (h === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (h === 'youtube.com' || h.endsWith('.youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(?:shorts|embed|v)\/([^/?]+)/);
      if (m) return m[1];
    }
    return null;
  } catch { return null; }
}

function extractMetaTag(html, prop) {
  const re = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i');
  const alt = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i');
  return html.match(re)?.[1] || html.match(alt)?.[1] || null;
}

async function scrapeOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': GOOGLEBOT_UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image') || null;
  } catch (err) {
    console.error('[extractVideoFrames] og:image scrape error:', err?.message || String(err));
    return null;
  }
}

// YouTube exposes 4 thumbnails at different timestamps (0=default, 1=25%, 2=50%, 3=75%).
// Verify each returns 200; some may not exist for very short/new videos.
async function getYouTubeFrames(videoId) {
  const candidates = ['0', '1', '2', '3'].map(n => `https://img.youtube.com/vi/${videoId}/${n}.jpg`);
  const frames = [];
  for (const c of candidates) {
    try {
      const r = await fetch(c, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(5000), redirect: 'follow' });
      if (r.ok) frames.push(c);
    } catch {}
  }
  // 0.jpg always exists — if HEAD failed for all (rare), include it as a guaranteed frame
  if (frames.length === 0) frames.push(`https://img.youtube.com/vi/${videoId}/0.jpg`);
  return frames;
}

export default async function(req) {
  let inputThumbnail = null;
  try {
    const body = await req.json();
    inputThumbnail = body.thumbnailUrl || null;
    const { url } = body;
    if (!url) return Response.json({ success: false, error: 'url is required', frames: [] }, { status: 400 });

    const hostname = (() => {
      try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
    })();

    let frames = [];
    let platform = 'unknown';

    // ── YouTube: 4 free timestamped thumbnails ──
    if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
      platform = 'youtube';
      const videoId = extractYouTubeId(url);
      if (videoId) {
        frames = await getYouTubeFrames(videoId);
        console.log(`[extractVideoFrames] YouTube ${videoId}: ${frames.length} frames`);
      } else {
        console.error('[extractVideoFrames] could not extract YouTube video ID');
      }
    }
    // ── All other platforms: cover thumbnail (passed in or scraped) ──
    else {
      platform = hostname || 'unknown';
      if (inputThumbnail) {
        frames = [inputThumbnail];
      } else {
        const og = await scrapeOgImage(url);
        if (og) frames = [og];
      }
      console.log(`[extractVideoFrames] ${platform}: ${frames.length} frame(s)${!inputThumbnail ? ' (scraped)' : ''}`);
    }

    return Response.json({ success: true, frames, platform, frameCount: frames.length });
  } catch (error) {
    console.error('[extractVideoFrames] error:', error?.message || String(error));
    // Graceful fallback — return the cover thumbnail if we have one
    const fallback = inputThumbnail ? [inputThumbnail] : [];
    return Response.json({ success: false, error: error?.message || String(error), frames: fallback, frameCount: fallback.length });
  }
}
