import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { ok, err } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { role, password } = body
    if (!password || password.length < 4) return err('Password must be at least 4 characters')
    const hashed = await bcrypt.hash(password, 12)

    if (role === 'STUDENT') {
      const { student_id, name, cgpa, dept_id } = body
      if (!student_id || !name) return err('Student ID and name required')
      const student = await prisma.student.create({
        data: { student_id: parseInt(student_id), name, cgpa: cgpa ? parseFloat(cgpa) : null, dept_id: dept_id ? parseInt(dept_id) : null, password: hashed },
        include: { department: true },
      })
      const token = await signToken({ id: student.student_id, name: student.name, role: 'STUDENT' })
      setAuthCookie(token)
      return ok({ id: student.student_id, name: student.name, role: 'STUDENT' }, 201)
    }

    if (role === 'RECRUITER') {
      const { recruiter_id, recruiter_name, company_id } = body
      if (!recruiter_id || !recruiter_name || !company_id) return err('Recruiter ID, name and company required')
      const recruiter = await prisma.recruiter.create({
        data: { recruiter_id: parseInt(recruiter_id), recruiter_name, company_id: parseInt(company_id), password: hashed },
        include: { company: true },
      })
      const token = await signToken({ id: recruiter.recruiter_id, name: recruiter.recruiter_name, role: 'RECRUITER' })
      setAuthCookie(token)
      return ok({ id: recruiter.recruiter_id, name: recruiter.recruiter_name, role: 'RECRUITER' }, 201)
    }

    return err('Invalid role')
  } catch (e: any) {
    if (e.code === 'P2002') return err('ID already exists — choose a different ID')
    return err('Failed to register', 500)
  }
}
