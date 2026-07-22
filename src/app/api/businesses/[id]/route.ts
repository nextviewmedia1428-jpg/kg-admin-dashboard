import { NextResponse } from "next/server";

function n8nHeaders() {
  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  return secret ? { [secretHeader]: secret } : undefined;
}

async function proxy(res: Response) {
  const text = await res.text();
  if (!res.ok || !text) {
    return NextResponse.json({ error: `n8n workflow returned ${res.status}${text ? `: ${text}` : " with an empty body (execution likely failed)"}` }, { status: res.ok ? 502 : res.status });
  }
  return new NextResponse(text, { status: 200, headers: { "content-type": "application/json" } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_GET_BUSINESS_URL;
  if (!url) return NextResponse.json({ error: "N8N_GET_BUSINESS_URL not configured" }, { status: 500 });
  const { id } = await params;
  const res = await fetch(`${url}?id=${encodeURIComponent(id)}`, { headers: n8nHeaders(), cache: "no-store" });
  return proxy(res);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_UPDATE_BUSINESS_URL;
  if (!url) return NextResponse.json({ error: "N8N_UPDATE_BUSINESS_URL not configured" }, { status: 500 });
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...n8nHeaders() },
    body: JSON.stringify({ ...body, id }),
  });
  return proxy(res);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_DELETE_BUSINESS_URL;
  if (!url) return NextResponse.json({ error: "N8N_DELETE_BUSINESS_URL not configured" }, { status: 500 });
  const { id } = await params;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...n8nHeaders() },
    body: JSON.stringify({ id }),
  });
  return proxy(res);
}
