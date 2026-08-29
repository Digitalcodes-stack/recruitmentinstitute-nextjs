import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Redirect old CI routes to new Next.js routes
  const redirectMap: Record<string, string> = {
    '/home/login_student':   '/candidate-login',
    '/home/login_membership': '/candidate-login',
    '/course_main':          '/courses',
  }

  if (redirectMap[pathname]) {
    return NextResponse.redirect(new URL(redirectMap[pathname], req.url), 301)
  }

  if (pathname === '/blog') {
    return NextResponse.redirect(new URL('/blogs', req.url), 301)
  }

  if (pathname === '/blogpage') {
    return NextResponse.redirect(new URL(`/blogs${req.nextUrl.search}`, req.url), 301)
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
