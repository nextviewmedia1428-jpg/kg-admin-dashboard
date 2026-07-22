import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_INVITE_PORTAL_URL;
  if (!url) return NextResponse.json({ error: "N8N_INVITE_PORTAL_URL not configured" }, { status: 500 });
  const { id } = await params;

  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...(secret ? { [secretHeader]: secret } : {}) },
    body: JSON.stringify({ business_id: id }),
  });
  const text = await res.text();
  if (!res.ok || !text) {
    return NextResponse.json({ error: `n8n workflow returned ${res.status}${text ? `: ${text}` : " with an empty body (execution likely failed)"}` }, { status: res.ok ? 502 : res.status });
  }
  return new NextResponse(text, { status: 200, headers: { "content-type": "application/json" } });
}
