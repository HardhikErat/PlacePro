'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Trash2, AlertTriangle, Plus, Clock, IndianRupee } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'
import { useAuthStore } from '@/stores/auth'

export default function RecruiterInternships() {
  const [form, setForm]           = useState({ internship_id: '', company_id: '', duration_months: '', stipend: '' })
  const [showForm, setShowForm]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; company: string } | null>(null)
  const { add }  = useToast()
  const { user } = useAuthStore()
  const router   = useRouter()
  const qc       = useQueryClient()

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => fetch('/api/companies').then(r => r.json()).then(d => d.data ?? []),
  })

  const { data: internships, isLoading } = useQuery({
    queryKey: ['rec-internships'],
    queryFn: async () => {
      // Get the recruiter's company_id and filter internships
      const rec = await fetch('/api/recruiters/me').then(r => r.json()).then(d => d.data)
      if (!rec?.company_id) return []
      return fetch(`/api/internships?company_id=${rec.company_id}`).then(r => r.json()).then(d => d.data ?? [])
    },
  })

  const post = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/internships', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Internship posted!', 'success')
      qc.invalidateQueries({ queryKey: ['rec-internships'] })
      setShowForm(false)
      setForm({ internship_id: '', company_id: '', duration_months: '', stipend: '' })
    },
  })

  const deleteInternship = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/internships/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Internship deleted', 'success')
      qc.invalidateQueries({ queryKey: ['rec-internships'] })
      setConfirmDelete(null)
    },
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Internships</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your company's internship listings</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus size={16} /> Post Internship
          </button>
        </div>

        {/* Post form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="glass rounded-2xl p-5 border border-blue-500/20 bg-blue-500/5 space-y-4"
            >
              <h2 className="font-display font-semibold text-sm text-foreground">New Internship</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Internship ID</label>
                  <input type="number" className="input-field" placeholder="e.g. 411"
                    value={form.internship_id} onChange={e => setForm(f => ({ ...f, internship_id: e.target.value }))} />
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
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration (months)</label>
                  <input type="number" className="input-field" placeholder="e.g. 3"
                    value={form.duration_months} onChange={e => setForm(f => ({ ...f, duration_months: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Monthly Stipend (₹)</label>
                  <input type="number" className="input-field" placeholder="e.g. 20000"
                    value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button disabled={post.isPending} onClick={() => post.mutate(form)} className="btn-primary">
                  {post.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><BookOpen size={15} /> Post</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Internships list */}
        {isLoading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-xl h-16 animate-pulse border border-white/[0.06]" />)}</div>
        ) : (
          <div className="space-y-2">
            {(internships ?? []).map((i: any, idx: number) => (
              <motion.div key={i.internship_id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }}
                className="glass rounded-xl p-4 border border-white/[0.06] flex items-center gap-4 hover:border-white/10 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{i.company?.company_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock size={10} />{i.duration_months} months</span>
                    <span className="font-mono text-[10px]">ID: {i.internship_id}</span>
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-400 shrink-0 flex items-center gap-0.5">
                  <IndianRupee size={12} />{i.stipend?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                </p>
                <button
                  onClick={() => setConfirmDelete({ id: i.internship_id, company: i.company?.company_name })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </motion.div>
            ))}
            {!internships?.length && (
              <div className="glass rounded-2xl p-10 border border-white/[0.06] text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No internships posted yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
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
              <h2 className="font-display font-bold text-lg text-foreground text-center mb-1">Delete Internship</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Delete the internship for <span className="font-semibold text-foreground">"{confirmDelete.company}"</span>?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button disabled={deleteInternship.isPending} onClick={() => deleteInternship.mutate(confirmDelete.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {deleteInternship.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Trash2 size={14} /> Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
