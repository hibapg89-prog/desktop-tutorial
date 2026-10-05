const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN');
const APIFY_BASE = 'https://api.apify.com/v2';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Resolve short/redirect URLs (vm.tiktok.com, etc.) to their canonical form.
async function resolveUrl(url) {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      method: 'GET',
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8000),
    });
    return r.url || url;
  } catch {
    return url;
  }
}

// Extract a meta tag (og:description, og:title, og:image, twitter:description, etc.)
// from raw HTML. Returns the first match's content value.
function extractMetaTag(html, prop) {
  const re = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i');
  const alt = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i');
  return html.match(re)?.[1] || html.match(alt)?.[1] || null;
}

// Decode HTML entities in scraped captions so the LLM and verification logic
// see clean text (@handle, emojis, apostrophes) instead of &#064;, &#x2728;, etc.
// &amp; is decoded LAST to avoid double-decoding (e.g. &amp;quot; → &quot; → ").
function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

// Generic HTML page scrape — extracts caption from og:description / og:title meta tags.
async function scrapeMetaTags(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      console.error('[MetaScrape] HTTP error:', res.status);
      return null;
    }
    const html = await res.text();
    const desc = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'twitter:description');
    const title = extractMetaTag(html, 'og:title') || extractMetaTag(html, 'twitter:title');
    const thumb = extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image');
    // og:description is often the best caption source; fall back to title if desc is thin
    const caption = (desc && desc.length > 10) ? desc : (title && title.length > 5 ? title : null);
    if (!caption) {
      console.error('[MetaScrape] no caption found in meta tags');
      return null;
    }
    return { caption, thumbnailUrl: thumb || null, canonicalUrl: url };
  } catch (err) {
    console.error('[MetaScrape] error:', err?.message || String(err));
    return null;
  }
}

// ── TIKTOK ──────────────────────────────────────────────────────────────────
async function tiktokOEmbed(url) {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { console.error('[TikTok oEmbed] HTTP error:', res.status); return null; }
    const data = await res.json();
    if (!data || !data.title) return null;
    return { caption: data.title, thumbnailUrl: data.thumbnail_url || null, canonicalUrl: url };
  } catch (err) {
    console.error('[TikTok oEmbed] error:', err?.message || String(err));
    return null;
  }
}

async function scrapeTikTokPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'en-US,en;q=0.9' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const uniMatch = html.match(/<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i);
    if (uniMatch) {
      try {
        const uni = JSON.parse(uniMatch[1]);
        const desc = uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['desc']
                  || uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['description']
                  || null;
        if (desc) {
          const thumb = uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['video']?.['cover'] || null;
          return { caption: desc, thumbnailUrl: thumb, canonicalUrl: url };
        }
      } catch {}
    }
    return null;
  } catch (err) {
    console.error('[TikTok PageScrape] error:', err?.message || String(err));
    return null;
  }
}

async function scrapeTikTokApify(url) {
  if (!APIFY_TOKEN) return null;
  try {
    const res = await fetch(
      `${APIFY_BASE}/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postURLs: [url], resultsPerPage: 1, maxProfilesPerQuery: 1, shouldDownloadVideos: false, shouldDownloadCovers: false }),
        signal: AbortSignal.timeout(100000),
      }
    );
    if (!res.ok) { console.error('[Apify TikTok] HTTP error:', res.status); return null; }
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return { caption: item.text || item.desc || item.description || '', thumbnailUrl: item.videoMeta?.coverUrl || item.covers?.[0] || item.cover || null, canonicalUrl: item.webVideoUrl || item.url || url };
  } catch (err) {
    console.error('[Apify TikTok] error:', err?.message || String(err));
    return null;
  }
}

// ── YOUTUBE ─────────────────────────────────────────────────────────────────
async function youtubeOEmbed(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { console.error('[YouTube oEmbed] HTTP error:', res.status); return null; }
    const data = await res.json();
    if (!data) return null;
    // oEmbed returns title + author_name but NOT the description.
    // We combine title + author as the caption, then scrape the page for the full description.
    const title = data.title || '';
    const author = data.author_name || '';
    const caption = [title, author ? `by ${author}` : ''].filter(Boolean).join(' — ');
    if (!caption) return null;
    return { caption, thumbnailUrl: data.thumbnail_url || null, canonicalUrl: url };
  } catch (err) {
    console.error('[YouTube oEmbed] error:', err?.message || String(err));
    return null;
  }
}

// Extract a JSON object from HTML by finding a key assignment (key = {) and
// brace-matching to its closing brace. Handles nested braces and escaped
// strings — far more reliable than regex for YouTube's huge embedded JSON blobs.
function extractJsonBlob(html, key) {
  const re = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*\\{');
  const match = html.match(re);
  if (!match) return null;
  let i = match.index + match[0].length - 1; // position of the opening {
  let depth = 0, inStr = false, escape = false;
  const start = i;
  for (; i < html.length; i++) {
    const c = html[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return html.slice(start, i + 1); }
  }
  return null;
}

// YouTube page scrape — extracts the full video description from the embedded JSON.
async function scrapeYouTubePage(url) {
  try {
    // Use Googlebot UA — YouTube serves full content to search crawlers, avoiding
    // the consent/bot-detection stubs served to datacenter IPs.
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { console.error('[YouTube PageScrape] HTTP error:', res.status); return null; }
    const html = await res.text();

    // Primary: ytInitialPlayerResponse — contains videoDetails.shortDescription (the full description)
    const playerJson = extractJsonBlob(html, 'ytInitialPlayerResponse');
    if (playerJson) {
      try {
        const player = JSON.parse(playerJson);
        const desc = player?.videoDetails?.shortDescription || null;
        const title = player?.videoDetails?.title || null;
        const thumb = player?.videoDetails?.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || null;
        if (desc && desc.length > 10) {
          return { caption: desc, thumbnailUrl: thumb, canonicalUrl: url };
        }
        if (title) {
          return { caption: title, thumbnailUrl: thumb, canonicalUrl: url };
        }
      } catch (e) {
        console.error('[YouTube PageScrape] player JSON parse error:', e?.message || String(e));
      }
    }

    // Fallback to og:description meta tag
    const ogDesc = extractMetaTag(html, 'og:description');
    const ogTitle = extractMetaTag(html, 'og:title');
    const ogThumb = extractMetaTag(html, 'og:image');
    const caption = (ogDesc && ogDesc.length > 10) ? ogDesc : ogTitle;
    if (caption) return { caption, thumbnailUrl: ogThumb || null, canonicalUrl: url };
    return null;
  } catch (err) {
    console.error('[YouTube PageScrape] error:', err?.message || String(err));
    return null;
  }
}

// ── PINTEREST ───────────────────────────────────────────────────────────────
async function pinterestOEmbed(url) {
  try {
    const oembedUrl = `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { console.error('[Pinterest oEmbed] HTTP error:', res.status); return null; }
    const data = await res.json();
    if (!data) return null;
    const title = data.title || '';
    const desc = data.description || '';
    const caption = [title, desc].filter(Boolean).join(' — ');
    if (!caption) return null;
    return { caption, thumbnailUrl: data.thumbnail_url || data.image_url || null, canonicalUrl: url };
  } catch (err) {
    console.error('[Pinterest oEmbed] error:', err?.message || String(err));
    return null;
  }
}

// ── INSTAGRAM ────────────────────────────────────────────────────────────────
// No-setup first: meta-tag scraping (og:description), then tokenless oEmbed to
// confirm the post exists. oEmbed became tokenless in June 2026 — no app or
// access token required. Apify is the last resort (only if oEmbed is inconclusive).
// oEmbed returns embed HTML (not caption text), so it confirms existence but
// doesn't give us the caption — the frontend's web search fallback handles that.
async function instagramOEmbed(url) {
  try {
    const oembedUrl = `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      const html = data.html || '';
      const permalinkMatch = html.match(/data-instgrm-permalink="([^"]+)"/);
      const canonicalUrl = permalinkMatch ? permalinkMatch[1].split('?')[0] : url;
      // Extract thumbnail URL — check direct field first, then parse from embed HTML
      let thumbnailUrl = data.thumbnail_url || null;
      if (!thumbnailUrl && html) {
        const imgMatch = html.match(/<img[^>]+src="([^"]+)"/i);
        if (imgMatch) thumbnailUrl = imgMatch[1];
      }
      return { exists: true, canonicalUrl, thumbnailUrl };
    }
    // 400 = post doesn't exist or is private
    return { exists: false };
  } catch (err) {
    console.error('[IG oEmbed] error:', err?.message || String(err));
    return null; // inconclusive — network error
  }
}

// Instagram serves full page content (og:image + og:description) to search
// engine crawlers. Using the Googlebot UA lets us scrape both the thumbnail
// and the caption directly — no API key, no Apify, no rate limits.
async function scrapeInstagramPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) { console.error('[IG Googlebot] HTTP error:', res.status); return null; }
    const html = await res.text();
    const desc = extractMetaTag(html, 'og:description');
    const title = extractMetaTag(html, 'og:title');
    const thumb = extractMetaTag(html, 'og:image');
    const caption = (desc && desc.length > 10) ? desc : (title && title.length > 5 ? title : null);
    if (!caption && !thumb) return null;
    return { caption, thumbnailUrl: thumb || null, canonicalUrl: url };
  } catch (err) {
    console.error('[IG Googlebot] error:', err?.message || String(err));
    return null;
  }
}

async function scrapeInstagramApify(url) {
  if (!APIFY_TOKEN) return null;
  try {
    const res = await fetch(
      `${APIFY_BASE}/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrls: [url], resultsType: 'posts', resultsLimit: 1 }),
        signal: AbortSignal.timeout(100000),
      }
    );
    if (!res.ok) { console.error('[Apify IG] HTTP error:', res.status); return null; }
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return { caption: item.caption || item.alt || '', thumbnailUrl: item.displayUrl || item.thumbnailUrl || null, canonicalUrl: url };
  } catch (err) {
    console.error('[Apify IG] error:', err?.message || String(err));
    return null;
  }
}

// ── FACEBOOK ──────────────────────────────────────────────────────────────────
// Tokenless oEmbed (graph.facebook.com/oembed_post) confirms a post exists.
// Meta-tag scraping is the primary caption source.
async function facebookOEmbed(url) {
  try {
    const oembedUrl = `https://graph.facebook.com/v25.0/oembed_post?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      // Facebook oEmbed may return a title/author — use as caption if available
      const caption = data.title || data.author_name ? `${data.title || ''} ${data.author_name || ''}`.trim() : null;
      return { exists: true, caption: caption || null };
    }
    return { exists: false };
  } catch (err) {
    console.error('[FB oEmbed] error:', err?.message || String(err));
    return null;
  }
}

// ── THREADS ──────────────────────────────────────────────────────────────────
// Threads has no public oEmbed API; meta-tag scraping is the no-setup path.
async function scrapeThreads(url) {
  return scrapeMetaTags(url);
}

// ── X / TWITTER ───────────────────────────────────────────────────────────────
// X blocks unauthenticated scraping aggressively. meta-tag scraping via a mobile
// UA sometimes works; if not, we return null and let the frontend fall back to the
// image-based OG image path.
async function scrapeX(url) {
  try {
    // Try with a mobile UA — X sometimes serves meta tags to mobile clients
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) { console.error('[X scrape] HTTP error:', res.status); return null; }
    const html = await res.text();
    const desc = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'twitter:description');
    const title = extractMetaTag(html, 'og:title');
    const thumb = extractMetaTag(html, 'og:image');
    const caption = (desc && desc.length > 10) ? desc : title;
    if (!caption) return null;
    return { caption, thumbnailUrl: thumb || null, canonicalUrl: url };
  } catch (err) {
    console.error('[X scrape] error:', err?.message || String(err));
    return null;
  }
}

// ── PLATFORM ROUTER ──────────────────────────────────────────────────────────
// Each platform function tries no-setup methods first, then Apify as last resort.
// All return { caption, thumbnailUrl, canonicalUrl } or null.

async function extractTikTok(url) {
  let r = await tiktokOEmbed(url);
  if (!r?.caption) r = await scrapeTikTokPage(url);
  if (!r?.caption) r = await scrapeTikTokApify(url);
  if (!r?.caption && url !== await resolveUrl(url)) r = await scrapeTikTokApify(await resolveUrl(url));
  return r;
}

async function extractYouTube(url) {
  // Combine oEmbed (title + author) with page scrape (full description) — prefer the richer one.
  const oembed = await youtubeOEmbed(url);
  const page = await scrapeYouTubePage(url);
  // Page scrape has the full description; prefer it if it's longer than oEmbed's title.
  if (page?.caption && page.caption.length > (oembed?.caption?.length || 0)) return page;
  return oembed || page;
}

async function extractPinterest(url) {
  let r = await pinterestOEmbed(url);
  if (!r?.caption) r = await scrapeMetaTags(url);
  return r;
}

async function extractInstagram(url) {
  // 1. Googlebot UA — Instagram serves full content to search crawlers.
  //    Gets both caption (og:description) and thumbnail (og:image) in one call.
  let r = await scrapeInstagramPage(url);
  if (r?.caption || r?.thumbnailUrl) return r;

  // 2. No-setup: meta-tag scrape with regular UA
  r = await scrapeMetaTags(url);
  if (r?.caption) return r;

  // 3. No-setup: tokenless oEmbed confirms the post exists
  const oembed = await instagramOEmbed(url);
  if (oembed?.exists === false) {
    // Post doesn't exist or is private — fail fast, no Apify needed
    return null;
  }
  if (oembed?.exists === true) {
    // Post exists but oEmbed doesn't return caption text.
    // Return the thumbnail URL so the frontend can do vision-based product
    // identification from the reel's cover frame. Skip Apify (rate-limited).
    return { caption: null, thumbnailUrl: oembed.thumbnailUrl, canonicalUrl: oembed.canonicalUrl };
  }

  // 4. oEmbed inconclusive (network error) — Apify as last resort
  r = await scrapeInstagramApify(url);
  return r;
}

async function extractFacebook(url) {
  // 1. No-setup: meta-tag scrape
  let r = await scrapeMetaTags(url);
  if (r?.caption) return r;

  // 2. No-setup: tokenless oEmbed confirms the post exists
  const oembed = await facebookOEmbed(url);
  if (oembed?.exists === false) return null; // post doesn't exist
  if (oembed?.caption) return { caption: oembed.caption, thumbnailUrl: null, canonicalUrl: url };
  // oEmbed confirmed existence but no caption — frontend web search fallback handles it
  if (oembed?.exists === true) return null;

  return null;
}

async function extractThreads(url) {
  return scrapeThreads(url);
}

async function extractX(url) {
  return scrapeX(url);
}

export default async function(req) {
  try {
    const { url } = await req.json();
    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractSocialContent] input url:', url);
    // Detect platform from the ORIGINAL url — resolving first can redirect to
    // consent pages (e.g. YouTube → consent.google.com in EU) and break detection.
    const hostname = (() => {
      try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
    })();
    const resolvedUrl = await resolveUrl(url);
    console.log('[extractSocialContent] resolved to:', resolvedUrl);

    let scraped = null;
    let platform = 'unknown';

    // Use the ORIGINAL url for extractors — resolvedUrl may be a consent redirect.
    // Apify fallback (inside extractTikTok/extractInstagram) resolves internally.
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
      platform = 'tiktok';
      scraped = await extractTikTok(url);
    } else if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
      platform = 'youtube';
      scraped = await extractYouTube(url);
    } else if (hostname === 'pinterest.com' || hostname.endsWith('.pinterest.com') || hostname === 'pinterest.fr' || hostname.endsWith('.pinterest.fr') || hostname === 'pinterest.co.uk' || hostname.endsWith('.pinterest.co.uk')) {
      platform = 'pinterest';
      scraped = await extractPinterest(url);
    } else if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
      platform = 'instagram';
      scraped = await extractInstagram(url);
    } else if (hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.com' || hostname.endsWith('.fb.com')) {
      platform = 'facebook';
      scraped = await extractFacebook(url);
    } else if (hostname === 'threads.net' || hostname.endsWith('.threads.net')) {
      platform = 'threads';
      scraped = await extractThreads(url);
    } else if (hostname === 'x.com' || hostname.endsWith('.x.com') || hostname === 'twitter.com' || hostname.endsWith('.twitter.com')) {
      platform = 'x';
      scraped = await extractX(url);
    }

    if (!scraped || !scraped.caption) {
      console.error(`[extractSocialContent] ${platform}: no caption extracted. scraped:`, JSON.stringify(scraped));
      return Response.json({
        success: false,
        error: `The Muse couldn't read this ${platform} post. Try saving the image or video and using Gallery instead.`,
        platform,
        thumbnailUrl: scraped?.thumbnailUrl || null,
      });
    }

    console.log(`[extractSocialContent] ${platform} caption:`, scraped.caption.slice(0, 300));

    return Response.json({
      success: true,
      caption: decodeHtmlEntities(scraped.caption),
      thumbnailUrl: scraped.thumbnailUrl || null,
      canonicalUrl: scraped.canonicalUrl || null,
      platform,
    });

  } catch (error) {
    console.error('[extractSocialContent] top-level error:', error?.message || String(error));
    return Response.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
