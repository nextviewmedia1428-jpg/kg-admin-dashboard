import { NextResponse } from "next/server";

function n8nHeaders() {
  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  return secret ? { [secretHeader]: secret } : undefined;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_LIST_ACTIVITY_URL;
  if (!url) return NextResponse.json({ error: "N8N_LIST_ACTIVITY_URL not configured" }, { status: 500 });
  const { id } = await params;
  const res = await fetch(`${url}?business_id=${encodeURIComponent(id)}`, { headers: n8nHeaders(), cache: "no-store" });
  const text = await res.text();
  if (!res.ok || !text) {
    return NextResponse.json({ error: `n8n workflow returned ${res.status}${text ? `: ${text}` : " with an empty body (execution likely failed)"}` }, { status: res.ok ? 502 : res.status });
  }
  return new NextResponse(text, { status: 200, headers: { "content-type": "application/json" } });
}
