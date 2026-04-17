import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const company_id = searchParams.get('company_id')
  const search     = searchParams.get('search') || ''

  const where: any = {}
  if (company_id) where.company_id = parseInt(company_id)
  if (search)     where.role = { contains: search, mode: 'insensitive' }

  const placements = await prisma.placement.findMany({
    where,
    include: {
      company: { select: { company_id: true, company_name: true, location: true } },
      placement_skills: { include: { skill: true } },
      _count: { select: { placement_results: true } },
    },
    orderBy: { ctc: 'desc' },
  })
  return ok(placements)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role === 'STUDENT') return forbidden()

  try {
    const { placement_id, company_id, role, ctc, skill_ids } = await req.json()
    if (!placement_id || !company_id || !role || ctc === undefined) {
      return err('placement_id, company_id, role and ctc required')
    }
    const placement = await prisma.placement.create({
      data: {
        placement_id: parseInt(placement_id),
        company_id:   parseInt(company_id),
        role,
        ctc: parseInt(ctc),
        placement_skills: skill_ids?.length
          ? { create: skill_ids.map((sid: number) => ({ skill_id: sid })) }
          : undefined,
      },
      include: { company: true, placement_skills: { include: { skill: true } } },
    })
    return ok(placement, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('placement_id already exists')
    return err('Failed to create placement', 500)
  }
}
