import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public paths and static files
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/departments') ||
    pathname.startsWith('/api/companies') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const user = await verifyToken(token)

    // Role-based route guards
    if (pathname.startsWith('/student') && user.role !== 'STUDENT') {
      return NextResponse.redirect(new URL(`/${user.role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith('/recruiter') && user.role !== 'RECRUITER') {
      return NextResponse.redirect(new URL(`/${user.role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${user.role.toLowerCase()}`, req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
