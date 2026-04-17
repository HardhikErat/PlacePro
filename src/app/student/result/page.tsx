'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, Building2, Briefcase, IndianRupee, Sparkles } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function StudentResult() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['my-results'],
    queryFn: () => fetch('/api/placement-results').then(r => r.json()).then(d => d.data),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Placement Result</h1>
          <p className="text-sm text-muted-foreground mt-0.5">placement_result table records</p>
        </div>

        {isLoading ? (
          <div className="glass rounded-2xl p-8 border border-white/[0.06] animate-pulse h-40" />
        ) : results?.length ? (
          <div className="space-y-4">
            {results.map((r: any, i: number) => (
              <motion.div key={r.result_id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`glass rounded-2xl p-6 border ${r.status === 'Selected' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.status === 'Selected' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {r.status === 'Selected' ? <Sparkles size={18} className="text-emerald-400" /> : <Award size={18} className="text-red-400" />}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">result_id = {r.result_id}</p>
                      <p className="font-mono text-xs text-muted-foreground">student_id = {r.student_id} · placement_id = {r.placement_id}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-xl ${r.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    status: {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 size={10} /> company_name</p>
                    <p className="text-sm font-semibold text-foreground">{r.placement?.company?.company_name}</p>
                    <p className="text-xs text-muted-foreground">{r.placement?.company?.location}</p>
                  </div>
                  <div className="glass rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase size={10} /> role</p>
                    <p className="text-sm font-semibold text-foreground">{r.placement?.role}</p>
                  </div>
                  <div className="glass rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><IndianRupee size={10} /> ctc</p>
                    <p className="font-display font-bold text-xl text-emerald-400">₹{r.placement?.ctc?.toLocaleString()}</p>
                  </div>
                </div>

                {r.placement?.placement_skills?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Required skills (placement_skill)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.placement.placement_skills.map((ps: any) => (
                        <span key={ps.skill_id} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                          {ps.skill_id} · {ps.skill.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 border border-white/[0.06] text-center">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-sm text-muted-foreground">No placement result record found for your student_id</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
