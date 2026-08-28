// Shared product-image fetcher using page-URL → og:image scraping.
// Asks the LLM for the product's PAGE URL on a retailer/brand site, fetches
// that page, extracts the og:image meta tag, and validates it. This is far
// more reliable than asking the LLM for direct image URLs (which it
// hallucinates), and much faster (1 page fetch vs 5 dead-link timeouts).
// Used by both the scan-time fetchProductImage function and the weekly
// backfill job.

const FETCH_TIMEOUT_MS = 8000;

const BLOCKED_DOMAINS = [
  'tiktok.com', 'instagram.com', 'pinterest.com', 'reddit.com',
  'twitter.com', 'x.com', 'facebook.com', 'snapchat.com', 'youtube.com',
  'tumblr.com', 'blogger.com', 'wordpress.com', 'blogspot.com',
  'cdninstagram.com', 'fbcdn.net', 'pbs.twimg.com', 'tiktokcdn.com',
  'pinimg.com', 'redd.it', 'redditmedia.com',
];

function isBlocked(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return BLOCKED_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return true;
  }
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function isLogoImage(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    if (/\/logo[s]?[/.]/.test(path) || /[_-]logo[._-]/.test(path)) return true;
    if (path.includes('sephora_logo') || path.includes('sephoralogo')) return true;
    if (/\/(img|images|assets|static)\/(logo|brand|favicon)/.test(path)) return true;
    return false;
  } catch {
    return true;
  }
}

async function isValidImage(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
    clearTimeout(timeout);
    if (!r.ok) return false;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    return ct.startsWith('image/');
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

async function scrapeOgImage(pageUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(pageUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);
    if (!r.ok) return null;
    const html = await r.text();
    const ogImage = extractOgImage(html);
    if (!ogImage) return null;
    try { return new URL(ogImage, pageUrl).href; } catch { return ogImage; }
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function findValidProductImage(base44, brand, name, shade) {
  const brandLower = (brand || '').toLowerCase();
  if (!brand || brandLower === 'not identified' || brandLower.startsWith('not identified')) return null;

  let pageUrls: string[] = [];
  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        'You are a product finder for a luxury beauty app. Find the exact PRODUCT PAGE URL for this beauty product on a major beauty retailer or the official brand website. ' +
        'Good sources: Sephora, ULTA, Lookfantastic, Feelunique, Space NK, Harvey Nichols, Selfridges, Harrods, Nordstrom, Net-a-Porter, Amazon, or the official brand website. ' +
        'Return up to 3 candidate product page URLs. Each MUST be a full https:// URL to the actual product detail page (NOT an image, NOT a category listing, NOT a search results page). ' +
        'ABSOLUTELY NEVER return URLs from social media — TikTok, Instagram, Pinterest, Reddit, Twitter/X, Facebook, YouTube. ' +
        'Only return URLs you are confident exist and are publicly accessible. ' +
        'Product brand: ' + (brand || '') + '. Product name: ' + (name || '') + '. Shade: ' + (shade || 'n/a') + '.',
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: { page_urls: { type: 'array', items: { type: 'string' } } }
      }
    });
    pageUrls = (res?.page_urls || []).filter(
      (u) => typeof u === 'string' && u.startsWith('http') && !isBlocked(u)
    );
  } catch {
    return null;
  }

  if (pageUrls.length === 0) return null;

  for (const pageUrl of pageUrls.slice(0, 3)) {
    const ogImage = await scrapeOgImage(pageUrl);
    if (!ogImage || isBlocked(ogImage)) continue;
    if (isLogoImage(ogImage)) continue;
    if (await isValidImage(ogImage)) return ogImage;
  }

  return null;
}