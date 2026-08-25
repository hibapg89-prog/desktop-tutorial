import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN');
const APIFY_BASE = 'https://api.apify.com/v2';

async function resolveUrl(url: string): Promise<string> {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    return r.url || url;
  } catch {
    return url;
  }
}

async function scrapeTikTok(url: string): Promise<{ caption: string; thumbnailUrl: string | null } | null> {
  if (!APIFY_TOKEN) return null;
  try {
    const res = await fetch(
      `${APIFY_BASE}/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postURLs: [url],
          resultsPerPage: 1,
          maxProfilesPerQuery: 1,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
        signal: AbortSignal.timeout(100000),
      }
    );
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return {
      caption: item.text || item.desc || item.description || '',
      thumbnailUrl: item.videoMeta?.coverUrl || item.covers?.[0] || item.cover || null,
    };
  } catch {
    return null;
  }
}

async function scrapeInstagram(url: string): Promise<{ caption: string; thumbnailUrl: string | null } | null> {
  if (!APIFY_TOKEN) return null;
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
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return {
      caption: item.caption || item.alt || '',
      thumbnailUrl: item.displayUrl || null,
    };
  } catch {
    return null;
  }
}

export default async function(req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { url } = body;
  if (!url) {
    return Response.json({ success: false, error: 'Missing url parameter' }, { status: 400 });
  }

  if (!APIFY_TOKEN) {
    return Response.json({
      success: false,
      error: 'APIFY_TOKEN secret is not configured. Please add it in the app secrets settings.',
    }, { status: 500 });
  }

  // Resolve short URLs (e.g. vm.tiktok.com)
  const resolvedUrl = await resolveUrl(url);

  let hostname: string;
  try {
    hostname = new URL(resolvedUrl).hostname.replace(/^www\./, '');
  } catch {
    return Response.json({ success: false, error: 'Invalid URL' }, { status: 400 });
  }

  let scraped: { caption: string; thumbnailUrl: string | null } | null = null;

  if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
    scraped = await scrapeTikTok(resolvedUrl);
    // Fallback: try original short URL if resolution didn't help
    if (!scraped && resolvedUrl !== url) {
      scraped = await scrapeTikTok(url);
    }
  } else if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
    scraped = await scrapeInstagram(resolvedUrl);
  } else {
    return Response.json({
      success: false,
      error: `Unsupported platform: ${hostname}. Only TikTok and Instagram are supported.`,
    }, { status: 400 });
  }

  if (!scraped || !scraped.caption) {
    return Response.json({
      success: false,
      error: 'Could not extract content from this post. The post may be private or the scraper may have timed out.',
    });
  }

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a beauty product expert. Extract all beauty and skincare products mentioned in the following social media caption. For each product, identify the brand name, product name, and subcategory (e.g. foundation, lipstick, mascara, skincare, fragrance, etc.).

Caption: "${scraped.caption}"

If no beauty products are mentioned, return an empty products_identified array. Determine the overall content category (makeup, skincare, haircare, fragrance, etc.).`,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Overall category of products (makeup, skincare, haircare, fragrance, nails, etc.)',
        },
        products_identified: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              brand: { type: 'string', description: 'Brand name (e.g. Charlotte Tilbury, Dior)' },
              product_name: { type: 'string', description: 'Product name or line' },
              subcategory: { type: 'string', description: 'Product type (foundation, lipstick, serum, etc.)' },
            },
            required: ['brand', 'product_name', 'subcategory'],
          },
        },
      },
      required: ['category', 'products_identified'],
    },
  });

  return Response.json({
    success: true,
    data: result,
    thumbnailUrl: scraped.thumbnailUrl || null,
  });
}
