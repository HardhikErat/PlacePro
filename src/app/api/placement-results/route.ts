import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const where: any = {}
  if (user.role === 'STUDENT') where.student_id = user.id
  // ADMIN and RECRUITER see all

  const results = await prisma.placementResult.findMany({
    where,
    include: {
      student: { select: { name: true, cgpa: true, department: true } },
      placement: {
        include: {
          company: true,
          placement_skills: { include: { skill: true } },
        },
      },
    },
    orderBy: { result_id: 'asc' },
  })
  return ok(results)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role === 'STUDENT') return forbidden()

  try {
    const { result_id, student_id, placement_id, status } = await req.json()
    if (!result_id || !student_id || !placement_id || !status) {
      return err('result_id, student_id, placement_id and status required')
    }
    const result = await prisma.placementResult.create({
      data: {
        result_id:    parseInt(result_id),
        student_id:   parseInt(student_id),
        placement_id: parseInt(placement_id),
        status,
      },
      include: {
        student:   { select: { name: true } },
        placement: { include: { company: true } },
      },
    })
    return ok(result, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('Result ID already exists')
    return err('Failed to record placement result', 500)
  }
}
