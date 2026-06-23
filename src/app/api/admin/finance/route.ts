import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getFinanceSnapshot } from '@/lib/finance'

async function guard() {
  const session = await getAdminSession()
  if (!session || session.type !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET() {
  const err = await guard()
  if (err) return err

  const snapshot = await getFinanceSnapshot()
  return NextResponse.json({ success: true, data: snapshot })
}
