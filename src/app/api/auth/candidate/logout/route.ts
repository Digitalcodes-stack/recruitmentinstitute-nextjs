import { NextResponse } from 'next/server'
import { clearUserCookie } from '@/lib/auth'

export async function GET() {
  const response = NextResponse.redirect(new URL('/candidate-login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
  response.cookies.set(clearUserCookie())
  return response
}
