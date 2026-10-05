import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const FETCH_TIMEOUT_MS = 8000;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { url } = body || {};

    if (!url) {
      return Response.json({ image_url: null, error: 'No URL provided' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return Response.json({ image_url: null, error: 'Invalid URL' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let html = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return Response.json({ image_url: null, error: `HTTP ${response.status}` });
      }

      const reader = response.body?.getReader();
      if (!reader) {
        return Response.json({ image_url: null, error: 'No response body' });
      }

      let bytes = 0;
      const decoder = new TextDecoder();
      const chunks = [];
      while (bytes < 50000) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
        bytes += value.length;
      }
      reader.cancel();
      html = chunks.join('');
    } catch (e) {
      clearTimeout(timeout);
      return Response.json({ image_url: null, error: e.message || 'Fetch failed' });
    }

    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        const imageUrl = match[1].trim();
        if (imageUrl.startsWith('http')) {
          return Response.json({ image_url: imageUrl });
        }
      }
    }

    return Response.json({ image_url: null, error: 'No OG image found in page' });
  } catch (error) {
    return Response.json({ image_url: null, error: error.message }, { status: 500 });
  }
}
