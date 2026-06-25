import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ authenticated: false })
  }
  return NextResponse.json({
    authenticated: true,
    user: { name: session.name, email: session.email, type: session.type },
  })
}
