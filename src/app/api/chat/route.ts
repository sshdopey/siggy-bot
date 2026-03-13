import Groq from "groq-sdk";
import { SIGGY_SYSTEM_PROMPT } from "@/lib/constants";
import { detectPriceQuery, formatPrice } from "@/lib/utils";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function fetchPrices(tokenIds: string[]): Promise<string> {
  try {
    const ids = tokenIds.join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return "";
    const data = await res.json();
    const lines = Object.entries(data).map(([id, info]: [string, any]) => {
      return `${id.toUpperCase()}: ${formatPrice(info.usd)} (24h: ${info.usd_24h_change?.toFixed(2) ?? "?"}%)`;
    });
    return `\n\n[LIVE PRICE DATA - weave naturally into your response]\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    let priceContext = "";
    if (lastUserMsg) {
      const tokens = detectPriceQuery(lastUserMsg.content);
      if (tokens.length > 0) priceContext = await fetchPrices(tokens);
    }

    const stream = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SIGGY_SYSTEM_PROMPT + priceContext },
        ...messages.slice(-20),
      ],
      stream: true,
      temperature: 1.0,
      max_tokens: 250,
      top_p: 0.9,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
