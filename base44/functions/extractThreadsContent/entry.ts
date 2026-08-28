// Extracts post text from a Threads URL via og: meta tag scraping.
// No API key required — Threads serves og:description with the post text
// for public posts when fetched with a realistic User-Agent.
// URL format: threads.net/@username/post/POSTID

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function metaContent(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i'
  );
  return html.match(re2)?.[1] || null;
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractThreadsContent] url:', url);

    let html: string;
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(14000),
      });
      if (!res.ok) {
        console.error('[extractThreadsContent] HTTP error:', res.status);
        return Response.json({ success: false, error: `Threads returned ${res.status}.` });
      }
      html = await res.text();
    } catch (err) {
      console.error('[extractThreadsContent] fetch error:', err?.message || String(err));
      return Response.json({ success: false, error: 'Could not reach Threads.' });
    }

    console.log('[extractThreadsContent] page size:', html.length);

    // ── METHOD A: og: meta tags ──────────────────────────────────────────────
    const ogTitle       = metaContent(html, 'og:title');
    const ogDescription = metaContent(html, 'og:description');
    const ogImage       = metaContent(html, 'og:image');

    if (ogDescription && ogDescription.length > 5) {
      const caption = [ogTitle, ogDescription].filter(Boolean).join('\n\n');
      console.log('[extractThreadsContent] og: caption:', caption.slice(0, 200));
      return Response.json({
        success: true,
        caption,
        thumbnailUrl: ogImage || null,
        platform: 'threads',
      });
    }

    // ── METHOD B: JSON-LD ────────────────────────────────────────────────────
    const ldMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (ldMatches) {
      for (const ldBlock of ldMatches) {
        const jsonStr = ldBlock.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
          const ld = JSON.parse(jsonStr);
          const desc = ld?.articleBody || ld?.description || (Array.isArray(ld) ? ld[0]?.description : null);
          if (desc && desc.length > 5) {
            const thumb = ld?.image?.url || ld?.image || null;
            console.log('[extractThreadsContent] ld+json caption:', desc.slice(0, 200));
            return Response.json({
              success: true,
              caption: desc,
              thumbnailUrl: typeof thumb === 'string' ? thumb : null,
              platform: 'threads',
            });
          }
        } catch {}
      }
    }

    console.error('[extractThreadsContent] no caption found');
    return Response.json({
      success: false,
      error: 'Could not read this Thread — the post may be private or require a login.',
    });
  } catch (error) {
    console.error('[extractThreadsContent] error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
