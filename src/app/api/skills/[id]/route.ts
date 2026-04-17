import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound } from '@/lib/response'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  try {
    await prisma.skill.delete({ where: { skill_id: parseInt(params.id) } })
    return ok({ message: 'Skill deleted' })
  } catch (e: any) {
    if (e.code === 'P2025') return notFound('Skill')
    return err('Failed to delete skill', 500)
  }
}
