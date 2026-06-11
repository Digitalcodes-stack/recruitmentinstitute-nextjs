import { NextResponse } from 'next/server'
import { clearAdminCookie, clearUserCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })
  response.cookies.set(clearAdminCookie())
  response.cookies.set(clearUserCookie())
  return response
}
