import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-dev-secret'
)

export interface JWTPayload {
  id: number
  name: string
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN'
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JWTPayload
}

export async function getAuthUser(req?: NextRequest): Promise<JWTPayload | null> {
  try {
    let token: string | undefined
    if (req) {
      token = req.cookies.get('token')?.value
    } else {
      token = cookies().get('token')?.value
    }
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().delete('token')
}
