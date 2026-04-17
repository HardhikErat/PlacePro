'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, X, Award } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function RecruiterResults() {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ result_id: '', student_id: '', placement_id: '', status: 'Selected' })
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: results, isLoading } = useQuery({
    queryKey: ['all-results'],
    queryFn: () => fetch('/api/placement-results').then(r => r.json()).then(d => d.data),
  })

  const { data: placementsData } = useQuery({
    queryKey: ['placements'],
    queryFn: () => fetch('/api/placements').then(r => r.json()).then(d => d.data ?? []),
  })

  const addResult = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/placement-results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Result recorded!', 'success')
      qc.invalidateQueries({ queryKey: ['all-results'] })
      setShowAdd(false)
      setForm({ result_id: '', student_id: '', placement_id: '', status: 'Selected' })
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Placement Results</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{results?.length ?? 0} results recorded</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Add Result</button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-foreground">Record Placement Result</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'result_id', label: 'Result ID', placeholder: 'e.g. 811' },
                  { key: 'student_id', label: 'Student ID', placeholder: 'e.g. 101' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <input type="number" className="input-field" placeholder={f.placeholder}
                      value={(form as any)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Placement</label>
                  <select className="input-field" value={form.placement_id} onChange={e => setForm(f => ({ ...f, placement_id: e.target.value }))}>
                    <option value="">Select placement</option>
                    {(placementsData ?? []).map((p: any) => (
                      <option key={p.placement_id} value={p.placement_id}>
                        {p.role} — {p.company?.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  disabled={addResult.isPending || !form.result_id || !form.student_id || !form.placement_id}
                  className="btn-primary flex-1 justify-center"
                  onClick={() => addResult.mutate(form)}
                >
                  {addResult.isPending ? 'Saving...' : 'Record Result'}
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
                    {['Result ID','Student','CGPA','Role','Company','CTC','Status'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(results ?? []).map((r: any, i: number) => (
                    <motion.tr key={r.result_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{r.result_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {r.student?.name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{r.student?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">{r.student?.cgpa}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.placement?.role}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.placement?.company?.company_name}</td>
                      <td className="px-4 py-3 text-xs text-emerald-400 font-mono">₹{r.placement?.ctc?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          r.status === 'Selected'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>{r.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                  {!results?.length && (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                        <p className="text-sm text-muted-foreground">No results recorded yet</p>
                      </td>
                    </tr>
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
