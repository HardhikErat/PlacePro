'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'

export default function StudentInterviews() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => fetch('/api/students').then(r => r.json()).then(d => d.data),
  })

  const interviews = (profile?.applications ?? []).flatMap((a: any) =>
    (a.interviews ?? []).map((iv: any) => ({ ...iv, company: a.company, application_id: a.application_id }))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Interviews</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{interviews.length} interview records</p>
        </div>

        {isLoading ? <SkeletonTable rows={5} /> : interviews.length ? (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Interview ID','Application ID','Company','Recruiter','Round','Result'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {interviews.map((iv: any, i: number) => (
                    <motion.tr key={iv.interview_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{iv.interview_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{iv.application_id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{iv.company?.company_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{iv.recruiter?.recruiter_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Round {iv.round_no}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          iv.result === 'Pass'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>{iv.result}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 border border-white/[0.06] text-center">
            <Users className="w-14 h-14 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">No interview records yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
