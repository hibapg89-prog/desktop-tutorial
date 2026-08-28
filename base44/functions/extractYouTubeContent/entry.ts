// Extracts the title + description from a YouTube video using the Data API v3.
// API key is stored as the YOUTUBE_API_KEY secret (accessed via secrets.get).

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com') {
      // /watch?v=VIDEO_ID
      if (u.pathname === '/watch') return u.searchParams.get('v');
      // /shorts/VIDEO_ID
      const shorts = u.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts) return shorts[1];
      // /embed/VIDEO_ID
      const embed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
    if (host === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function (req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return Response.json({ success: false, error: 'url is required' }, { status: 400 });
    }

    console.log('[extractYouTubeContent] url:', url);

    const videoId = extractVideoId(url);
    if (!videoId) {
      console.error('[extractYouTubeContent] could not extract video ID from:', url);
      return Response.json({ success: false, error: 'Could not extract a video ID from this YouTube URL.' });
    }

    console.log('[extractYouTubeContent] videoId:', videoId);

    const apiKey = secrets.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error('[extractYouTubeContent] YOUTUBE_API_KEY secret not set');
      return Response.json({ success: false, error: 'YouTube API key not configured.' });
    }

    const apiUrl =
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(12000) });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[extractYouTubeContent] API error:', res.status, body.slice(0, 200));
      return Response.json({ success: false, error: `YouTube API returned ${res.status}.` });
    }

    const data = await res.json();
    const item = data?.items?.[0];

    if (!item) {
      console.error('[extractYouTubeContent] video not found or private. videoId:', videoId);
      return Response.json({ success: false, error: 'Video not found or is private.' });
    }

    const snippet = item.snippet;
    const title = snippet?.title || '';
    const description = snippet?.description || '';

    // Combine title + first 800 chars of description for the LLM caption
    const caption = description
      ? `${title}\n\n${description.slice(0, 800)}`
      : title;

    const thumbnailUrl =
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.default?.url ||
      null;

    console.log('[extractYouTubeContent] caption:', caption.slice(0, 200));

    return Response.json({
      success: true,
      caption,
      thumbnailUrl,
      platform: 'youtube',
    });
  } catch (error) {
    console.error('[extractYouTubeContent] error:', error?.message || String(error));
    return Response.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
