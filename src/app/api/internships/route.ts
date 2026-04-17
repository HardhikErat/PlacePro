import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const company_id = searchParams.get('company_id')

  const internships = await prisma.internship.findMany({
    where: company_id ? { company_id: parseInt(company_id) } : {},
    include: { company: { select: { company_id: true, company_name: true, location: true } } },
    orderBy: { stipend: 'desc' },
  })
  return ok(internships)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role === 'STUDENT') return forbidden()

  try {
    const { internship_id, company_id, duration_months, stipend } = await req.json()
    if (!internship_id || !company_id || !duration_months || stipend === undefined) {
      return err('internship_id, company_id, duration_months and stipend required')
    }
    const internship = await prisma.internship.create({
      data: {
        internship_id: parseInt(internship_id),
        company_id: parseInt(company_id),
        duration_months: parseInt(duration_months),
        stipend: parseInt(stipend),
      },
      include: { company: true },
    })
    return ok(internship, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('internship_id already exists')
    return err('Failed to create internship', 500)
  }
}
