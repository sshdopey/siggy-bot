export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "cosmic cat";

  const giphyKey = process.env.GIPHY_API_KEY;
  if (!giphyKey) {
    return Response.json({ url: null });
  }

  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${giphyKey}&q=${encodeURIComponent(q)}&limit=10&rating=pg&lang=en`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return Response.json({ url: null });

    const data = await res.json();
    const gifs = data.data;
    if (!gifs || gifs.length === 0) return Response.json({ url: null });

    // Pick a random GIF from results
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    const url = gif.images?.fixed_height?.url || gif.images?.original?.url || null;

    return Response.json({ url });
  } catch {
    return Response.json({ url: null });
  }
}
