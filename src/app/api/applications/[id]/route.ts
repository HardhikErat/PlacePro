import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound } from '@/lib/response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const application = await prisma.application.findUnique({
    where: { application_id: parseInt(params.id) },
    include: {
      student: { select: { student_id: true, name: true, cgpa: true, department: true } },
      company: true,
      interviews: { include: { recruiter: true }, orderBy: { round_no: 'asc' } },
    },
  })
  if (!application) return notFound('Application')
  if (user.role === 'STUDENT' && application.student_id !== user.id) return forbidden()

  return ok(application)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'ADMIN') return forbidden()

  try {
    await prisma.application.delete({ where: { application_id: parseInt(params.id) } })
    return ok({ message: 'Deleted' })
  } catch {
    return notFound('Application')
  }
}
