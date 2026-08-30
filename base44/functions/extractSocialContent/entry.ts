const APIFY_TOKEN = Deno.env.get('APIFY_TOKEN');
const APIFY_BASE = 'https://api.apify.com/v2';

// Resolve short/redirect URLs (vm.tiktok.com, etc.) to their canonical form.
async function resolveUrl(url) {
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    return r.url || url;
  } catch {
    return url;
  }
}

// ── PRIMARY: TikTok oEmbed API (free, no auth, instant) ──────────────────
// Returns the video caption (title), thumbnail, and author name.
// https://developers.tiktok.com/doc/embed-posts
async function tiktokOEmbed(url) {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error('[oEmbed] HTTP error:', res.status);
      return null;
    }
    const data = await res.json();
    if (!data || !data.title) return null;
    return {
      caption: data.title,
      thumbnailUrl: data.thumbnail_url || null,
      canonicalUrl: url,
    };
  } catch (err) {
    console.error('[oEmbed] error:', err?.message || String(err));
    return null;
  }
}

// ── FALLBACK 1: Direct HTML page scrape (free, no auth) ───────────────────
// Fetches the TikTok page HTML and extracts the caption from the embedded
// __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON blob or JSON-LD script tags.
async function scrapeTikTokPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      console.error('[PageScrape] HTTP error:', res.status);
      return null;
    }
    const html = await res.text();

    // Method A: __UNIVERSAL_DATA_FOR_REHYDRATION__ script tag
    const uniMatch = html.match(/<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i);
    if (uniMatch) {
      try {
        const uni = JSON.parse(uniMatch[1]);
        const desc = uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['desc']
                  || uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['description']
                  || uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['videoInfo']?.['desc']
                  || null;
        if (desc) {
          const thumb = uni?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.['itemInfo']?.['itemStruct']?.['video']?.['cover'] || null;
          console.log('[PageScrape] found caption via __UNIVERSAL_DATA__');
          return { caption: desc, thumbnailUrl: thumb, canonicalUrl: url };
        }
      } catch (e) {
        console.error('[PageScrape] JSON parse error:', e?.message);
      }
    }

    // Method B: JSON-LD script tag
    const ldMatches = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (ldMatches) {
      for (const ldMatch of ldMatches) {
        const jsonStr = ldMatch.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        try {
          const ld = JSON.parse(jsonStr);
          const desc = ld?.description || (Array.isArray(ld) ? ld[0]?.description : null);
          if (desc && desc.length > 5) {
            console.log('[PageScrape] found caption via JSON-LD');
            return { caption: desc, thumbnailUrl: ld?.thumbnailUrl || null, canonicalUrl: url };
          }
        } catch {}
      }
    }

    // Method C: meta tags
    const ogDesc = html.match(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (ogDesc?.[1] && ogDesc[1].length > 10) {
      console.log('[PageScrape] found caption via og:description');
      const ogThumb = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      return { caption: ogDesc[1], thumbnailUrl: ogThumb?.[1] || null, canonicalUrl: url };
    }

    console.error('[PageScrape] no caption found in page HTML');
    return null;
  } catch (err) {
    console.error('[PageScrape] error:', err?.message || String(err));
    return null;
  }
}

// ── FALLBACK 2: Apify TikTok scraper (needs APIFY_TOKEN) ───────────────────
async function scrapeTikTok(url) {
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
    if (!res.ok) {
      console.error('[Apify TikTok] HTTP error:', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return {
      caption: item.text || item.desc || item.description || '',
      thumbnailUrl: item.videoMeta?.coverUrl || item.covers?.[0] || item.cover || null,
      canonicalUrl: item.webVideoUrl || item.url || url,
    };
  } catch (err) {
    console.error('[Apify TikTok] error:', err?.message || String(err));
    return null;
  }
}

async function scrapeInstagram(url) {
  // Try og: scrape first (free, no Apify credits)
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    });
    if (res.ok) {
      const html = await res.text();
      const extract = (prop) => {
        const re = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i');
        const alt = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i');
        return html.match(re)?.[1] || html.match(alt)?.[1] || null;
      };
      const description = extract('og:description');
      const image = extract('og:image') || extract('twitter:image');
      if (description && description.length > 5) {
        console.log('[scrapeInstagram] og: scrape succeeded');
        return { caption: description, thumbnailUrl: image };
      }
    }
  } catch (err) {
    console.warn('[scrapeInstagram] og: scrape failed:', err?.message);
  }

  // Apify fallback — actor changed from apify~instagram-post-scraper (deprecated,
  // now requires username field) to apify~instagram-scraper (accepts directUrls).
  if (!APIFY_TOKEN) return null;
  try {
    const res = await fetch(
      `${APIFY_BASE}/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=90&memory=512`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrls: [url], resultsType: 'posts', resultsLimit: 1 }),
        signal: AbortSignal.timeout(100000),
      }
    );
    if (!res.ok) {
      console.error('[Apify Instagram] HTTP error:', res.status);
      return null;
    }
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : null;
    if (!item) return null;
    return {
      caption: item.caption || item.alt || '',
      thumbnailUrl: item.displayUrl || item.thumbnailUrl || null,
    };
  } catch (err) {
    console.error('[Apify Instagram] error:', err?.message || String(err));
    return null;
  }
}

export default async function(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    // Resolve short URLs (vm.tiktok.com → www.tiktok.com/@user/video/...)
    console.log('[extractSocialContent] resolving url:', url);
    const resolvedUrl = await resolveUrl(url);
    console.log('[extractSocialContent] resolved to:', resolvedUrl);

    const hostname = (() => {
      try { return new URL(resolvedUrl).hostname.replace(/^www\./, ''); } catch { return ''; }
    })();

    let scraped = null;

    if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
      // PRIMARY: free oEmbed API (instant, no rate limits)
      scraped = await tiktokOEmbed(resolvedUrl);
      // FALLBACK 1: direct HTML page scrape (free, no auth)
      if (!scraped?.caption) {
        console.log('[extractSocialContent] oEmbed failed, trying page scrape...');
        scraped = await scrapeTikTokPage(resolvedUrl);
      }
      // FALLBACK 2: Apify scraper (needs APIFY_TOKEN)
      if (!scraped?.caption) {
        console.log('[extractSocialContent] page scrape failed, trying Apify...');
        scraped = await scrapeTikTok(resolvedUrl);
        if (!scraped && resolvedUrl !== url) {
          scraped = await scrapeTikTok(url);
        }
      }
    } else if (hostname === 'instagram.com' || hostname.endsWith('.instagram.com')) {
      scraped = await scrapeInstagram(resolvedUrl);
    }

    if (!scraped || !scraped.caption) {
      console.error('[extractSocialContent] scraping produced no caption. scraped:', JSON.stringify(scraped));
      return Response.json({
        success: false,
        error: 'The Muse couldn\'t read this post. Make sure it\'s public and try a direct link to the video (not a short share link).',
      });
    }

    console.log('[extractSocialContent] caption:', scraped.caption.slice(0, 300));

    return Response.json({
      success: true,
      caption: scraped.caption,
      thumbnailUrl: scraped.thumbnailUrl || null,
      canonicalUrl: scraped.canonicalUrl || null,
    });

  } catch (error) {
    console.error('[extractSocialContent] top-level error:', error?.message || String(error));
    return Response.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
