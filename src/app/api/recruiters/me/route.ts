import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthUser, clearAuthCookie } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

// GET /api/recruiters/me — get own recruiter profile
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'RECRUITER') return forbidden()

  const recruiter = await prisma.recruiter.findUnique({
    where: { recruiter_id: user.id },
    include: {
      company: true,
      interviews: {
        include: {
          application: {
            include: {
              student: { select: { name: true, cgpa: true } },
              company: { select: { company_name: true } },
            },
          },
        },
        orderBy: { interview_id: 'asc' },
      },
    },
  })
  if (!recruiter) return err('Recruiter not found', 404)
  const { password, ...safe } = recruiter
  return ok(safe)
}

// PATCH /api/recruiters/me — recruiter updates own profile
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'RECRUITER') return forbidden()

  try {
    const body = await req.json()
    const { recruiter_name, company_id, current_password, new_password } = body

    const data: any = {}
    if (recruiter_name) data.recruiter_name = recruiter_name
    if (company_id)     data.company_id = parseInt(company_id)

    if (new_password) {
      if (!current_password) return err('Current password is required to set a new password')
      const recruiter = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
      if (!recruiter) return err('Recruiter not found', 404)
      const valid = await bcrypt.compare(current_password, recruiter.password)
      if (!valid) return err('Current password is incorrect', 401)
      if (new_password.length < 4) return err('New password must be at least 4 characters')
      data.password = await bcrypt.hash(new_password, 12)
    }

    if (Object.keys(data).length === 0) return err('No fields to update')

    const updated = await prisma.recruiter.update({
      where: { recruiter_id: user.id },
      data,
      include: { company: true },
    })

    const { password, ...safe } = updated
    return ok(safe)
  } catch (e: any) {
    console.error(e)
    return err('Failed to update profile', 500)
  }
}

// DELETE /api/recruiters/me — recruiter deletes own account
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'RECRUITER') return forbidden()

  try {
    const body = await req.json().catch(() => ({}))
    const { password } = body

    if (!password) return err('Password is required to delete your account')

    const recruiter = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
    if (!recruiter) return err('Recruiter not found', 404)

    const valid = await bcrypt.compare(password, recruiter.password)
    if (!valid) return err('Incorrect password', 401)

    // Cascade deletes: interviews conducted by this recruiter will have recruiter_id set to null
    await prisma.recruiter.delete({ where: { recruiter_id: user.id } })

    clearAuthCookie()
    return ok({ message: 'Account deleted successfully' })
  } catch (e: any) {
    console.error(e)
    return err('Failed to delete account', 500)
  }
}
