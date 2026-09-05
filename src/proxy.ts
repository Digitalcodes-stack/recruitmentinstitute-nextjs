import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old CI routes and candidate routes to new Next.js routes
  const redirectMap: Record<string, string> = {
    '/home/login_student':    '/student-login',
    '/home/login_membership': '/membership-login',
    '/candidate-login':       '/student-login',
    '/course_main':           '/courses',
  }

  // Determine safe base origin to avoid 0.0.0.0 issues
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  let baseOrigin = req.nextUrl.origin
  if (baseOrigin.includes('0.0.0.0') || (host && host.includes('0.0.0.0'))) {
    baseOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }

  if (redirectMap[pathname]) {
    return NextResponse.redirect(new URL(redirectMap[pathname], baseOrigin), 301)
  }

  if (pathname === '/blog') {
    return NextResponse.redirect(new URL('/blogs', baseOrigin), 301)
  }

  if (pathname === '/blogpage') {
    return NextResponse.redirect(new URL(`/blogs${req.nextUrl.search}`, baseOrigin), 301)
  }

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // microphone=(self) — the AI Desk Talk widget (embedded site-wide) needs mic access via getUserMedia.
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/admin|api/auth/logout).*)',
  ],
}
