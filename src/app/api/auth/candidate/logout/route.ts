import { NextResponse } from 'next/server'
import { clearUserCookie } from '@/lib/auth'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || url.host
  let targetOrigin = url.origin

  // If host or origin is 0.0.0.0, resolve safely using referer or localhost or NEXT_PUBLIC_SITE_URL
  if (targetOrigin.includes('0.0.0.0') || (host && host.includes('0.0.0.0'))) {
    const referer = req.headers.get('referer')
    if (referer && !referer.includes('0.0.0.0')) {
      try {
        targetOrigin = new URL(referer).origin
      } catch {
        targetOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }
    } else {
      targetOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  }

  const response = NextResponse.redirect(new URL('/student-login', targetOrigin))
  response.cookies.set(clearUserCookie())
  return response
}

