import { NextResponse } from "next/server";

interface N8nBusinessRow {
  id: string;
  name: string;
  status: string;
  calls_today: number;
  calls_month: number;
  last_activity_at: string | null;
}

export async function GET() {
  const url = process.env.N8N_LIST_BUSINESSES_URL;
  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) {
    return NextResponse.json({ error: "N8N_LIST_BUSINESSES_URL / N8N_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const res = await fetch(url, { headers: { [secretHeader]: secret }, cache: "no-store" });
  const text = await res.text();
  if (!res.ok || !text) {
    // n8n responds 200 with an empty body when the workflow execution itself errors
    // (e.g. a bad query) — not just on a non-2xx HTTP status.
    return NextResponse.json({ error: `n8n workflow returned ${res.status}${text ? `: ${text}` : " with an empty body (the workflow execution likely failed — check n8n's Executions tab)"}` }, { status: 502 });
  }

  let data: { businesses: N8nBusinessRow[] };
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: `n8n workflow returned invalid JSON: ${text.slice(0, 200)}` }, { status: 502 });
  }
  const businesses = data.businesses.map((b) => ({
    id: b.id,
    name: b.name,
    status: b.status,
    callsToday: b.calls_today,
    callsMonth: b.calls_month,
    lastActivityAt: b.last_activity_at,
  }));
  return NextResponse.json({ businesses });
}
