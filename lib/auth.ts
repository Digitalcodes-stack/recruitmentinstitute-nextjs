import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { AuthSession } from '@/types'

const DEFAULT_SECRET = 'dev-secret-key-for-local-development-only-change-in-prod\r\n'

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET || DEFAULT_SECRET
  if (s === 'dev-secret-key-for-local-development-only-change-in-prod') {
    return 'dev-secret-key-for-local-development-only-change-in-prod\r\n'
  }
  return s
}
const ADMIN_COOKIE = 'ri_admin_token'
const USER_COOKIE = 'ri_user_token'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: AuthSession, expiresIn = '7d'): string {
  const secret = getJwtSecret()
  const { iat, exp, ...cleanPayload } = payload as any
  const uid = cleanPayload.userId || cleanPayload.id
  return jwt.sign(
    {
      ...cleanPayload,
      ...(uid ? { sub: String(uid), userId: Number(uid) } : {}),
    },
    secret,
    { expiresIn } as jwt.SignOptions
  )
}

export function verifyToken(token: string): AuthSession | null {
  const secret = getJwtSecret()
  try {
    return jwt.verify(token, secret) as AuthSession
  } catch {
    try {
      return jwt.verify(token, secret.trim()) as AuthSession
    } catch {
      try {
        return jwt.verify(token, secret.trim() + '\r\n') as AuthSession
      } catch {
        return null
      }
    }
  }
}

export async function getAdminSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getUserSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function setAdminCookie(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
}

export function setUserCookie(token: string) {
  return {
    name: USER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
}

export function clearAdminCookie() {
  return { name: ADMIN_COOKIE, value: '', maxAge: 0, path: '/' }
}

export function clearUserCookie() {
  return { name: USER_COOKIE, value: '', maxAge: 0, path: '/' }
}

export const ADMIN_ROLES = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  ACCOUNTANT: 2,
  EMPLOYEE: 3,
  PURCHASE_MANAGER: 4,
  SALES_MANAGER: 5,
} as const
