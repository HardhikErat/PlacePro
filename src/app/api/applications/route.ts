import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = {}
  if (user.role === 'STUDENT') {
    where.student_id = user.id
  } else if (user.role === 'RECRUITER') {
    const rec = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
    if (!rec) return err('Recruiter not found', 404)
    where.company_id = rec.company_id
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        student: { select: { student_id: true, name: true, cgpa: true, department: true } },
        company: { select: { company_id: true, company_name: true, location: true } },
        interviews: {
          include: { recruiter: { select: { recruiter_id: true, recruiter_name: true } } },
          orderBy: { round_no: 'asc' },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { application_id: 'asc' },
    }),
    prisma.application.count({ where }),
  ])

  return ok({ applications, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'STUDENT') return forbidden()

  try {
    const { application_id, company_id } = await req.json()
    if (!application_id || !company_id) return err('application_id and company_id required')

    const existing = await prisma.application.findFirst({
      where: { student_id: user.id, company_id: parseInt(company_id) },
    })
    if (existing) return err('Already applied to this company')

    const application = await prisma.application.create({
      data: {
        application_id: parseInt(application_id),
        student_id: user.id,
        company_id: parseInt(company_id),
      },
      include: {
        company: { select: { company_name: true, location: true } },
        student: { select: { name: true, cgpa: true } },
      },
    })
    return ok(application, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('application_id already exists')
    return err('Failed to submit application', 500)
  }
}
