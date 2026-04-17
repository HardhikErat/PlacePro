'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Plus, Trash2, AlertTriangle, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'

export default function AdminSkills() {
  const [skillId, setSkillId]     = useState('')
  const [skillName, setSkillName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null)
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => fetch('/api/skills').then(r => r.json()).then(d => d.data),
  })

  const addSkill = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Skill added!', 'success')
      qc.invalidateQueries({ queryKey: ['skills'] })
      setSkillId(''); setSkillName('')
    },
  })

  const deleteSkill = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/skills/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Skill deleted', 'success')
      qc.invalidateQueries({ queryKey: ['skills'] })
      setConfirmDelete(null)
    },
    onError: () => add('Failed to delete skill', 'error'),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Skills</h1>
          <p className="text-sm text-muted-foreground">{skills?.length ?? 0} skills in the system</p>
        </div>

        {/* Add skill */}
        <div className="glass rounded-2xl p-5 border border-white/[0.06]">
          <h2 className="text-sm font-semibold text-foreground mb-3">Add New Skill</h2>
          <div className="flex gap-2">
            <input type="number" className="input-field w-32" placeholder="Skill ID"
              value={skillId} onChange={e => setSkillId(e.target.value)} />
            <input className="input-field flex-1" placeholder="Skill name (e.g. Rust, Kubernetes…)"
              value={skillName} onChange={e => setSkillName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && skillId && skillName && addSkill.mutate({ skill_id: skillId, skill_name: skillName })} />
            <button
              disabled={!skillId || !skillName || addSkill.isPending}
              onClick={() => addSkill.mutate({ skill_id: skillId, skill_name: skillName })}
              className="btn-primary shrink-0"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Skills table */}
        <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['skill_id', 'skill_name', 'Used in placements', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : (skills ?? []).map((s: any, i: number) => (
                <motion.tr key={s.skill_id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-sm font-bold text-blue-400">{s.skill_id}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                      {s.skill_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-violet-400">
                    {s.placement_skills?.length ?? 0} placement(s)
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirmDelete({ id: s.skill_id, name: s.skill_name })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
              {!isLoading && !skills?.length && (
                <tr><td colSpan={4} className="text-center text-sm text-muted-foreground py-10">No skills yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
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
              <h2 className="font-display font-bold text-lg text-foreground text-center mb-1">Delete Skill</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Delete <span className="font-semibold text-foreground">"{confirmDelete.name}"</span>?
                This will also remove it from all linked placements.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  disabled={deleteSkill.isPending}
                  onClick={() => deleteSkill.mutate(confirmDelete.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {deleteSkill.isPending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Trash2 size={14} /> Delete</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
