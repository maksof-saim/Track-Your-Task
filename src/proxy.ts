import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_PAGES = ["/", "/privacy", "/terms", "/offline"];
const PUBLIC_PREFIXES = ["/tools"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isPublicPage =
    PUBLIC_PAGES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isLoggedIn && (isAuthPage || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    // APIs must answer like an API: a redirect to the sign-in page would reach
    // fetch() as an HTML 200 and look like success.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  if (!isPublicPage) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
});

export const config = {
  matcher: [
    "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|opengraph-image|sw.js|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};