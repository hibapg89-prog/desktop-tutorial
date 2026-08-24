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
const WHISPER_MAX_BYTES   = 25 * 1024 * 1024; // 25 MB — OpenAI Whisper hard limit
const GEMINI_VIDEO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB — Gemini inline video limit
const GEMINI_IMAGE_MAX_BYTES = 5  * 1024 * 1024; // 5 MB  — per image
const MIN_JPEG_BYTES = 5000; // Ignore embedded frames smaller than this

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

// Returns true when text has more than 15 non-whitespace characters.
// Intentionally permissive — TikTok captions list products as "@Brand product name"
// and we must NOT strip @-mentions before sending to the LLM.
function hasSubstantiveContent(text: string): boolean {
  return (text?.trim()?.length ?? 0) >= 15;
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
// Social-platform MP4s commonly embed cover art and preview frames in container metadata.
function extractEmbeddedJpegs(buffer: Uint8Array, maxCount = 5): Uint8Array[] {
  const frames: Uint8Array[] = [];
  let i = 0;
  while (i < buffer.length - 2 && frames.length < maxCount) {
    if (buffer[i] === 0xFF && buffer[i + 1] === 0xD8 && buffer[i + 2] === 0xFF) {
      let j = i + 3;
      let found = false;
      while (j < buffer.length - 1) {
        if (buffer[j] === 0xFF && buffer[j + 1] === 0xD9) {
          const jpeg = buffer.slice(i, j + 2);
          if (jpeg.length >= MIN_JPEG_BYTES) frames.push(jpeg);
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

// Download URL → raw ArrayBuffer with size guard
async function downloadBuffer(
  url: string,
  maxBytes: number,
  headers: Record<string, string> = {},
  timeoutMs = 20000,
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

// ── Whisper transcription ─────────────────────────────────────────────────────

// Send a video/audio buffer to OpenAI Whisper and return the text transcript.
// Whisper accepts MP4 directly and strips the audio internally.
async function transcribeWithWhisper(
  buffer: ArrayBuffer,
  apiKey: string,
  timeoutMs = 60000,
): Promise<{ transcript?: string; error?: string }> {
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'video/mp4' }), 'audio.mp4');
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'text');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text();
      return { error: `Whisper API ${res.status}: ${errText.slice(0, 300)}` };
    }
    const transcript = (await res.text()).trim();
    return { transcript };
  } catch (e: any) {
    clearTimeout(timer);
    return { error: e?.message || 'Whisper call timed out' };
  }
}

// ── Gemini vision ─────────────────────────────────────────────────────────────

// Call Gemini 1.5 Flash with one or more inline image/video parts + prompt text
async function callGeminiWithParts(
  parts: Array<{ data: string; mimeType: string }>,
  apiKey: string,
  timeoutMs = 30000,
): Promise<{ data?: any; error?: string }> {
  const contentParts = [
    ...parts.map(p => ({ inlineData: { mimeType: p.mimeType, data: p.data } })),
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
          contents: [{ parts: contentParts }],
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

// ── Gemini text extraction ────────────────────────────────────────────────────

// Call Gemini 1.5 Flash with a text-only prompt and parse the JSON response.
async function extractFromTextViaGemini(
  prompt: string,
  apiKey: string,
  timeoutMs = 30000,
): Promise<{ data?: any; rawResponse?: string; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    if (!res.ok) {
      const errText = await res.text();
      return { error: `Gemini text API ${res.status}: ${errText.slice(0, 300)}` };
    }
    const gemData = await res.json();
    const rawText: string = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!cleaned) {
      return { error: 'Gemini returned empty text', rawResponse: rawText };
    }
    try {
      return { data: JSON.parse(cleaned), rawResponse: rawText };
    } catch (parseErr: any) {
      return { error: `JSON parse failed: ${parseErr.message}`, rawResponse: rawText };
    }
  } catch (e: any) {
    clearTimeout(timer);
    return { error: e?.message || 'Gemini text call timed out' };
  }
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
    // Dump the full raw scraper output so we can verify field names
    const rawDump = JSON.stringify(item, null, 2);
    console.log(`[Apify] Raw scraper output (first 4000 chars):\n${rawDump.slice(0, 4000)}`);

    const caption = item.caption || item.text || item.description || item.videoDescription || item.alt || item.body || '';
    const videoUrl: string | null = item.videoUrl || item.playAddress || item.downloadAddr || item.video?.playAddr || item.videoLink || null;
    const thumbnailUrl: string | null = item.displayUrl || item.coverUrl || item.thumbnailUrl || item.video?.cover || item.cover || item.previewUrl || null;

    console.log(`[Apify] caption="${caption.slice(0, 200)}" | videoUrl=${!!videoUrl} | thumbnailUrl=${!!thumbnailUrl}`);
    return { caption, videoUrl, thumbnailUrl };
  } catch (e: any) {
    clearTimeout(timeout);
    return { error: e?.message || 'Scrape failed' };
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { url } = body || {};

    if (!url) {
      return Response.json({ success: false, error: 'No URL provided' }, { status: 400 });
    }

    console.log(`[Pipeline] ── New scan: ${url}`);
    // Log which secrets are present so we know immediately if API keys are missing
    console.log(`[Pipeline] Secrets present: APIFY_TOKEN=${!!secrets.get('APIFY_TOKEN')} | GEMINI_API_KEY=${!!secrets.get('GEMINI_API_KEY')} | GROQ_API_KEY=${!!secrets.get('GROQ_API_KEY')}`);

    // ── Step 1: Expand short links ────────────────────────────────────────────
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
      return Response.json({ success: false, error: 'APIFY_TOKEN not configured' });
    }

    // ── Step 2: Scrape via Apify ──────────────────────────────────────────────
    const scraped = await scrapeWithApify(platform, resolvedUrl, token);
    if (scraped.error) {
      console.log(`[Pipeline] Apify error: ${scraped.error}`);
      return Response.json({ success: false, level: 1, error: scraped.error });
    }

    const { caption, videoUrl, thumbnailUrl } = scraped;

    // Shared video buffer — downloaded once for both Level 2 (Whisper) and Level 3 (Gemini).
    // null = not yet attempted; false = attempted and failed; ArrayBuffer = ready.
    let _videoBuffer: ArrayBuffer | false | null = null;
    let _videoError: string | null = null;

    const getVideoBuffer = async (): Promise<ArrayBuffer | null> => {
      if (_videoBuffer !== null) return _videoBuffer || null;
      if (!videoUrl) {
        _videoBuffer = false;
        _videoError = 'No video URL';
        return null;
      }
      console.log(`[Video] Downloading: ${videoUrl.slice(0, 80)}…`);
      const headers = platform === 'tiktok' ? TIKTOK_DOWNLOAD_HEADERS : {};
      // Use Whisper's larger limit so the same buffer serves both L2 and L3
      const result = await downloadBuffer(videoUrl, WHISPER_MAX_BYTES, headers, 20000);
      if (result.data) {
        const mb = Math.round(result.data.byteLength / 1024 / 1024 * 10) / 10;
        console.log(`[Video] Downloaded (${mb}MB)`);
        _videoBuffer = result.data;
        return result.data;
      }
      console.log(`[Video] Download failed: ${result.error}`);
      _videoBuffer = false;
      _videoError = result.error || 'Download failed';
      return null;
    };

    // ── Run Gemini text extraction on any text content ────────────────────────
    const extractFromText = async (
      text: string,
      label: string,
    ): Promise<{ data?: any; error?: string }> => {
      const geminiKey = secrets.get('GEMINI_API_KEY');
      if (!geminiKey) {
        return { error: 'GEMINI_API_KEY not configured' };
      }
      const prompt = `${MASTER_MUSE_PROMPT}\n\nCONTENT TO ANALYSE (${label}):\n${text}`;
      console.log(`[Extract/${label}] Calling Gemini 1.5 Flash (text length: ${text.length} chars)…`);
      const result = await extractFromTextViaGemini(prompt, geminiKey, 30000);
      if (result.rawResponse) {
        console.log(`[Extract/${label}] Raw response (first 300): "${result.rawResponse.slice(0, 300)}"`);
      }
      if (result.error) {
        console.log(`[Extract/${label}] Error: ${result.error}`);
        return { error: result.error };
      }
      const productCount = result.data?.products_identified?.length ?? 0;
      if (productCount === 0) {
        console.log(`[Extract/${label}] WARNING: 0 products in parsed result. Full data: ${JSON.stringify(result.data)}`);
      }
      return { data: result.data };
    };

    // ── LEVEL 2 — Audio transcription via OpenAI Whisper ─────────────────────
    const tryLevel2 = async (): Promise<{ response?: Response; errors: string[]; productCount: number }> => {
      const errors: string[] = [];
      console.log('[L2] ── Starting Level 2: audio transcription');

      const openaiKey = secrets.get('GROQ_API_KEY');
      if (!openaiKey) {
        const msg = 'GROQ_API_KEY not configured';
        console.log(`[L2] ${msg}`);
        errors.push(msg);
        return { errors, productCount: 0 };
      }

      const buf = await getVideoBuffer();
      if (!buf) {
        const msg = _videoError || 'No video buffer';
        console.log(`[L2] Cannot transcribe — ${msg}`);
        errors.push(msg);
        return { errors, productCount: 0 };
      }

      console.log(`[L2] Sending ${Math.round(buf.byteLength / 1024 / 1024 * 10) / 10}MB to Groq Whisper…`);
      const whisper = await transcribeWithWhisper(buf, openaiKey, 60000);

      if (!whisper.transcript) {
        console.log(`[L2] Whisper failed: ${whisper.error}`);
        errors.push(`Whisper: ${whisper.error}`);
        return { errors, productCount: 0 };
      }

      const transcript = whisper.transcript;
      console.log(`[L2] Transcript (${transcript.split(/\s+/).length} words): "${transcript.slice(0, 200)}…"`);

      if (!transcript.trim()) {
        const msg = 'Whisper returned an empty transcript';
        console.log(`[L2] ${msg}`);
        errors.push(msg);
        return { errors, productCount: 0 };
      }

      console.log('[L2] Extracting products from transcript via Gemini…');
      const extraction = await extractFromText(transcript, 'VIDEO TRANSCRIPT');

      if (extraction.error) {
        console.log(`[L2] Extraction error: ${extraction.error}`);
        errors.push(`Extraction: ${extraction.error}`);
        return { errors, productCount: 0 };
      }

      const productCount = extraction.data?.products_identified?.length ?? 0;
      console.log(`[L2] Extraction complete — ${productCount} product(s) found in transcript`);

      // Always return a response + productCount — routing decides whether to escalate to L3
      return {
        response: Response.json({
          success: true,
          level: 2,
          transcript,
          caption: caption || '',
          videoUrl,
          thumbnailUrl,
          data: extraction.data,
        }),
        errors,
        productCount,
      };
    };

    // ── LEVEL 3 — Gemini 1.5 Flash visual analysis ────────────────────────────
    // Priority: thumbnail image → extracted keyframes → full inline video
    const tryLevel3 = async (): Promise<{ response?: Response; errors: string[] }> => {
      const errors: string[] = [];
      console.log('[L3] ── Starting Level 3: Gemini vision analysis');

      const geminiKey = secrets.get('GEMINI_API_KEY');
      if (!geminiKey) {
        const msg = 'GEMINI_API_KEY not configured';
        console.log(`[L3] ${msg}`);
        errors.push(msg);
        return { errors };
      }

      const imageParts: Array<{ data: string; mimeType: string }> = [];

      // Step 3a: Thumbnail (cover image — fast, always try first)
      if (thumbnailUrl) {
        console.log(`[L3] Step 3a — thumbnail: ${thumbnailUrl.slice(0, 80)}…`);
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
        console.log('[L3] No thumbnail URL');
        errors.push('No thumbnail URL');
      }

      // Step 3b: Extract keyframes from the shared video buffer
      let videoBase64ForGemini: string | null = null;
      const buf = await getVideoBuffer();

      if (buf) {
        const raw = new Uint8Array(buf);
        console.log('[L3] Step 3b — scanning video binary for embedded JPEG keyframes…');
        const frames = extractEmbeddedJpegs(raw, 4);
        console.log(`[L3] Found ${frames.length} embedded JPEG frame(s)`);

        if (frames.length >= 2) {
          for (let i = 0; i < frames.length; i++) {
            const b64 = uint8ArrayToBase64(frames[i]);
            const kb = Math.round(b64.length * 0.75 / 1024);
            console.log(`[L3]   Frame ${i + 1}: ${kb}KB`);
            imageParts.push({ data: b64, mimeType: 'image/jpeg' });
          }
        } else {
          console.log('[L3] Fewer than 2 embedded frames — will use full video inline as fallback');
          if (buf.byteLength <= GEMINI_VIDEO_MAX_BYTES) {
            videoBase64ForGemini = uint8ArrayToBase64(raw);
          } else {
            const mb = Math.round(buf.byteLength / 1024 / 1024 * 10) / 10;
            console.log(`[L3] Video (${mb}MB) exceeds Gemini 15MB inline limit — skipping video fallback`);
            errors.push(`Video too large for Gemini inline (${mb}MB)`);
          }
        }
      } else {
        console.log(`[L3] Video not available for frame extraction (${_videoError})`);
        errors.push(`Video: ${_videoError}`);
      }

      // Step 3c: Call Gemini with collected image frames
      if (imageParts.length > 0) {
        console.log(`[L3] Step 3c — calling Gemini 1.5 Flash with ${imageParts.length} image frame(s)…`);
        const result = await callGeminiWithParts(imageParts, geminiKey, 30000);
        if (result.data) {
          const count = result.data.products_identified?.length ?? 0;
          console.log(`[L3] Gemini frames success — ${count} product(s) identified`);
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
        console.log(`[L3] Gemini frames failed: ${result.error}`);
        errors.push(`Gemini frames: ${result.error}`);
      }

      // Step 3d: Last resort — inline full video (≤ 15MB only)
      if (videoBase64ForGemini) {
        console.log('[L3] Step 3d — calling Gemini 1.5 Flash with full inline video…');
        const result = await callGeminiWithParts(
          [{ data: videoBase64ForGemini, mimeType: 'video/mp4' }],
          geminiKey,
          30000,
        );
        if (result.data) {
          const count = result.data.products_identified?.length ?? 0;
          console.log(`[L3] Gemini video success — ${count} product(s) identified`);
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
        console.log(`[L3] Gemini video failed: ${result.error}`);
        errors.push(`Gemini video: ${result.error}`);
      }

      console.log(`[L3] All attempts failed: ${errors.join(' | ')}`);
      return { errors };
    };

    // ── Routing ───────────────────────────────────────────────────────────────

    // LEVEL 1: Caption has substantive text — extract directly with Gemini
    if (hasSubstantiveContent(caption || '')) {
      console.log('[Pipeline] Caption has product text — running Level 1 extraction');
      const extraction = await extractFromText(caption!, 'CAPTION');

      if (!extraction.error) {
        const productCount = extraction.data?.products_identified?.length ?? 0;
        console.log(`[Pipeline] Level 1 complete — ${productCount} product(s) extracted`);
        if (productCount === 0) {
          console.log('[Pipeline] Level 1 returned 0 products — escalating to L2/L3 for visual analysis');
        } else {
          return Response.json({
            success: true,
            level: 1,
            caption,
            videoUrl,
            thumbnailUrl,
            data: extraction.data,
          });
        }
      } else {
        console.log(`[Pipeline] Level 1 extraction error: ${extraction.error} — falling through to L2/L3`);
      }
    } else {
      console.log(`[Pipeline] Caption "${(caption || '').slice(0, 60)}" has no product text — skipping Level 1`);
    }

    // LEVEL 2: Audio transcription (handles spoken product names, foreign-language voiceover, etc.)
    const { response: level2Response, errors: l2errors, productCount: l2ProductCount } = await tryLevel2();
    if (level2Response && l2ProductCount > 0) return level2Response;
    const l2Reason = level2Response
      ? `transcript yielded 0 products (background music / no spoken names)`
      : l2errors.join('; ');
    console.log(`[Pipeline] Level 2 did not yield products (${l2Reason}) — escalating to Level 3`);

    // LEVEL 3: Visual analysis — keyframes + Gemini vision
    const { response: level3Response, errors: l3errors } = await tryLevel3();
    if (level3Response) return level3Response;

    // All three levels exhausted
    const allErrors = [...l2errors, ...l3errors];
    console.log(`[Pipeline] All levels failed: ${allErrors.join(' | ')}`);

    return Response.json({
      success: false,
      level: 3,
      videoUrl,
      thumbnailUrl,
      caption: caption || '',
      error: `Could not identify products. L2: ${l2errors.join('; ')} | L3: ${l3errors.join('; ')}`,
    });

  } catch (error: any) {
    console.log(`[Pipeline] Unhandled error: ${error?.message}\n${error?.stack || ''}`);
    return Response.json({ success: false, error: error?.message || 'Internal error', stack: error?.stack });
  }
}
