// Extracts tweet text from a Twitter/X URL using the public oEmbed API.
// No API key required — publish.twitter.com/oembed is a free, public endpoint
// that returns the tweet HTML including the full text content.
// Handles twitter.com, x.com, and t.co short links (redirect-followed by oEmbed).

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g,  ' ')
    .replace(/&#\d+;/g, ' ');
}

function extractTweetText(html: string): string | null {
  // The oEmbed HTML looks like:
  // <blockquote class="twitter-tweet"><p lang="en" dir="ltr">TWEET TEXT...</p>— @handle <a ...>date</a></blockquote>
  const pMatch = html.match(/<p[^>]*lang[^>]*>([\s\S]*?)<\/p>/i)
               || html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!pMatch) return null;
  // Strip all HTML tags, decode entities, collapse whitespace
  const text = decodeHtmlEntities(
    pMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
  return text.length > 3 ? text : null;
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractTwitterContent] url:', url);

    // ── PRIMARY: Twitter/X oEmbed API (free, public, no auth) ────────────────
    const oembedUrl =
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`;

    try {
      const res = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        const html = data?.html || '';
        const tweetText = extractTweetText(html);
        const authorName = data?.author_name || '';

        if (tweetText) {
          // Prefix with author name for LLM context
          const caption = authorName ? `${authorName}: ${tweetText}` : tweetText;
          console.log('[extractTwitterContent] oEmbed caption:', caption.slice(0, 200));
          return Response.json({
            success: true,
            caption,
            thumbnailUrl: null,
            platform: 'twitter',
          });
        }
      } else {
        console.error('[extractTwitterContent] oEmbed HTTP error:', res.status);
      }
    } catch (err) {
      console.error('[extractTwitterContent] oEmbed error:', err?.message || String(err));
    }

    // ── FALLBACK: Try nitter or raw og: meta tags ────────────────────────────
    // Attempt to fetch og: meta tags directly from the tweet page with a bot UA
    const tweetUrl = url.replace('x.com', 'twitter.com');
    try {
      const pageRes = await fetch(tweetUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Twitterbot/1.0',
          'Accept': 'text/html',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const ogDesc = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']{10,})["']/i)
                    || html.match(/<meta\s+content=["']([^"']{10,})["']\s+(?:property|name)=["']og:description["']/i);
        if (ogDesc?.[1]) {
          const caption = decodeHtmlEntities(ogDesc[1].trim());
          console.log('[extractTwitterContent] og:description caption:', caption.slice(0, 200));
          return Response.json({
            success: true,
            caption,
            thumbnailUrl: null,
            platform: 'twitter',
          });
        }
      }
    } catch (err) {
      console.error('[extractTwitterContent] page scrape error:', err?.message || String(err));
    }

    console.error('[extractTwitterContent] all methods failed for:', url);
    return Response.json({
      success: false,
      error: 'Could not read this tweet. It may be from a private account or the content may have been removed.',
    });
  } catch (error) {
    console.error('[extractTwitterContent] top-level error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
