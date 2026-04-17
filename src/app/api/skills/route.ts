import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()
  const skills = await prisma.skill.findMany({ orderBy: { skill_id: 'asc' } })
  return ok(skills)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || user.role !== 'ADMIN') return forbidden()
  try {
    const { skill_id, skill_name } = await req.json()
    if (!skill_id || !skill_name) return err('skill_id and skill_name required')
    const skill = await prisma.skill.create({ data: { skill_id: parseInt(skill_id), skill_name } })
    return ok(skill, 201)
  } catch (e: any) {
    if (e.code === 'P2002') return err('skill_id already exists')
    return err('Failed to create skill', 500)
  }
}
