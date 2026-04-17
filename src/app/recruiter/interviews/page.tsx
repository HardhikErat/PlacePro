'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function RecruiterInterviews() {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ interview_id: '', application_id: '', round_no: '1', result: 'Pass' })
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['rec-interviews'],
    queryFn: () => fetch('/api/interviews').then(r => r.json()).then(d => d.data),
  })

  const { data: appsData } = useQuery({
    queryKey: ['rec-apps-mini'],
    queryFn: () => fetch('/api/applications?limit=100').then(r => r.json()).then(d => d.data?.applications ?? []),
  })

  const addInterview = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/interviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Interview recorded!', 'success')
      qc.invalidateQueries({ queryKey: ['rec-interviews'] })
      setShowAdd(false)
      setForm({ interview_id: '', application_id: '', round_no: '1', result: 'Pass' })
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Interviews</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{interviews?.length ?? 0} interview records</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add Interview</button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-foreground">Add Interview Record</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Interview ID</label>
                  <input type="number" className="input-field" placeholder="e.g. 611"
                    value={form.interview_id} onChange={e => setForm(f => ({ ...f, interview_id: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Application</label>
                  <select className="input-field" value={form.application_id} onChange={e => setForm(f => ({ ...f, application_id: e.target.value }))}>
                    <option value="">Select application</option>
                    {(appsData ?? []).map((a: any) => (
                      <option key={a.application_id} value={a.application_id}>
                        #{a.application_id} — {a.student?.name}
                      </option>
                    ))}
                  </select>
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
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  disabled={addInterview.isPending || !form.interview_id || !form.application_id}
                  className="btn-primary flex-1 justify-center"
                  onClick={() => addInterview.mutate({ ...form, recruiter_id: 301 })}
                >
                  {addInterview.isPending ? 'Saving...' : 'Add Record'}
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
                    {['Interview ID','Application ID','Student','Company','Round','Result'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(interviews ?? []).map((iv: any, i: number) => (
                    <motion.tr key={iv.interview_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{iv.interview_id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{iv.application_id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{iv.application?.student?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{iv.application?.company?.company_name ?? '—'}</td>
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
                  {!interviews?.length && <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-12">No interviews recorded</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
