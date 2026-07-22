import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = process.env.N8N_ONBOARD_BUSINESS_URL;
  if (!url) {
    return NextResponse.json({ error: "N8N_ONBOARD_BUSINESS_URL not configured" }, { status: 500 });
  }

  const formData = await req.formData();
  if (!String(formData.get("phone") ?? "").trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(url, { method: "POST", body: formData, headers: secret ? { [secretHeader]: secret } : undefined });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: `n8n workflow returned ${res.status}: ${text}` }, { status: 502 });
  }
  return new NextResponse(text, {
    status: 200,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
