import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_SECRET = 'dev-secret-key-for-local-development-only-change-in-prod\r\n'

function base64UrlToUint8Array(base64Url: string) {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function verifyTokenWithSecret(token: string, secretStr: string): Promise<any | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signatureB64] = parts

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const data = enc.encode(`${headerB64}.${payloadB64}`)
    const signature = base64UrlToUint8Array(signatureB64)
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data)
    if (!isValid) return null

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64))
    const payload = JSON.parse(payloadJson)

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

async function verifyAdminJwt(token: string): Promise<any | null> {
  const envSecret = process.env.JWT_SECRET || DEFAULT_SECRET
  const secretsToTry = [
    envSecret,
    envSecret.trim(),
    envSecret.trim() + '\r\n',
    DEFAULT_SECRET,
    DEFAULT_SECRET.trim(),
  ]

  for (const s of secretsToTry) {
    const payload = await verifyTokenWithSecret(token, s)
    if (payload) return payload
  }
  return null
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Determine safe base origin to avoid 0.0.0.0 issues
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  let baseOrigin = req.nextUrl.origin
  if (baseOrigin.includes('0.0.0.0') || (host && host.includes('0.0.0.0'))) {
    baseOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }

  // ── 1. Admin Route Protection ─────────────────────────────────────────────
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')

  if (isAdminPage || isAdminApi) {
    const isLoginRoute = pathname === '/admin/login' || pathname.startsWith('/admin/login/')
    const isAuthRoute = pathname === '/api/auth/admin' || pathname.startsWith('/api/auth/admin/')

    if (isLoginRoute) {
      const reqHeaders = new Headers(req.headers)
      reqHeaders.set('x-is-admin-login', '1')
      return NextResponse.next({ request: { headers: reqHeaders } })
    }

    if (!isLoginRoute && !isAuthRoute) {
      const adminToken = req.cookies.get('ri_admin_token')?.value
      let isAuthorized = false

      if (adminToken) {
        const payload = await verifyAdminJwt(adminToken)
        if (
          payload &&
          payload.type === 'admin' &&
          (payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN')
        ) {
          isAuthorized = true
        }
      }

      if (!isAuthorized) {
        if (isAdminApi) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized: Admin privileges required' },
            { status: 401 }
          )
        }

        // Redirect unauthorized page access to /admin/login
        const loginUrl = new URL('/admin/login', baseOrigin)
        if (pathname !== '/admin' && pathname !== '/admin/dashboard') {
          loginUrl.searchParams.set('returnUrl', pathname)
        }
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  // ── 2. Redirect Old CI Routes & Candidate Routes ──────────────────────────
  const redirectMap: Record<string, string> = {
    '/home/login_student':    '/student-login',
    '/home/login_membership': '/membership-login',
    '/candidate-login':       '/student-login',
    '/course_main':           '/courses',
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

  // ── 3. Security Headers ───────────────────────────────────────────────────
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
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth/logout).*)',
  ],
}
