import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Only protect non-API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const publicPaths = ["/login"];
  const staticFiles = ["/manifest.json", "/sw.js", "/icon-192.png", "/icon-512.png", "/ERB.png", "/ERB-original.png"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p)) || staticFiles.includes(pathname) || /\.(png|jpg|jpeg|svg|ico|webp)$/i.test(pathname);

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/instructor") && token?.role !== "INSTRUCTOR" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/instructor") && token?.role === "INSTRUCTOR") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
