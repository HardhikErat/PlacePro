'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { BookOpen, MapPin, Clock, IndianRupee, Trash2, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { SkeletonTable } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toaster'

export default function AdminInternships() {
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; company: string } | null>(null)
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: internships, isLoading } = useQuery({
    queryKey: ['admin-internships'],
    queryFn: () => fetch('/api/internships').then(r => r.json()).then(d => d.data),
  })

  const deleteInternship = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/internships/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Internship deleted', 'success')
      qc.invalidateQueries({ queryKey: ['admin-internships'] })
      setConfirmDelete(null)
    },
    onError: () => add('Failed to delete internship', 'error'),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Internships</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{internships?.length ?? 0} internship records</p>
        </div>

        {isLoading ? <SkeletonTable rows={6} /> : (
          <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['ID', 'Company', 'Location', 'Duration', 'Stipend', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(internships ?? []).map((i: any, idx: number) => (
                    <motion.tr key={i.internship_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{i.internship_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                            <BookOpen size={13} className="text-cyan-400" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{i.company?.company_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={10} />{i.company?.location}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <Clock size={10} />{i.duration_months} months
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">
                        <span className="flex items-center gap-0.5"><IndianRupee size={11} />{i.stipend?.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmDelete({ id: i.internship_id, company: i.company?.company_name })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {!internships?.length && (
                    <tr><td colSpan={6} className="text-center text-sm text-muted-foreground py-12">No internships found</td></tr>
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
              <h2 className="font-display font-bold text-lg text-foreground text-center mb-1">Delete Internship</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Delete the internship offered by <span className="font-semibold text-foreground">"{confirmDelete.company}"</span>?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button
                  disabled={deleteInternship.isPending}
                  onClick={() => deleteInternship.mutate(confirmDelete.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                >
                  {deleteInternship.isPending
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
