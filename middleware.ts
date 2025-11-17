// middleware.ts - Enhanced security middleware for Dashboard
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/forgot-password"];
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith("/_next") || pathname.includes("."));

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = req.cookies.get("admin_token")?.value || 
                req.headers.get("authorization")?.replace("Bearer ", "");

  // If no token in cookies, check localStorage (client-side will handle redirect)
  if (!token) {
    // For API routes or protected pages, redirect to login
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
      const loginUrl = new URL("/", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // Remove server info
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
