import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  if (user.role === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { student_id: user.id },
      include: {
        department: true,
        applications: {
          include: {
            company: true,
            interviews: { include: { recruiter: true }, orderBy: { round_no: 'asc' } },
          },
        },
        placement_results: {
          include: {
            placement: { include: { company: true, placement_skills: { include: { skill: true } } } },
          },
        },
      },
    })
    return ok(student)
  }

  const { searchParams } = new URL(req.url)
  const page   = parseInt(searchParams.get('page')    || '1')
  const limit  = parseInt(searchParams.get('limit')   || '20')
  const search = searchParams.get('search')  || ''
  const dept   = searchParams.get('dept_id') || ''

  const where: any = {}
  if (search) where.name    = { contains: search, mode: 'insensitive' }
  if (dept)   where.dept_id = parseInt(dept)

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        department: true,
        _count: { select: { applications: true, placement_results: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { student_id: 'asc' },
    }),
    prisma.student.count({ where }),
  ])

  return ok({ students, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'ADMIN') return forbidden()

  try {
    const { student_id, name, cgpa, dept_id } = await req.json()
    if (!student_id || !name) return err('student_id and name required')
    const student = await prisma.student.create({
      data: { student_id: parseInt(student_id), name, cgpa: cgpa ? parseFloat(cgpa) : null, dept_id: dept_id ? parseInt(dept_id) : null },
      include: { department: true },
    })
    return ok(student, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('student_id already exists')
    return err('Failed to create student', 500)
  }
}
