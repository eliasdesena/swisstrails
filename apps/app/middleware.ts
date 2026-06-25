import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/explore", "/favorites", "/profile"];
const ADMIN_PATHS = ["/admin"];
const AUTH_PATHS = ["/login", "/signup"];

export default auth(function middleware(req) {
  // In mock mode, skip all auth guards so the full app UI can be explored
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
    return NextResponse.next();
  }

  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if ((isProtected || isAdmin) && !session?.user) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && session?.user) {
    return NextResponse.redirect(new URL("/explore", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|images|og-image|site.webmanifest).*)",
  ],
};
