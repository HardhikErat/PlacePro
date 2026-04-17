'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'
import { useAuthStore } from '@/stores/auth'

export default function RecruiterApplications() {
  const [showInterview, setShowInterview] = useState(false)
  const [selected, setSelected]           = useState<any>(null)
  const [form, setForm] = useState({ interview_id: '', round_no: '1', result: 'Pass' })
  const { add }    = useToast()
  const { user }   = useAuthStore()
  const qc         = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['rec-apps'],
    queryFn: () => fetch('/api/applications?limit=100').then(r => r.json()).then(d => d.data),
  })

  const addInterview = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Interview recorded!', 'success')
      setShowInterview(false)
      setForm({ interview_id: '', round_no: '1', result: 'Pass' })
      qc.invalidateQueries({ queryKey: ['rec-apps'] })
    },
  })

  const apps = data?.applications ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{apps.length} applications for your company</p>
        </div>

        {/* Interview modal */}
        {showInterview && selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInterview(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-display font-bold text-lg text-foreground">Record Interview</h2>
                <button onClick={() => setShowInterview(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Application #{selected.application_id} — {selected.student?.name}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Interview ID (must be unique)</label>
                  <input type="number" className="input-field" placeholder="e.g. 611"
                    value={form.interview_id} onChange={e => setForm(f => ({ ...f, interview_id: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Round Number</label>
                  <input type="number" min="1" className="input-field"
                    value={form.round_no} onChange={e => setForm(f => ({ ...f, round_no: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Result</label>
                  <select className="input-field" value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value }))}>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowInterview(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  disabled={addInterview.isPending || !form.interview_id}
                  className="btn-primary flex-1 justify-center"
                  onClick={() => addInterview.mutate({
                    interview_id:   form.interview_id,
                    application_id: selected.application_id,
                    recruiter_id:   user?.id ?? 301,
                    round_no:       form.round_no,
                    result:         form.result,
                  })}
                >
                  {addInterview.isPending ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLoading ? <SkeletonTable rows={6} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['App ID','Student','CGPA','Dept','Company','Interviews','Action'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.student?.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{a.student?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">{a.student?.cgpa}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.student?.department?.dept_name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.company?.company_name}</td>
                      <td className="px-4 py-3">
                        {a.interviews?.length ? (
                          <div className="flex gap-1 flex-wrap">
                            {a.interviews.map((iv: any) => (
                              <span key={iv.interview_id}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  iv.result === 'Pass'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >R{iv.round_no}: {iv.result}</span>
                            ))}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">None yet</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelected(a); setShowInterview(true) }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
                        >
                          + Interview
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {!apps.length && <tr><td colSpan={7} className="text-center text-sm text-muted-foreground py-12">No applications found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
