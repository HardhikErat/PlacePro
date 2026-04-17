import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ok, unauthorized, forbidden } from '@/lib/response'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  const [
    totalStudents, totalCompanies, totalApplications,
    totalPlacements, totalInternships, totalSelected,
    topCompanies, recentApplications, departmentStats, interviewStats,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.placement.count(),
    prisma.internship.count(),
    prisma.placementResult.count({ where: { status: 'Selected' } }),
    prisma.company.findMany({
      include: { _count: { select: { applications: true, placements: true } } },
      orderBy: { applications: { _count: 'desc' } },
      take: 5,
    }),
    prisma.application.findMany({
      include: {
        student: { select: { name: true } },
        company: { select: { company_name: true } },
      },
      orderBy: { application_id: 'desc' },
      take: 8,
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { students: true } },
        students: { include: { placement_results: true } },
      },
    }),
    prisma.interview.groupBy({ by: ['result'], _count: { result: true } }),
  ])

  const placementRate = totalStudents > 0
    ? Math.round((totalSelected / totalStudents) * 100) : 0

  const deptStats = departmentStats.map(d => ({
    dept_name: d.dept_name,
    total:  d._count.students,
    placed: d.students.filter(s => s.placement_results.some(r => r.status === 'Selected')).length,
  }))

  return ok({
    summary: { totalStudents, totalCompanies, totalApplications, totalPlacements, totalInternships, totalSelected, placementRate },
    topCompanies, recentApplications, departmentStats: deptStats, interviewStats,
  })
}
