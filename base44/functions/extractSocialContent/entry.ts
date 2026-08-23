import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

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

const GEMINI_VISION_PROMPT = `You are a luxury beauty product detection expert. Watch this video carefully and identify every beauty product shown — especially those appearing as on-screen text overlays, name cards, or graphics burned into the video (e.g. "Rare Beauty Soft Pinch Blush in Serene", "Charlotte Tilbury 4.5 Medium").

RULES:
1. Tone: Write "the_ritual" instructions in an elegant, editorial tone (e.g., "Sweep a satin-finish blush across the cheekbones..." not "Apply blush").
2. Subcategories: For makeup products, use ONLY these exact strings: "face", "cheek", "lips", "eyes", "sets and palettes", or "makeup tools".
3. Materials: List generic product types (e.g., "Tinted lip oil") not specific brand names.
4. Read all visible on-screen text carefully — product names, shade names, and brand names may flash briefly.

Return ONLY valid JSON in this exact format:
{
  "tutorial_title": "Chic 2-to-3 word title",
  "category": "Makeup, Skincare, Hair, or Wellness",
  "read_time": "Estimated time in minutes",
  "materials": ["List of generic product types"],
  "products_identified": [{"brand": "Brand Name", "product_name": "Specific Product Name", "subcategory": "exact allowed string"}],
  "the_ritual": [{"step": 1, "instruction": "Detailed, elegant instruction."}]
}

If no beauty products are identifiable, return products_identified as an empty array.`;

const APIFY_ACTORS = {
  instagram: 'apify~instagram-post-scraper',
  tiktok: 'clockworks~free-tiktok-scraper',
};

const SCRAPE_TIMEOUT_MS = 30000;
const GEMINI_VIDEO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

function detectPlatform(url: string): 'instagram' | 'tiktok' | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'instagram';
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'tiktok';
  } catch {}
  return null;
}

// Follow redirects to resolve short URLs (e.g. vm.tiktok.com → www.tiktok.com/...)
async function expandShortUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    clearTimeout(timer);
    return res.url || url;
  } catch {
    return url;
  }
}

// Returns false when caption is empty or only hashtags/mentions with no real words
function hasSubstantiveContent(caption: string): boolean {
  if (!caption?.trim()) return false;
  const words = caption.trim().split(/\s+/);
  const meaningful = words.filter(w => !w.startsWith('#') && !w.startsWith('@') && w.length > 2);
  return meaningful.length >= 3;
}

// Encode video bytes to base64 in chunks to avoid call-stack overflow on large buffers
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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

// Level 3: download the video and send to Gemini 1.5 Flash for on-screen text + product detection
async function analyzeVideoWithGemini(
  videoUrl: string,
  apiKey: string,
): Promise<{ data?: any; error?: string }> {
  // Download the video
  const dlController = new AbortController();
  const dlTimer = setTimeout(() => dlController.abort(), 20000);
  let videoBuffer: ArrayBuffer;
  try {
    const dlRes = await fetch(videoUrl, { signal: dlController.signal });
    clearTimeout(dlTimer);
    if (!dlRes.ok) return { error: `Video download failed (HTTP ${dlRes.status})` };
    videoBuffer = await dlRes.arrayBuffer();
  } catch (e: any) {
    clearTimeout(dlTimer);
    return { error: `Video download failed: ${e?.message || 'timeout'}` };
  }

  if (videoBuffer.byteLength > GEMINI_VIDEO_MAX_BYTES) {
    return { error: 'Video file is too large for frame analysis' };
  }

  const base64Data = uint8ArrayToBase64(new Uint8Array(videoBuffer));

  // Call Gemini 1.5 Flash with inline video data
  const gemController = new AbortController();
  const gemTimer = setTimeout(() => gemController.abort(), 50000);
  try {
    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'video/mp4', data: base64Data } },
              { text: GEMINI_VISION_PROMPT },
            ],
          }],
          generationConfig: { temperature: 0.1 },
        }),
        signal: gemController.signal,
      },
    );
    clearTimeout(gemTimer);

    if (!gemRes.ok) {
      const errText = await gemRes.text();
      return { error: `Gemini API error ${gemRes.status}: ${errText.slice(0, 200)}` };
    }

    const gemData = await gemRes.json();
    const rawText: string = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if Gemini wraps the JSON
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return { data: parsed };
  } catch (e: any) {
    clearTimeout(gemTimer);
    return { error: e?.message || 'Gemini analysis failed' };
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

    // Expand short links (e.g. vm.tiktok.com/ZN8xxx → www.tiktok.com/@user/video/...)
    const resolvedUrl = await expandShortUrl(url);
    const platform = detectPlatform(resolvedUrl) ?? detectPlatform(url);

    if (!platform) {
      return Response.json(
        { success: false, error: 'Unsupported platform — only Instagram and TikTok are supported' },
        { status: 400 },
      );
    }

    const token = secrets.get('APIFY_TOKEN');
    if (!token) {
      return Response.json({ success: false, error: 'APIFY_TOKEN not configured' }, { status: 500 });
    }

    // Level 1: scrape caption via Apify (use resolved URL)
    const scraped = await scrapeWithApify(platform, resolvedUrl, token);

    if (scraped.error) {
      return Response.json({ success: false, level: 1, error: scraped.error });
    }

    const { caption, videoUrl, thumbnailUrl } = scraped;

    // Helper: attempt Level 3 Gemini video analysis
    const tryLevel3 = async (): Promise<Response | null> => {
      if (!videoUrl) return null;
      const geminiKey = secrets.get('GEMINI_API_KEY');
      if (!geminiKey) return null;
      const result = await analyzeVideoWithGemini(videoUrl, geminiKey);
      if (result.error || !result.data) return null;
      return Response.json({
        success: true,
        level: 3,
        caption: caption || '',
        videoUrl,
        thumbnailUrl,
        data: result.data,
      });
    };

    // No caption at all — go straight to Level 3
    if (!caption?.trim()) {
      const level3 = await tryLevel3();
      if (level3) return level3;
      return Response.json({
        success: false,
        level: 1,
        videoUrl,
        thumbnailUrl,
        error: 'No caption found in this post — video analysis may be needed',
      });
    }

    // Caption is only hashtags/mentions — try Level 3 before giving up
    if (!hasSubstantiveContent(caption)) {
      const level3 = await tryLevel3();
      if (level3) return level3;
      return Response.json({
        success: false,
        level: 1,
        videoUrl,
        thumbnailUrl,
        caption,
        error: "This post's caption only contains hashtags. Try a post where product names are written in the description, or paste the product names directly.",
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
