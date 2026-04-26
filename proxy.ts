import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/workout", "/profile", "/onboarding"];
const authRoutes = [
  "/auth",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("ACCESS_TOKEN");
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workout/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
  ],
};
