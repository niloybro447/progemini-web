import { NextRequest, NextResponse } from 'next/server';

const HTML_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';

// Rate limiting map for auth endpoints - in production use Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up old rate limit entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(rateLimitMap.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}

function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIp = getClientIp(request);

  // Rate limiting for auth endpoints - 5 attempts per minute
  if (pathname === '/api/auth/signin' || pathname === '/api/auth/signup') {
    const rateLimitKey = `auth:${clientIp}`;
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many login attempts. Please try again in 1 minute.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // API routes - 100 requests per minute
  if (pathname.startsWith('/api/')) {
    const rateLimitKey = `api:${clientIp}`;
    if (!checkRateLimit(rateLimitKey, 100, 60000)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  const response = NextResponse.next();
  const acceptHeader = request.headers.get('accept') ?? '';
  const isDocumentRequest = acceptHeader.includes('text/html');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CSP header (adjust as needed for your resources)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://62.169.25.212; font-src 'self' data:; connect-src 'self' https:;"
  );

  if (isDocumentRequest) {
    response.headers.set('Cache-Control', HTML_CACHE_CONTROL);
    response.headers.set('CDN-Cache-Control', HTML_CACHE_CONTROL);
    response.headers.set('Vercel-CDN-Cache-Control', HTML_CACHE_CONTROL);
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};