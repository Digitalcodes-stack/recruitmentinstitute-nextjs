import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { AuthSession } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-production'
const ADMIN_COOKIE = 'ri_admin_token'
const USER_COOKIE = 'ri_user_token'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: AuthSession, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession
  } catch {
    return null
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
