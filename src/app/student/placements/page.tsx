'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search, MapPin, IndianRupee, CheckCircle, Briefcase } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'

export default function StudentPlacements() {
  const [search, setSearch]     = useState('')
  const [showApply, setShowApply] = useState(false)
  const [appId, setAppId]       = useState('')
  const [selectedPlacement, setSelectedPlacement] = useState<any>(null)
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: placements, isLoading } = useQuery({
    queryKey: ['placements', search],
    queryFn: () => fetch(`/api/placements?search=${search}`).then(r => r.json()).then(d => d.data),
  })

  const { data: myApps } = useQuery({
    queryKey: ['my-apps'],
    queryFn: () => fetch('/api/applications').then(r => r.json()).then(d => d.data?.applications ?? []),
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
      qc.invalidateQueries({ queryKey: ['my-apps'] })
      setShowApply(false); setAppId('')
    },
  })

  const appliedCompanyIds = new Set((myApps ?? []).map((a: any) => a.company_id))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Placements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{placements?.length ?? 0} records in placement table</p>
        </div>

        <div className="flex items-center gap-2 glass border border-white/[0.08] rounded-xl px-4 py-3 max-w-md">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search by role..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>

        {/* Apply modal */}
        {showApply && selectedPlacement && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-display font-bold text-lg text-foreground mb-1">Apply to {selectedPlacement.company?.company_name}</h2>
              <p className="text-xs text-muted-foreground font-mono mb-4">company_id: {selectedPlacement.company_id}</p>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block font-mono">application_id (PK — choose unused int)</label>
                <input type="number" className="input-field" placeholder="e.g. 511"
                  value={appId} onChange={e => setAppId(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowApply(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  disabled={!appId || applyMutation.isPending}
                  onClick={() => applyMutation.mutate({ application_id: appId, company_id: selectedPlacement.company_id })}
                  className="btn-primary flex-1 justify-center"
                >
                  {applyMutation.isPending ? 'Submitting...' : 'INSERT'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl p-5 border border-white/[0.06] h-40 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(placements ?? []).map((p: any, i: number) => {
              const applied = appliedCompanyIds.has(p.company_id)
              return (
                <motion.div key={p.placement_id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-hover rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 shrink-0">
                        {p.company?.company_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.company?.company_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={9} /> {p.company?.location}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                      <IndianRupee size={10} />{p.ctc?.toLocaleString()}
                    </p>
                  </div>

                  {/* DB fields */}
                  <div className="glass rounded-lg p-2.5 border border-white/[0.05] space-y-0.5">
                    <p className="font-mono text-[10px] text-muted-foreground">placement_id: <span className="text-blue-400">{p.placement_id}</span></p>
                    <p className="font-mono text-[10px] text-muted-foreground">company_id: <span className="text-violet-400">{p.company_id}</span></p>
                    <p className="font-mono text-[10px] text-muted-foreground">role: <span className="text-foreground">{p.role}</span></p>
                    <p className="font-mono text-[10px] text-muted-foreground">ctc: <span className="text-emerald-400">{p.ctc}</span></p>
                  </div>

                  {/* Skills */}
                  {p.placement_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.placement_skills.map((ps: any) => (
                        <span key={ps.skill_id} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-muted-foreground border border-white/[0.08] font-mono">
                          {ps.skill.skill_name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground">{p._count?.placement_results ?? 0} results recorded</p>
                    {applied ? (
                      <button disabled className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed">
                        <CheckCircle size={11} /> Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelectedPlacement(p); setShowApply(true) }}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        <Briefcase size={11} /> Apply
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
            {!placements?.length && <div className="col-span-3 text-center text-muted-foreground text-sm py-16">No placements found</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
