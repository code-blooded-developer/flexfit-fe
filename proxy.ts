import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/onboarding", "/dashboard", "/equipment-selection"];
const authRoutes = ["/auth", "/login", "/signup", "/forgot-password"];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshAccessToken(
  request: NextRequest,
): Promise<NextResponse | null> {
  try {
    const refreshToken = request.cookies.get("REFRESH_TOKEN")?.value;
    if (!refreshToken) return null;

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `REFRESH_TOKEN=${refreshToken}`,
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (!json.success) return null;

    // Continue the original request with new access_token set
    const response = NextResponse.next();
    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const hasAccessToken = request.cookies.has("ACCESS_TOKEN");
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (!hasAccessToken) {
    const hasRefreshToken = request.cookies.has("REFRESH_TOKEN");

    if (hasRefreshToken) {
      const refreshed = await refreshAccessToken(request);
      if (refreshed) {
        if (isAuthRoute) {
          const redirect = NextResponse.redirect(
            new URL("/onboarding", request.url),
          );
          const setCookieHeader = refreshed.headers.get("set-cookie");
          if (setCookieHeader) {
            redirect.headers.set("set-cookie", setCookieHeader);
          }
          return redirect;
        }
        return refreshed;
      }
    }

    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isAuthRoute && hasAccessToken) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }
}

export const config = {
  matcher: [
    "/auth",
    "/login",
    "/signup",
    "/forgot-password",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/equipment-selection/:path*",
  ],
};
