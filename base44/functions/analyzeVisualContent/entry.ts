// Analyzes a social media post thumbnail via Gemini vision to identify beauty/luxury products.
// Called when caption text extraction yields no product mentions.
// Requires GEMINI_API_KEY secret.

const GEMINI_API_KEY = secrets.get('GEMINI_API_KEY');

export default async function (req) {
  try {
    const { imageUrl, caption, platform } = await req.json();

    if (!imageUrl) {
      return Response.json({ success: false, error: 'imageUrl is required' }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      console.error('[analyzeVisualContent] GEMINI_API_KEY not set');
      return Response.json({ success: false, error: 'Vision analysis not configured.' });
    }

    console.log('[analyzeVisualContent] platform:', platform, 'imageUrl:', imageUrl.slice(0, 80));

    // Fetch and base64-encode the image
    let base64Image: string;
    let mimeType: string;
    try {
      const imgRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.google.com/',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (!imgRes.ok) {
        console.error('[analyzeVisualContent] image fetch failed:', imgRes.status);
        return Response.json({ success: false, error: `Could not fetch image (${imgRes.status}).` });
      }
      const buffer = await imgRes.arrayBuffer();
      // Chunked base64 encoding to avoid stack overflow on large images
      const bytes = new Uint8Array(buffer);
      const chunkSize = 8192;
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      base64Image = btoa(binary);
      mimeType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
    } catch (err) {
      console.error('[analyzeVisualContent] image fetch error:', err?.message || String(err));
      return Response.json({ success: false, error: 'Could not download image for analysis.' });
    }

    const contextLine = caption ? `\nPost caption context: "${caption.slice(0, 400)}"` : '';

    const prompt = `You are a luxury beauty and cosmetics expert with encyclopedic knowledge of every brand, product line, shade name, and collection worldwide.

Analyze this ${platform || 'social media'} post image carefully.${contextLine}

Identify EVERY beauty or luxury product visible — look for:
• Lipstick, lip gloss, lip liner, lip oil — note the shade name or number if visible on packaging
• Foundation, concealer, powder — note shade name/number on bottle or compact
• Eyeshadow palettes (name the palette), mascara, eyeliner
• Blush, bronzer, highlighter
• Skincare: serums, moisturizers, sunscreens, treatments
• Fragrance bottles — read the name on the bottle
• Nail polish shades
• Any text visible on product packaging — brand names, product names, shade codes

For each product, return:
- brand: the brand name (e.g. "Charlotte Tilbury", "Rare Beauty", "MAC Cosmetics", "La Mer")
- name: the product name/line (e.g. "Pillow Talk", "Soft Pinch Liquid Blush", "Ruby Woo")
- shade: the shade name or number if identifiable, otherwise null
- category: one of: lipstick | lip_gloss | foundation | concealer | eyeshadow | mascara | eyeliner | blush | bronzer | highlighter | skincare | fragrance | nail_polish | other
- confidence: "high" if brand+name clearly visible or identifiable, "medium" if probable from context, "low" if guessing

Return ONLY a valid JSON array. Empty array [] if no beauty/luxury products are visible.

Example format:
[{"brand":"Charlotte Tilbury","name":"Pillow Talk","shade":"Original","category":"lipstick","confidence":"high"},{"brand":"Rare Beauty","name":"Soft Pinch Liquid Blush","shade":"Joy","category":"blush","confidence":"medium"}]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    let geminiData: unknown;
    try {
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: base64Image } },
              { text: prompt },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(35000),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text().catch(() => '');
        console.error('[analyzeVisualContent] Gemini error:', geminiRes.status, errText.slice(0, 200));
        return Response.json({ success: false, error: `Vision model returned ${geminiRes.status}.` });
      }

      geminiData = await geminiRes.json();
    } catch (err) {
      console.error('[analyzeVisualContent] Gemini fetch error:', err?.message || String(err));
      return Response.json({ success: false, error: 'Vision analysis request failed.' });
    }

    const rawText = (geminiData as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[analyzeVisualContent] raw response:', rawText.slice(0, 400));

    // Extract the JSON array from the response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[analyzeVisualContent] no JSON array in response');
      return Response.json({ success: false, error: 'No structured data returned from vision model.' });
    }

    let products: unknown[];
    try {
      products = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('[analyzeVisualContent] JSON parse failed');
      return Response.json({ success: false, error: 'Could not parse vision model response.' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      console.log('[analyzeVisualContent] no products found in image');
      return Response.json({ success: false, error: 'No beauty products identified in this image.' });
    }

    console.log('[analyzeVisualContent] found', products.length, 'products');
    return Response.json({ success: true, products });

  } catch (error) {
    console.error('[analyzeVisualContent] top-level error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
