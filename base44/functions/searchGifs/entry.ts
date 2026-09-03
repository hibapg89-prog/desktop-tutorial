import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Proxies Tenor GIF search so the API key stays server-side.
// Add your Tenor v2 key as a Base44 secret named TENOR_API_KEY.
// Free keys: https://developers.google.com/tenor/guides/quickstart
export default async function(req) {
  try {
    const createClient = createClientFromRequest;
    void createClient; // import used only for auth pattern consistency

    const url = new URL(req.url);
    const q     = url.searchParams.get("q")?.trim() || "beauty makeup";
    const limit = Math.min(Number(url.searchParams.get("limit") || "12"), 30);

    const key = Deno.env.get("TENOR_API_KEY");
    if (!key) {
      return Response.json({ error: "TENOR_API_KEY secret not set" }, { status: 503 });
    }

    const tenorUrl =
      `https://g.tenor.com/v2/search?q=${encodeURIComponent(q)}&key=${key}&limit=${limit}&media_filter=gif,tinygif`;

    const res  = await fetch(tenorUrl);
    const data = await res.json();

    const gifs = (data.results || [])
      .map((r: any) => ({
        url:     r.media_formats?.gif?.url,
        tinygif: r.media_formats?.tinygif?.url,
      }))
      .filter((g: any) => g.url && g.tinygif);

    return Response.json({ gifs });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
