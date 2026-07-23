import { NextResponse, type NextRequest } from "next/server";
import { hashPassphrase } from "@/lib/admin-auth";

const PUBLIC_PATHS = ["/login", "/api/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const cookieValue = req.cookies.get("admin_auth")?.value;
  const isAuthed =
    !!cookieValue &&
    !!process.env.ADMIN_PASSPHRASE &&
    cookieValue === (await hashPassphrase(process.env.ADMIN_PASSPHRASE));

  if (!isAuthed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (isAuthed && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
