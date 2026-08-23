import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MASTER_MUSE_PROMPT = `You are the AI extraction engine for a luxury beauty application. Your task is to analyze social media captions or video transcripts and extract all beauty products and application steps into a highly structured JSON format.

RULES:
1. Tone: Ensure "the_ritual" instructions are written in an elegant, editorial tone (e.g., "Begin with a luminizing primer..." instead of "Put on primer").
2. Subcategories: For any makeup product identified, you MUST categorize it strictly into one of the following exact strings: "face", "cheek", "lips", "eyes", "sets and palettes", or "makeup tools". Do not invent other categories.
3. Materials: List general product types (e.g., "Translucent setting powder") in the materials array, not specific brand names.

Extract from the content below and return ONLY valid JSON in this exact format:
{
  "tutorial_title": "Provide a chic, 2-to-3 word title",
  "category": "Makeup, Skincare, Hair, or Wellness",
  "read_time": "Estimated time in minutes",
  "materials": ["List of generic product types needed"],
  "products_identified": [{"brand": "Brand Name", "product_name": "Specific Product Name", "subcategory": "Must match exact allowed strings"}],
  "the_ritual": [{"step": 1, "instruction": "Detailed, elegant instruction."}]
}`;

const APIFY_ACTORS = {
  instagram: 'apify~instagram-post-scraper',
  tiktok: 'clockworks~free-tiktok-scraper',
};

const SCRAPE_TIMEOUT_MS = 30000;

function detectPlatform(url: string): 'instagram' | 'tiktok' | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'instagram';
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'tiktok';
  } catch {}
  return null;
}

async function scrapeWithApify(
  platform: 'instagram' | 'tiktok',
  url: string,
  token: string,
): Promise<{ caption?: string; videoUrl?: string | null; thumbnailUrl?: string | null; error?: string }> {
  const actor = APIFY_ACTORS[platform];
  const apiUrl = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=30`;

  const inputBody = platform === 'instagram'
    ? { directUrls: [url], resultsLimit: 1 }
    : { postURLs: [url], resultsPerPage: 1 };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputBody),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { error: `Apify returned HTTP ${res.status}` };
    }

    const items: any[] = await res.json();
    if (!items?.length) return { error: 'No data returned from scraper' };

    const item = items[0];
    const caption = item.caption || item.text || item.description || '';
    const videoUrl: string | null = item.videoUrl || item.playAddress || item.downloadAddr || null;
    const thumbnailUrl: string | null = item.displayUrl || item.coverUrl || item.thumbnailUrl || null;

    return { caption, videoUrl, thumbnailUrl };
  } catch (e: any) {
    clearTimeout(timeout);
    return { error: e?.message || 'Scrape failed' };
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { url } = body || {};

    if (!url) {
      return Response.json({ success: false, error: 'No URL provided' }, { status: 400 });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return Response.json(
        { success: false, error: 'Unsupported platform — only Instagram and TikTok are supported' },
        { status: 400 },
      );
    }

    const token = Deno.env.get('APIFY_TOKEN');
    if (!token) {
      return Response.json({ success: false, error: 'APIFY_TOKEN not configured' }, { status: 500 });
    }

    // Level 1: scrape caption via Apify
    const scraped = await scrapeWithApify(platform, url, token);

    if (scraped.error) {
      return Response.json({ success: false, level: 1, error: scraped.error });
    }

    const { caption, videoUrl, thumbnailUrl } = scraped;

    if (!caption?.trim()) {
      return Response.json({
        success: false,
        level: 1,
        videoUrl,
        thumbnailUrl,
        error: 'No caption or text found — video analysis may be needed',
      });
    }

    // Level 1 extraction: Claude analyses the caption with the Master Muse prompt
    const extractionPrompt = `${MASTER_MUSE_PROMPT}\n\nCONTENT TO ANALYSE:\n${caption}`;

    const extracted = await base44.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          tutorial_title: { type: 'string' },
          category: { type: 'string' },
          read_time: { type: 'string' },
          materials: { type: 'array', items: { type: 'string' } },
          products_identified: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                brand: { type: 'string' },
                product_name: { type: 'string' },
                subcategory: { type: 'string' },
              },
            },
          },
          the_ritual: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'number' },
                instruction: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({
      success: true,
      level: 1,
      caption,
      videoUrl,
      thumbnailUrl,
      data: extracted,
    });
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || 'Internal error' }, { status: 500 });
  }
}
