import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getAuthUser, clearAuthCookie } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

// PATCH /api/students/me — student updates own profile
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'STUDENT') return forbidden()

  try {
    const body = await req.json()
    const { name, cgpa, dept_id, current_password, new_password } = body

    // Build update data — only fields that were provided
    const data: any = {}
    if (name)    data.name    = name
    if (cgpa !== undefined && cgpa !== '') data.cgpa = parseFloat(cgpa)
    if (dept_id) data.dept_id = parseInt(dept_id)

    // Password change — requires current password verification
    if (new_password) {
      if (!current_password) return err('Current password is required to set a new password')
      const student = await prisma.student.findUnique({ where: { student_id: user.id } })
      if (!student) return err('Student not found', 404)
      const valid = await bcrypt.compare(current_password, student.password)
      if (!valid) return err('Current password is incorrect', 401)
      if (new_password.length < 4) return err('New password must be at least 4 characters')
      data.password = await bcrypt.hash(new_password, 12)
    }

    if (Object.keys(data).length === 0) return err('No fields to update')

    const updated = await prisma.student.update({
      where: { student_id: user.id },
      data,
      include: { department: true },
    })

    // Don't return password in response
    const { password, ...safe } = updated
    return ok(safe)
  } catch (e: any) {
    console.error(e)
    return err('Failed to update profile', 500)
  }
}

// DELETE /api/students/me — student deletes own account completely
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'STUDENT') return forbidden()

  try {
    const body = await req.json().catch(() => ({}))
    const { password } = body

    if (!password) return err('Password is required to delete your account')

    const student = await prisma.student.findUnique({ where: { student_id: user.id } })
    if (!student) return err('Student not found', 404)

    const valid = await bcrypt.compare(password, student.password)
    if (!valid) return err('Incorrect password', 401)

    // Cascade delete handles: applications → interviews, placement_results
    await prisma.student.delete({ where: { student_id: user.id } })

    clearAuthCookie()
    return ok({ message: 'Account deleted successfully' })
  } catch (e: any) {
    console.error(e)
    return err('Failed to delete account', 500)
  }
}
