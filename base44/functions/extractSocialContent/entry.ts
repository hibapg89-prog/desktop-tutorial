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

const GEMINI_VISION_PROMPT = `You are a luxury beauty product detection expert. Analyze these video frames carefully and identify every beauty product shown — especially those appearing as on-screen text overlays, name cards, or graphics burned into the video (e.g. "Rare Beauty Soft Pinch Blush in Serene", "Charlotte Tilbury 4.5 Medium").

RULES:
1. Tone: Write "the_ritual" instructions in an elegant, editorial tone (e.g., "Sweep a satin-finish blush across the cheekbones..." not "Apply blush").
2. Subcategories: For makeup products, use ONLY these exact strings: "face", "cheek", "lips", "eyes", "sets and palettes", or "makeup tools".
3. Materials: List generic product types (e.g., "Tinted lip oil") not specific brand names.
4. Read all visible on-screen text carefully — product names, shade names, and brand names may flash briefly across frames.

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
const GEMINI_IMAGE_MAX_BYTES = 5 * 1024 * 1024;  // 5 MB
const MIN_JPEG_BYTES = 5000; // Ignore thumbnails smaller than this (corrupt/tiny icons)

// Mobile UA + Referer to bypass TikTok CDN restrictions
const TIKTOK_DOWNLOAD_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  'Referer': 'https://www.tiktok.com/',
  'Accept': '*/*',
};

// ── Platform detection ────────────────────────────────────────────────────────

function detectPlatform(url: string): 'instagram' | 'tiktok' | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) return 'instagram';
    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) return 'tiktok';
  } catch {}
  return null;
}

// Resolve vm.tiktok.com/ZN8xxx → https://www.tiktok.com/@user/video/...
async function expandShortUrl(url: string): Promise<string> {
  try {
    console.log(`[URL] Expanding short URL: ${url}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
    clearTimeout(timer);
    const expanded = res.url || url;
    if (expanded !== url) console.log(`[URL] Resolved to: ${expanded}`);
    return expanded;
  } catch (e: any) {
    console.log(`[URL] Expand failed (${e?.message}) — using original`);
    return url;
  }
}

// Returns false when caption has no real words (only hashtags / mentions)
function hasSubstantiveContent(caption: string): boolean {
  if (!caption?.trim()) return false;
  const words = caption.trim().split(/\s+/);
  const meaningful = words.filter(w => !w.startsWith('#') && !w.startsWith('@') && w.length > 2);
  return meaningful.length >= 3;
}

// ── Binary helpers ────────────────────────────────────────────────────────────

// Chunked base64 encode to avoid call-stack overflow on large buffers
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Scan an MP4 binary for embedded JPEG frames (SOI = 0xFF 0xD8 0xFF, EOI = 0xFF 0xD9).
// Many social-platform videos embed cover art and preview frames in container metadata.
function extractEmbeddedJpegs(buffer: Uint8Array, maxCount = 5): Uint8Array[] {
  const frames: Uint8Array[] = [];
  let i = 0;
  while (i < buffer.length - 2 && frames.length < maxCount) {
    // JPEG Start-Of-Image: FF D8 FF
    if (buffer[i] === 0xFF && buffer[i + 1] === 0xD8 && buffer[i + 2] === 0xFF) {
      let j = i + 3;
      let found = false;
      while (j < buffer.length - 1) {
        // JPEG End-Of-Image: FF D9
        if (buffer[j] === 0xFF && buffer[j + 1] === 0xD9) {
          const jpeg = buffer.slice(i, j + 2);
          if (jpeg.length >= MIN_JPEG_BYTES) {
            frames.push(jpeg);
          }
          i = j + 2;
          found = true;
          break;
        }
        j++;
      }
      if (!found) break;
    } else {
      i++;
    }
  }
  return frames;
}

// ── Network helpers ───────────────────────────────────────────────────────────

// Download URL → raw ArrayBuffer, with size guard
async function downloadBuffer(
  url: string,
  maxBytes: number,
  headers: Record<string, string> = {},
  timeoutMs = 15000,
): Promise<{ data?: ArrayBuffer; contentType?: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const data = await res.arrayBuffer();
    if (data.byteLength > maxBytes) {
      return { error: `${Math.round(data.byteLength / 1024 / 1024)}MB exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit` };
    }
    const contentType = res.headers.get('content-type')?.split(';')[0] || 'application/octet-stream';
    return { data, contentType };
  } catch (e: any) {
    clearTimeout(timer);
    return { error: e?.message || 'Download timed out' };
  }
}

// Download URL → base64 string
async function downloadBase64(
  url: string,
  maxBytes: number,
  headers: Record<string, string> = {},
  timeoutMs = 15000,
): Promise<{ data?: string; mimeType?: string; error?: string }> {
  const result = await downloadBuffer(url, maxBytes, headers, timeoutMs);
  if (!result.data) return { error: result.error };
  return { data: uint8ArrayToBase64(new Uint8Array(result.data)), mimeType: result.contentType };
}

// ── Gemini calls ──────────────────────────────────────────────────────────────

// Call Gemini 1.5 Flash with an array of inline image parts + prompt text
async function callGeminiWithImages(
  imageParts: Array<{ data: string; mimeType: string }>,
  apiKey: string,
  timeoutMs = 30000,
): Promise<{ data?: any; error?: string }> {
  const parts = [
    ...imageParts.map(p => ({ inlineData: { mimeType: p.mimeType, data: p.data } })),
    { text: GEMINI_VISION_PROMPT },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.1 },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      return { error: `Gemini API ${res.status}: ${errText.slice(0, 300)}` };
    }

    const gemData = await res.json();
    const rawText: string = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return { data: JSON.parse(cleaned) };
  } catch (e: any) {
    clearTimeout(timer);
    return { error: e?.message || 'Gemini call failed' };
  }
}

// Call Gemini 1.5 Flash with a single inline video part
async function callGeminiWithVideo(
  videoBase64: string,
  apiKey: string,
  timeoutMs = 30000,
): Promise<{ data?: any; error?: string }> {
  return callGeminiWithImages([{ data: videoBase64, mimeType: 'video/mp4' }], apiKey, timeoutMs);
}

// ── Apify scraper ─────────────────────────────────────────────────────────────

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

  console.log(`[Apify] Scraping ${platform} post…`);

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

    if (!res.ok) return { error: `Apify HTTP ${res.status}` };

    const items: any[] = await res.json();
    if (!items?.length) return { error: 'No data returned from scraper' };

    const item = items[0];
    const caption = item.caption || item.text || item.description || '';
    const videoUrl: string | null = item.videoUrl || item.playAddress || item.downloadAddr || null;
    const thumbnailUrl: string | null = item.displayUrl || item.coverUrl || item.thumbnailUrl || null;

    console.log(`[Apify] caption="${caption.slice(0, 80)}…" videoUrl=${!!videoUrl} thumbnailUrl=${!!thumbnailUrl}`);
    return { caption, videoUrl, thumbnailUrl };
  } catch (e: any) {
    clearTimeout(timeout);
    return { error: e?.message || 'Scrape failed' };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { url } = body || {};

    if (!url) {
      return Response.json({ success: false, error: 'No URL provided' }, { status: 400 });
    }

    console.log(`[Pipeline] ── New scan request: ${url}`);

    // Step 1: Expand short links (vm.tiktok.com → canonical TikTok URL)
    const resolvedUrl = await expandShortUrl(url);
    const platform = detectPlatform(resolvedUrl) ?? detectPlatform(url);

    if (!platform) {
      return Response.json(
        { success: false, error: 'Unsupported platform — only Instagram and TikTok are supported' },
        { status: 400 },
      );
    }

    console.log(`[Pipeline] Platform: ${platform} | URL: ${resolvedUrl}`);

    const token = secrets.get('APIFY_TOKEN');
    if (!token) {
      return Response.json({ success: false, error: 'APIFY_TOKEN not configured' }, { status: 500 });
    }

    // Step 2: Scrape caption + media URLs via Apify
    const scraped = await scrapeWithApify(platform, resolvedUrl, token);
    if (scraped.error) {
      console.log(`[Pipeline] Apify error: ${scraped.error}`);
      return Response.json({ success: false, level: 1, error: scraped.error });
    }

    const { caption, videoUrl, thumbnailUrl } = scraped;

    // ── Level 3: Gemini vision fallback ──────────────────────────────────────
    // Called when caption has no substantive product text.
    // Strategy: thumbnail + keyframes extracted from video binary → multi-image Gemini.
    // Falls back to full video inline if frame extraction yields < 2 frames.
    const tryLevel3 = async (): Promise<{ response?: Response; errors: string[] }> => {
      const errors: string[] = [];
      console.log('[L3] ── Starting Level 3 vision analysis');

      const geminiKey = secrets.get('GEMINI_API_KEY');
      if (!geminiKey) {
        const msg = 'GEMINI_API_KEY not configured';
        console.log(`[L3] ${msg}`);
        errors.push(msg);
        return { errors };
      }

      const imageParts: Array<{ data: string; mimeType: string }> = [];

      // Step 3a: Download thumbnail (cover frame 0)
      if (thumbnailUrl) {
        console.log(`[L3] Step 3a — Downloading thumbnail: ${thumbnailUrl.slice(0, 80)}…`);
        const thumb = await downloadBase64(thumbnailUrl, GEMINI_IMAGE_MAX_BYTES, {}, 10000);
        if (thumb.data) {
          const kb = Math.round(thumb.data.length * 0.75 / 1024);
          console.log(`[L3] Thumbnail OK (${kb}KB, ${thumb.mimeType})`);
          imageParts.push({ data: thumb.data, mimeType: thumb.mimeType || 'image/jpeg' });
        } else {
          console.log(`[L3] Thumbnail failed: ${thumb.error}`);
          errors.push(`Thumbnail: ${thumb.error}`);
        }
      } else {
        console.log('[L3] No thumbnail URL available');
        errors.push('No thumbnail URL');
      }

      // Step 3b: Download video binary and extract keyframes
      let videoBase64: string | null = null;
      if (videoUrl) {
        const headers = platform === 'tiktok' ? TIKTOK_DOWNLOAD_HEADERS : {};
        console.log(`[L3] Step 3b — Downloading video: ${videoUrl.slice(0, 80)}…`);
        const videoBuf = await downloadBuffer(videoUrl, GEMINI_VIDEO_MAX_BYTES, headers, 15000);

        if (videoBuf.data) {
          const mb = Math.round(videoBuf.data.byteLength / 1024 / 1024 * 10) / 10;
          console.log(`[L3] Video downloaded (${mb}MB) — scanning for embedded JPEG keyframes…`);

          const raw = new Uint8Array(videoBuf.data);
          const frames = extractEmbeddedJpegs(raw, 4);
          console.log(`[L3] Keyframe scan complete — found ${frames.length} embedded JPEG(s)`);

          if (frames.length >= 2) {
            // Enough extracted frames — use them as individual image parts
            for (let i = 0; i < frames.length; i++) {
              const b64 = uint8ArrayToBase64(frames[i]);
              const kb = Math.round(b64.length * 0.75 / 1024);
              console.log(`[L3]   Frame ${i + 1}: ${kb}KB`);
              imageParts.push({ data: b64, mimeType: 'image/jpeg' });
            }
          } else {
            // Too few embedded frames — keep the video for inline fallback
            console.log('[L3] Fewer than 2 keyframes extracted — will use full video as fallback');
            videoBase64 = uint8ArrayToBase64(raw);
          }
        } else {
          console.log(`[L3] Video download failed: ${videoBuf.error}`);
          errors.push(`Video download: ${videoBuf.error}`);
        }
      } else {
        console.log('[L3] No video URL available');
        errors.push('No video URL');
      }

      // Step 3c: Call Gemini with collected image frames
      if (imageParts.length > 0) {
        console.log(`[L3] Step 3c — Calling Gemini 1.5 Flash with ${imageParts.length} image frame(s)…`);
        const result = await callGeminiWithImages(imageParts, geminiKey, 30000);

        if (result.data) {
          const count = result.data.products_identified?.length ?? 0;
          console.log(`[L3] Gemini vision success — ${count} product(s) identified from frames`);
          return {
            response: Response.json({
              success: true,
              level: 3,
              media: 'frames',
              frameCount: imageParts.length,
              caption: caption || '',
              videoUrl,
              thumbnailUrl,
              data: result.data,
            }),
            errors,
          };
        }

        console.log(`[L3] Gemini frames call failed: ${result.error}`);
        errors.push(`Gemini (frames): ${result.error}`);
      }

      // Step 3d: Last resort — inline full video
      if (videoBase64) {
        console.log('[L3] Step 3d — Calling Gemini 1.5 Flash with full inline video…');
        const result = await callGeminiWithVideo(videoBase64, geminiKey, 30000);

        if (result.data) {
          const count = result.data.products_identified?.length ?? 0;
          console.log(`[L3] Gemini video success — ${count} product(s) identified from video`);
          return {
            response: Response.json({
              success: true,
              level: 3,
              media: 'video',
              caption: caption || '',
              videoUrl,
              thumbnailUrl,
              data: result.data,
            }),
            errors,
          };
        }

        console.log(`[L3] Gemini video call failed: ${result.error}`);
        errors.push(`Gemini (video): ${result.error}`);
      }

      console.log(`[L3] All Level 3 attempts failed. Errors: ${errors.join(' | ')}`);
      return { errors };
    };

    // ── Routing logic ─────────────────────────────────────────────────────────

    // No caption at all → go straight to Level 3
    if (!caption?.trim()) {
      console.log('[Pipeline] No caption — routing directly to Level 3 vision');
      const { response: level3, errors } = await tryLevel3();
      if (level3) return level3;
      return Response.json({
        success: false,
        level: 1,
        videoUrl,
        thumbnailUrl,
        error: `No caption found. Vision analysis failed: ${errors.join(' | ')}`,
      });
    }

    // Caption is only hashtags/mentions → try Level 3 before giving up
    if (!hasSubstantiveContent(caption)) {
      console.log('[Pipeline] Caption is hashtag-only — routing to Level 3 vision');
      const { response: level3, errors } = await tryLevel3();
      if (level3) return level3;
      return Response.json({
        success: false,
        level: 1,
        videoUrl,
        thumbnailUrl,
        caption,
        error: `Caption only contains hashtags. Vision analysis failed: ${errors.join(' | ')}`,
      });
    }

    // Level 1: Claude extracts products from the caption text
    console.log('[Pipeline] Caption has substantive content — running Level 1 extraction');
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

    const productCount = extracted?.products_identified?.length ?? 0;
    console.log(`[Pipeline] Level 1 complete — ${productCount} product(s) extracted from caption`);

    return Response.json({
      success: true,
      level: 1,
      caption,
      videoUrl,
      thumbnailUrl,
      data: extracted,
    });

  } catch (error: any) {
    console.log(`[Pipeline] Unhandled error: ${error?.message}`);
    return Response.json({ success: false, error: error?.message || 'Internal error' }, { status: 500 });
  }
}
