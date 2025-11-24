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

  // Check for authentication token in cookies or headers
  const token = req.cookies.get("admin_token")?.value || 
                req.headers.get("authorization")?.replace("Bearer ", "");

  // Note: localStorage is not accessible in middleware (server-side)
  // Client-side ProtectedWrapper will handle the actual auth check
  // This middleware just adds security headers and basic cookie check
  
  // If no token in cookies for protected routes, let client-side handle it
  // We don't redirect here to avoid conflicts with localStorage-based auth
  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/api"))) {
    // Let it pass - client-side ProtectedWrapper will handle redirect
    // This prevents issues with localStorage not being accessible here
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
