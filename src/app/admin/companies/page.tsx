'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Building2, Plus, MapPin, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function AdminCompanies() {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ company_id: '', company_name: '', location: '' })
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => fetch('/api/companies').then(r => r.json()).then(d => d.data),
  })

  const addCompany = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Company inserted!', 'success')
      qc.invalidateQueries({ queryKey: ['companies'] })
      setShowAdd(false)
      setForm({ company_id: '', company_name: '', location: '' })
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Companies</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{companies?.length ?? 0} records in company table</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> Insert Row</button>
        </div>

        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-foreground">Insert Company</h2>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mb-4">INSERT INTO company (company_id, company_name, location) VALUES (...)</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">company_id INT PK</label>
                  <input type="number" className="input-field" placeholder="e.g. 211"
                    value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">company_name VARCHAR(150)</label>
                  <input className="input-field" placeholder="e.g. Zoho" value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground mb-1 block">location VARCHAR(150)</label>
                  <input className="input-field" placeholder="e.g. Chennai" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button disabled={addCompany.isPending || !form.company_id || !form.company_name} onClick={() => addCompany.mutate(form)} className="btn-primary flex-1 justify-center">
                  {addCompany.isPending ? 'Inserting...' : 'INSERT'}
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
                    {['company_id','company_name','location','placements','internships','applications','recruiters'].map(h => (
                      <th key={h} className="text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(companies ?? []).map((c: any, i: number) => (
                    <motion.tr key={c.company_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-bold text-blue-400">{c.company_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                            {c.company_name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{c.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1 mt-2"><MapPin size={10} />{c.location}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-400">{c.placements?.length ?? 0}</td>
                      <td className="px-4 py-3 font-mono text-xs text-cyan-400">{c.internships?.length ?? 0}</td>
                      <td className="px-4 py-3 font-mono text-xs text-violet-400">{c._count?.applications ?? 0}</td>
                      <td className="px-4 py-3 font-mono text-xs text-amber-400">{c._count?.recruiters ?? 0}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
