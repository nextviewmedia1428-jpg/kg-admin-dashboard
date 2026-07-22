import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.N8N_DASHBOARD_STATS_URL;
  if (!url) return NextResponse.json({ error: "N8N_DASHBOARD_STATS_URL not configured" }, { status: 500 });

  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(url, { headers: secret ? { [secretHeader]: secret } : undefined, cache: "no-store" });
  const text = await res.text();
  if (!res.ok || !text) {
    return NextResponse.json({ error: `n8n workflow returned ${res.status}${text ? `: ${text}` : " with an empty body (execution likely failed)"}` }, { status: res.ok ? 502 : res.status });
  }
  return new NextResponse(text, { status: 200, headers: { "content-type": "application/json" } });
}
