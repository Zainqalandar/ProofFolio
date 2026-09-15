import { NextRequest, NextResponse } from "next/server";

const authRoutes = new Set(["/signin", "/signup"]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasToken = Boolean(request.cookies.get("token")?.value);
  if (authRoutes.has(pathname) && hasToken) return NextResponse.redirect(new URL("/dashboard", request.url));
  const isProtectedRoute = pathname === "/dashboard" || pathname.startsWith("/case-studies/");
  if (isProtectedRoute && !hasToken) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("from", pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/signin", "/signup", "/dashboard", "/case-studies/:path*"] };
