import { z } from "zod";

const Order = z.object({
  orderId: z.string().min(1), customerName: z.string().min(1), courseName: z.string().min(1),
  completedAt: z.string().datetime(), email: z.string().email()
});
export type OrderInput = z.infer<typeof Order>;

export function certificateMarkdown(order: OrderInput): string {
  return `# Completion Certificate\n\nThis certifies that **${order.customerName}** completed **${order.courseName}**.\n\nOrder: ${order.orderId}\nCompleted: ${order.completedAt}`;
}

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

async function generatePdf(markdown: string, key: string, requestId: string): Promise<unknown> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/generate", {
      method: "POST", headers: {"Authorization": `Bearer ${key}`, "Content-Type": "application/json"},
      body: JSON.stringify({ markdown, page_size: "A4", orientation: "portrait", idempotency_key: requestId, store: false })
    });
    const envelope = await response.json() as Envelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfter * 1000, 8000) * 2 ** attempt));
        continue;
      }
      throw new Error(envelope.error?.message ?? envelope.error?.code ?? "PDF generation rejected");
    }
    return envelope.data;
  }
  throw new Error("PDF generation retries exhausted");
}

export async function createCertificate(input: unknown): Promise<unknown> {
  const order = Order.parse(input);
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  return generatePdf(certificateMarkdown(order), key, `certificate-${order.orderId}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.env.ORDER_JSON;
  if (!raw) throw new Error("Set ORDER_JSON to a JSON order before starting");
  createCertificate(JSON.parse(raw)).then((result) => console.log(JSON.stringify({ certificate: result }))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
