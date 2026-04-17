import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, forbidden } from '@/lib/response'

// Public GET — needed on signup page before auth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''

  const companies = await prisma.company.findMany({
    where: search ? { company_name: { contains: search, mode: 'insensitive' } } : {},
    include: {
      internships: true,
      placements:  { include: { placement_skills: { include: { skill: true } } } },
      _count:      { select: { applications: true, recruiters: true } },
    },
    orderBy: { company_id: 'asc' },
  })
  return ok(companies)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'ADMIN') return forbidden()
  try {
    const { company_id, company_name, location } = await req.json()
    if (!company_id || !company_name) return err('company_id and company_name required')
    const company = await prisma.company.create({
      data: { company_id: parseInt(company_id), company_name, location },
    })
    return ok(company, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('company_id already exists')
    return err('Failed to create company', 500)
  }
}
