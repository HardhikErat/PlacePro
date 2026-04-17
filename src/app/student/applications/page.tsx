'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, ChevronRight } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function StudentApplications() {
  const [showApply, setShowApply]       = useState(false)
  const [appId, setAppId]               = useState('')
  const [companyId, setCompanyId]       = useState('')
  const qc = useQueryClient()
  const { add } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => fetch('/api/applications').then(r => r.json()).then(d => d.data),
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => fetch('/api/companies').then(r => r.json()).then(d => d.data),
  })

  const applyMutation = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Application submitted!', 'success')
      qc.invalidateQueries({ queryKey: ['applications'] })
      setShowApply(false); setAppId(''); setCompanyId('')
    },
  })

  const apps = data?.applications ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{apps.length} applications</p>
          </div>
          <button onClick={() => setShowApply(true)} className="btn-primary">
            <Plus size={16} /> Apply
          </button>
        </div>

        {showApply && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApply(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display font-bold text-lg text-foreground mb-4">New Application</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">application_id</label>
                  <input type="number" className="input-field" placeholder="e.g. 511"
                    value={appId} onChange={e => setAppId(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">company_id</label>
                  <select className="input-field" value={companyId} onChange={e => setCompanyId(e.target.value)}>
                    <option value="">Select company</option>
                    {(companies ?? []).map((c: any) => (
                      <option key={c.company_id} value={c.company_id}>
                        [{c.company_id}] {c.company_name} — {c.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowApply(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  disabled={!appId || !companyId || applyMutation.isPending}
                  onClick={() => applyMutation.mutate({ application_id: appId, company_id: companyId })}
                  className="btn-primary flex-1 justify-center"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLoading ? <SkeletonTable rows={5} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['application_id','student_id','company_id','company_name','location','round_no','result'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 font-mono">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {apps.map((a: any, i: number) => (
                    <motion.tr key={a.application_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{a.application_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.student_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.company_id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{a.company?.company_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.company?.location}</td>
                      <td className="px-4 py-3 text-xs text-violet-400">
                        {a.interviews?.map((iv: any) => `Round ${iv.round_no}`).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {a.interviews?.map((iv: any) => (
                          <span key={iv.interview_id}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mr-1
                              ${iv.result === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                          >{iv.result}</span>
                        ))}
                        {!a.interviews?.length && <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </motion.tr>
                  ))}
                  {!apps.length && (
                    <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">No applications yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
