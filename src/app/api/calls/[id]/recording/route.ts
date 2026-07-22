import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.N8N_GET_CALL_RECORDING_URL;
  if (!url) return NextResponse.json({ error: "N8N_GET_CALL_RECORDING_URL not configured" }, { status: 500 });
  const { id } = await params;

  const secretHeader = process.env.N8N_WEBHOOK_SECRET_HEADER || "X-Webhook-Secret";
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const res = await fetch(`${url}?id=${encodeURIComponent(id)}`, {
    headers: secret ? { [secretHeader]: secret } : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "no recording" }, { status: 404 });
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, { status: 200, headers: { "content-type": "audio/wav" } });
}
