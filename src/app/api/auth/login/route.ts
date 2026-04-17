import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { id, password, role } = await req.json()

    if (role === 'ADMIN') {
      const secret = req.headers.get('x-admin-secret') || password || ''
      if (secret !== (process.env.ADMIN_SECRET || 'admin2026')) {
        return err('Invalid admin credentials', 401)
      }
      const token = await signToken({ id: 0, name: 'Admin', role: 'ADMIN' })
      setAuthCookie(token)
      return ok({ id: 0, name: 'Admin', role: 'ADMIN' })
    }

    if (role === 'STUDENT') {
      if (!id || !password) return err('Student ID and password required')
      const student = await prisma.student.findUnique({
        where: { student_id: parseInt(id) },
        include: { department: true },
      })
      if (!student) return err('Student not found', 401)
      const valid = await bcrypt.compare(password, student.password)
      if (!valid) return err('Invalid password', 401)
      const token = await signToken({ id: student.student_id, name: student.name, role: 'STUDENT' })
      setAuthCookie(token)
      return ok({ id: student.student_id, name: student.name, role: 'STUDENT' })
    }

    if (role === 'RECRUITER') {
      if (!id || !password) return err('Recruiter ID and password required')
      const recruiter = await prisma.recruiter.findUnique({
        where: { recruiter_id: parseInt(id) },
        include: { company: true },
      })
      if (!recruiter) return err('Recruiter not found', 401)
      const valid = await bcrypt.compare(password, recruiter.password)
      if (!valid) return err('Invalid password', 401)
      const token = await signToken({ id: recruiter.recruiter_id, name: recruiter.recruiter_name, role: 'RECRUITER' })
      setAuthCookie(token)
      return ok({ id: recruiter.recruiter_id, name: recruiter.recruiter_name, role: 'RECRUITER' })
    }

    return err('Invalid role')
  } catch (e) {
    console.error(e)
    return err('Internal server error', 500)
  }
}
