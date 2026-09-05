import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie, clearUserCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })
  response.cookies.set(clearAdminCookie())
  response.cookies.set(clearUserCookie())
  return response
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000'
  const response = NextResponse.redirect(new URL('/', origin))
  response.cookies.set(clearAdminCookie())
  response.cookies.set(clearUserCookie())
  return response
}
