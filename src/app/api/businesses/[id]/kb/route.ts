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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_ADD_KB_DOCUMENT_URL;
  if (!url) return NextResponse.json({ error: "N8N_ADD_KB_DOCUMENT_URL not configured" }, { status: 500 });
  const { id } = await params;
  const formData = await req.formData();
  formData.set("business_id", id);
  const res = await fetch(url, { method: "POST", body: formData, headers: n8nHeaders() });
  return proxy(res);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_DELETE_KB_DOCUMENT_URL;
  if (!url) return NextResponse.json({ error: "N8N_DELETE_KB_DOCUMENT_URL not configured" }, { status: 500 });
  const { id } = await params;
  const { filename } = await req.json();
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...n8nHeaders() },
    body: JSON.stringify({ business_id: id, filename }),
  });
  return proxy(res);
}
