import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { hashPassphrase } from "@/lib/admin-auth";

// ponytail: per-instance in-memory throttle, not a distributed one — on Vercel this resets
// per cold start and doesn't share state across regions/instances, so it's a speed bump
// against casual brute-forcing, not a hard guarantee. ADMIN_PASSPHRASE is already a long
// random secret, so this is defense-in-depth. Upgrade to Upstash/Vercel Firewall if this
// ever needs to be a real guarantee.
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { passphrase } = await req.json();

  if (!process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "ADMIN_PASSPHRASE not set on the server" }, { status: 500 });
  }
  if (passphrase !== process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "Incorrect passphrase" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set("admin_auth", await hashPassphrase(passphrase), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
