'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function AdminStudents() {
  const [search, setSearch] = useState('')
  const [dept, setDept]     = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students', search, dept, page],
    queryFn: () => fetch(`/api/students?search=${search}&dept_id=${dept}&page=${page}&limit=15`)
      .then(r => r.json()).then(d => d.data),
    placeholderData: (p: any) => p,
  })

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetch('/api/departments').then(r => r.json()).then(d => d.data),
  })

  const students    = data?.students ?? []
  const total       = data?.total ?? 0
  const totalPages  = Math.ceil(total / 15)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total} records in student table</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 glass border border-white/[0.08] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input type="text" placeholder="Search by name..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          <select className="input-field w-52 py-2 text-sm" value={dept} onChange={e => { setDept(e.target.value); setPage(1) }}>
            <option value="">All Departments</option>
            {(depts ?? []).map((d: any) => (
              <option key={d.dept_id} value={d.dept_id}>[{d.dept_id}] {d.dept_name}</option>
            ))}
          </select>
        </div>

        {isLoading ? <SkeletonTable rows={8} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['student_id','name','cgpa','dept_id','dept_name','applications','results'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {students.map((s: any, i: number) => (
                    <motion.tr key={s.student_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-bold text-blue-400">{s.student_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${
                          (s.cgpa ?? 0) >= 8.5 ? 'text-emerald-400' :
                          (s.cgpa ?? 0) >= 7.5 ? 'text-blue-400'    : 'text-amber-400'
                        }`}>{s.cgpa ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.dept_id ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{s.department?.dept_name ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-violet-400">{s._count?.applications ?? 0}</td>
                      <td className="px-4 py-3 font-mono text-xs text-amber-400">{s._count?.placement_results ?? 0}</td>
                    </motion.tr>
                  ))}
                  {!students.length && (
                    <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">No students found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                <p className="text-xs text-muted-foreground">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</p>
                <div className="flex items-center gap-1.5">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-40">← Prev</button>
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost py-1 px-2.5 text-xs disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
