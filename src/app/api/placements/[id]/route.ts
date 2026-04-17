import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound } from '@/lib/response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const placement = await prisma.placement.findUnique({
    where: { placement_id: parseInt(params.id) },
    include: {
      company: true,
      placement_skills: { include: { skill: true } },
    },
  })
  if (!placement) return notFound('Placement')
  return ok(placement)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()
  if (user.role === 'STUDENT') return forbidden()

  // Recruiter can only delete placements belonging to their company
  if (user.role === 'RECRUITER') {
    const recruiter = await prisma.recruiter.findUnique({ where: { recruiter_id: user.id } })
    const placement = await prisma.placement.findUnique({ where: { placement_id: parseInt(params.id) } })
    if (!placement) return notFound('Placement')
    if (recruiter?.company_id !== placement.company_id) return forbidden()
  }

  try {
    // Delete placement_skill junction rows first (cascade may not cover this in all configs)
    await prisma.placementSkill.deleteMany({ where: { placement_id: parseInt(params.id) } })
    await prisma.placement.delete({ where: { placement_id: parseInt(params.id) } })
    return ok({ message: 'Placement deleted' })
  } catch (e: any) {
    if (e.code === 'P2025') return notFound('Placement')
    return err('Failed to delete placement', 500)
  }
}
