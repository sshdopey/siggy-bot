import { formatPrice } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids") || "bitcoin,ethereum";

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) throw new Error("CoinGecko API error");

    const data = await res.json();
    const formatted = Object.entries(data).map(([id, info]: [string, any]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      price: formatPrice(info.usd),
      priceRaw: info.usd,
      change24h: info.usd_24h_change?.toFixed(2) ?? null,
      marketCap: info.usd_market_cap,
    }));

    return Response.json({ prices: formatted });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
