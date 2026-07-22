import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { passphrase } = await req.json();

  if (!process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "ADMIN_PASSPHRASE not set on the server" }, { status: 500 });
  }
  if (passphrase !== process.env.ADMIN_PASSPHRASE) {
    return NextResponse.json({ error: "Incorrect passphrase" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set("admin_auth", passphrase, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
