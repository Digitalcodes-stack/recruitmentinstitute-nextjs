import { NextResponse } from 'next/server'
import { clearUserCookie } from '@/lib/auth'

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL('/student-login', req.url))
  response.cookies.set(clearUserCookie())
  return response
}
