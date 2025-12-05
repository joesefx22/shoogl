// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getUserFromToken } from "@/lib/authServer";

// =============================================
// 🔧 Configuration
// =============================================
const COOKIE_NAME = process.env.COOKIE_NAME || "ehg_token";
const SESSION_COOKIE = process.env.SESSION_COOKIE || "session_token";

// =============================================
// 📍 Path Configuration
// =============================================

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/auth",
  "/about",
  "/contact",
  "/stadiums",
  "/play",
  "/play-search",
  "/api/auth",
  "/api/health",
  "/api/payments/webhook", // Payment webhooks are public
  "/api/public",
];

// Role-based path protection
const PROTECTED_PATHS = {
  ADMIN: [
    "/admin",
    "/api/admin",
  ],
  OWNER: [
    "/owner",
    "/api/owner",
    "/owner/dashboard",
    "/owner/stadiums",
    "/owner/bookings",
    "/owner/analytics",
    "/owner/profile",
  ],
  STAFF: [
    "/staff",
    "/api/staff",
    "/staff/dashboard",
    "/staff/bookings",
    "/staff/playgrounds",
    "/staff/reports",
  ],
  PLAYER: [
    "/player",
    "/api/player",
    "/player/bookings",
    "/player/notifications",
    "/player/profile",
    "/player/play",
    "/checkout",
  ],
  DASHBOARD: [
    "/dashboard",
  ],
};

// API endpoints that are public (GET only)
const PUBLIC_API_GET_ENDPOINTS = [
  "/api/stadiums",
  "/api/stadium",
  "/api/fields",
  "/api/play",
  "/api/matches",
];

// =============================================
// 🛡️ Security Headers Middleware
// =============================================
function applySecurityHeaders(response: NextResponse) {
  const headers = response.headers;
  
  // Security headers
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  // HSTS - only in production
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  
  // CSP - adjust based on your needs
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.ehgzly.com",
      "frame-src 'self' https://accept.paymob.com", // Allow Paymob iframe
      "frame-ancestors 'self'",
    ].join("; ")
  );
  
  return response;
}

// =============================================
// 🔐 Authentication Helper
// =============================================
async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Try both cookie names for backward compatibility
    const token = 
      request.cookies.get(COOKIE_NAME)?.value ||
      request.cookies.get(SESSION_COOKIE)?.value;
    
    if (!token) return null;
    
    // Verify token and get user
    const user = await getUserFromToken(token);
    
    if (!user || !user.isActive) return null;
    
    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// =============================================
// 🚦 Rate Limiting (Simple implementation)
// =============================================
const RATE_LIMIT_MAP = new Map<
  string,
  { tokens: number; last: number; blockedUntil?: number }
>();

function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(key) || {
    tokens: limit,
    last: now,
  };

  // Check if blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, remaining: 0 };
  }

  // Calculate tokens based on time passed
  const elapsed = now - record.last;
  const refill = (elapsed * limit) / windowMs;
  record.tokens = Math.min(limit, record.tokens + refill);
  record.last = now;

  // Check if request is allowed
  if (record.tokens >= 1) {
    record.tokens -= 1;
    RATE_LIMIT_MAP.set(key, record);
    return { allowed: true, remaining: Math.floor(record.tokens) };
  }

  // Block for 1 minute if rate limit exceeded
  record.blockedUntil = now + 60000;
  RATE_LIMIT_MAP.set(key, record);
  
  return { allowed: false, remaining: 0 };
}

// =============================================
// 🎯 Main Middleware Function
// =============================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // ===========================================
  // 1. Skip middleware for static files
  // ===========================================
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_static") ||
    pathname.startsWith("/_vercel") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // ===========================================
  // 2. Apply rate limiting
  // ===========================================
  const clientIp =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  
  const rateLimitKey = `${clientIp}:${pathname}:${method}`;
  const rateLimit = checkRateLimit(rateLimitKey);
  
  if (!rateLimit.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "لقد تجاوزت الحد المسموح به من الطلبات. يرجى الانتظار قليلاً.",
        retryAfter: 60,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": Math.floor((Date.now() + 60000) / 1000).toString(),
        },
      }
    );
  }

  // ===========================================
  // 3. Check if path is public
  // ===========================================
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  
  if (isPublicPath) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ===========================================
  // 4. Handle public API GET endpoints
  // ===========================================
  const isPublicApiGet = 
    method === "GET" && 
    PUBLIC_API_GET_ENDPOINTS.some((endpoint) => pathname.startsWith(endpoint));
  
  if (isPublicApiGet) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // ===========================================
  // 5. Authentication check
  // ===========================================
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "auth_required");
    
    const response = NextResponse.redirect(loginUrl);
    
    // Clear invalid cookies
    response.cookies.delete(COOKIE_NAME);
    response.cookies.delete(SESSION_COOKIE);
    
    return applySecurityHeaders(response);
  }

  // ===========================================
  // 6. Role-based access control
  // ===========================================
  const userRole = user.role as keyof typeof PROTECTED_PATHS;
  
  // Check if user has access to this path
  let hasAccess = false;
  let requiredRole = "USER";
  
  for (const [role, paths] of Object.entries(PROTECTED_PATHS)) {
    if (paths.some((path) => pathname.startsWith(path))) {
      requiredRole = role;
      hasAccess = user.role === role || 
                  (role === "STAFF" && (user.role === "OWNER" || user.role === "ADMIN")) ||
                  (role === "OWNER" && user.role === "ADMIN") ||
                  user.role === "ADMIN";
      break;
    }
  }
  
  // If no specific role required, allow access
  if (requiredRole === "USER") {
    hasAccess = true;
  }
  
  if (!hasAccess) {
    // Redirect to appropriate dashboard or show 403
    let redirectPath = "/";
    
    switch (user.role) {
      case "PLAYER":
        redirectPath = "/player/dashboard";
        break;
      case "STAFF":
        redirectPath = "/staff/dashboard";
        break;
      case "OWNER":
        redirectPath = "/owner/dashboard";
        break;
      case "ADMIN":
        redirectPath = "/admin/dashboard";
        break;
    }
    
    // For API calls, return 403
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: "ليس لديك صلاحية الوصول إلى هذا المورد",
          requiredRole,
          yourRole: user.role,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // For pages, redirect to appropriate dashboard
    const redirectUrl = new URL(redirectPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // ===========================================
  // 7. Add user info to headers for API routes
  // ===========================================
  const requestHeaders = new Headers(request.headers);
  
  if (pathname.startsWith("/api/")) {
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-user-email", user.email);
    
    // Add stadium IDs if user is staff or owner
    if (user.stadiums && user.stadiums.length > 0) {
      requestHeaders.set("x-user-stadiums", JSON.stringify(user.stadiums));
    }
  }

  // ===========================================
  // 8. Handle special cases
  // ===========================================
  
  // Redirect root to appropriate dashboard if logged in
  if (pathname === "/" && user) {
    let dashboardPath = "/player/dashboard";
    
    switch (user.role) {
      case "STAFF":
        dashboardPath = "/staff/dashboard";
        break;
      case "OWNER":
        dashboardPath = "/owner/dashboard";
        break;
      case "ADMIN":
        dashboardPath = "/admin/dashboard";
        break;
    }
    
    const dashboardUrl = new URL(dashboardPath, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // ===========================================
  // 9. Create response and apply headers
  // ===========================================
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add rate limit headers
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  response.headers.set("X-RateLimit-Reset", Math.floor((Date.now() + 60000) / 1000).toString());
  
  return applySecurityHeaders(response);
}

// =============================================
// ⚙️ Middleware Configuration
// =============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next/static (static files)
     * 2. /_next/image (image optimization files)
     * 3. /favicon.ico, /sitemap.xml, /robots.txt (static files)
     * 4. /public (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/).*)",
  ],
};

// =============================================
// 📊 Rate Limiting Export (for use in API routes)
// =============================================
export function allowRate(
  key: string,
  limit: number = 10,
  perSeconds: number = 60
): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(key) || {
    tokens: limit,
    last: now,
  };
  
  const elapsed = (now - record.last) / 1000;
  record.tokens = Math.min(limit, record.tokens + elapsed * (limit / perSeconds));
  record.last = now;
  
  if (record.tokens >= 1) {
    record.tokens -= 1;
    RATE_LIMIT_MAP.set(key, record);
    return true;
  }
  
  RATE_LIMIT_MAP.set(key, record);
  return false;
}
