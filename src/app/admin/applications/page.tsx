'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function AdminApplications() {
  const [page, setPage] = useState(1)
  const limit = 15

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page],
    queryFn: () => fetch(`/api/applications?page=${page}&limit=${limit}`).then(r => r.json()).then(d => d.data),
    placeholderData: (p: any) => p,
  })

  const applications = data?.applications ?? []
  const total        = data?.total ?? 0
  const totalPages   = Math.ceil(total / limit)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total applications</p>
        </div>

        {isLoading ? <SkeletonTable rows={8} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['App ID','Student','CGPA','Department','Company','Location','Interviews'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {applications.map((a: any, i: number) => (
                    <motion.tr key={a.application_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{a.application_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.student?.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">ID: {a.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">{a.student?.cgpa}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.student?.department?.dept_name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{a.company?.company_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.company?.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {a.interviews?.length ? a.interviews.map((iv: any) => (
                            <span key={iv.interview_id}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                iv.result === 'Pass'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                              }`}
                            >R{iv.round_no}:{iv.result}</span>
                          )) : <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {!applications.length && <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">No applications found</td></tr>}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                <p className="text-xs text-muted-foreground">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
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
