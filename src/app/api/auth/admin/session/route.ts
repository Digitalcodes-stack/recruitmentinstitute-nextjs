import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()

  return NextResponse.json({
    success: Boolean(session && session.type === 'admin'),
    session: session && session.type === 'admin' ? session : null,
  })
}
