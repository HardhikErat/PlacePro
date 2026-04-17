import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound } from '@/lib/response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const internship = await prisma.internship.findUnique({
    where: { internship_id: parseInt(params.id) },
    include: { company: true },
  })
  if (!internship) return notFound('Internship')
  return ok(internship)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()
  if (user.role === 'STUDENT') return forbidden()

  // Recruiter can only delete internships belonging to their company
  if (user.role === 'RECRUITER') {
    const recruiter = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
    const internship = await prisma.internship.findUnique({ where: { internship_id: parseInt(params.id) } })
    if (!internship) return notFound('Internship')
    if (recruiter?.company_id !== internship.company_id) return forbidden()
  }

  try {
    await prisma.internship.delete({ where: { internship_id: parseInt(params.id) } })
    return ok({ message: 'Internship deleted' })
  } catch (e: any) {
    if (e.code === 'P2025') return notFound('Internship')
    return err('Failed to delete internship', 500)
  }
}
