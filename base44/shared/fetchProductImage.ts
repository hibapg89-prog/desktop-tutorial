// Shared product-image fetcher using LLM-generated direct image URLs.
// Asks the LLM for direct image file URLs from retailer CDNs, validates each
// by checking the content-type, and proxies the winner to Wix Media.
// Used by both the scan-time fetchProductImage function and the weekly
// backfill job.

const FETCH_TIMEOUT_MS = 8000;

// Realistic browser User-Agent — retailer CDNs block requests with no UA
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Domains that host social media / UGC content — never use these.
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

// Extract og:image from raw HTML using a regex (no DOM parser available).
function extractOgImage(html: string): string | null {
  // Match: <meta property="og:image" content="..."> (attribute order varies)
  const patterns = [
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
    // Twitter fallback
    /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

// Reject og:image URLs that are clearly site logos / wordmarks rather than
// product photos. Retailer homepages and category pages often expose the site
// logo as their og:image, which passes the content-type check but is not a
// product image.
function isLogoImage(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    // Path contains "logo" (sephora_logo.jpg, brand-logo.png, etc.)
    if (/\/logo[s]?[/.]/.test(path) || /[_-]logo[._-]/.test(path)) return true;
    // Known logo URL patterns
    if (path.includes('sephora_logo') || path.includes('sephoralogo')) return true;
    // Very short paths that are likely favicons/logos (e.g. /img/logo.png)
    if (/\/(img|images|assets|static)\/(logo|brand|favicon)/.test(path)) return true;
    return false;
  } catch {
    return true; // invalid URL → treat as bad
  }
}

// Validate that a URL actually returns an image (content-type check, no body download).
async function isValidImage(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);
    if (!r.ok) return false;
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    return ct.startsWith('image/');
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

// Fetch a page and extract its og:image, returning the image URL or null.
async function scrapeOgImage(pageUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(pageUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Googlebot UA — retailers serve full product pages (with og:image)
        // to search crawlers, bypassing the consent/cookie walls served to
        // datacenter IPs in the EU.
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);
    if (!r.ok) { console.log('[scrapeOgImage] HTTP', r.status, 'for', pageUrl); return null; }
    const html = await r.text();
    console.log('[scrapeOgImage] got', html.length, 'chars from', pageUrl, '| first 200:', html.slice(0, 200).replace(/\n/g, ' '));
    const ogImage = extractOgImage(html);
    if (!ogImage) return null;
    // Resolve relative URLs
    try {
      return new URL(ogImage, pageUrl).href;
    } catch {
      return ogImage;
    }
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * @param base44  a base44 client (user-scoped or asServiceRole)
 * @returns a verified direct image URL, or null
 */
export async function findValidProductImage(base44, brand, name, shade) {
  const rawBrand = (brand || '').toLowerCase();
  const PLACEHOLDER_BRANDS = ['not identified', 'to source', 'n/a', 'unknown'];
  // For placeholder brands, fall back to extracting the brand from the product
  // name — the name often starts with the real brand (e.g. "NYX The Simpsons…").
  const searchBrand = (!brand || PLACEHOLDER_BRANDS.includes(rawBrand) || rawBrand.startsWith('not identified'))
    ? (name || '')
    : brand;
  if (!searchBrand) return null;

  // Step 1: Ask Gemini (with web search) for the product's PAGE URL on a
  // retailer or brand site. LLMs are much better at knowing real page URLs
  // than direct image file URLs.
  let imageUrls: string[] = [];
  try {
    console.log('[findValidProductImage] searching for:', searchBrand, '|', name);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt:
        'You are a product image finder for a luxury beauty app. Return up to 8 direct image URLs for this beauty product. ' +
        'Each URL MUST be a direct link to an image file (ending in .jpg, .jpeg, .png, or .webp) from a retailer CDN or brand website. ' +
        'Good sources: Sephora, ULTA, Nordstrom, Lookfantastic, brand websites, Amazon. ' +
        'NEVER return URLs from social media (TikTok, Instagram, Pinterest, Reddit, Twitter/X, Facebook, YouTube). ' +
        'NEVER return page URLs — only direct image file URLs. ' +
        'Product brand: ' + (searchBrand || '') + '. ' +
        'Product name: ' + (name || '') + '. ' +
        'Shade: ' + (shade || 'n/a') + '.',
      response_json_schema: {
        type: 'object',
        properties: {
          image_urls: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    imageUrls = (res?.image_urls || []).filter(
      (u) => typeof u === 'string' && u.startsWith('http') && !isBlocked(u)
    );
    console.log('[findValidProductImage] LLM returned', imageUrls.length, 'image URLs:', imageUrls.slice(0, 3));
  } catch (err) {
    console.error('[findValidProductImage] LLM error:', err?.message || String(err));
    return null;
  }

  if (imageUrls.length === 0) {
    console.log('[findValidProductImage] no image URLs found, giving up');
    return null;
  }

  // Step 2: For each page URL, fetch the page and extract og:image.
  // Try up to 3 pages — return the first valid og:image found.
  // Validate each candidate image URL — return the first one that loads.
  for (const imgUrl of imageUrls.slice(0, 5)) {
    console.log('[findValidProductImage] checking image URL:', imgUrl.slice(0, 100));
    if (isBlocked(imgUrl)) continue;
    if (isLogoImage(imgUrl)) {
      console.log('[findValidProductImage] rejected as logo');
      continue;
    }
    const valid = await isValidImage(imgUrl);
    console.log('[findValidProductImage] isValidImage:', valid);
    if (valid) {
      return imgUrl;
    }
  }

  console.log('[findValidProductImage] all URLs exhausted, no valid image found');
  return null;
}

/**
 * Downloads an image from a URL and re-uploads it to the app's Wix Media
 * storage. This makes all product images go through the optimized Wix Media
 * pipeline (responsive srcSet, WebP conversion, lazy loading, blur-up
 * placeholder) instead of loading full-resolution from retailer CDNs.
 * Returns the Wix Media file_url, or null if the proxy fails (caller should
 * fall back to the direct URL).
 */
export async function proxyImageToWixMedia(base44, imageUrl): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS * 2);
    const imgRes = await fetch(imageUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeout);
    if (!imgRes.ok) return null;
    const blob = await imgRes.blob();
    if (!blob.type.startsWith('image/')) return null;
    const ext = (blob.type.split('/')[1] || 'jpg').split(';')[0];
    const file = new File([blob], `product-${Date.now()}.${ext}`, { type: blob.type });
    const uploadRes = await base44.integrations.Core.UploadFile({ file });
    return uploadRes?.file_url || null;
  } catch {
    return null;
  }
}
