import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, forbidden } from '@/lib/response'

// Public GET — needed on signup page before auth
export async function GET() {
  const departments = await prisma.department.findMany({ orderBy: { dept_id: 'asc' } })
  return ok(departments)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'ADMIN') return forbidden()
  try {
    const { dept_id, dept_name } = await req.json()
    if (!dept_id || !dept_name) return err('dept_id and dept_name required')
    const dept = await prisma.department.create({ data: { dept_id: parseInt(dept_id), dept_name } })
    return ok(dept, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('dept_id already exists')
    return err('Failed to create department', 500)
  }
}
