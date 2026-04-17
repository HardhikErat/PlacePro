'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Briefcase, Trash2, AlertTriangle, Plus, IndianRupee, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'
import { useAuthStore } from '@/stores/auth'

export default function RecruiterPlacements() {
  const [form, setForm]           = useState({ placement_id: '', company_id: '', role: '', ctc: '' })
  const [skillIds, setSkillIds]   = useState<number[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; role: string } | null>(null)
  const { add }  = useToast()
  const { user } = useAuthStore()
  const qc       = useQueryClient()

  const { data: companies } = useQuery({ queryKey: ['companies'], queryFn: () => fetch('/api/companies').then(r => r.json()).then(d => d.data ?? []) })
  const { data: skills }    = useQuery({ queryKey: ['skills'],    queryFn: () => fetch('/api/skills').then(r => r.json()).then(d => d.data ?? []) })

  const { data: placements, isLoading } = useQuery({
    queryKey: ['rec-placements'],
    queryFn: async () => {
      const rec = await fetch('/api/recruiters/me').then(r => r.json()).then(d => d.data)
      if (!rec?.company_id) return []
      return fetch(`/api/placements?company_id=${rec.company_id}`).then(r => r.json()).then(d => d.data ?? [])
    },
  })

  const post = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/placements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Placement posted!', 'success')
      qc.invalidateQueries({ queryKey: ['rec-placements'] })
      setShowForm(false)
      setForm({ placement_id: '', company_id: '', role: '', ctc: '' })
      setSkillIds([])
    },
  })

  const deletePlacement = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/placements/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Placement deleted', 'success')
      qc.invalidateQueries({ queryKey: ['rec-placements'] })
      setConfirmDelete(null)
    },
  })

  const toggleSkill = (id: number) =>
    setSkillIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Placements</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your company's placement listings</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> Post Placement
          </button>
        </div>

        {/* Post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/5 space-y-4"
            >
              <h2 className="font-display font-semibold text-sm text-foreground">New Placement</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Placement ID</label>
                  <input type="number" className="input-field" placeholder="e.g. 711"
                    value={form.placement_id} onChange={e => setForm(f => ({ ...f, placement_id: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
                  <select className="input-field" value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}>
                    <option value="">Select company</option>
                    {(companies ?? []).map((c: any) => (
                      <option key={c.company_id} value={c.company_id}>{c.company_name} — {c.location}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Role</label>
                  <input className="input-field" placeholder="e.g. DevOps Engineer"
                    value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">CTC (₹ per annum)</label>
                  <input type="number" className="input-field" placeholder="e.g. 1200000"
                    value={form.ctc} onChange={e => setForm(f => ({ ...f, ctc: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                  {(skills ?? []).map((s: any) => {
                    const on = skillIds.includes(s.skill_id)
                    return (
                      <button type="button" key={s.skill_id} onClick={() => toggleSkill(s.skill_id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          on ? 'bg-primary/20 text-primary border-primary/40 font-semibold' : 'bg-white/[0.04] text-muted-foreground border-white/[0.08] hover:border-white/20'
                        }`}
                      >{s.skill_name}</button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button disabled={post.isPending} onClick={() => post.mutate({ ...form, skill_ids: skillIds })} className="btn-primary">
                  {post.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Briefcase size={15} /> Post</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placements list */}
        {isLoading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse border border-white/[0.06]" />)}</div>
        ) : (
          <div className="space-y-2">
            {(placements ?? []).map((p: any, idx: number) => (
              <motion.div key={p.placement_id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                className="glass rounded-xl p-4 border border-white/[0.06] flex items-center gap-4 hover:border-white/10 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.role}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><MapPin size={10} />{p.company?.company_name}</span>
                    <span className="font-mono text-[10px]">ID: {p.placement_id}</span>
                  </p>
                  {p.placement_skills?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.placement_skills.map((ps: any) => (
                        <span key={ps.skill_id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{ps.skill.skill_name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-emerald-400 shrink-0 flex items-center gap-0.5">
                  <IndianRupee size={12} />{p.ctc?.toLocaleString()}
                </p>
                <button
                  onClick={() => setConfirmDelete({ id: p.placement_id, role: p.role })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            ))}
            {!placements?.length && (
              <div className="glass rounded-2xl p-10 border border-white/[0.06] text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No placements posted yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div initial={{ scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 border border-red-500/30 w-full max-w-sm shadow-2xl bg-red-500/5"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <h2 className="font-display font-bold text-lg text-foreground text-center mb-1">Delete Placement</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Delete <span className="font-semibold text-foreground">"{confirmDelete.role}"</span>?
                All skill links and results will be removed too.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button disabled={deletePlacement.isPending} onClick={() => deletePlacement.mutate(confirmDelete.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {deletePlacement.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
