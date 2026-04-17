'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Search, MapPin, IndianRupee, Trash2, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function AdminPlacements() {
  const [search, setSearch]               = useState('')
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; role: string; company: string } | null>(null)
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: placements, isLoading } = useQuery({
    queryKey: ['admin-placements', search],
    queryFn: () => fetch(`/api/placements?search=${search}`).then(r => r.json()).then(d => d.data),
  })

  const deletePlacement = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/placements/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Placement deleted', 'success')
      qc.invalidateQueries({ queryKey: ['admin-placements'] })
      setConfirmDelete(null)
    },
    onError: () => add('Failed to delete placement', 'error'),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Placements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{placements?.length ?? 0} placement records</p>
        </div>

        <div className="flex items-center gap-2 glass border border-white/[0.08] rounded-lg px-3 py-2 max-w-xs">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search by role…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>

        {isLoading ? <SkeletonTable rows={6} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['ID', 'Role', 'Company', 'Location', 'CTC', 'Skills', 'Results', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(placements ?? []).map((p: any, i: number) => (
                    <motion.tr key={p.placement_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{p.placement_id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{p.role}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.company?.company_name}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={10} />{p.company?.location}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">
                        <span className="flex items-center gap-0.5"><IndianRupee size={11} />{p.ctc?.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.placement_skills?.map((ps: any) => (
                            <span key={ps.skill_id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{ps.skill.skill_name}</span>
                          ))}
                          {!p.placement_skills?.length && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-violet-400">{p._count?.placement_results ?? 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmDelete({ id: p.placement_id, role: p.role, company: p.company?.company_name })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {!placements?.length && (
                    <tr><td colSpan={8} className="text-center text-sm text-muted-foreground py-12">No placements found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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
                Delete <span className="font-semibold text-foreground">"{confirmDelete.role}"</span> at <span className="font-semibold text-foreground">{confirmDelete.company}</span>?
                All associated skill links and results will also be removed.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  disabled={deletePlacement.isPending}
                  onClick={() => deletePlacement.mutate(confirmDelete.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {deletePlacement.isPending
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
