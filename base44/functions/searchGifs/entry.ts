import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Proxies GIPHY search so the API key stays server-side.
// Add your GIPHY key as a Base44 secret named GIPHY_API_KEY.
// Free keys: https://developers.giphy.com/dashboard/
export default async function(req) {
  try {
    const createClient = createClientFromRequest;
    void createClient; // import used only for auth pattern consistency

    const url = new URL(req.url);
    const q     = url.searchParams.get("q")?.trim() || "beauty makeup";
    const limit = Math.min(Number(url.searchParams.get("limit") || "12"), 30);

    const key = Deno.env.get("GIPHY_API_KEY") || Deno.env.get("Giphy_API_key");
    if (!key) {
      return Response.json({ error: "GIPHY_API_KEY secret not set" }, { status: 503 });
    }

    const giphyUrl =
      `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg&lang=en`;

    const res  = await fetch(giphyUrl);
    const data = await res.json();

    const gifs = (data.data || [])
      .map((r: any) => ({
        url:     r.images?.original?.url,
        tinygif: r.images?.fixed_width?.url,
        title:   r.title || "",
      }))
      .filter((g: any) => g.url && g.tinygif);

    return Response.json({ gifs });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
