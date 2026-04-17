import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const application_id = searchParams.get('application_id')

  const where: any = {}
  if (application_id) where.application_id = parseInt(application_id)

  // For recruiters, show interviews for applications at their company
  if (user.role === 'RECRUITER') {
    const recruiter = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
    if (recruiter) {
      // Get all applications for this company
      const apps = await prisma.application.findMany({
        where: { company_id: recruiter.company_id ?? 0 },
        select: { application_id: true },
      })
      const appIds = apps.map(a => a.application_id)
      where.application_id = { in: appIds }
    }
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      application: {
        include: {
          student: { select: { name: true, cgpa: true, department: true } },
          company: { select: { company_name: true } },
        },
      },
      recruiter: { select: { recruiter_name: true } },
    },
    orderBy: [{ application_id: 'asc' }, { round_no: 'asc' }],
  })
  return ok(interviews)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role === 'STUDENT') return forbidden()

  try {
    const { interview_id, application_id, recruiter_id, round_no, result } = await req.json()
    if (!interview_id || !application_id || !recruiter_id || !round_no || !result) {
      return err('All fields required: interview_id, application_id, recruiter_id, round_no, result')
    }
    const interview = await prisma.interview.create({
      data: {
        interview_id:   parseInt(interview_id),
        application_id: parseInt(application_id),
        recruiter_id:   parseInt(recruiter_id),
        round_no:       parseInt(round_no),
        result,
      },
      include: {
        application: { include: { student: { select: { name: true } } } },
        recruiter:   { select: { recruiter_name: true } },
      },
    })
    return ok(interview, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('Interview ID already exists')
    return err('Failed to create interview', 500)
  }
}
