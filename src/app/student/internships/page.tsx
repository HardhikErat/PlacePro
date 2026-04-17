'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Search, MapPin, Clock, IndianRupee, CheckCircle, BookOpen, X } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'

export default function StudentInternships() {
  const [search, setSearch]       = useState('')
  const [showApply, setShowApply] = useState(false)
  const [selected, setSelected]   = useState<any>(null)
  const [appId, setAppId]         = useState('')
  const { add } = useToast()
  const qc = useQueryClient()

  const { data: internships, isLoading } = useQuery({
    queryKey: ['internships'],
    queryFn: () => fetch('/api/internships').then(r => r.json()).then(d => d.data),
  })

  // My existing applications — used to check if already applied to a company
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
      add(`Applied to ${selected?.company?.company_name}!`, 'success')
      qc.invalidateQueries({ queryKey: ['my-apps'] })
      qc.invalidateQueries({ queryKey: ['applications'] })
      setShowApply(false)
      setAppId('')
      setSelected(null)
    },
    onError: () => add('Failed to submit application', 'error'),
  })

  const appliedCompanyIds = new Set((myApps ?? []).map((a: any) => a.company_id))

  const filtered = (internships ?? []).filter((i: any) =>
    !search || i.company?.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Internships</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} internship opportunities available</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 glass border border-white/[0.08] rounded-xl px-4 py-3 max-w-md">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search by company…" value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
        </div>

        {/* Apply modal */}
        <AnimatePresence>
          {showApply && selected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowApply(false)}
            >
              <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="glass rounded-2xl p-6 border border-white/10 w-full max-w-sm shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-foreground">Apply for Internship</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{selected.company?.company_name} · {selected.duration_months} months · ₹{selected.stipend?.toLocaleString()}/mo</p>
                  </div>
                  <button onClick={() => setShowApply(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                {/* Internship details card */}
                <div className="glass rounded-xl p-3 border border-cyan-500/20 bg-cyan-500/5 mb-4 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin size={11} className="text-cyan-400" /> {selected.company?.location}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock size={11} className="text-amber-400" /> Duration: {selected.duration_months} months
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <IndianRupee size={11} className="text-emerald-400" /> Stipend: ₹{selected.stipend?.toLocaleString()}/month
                  </p>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Application ID (choose a unique number)</label>
                  <input type="number" className="input-field" placeholder="e.g. 511"
                    value={appId} onChange={e => setAppId(e.target.value)} />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setShowApply(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                  <button
                    disabled={!appId || applyMutation.isPending}
                    onClick={() => applyMutation.mutate({ application_id: appId, company_id: selected.company_id })}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {applyMutation.isPending
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><BookOpen size={14} /> Apply Now</>
                    }
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-48 border border-white/[0.06] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((i: any, idx: number) => {
              const applied = appliedCompanyIds.has(i.company_id)
              return (
                <motion.div key={i.internship_id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-hover rounded-2xl p-5 border border-white/[0.06] flex flex-col gap-4"
                >
                  {/* Company */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400 text-base shrink-0">
                      {i.company?.company_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{i.company?.company_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={9} /> {i.company?.location}
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="glass rounded-lg p-2.5 border border-white/[0.05] text-center">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1"><Clock size={10} /> Duration</p>
                      <p className="text-sm font-bold text-amber-400">{i.duration_months} months</p>
                    </div>
                    <div className="glass rounded-lg p-2.5 border border-white/[0.05] text-center">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center justify-center gap-1"><IndianRupee size={10} /> Stipend</p>
                      <p className="text-sm font-bold text-emerald-400">₹{i.stipend?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <p className="text-[10px] text-muted-foreground font-mono">id: {i.internship_id}</p>
                    {applied ? (
                      <button disabled className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed">
                        <CheckCircle size={12} /> Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelected(i); setShowApply(true) }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                      >
                        <BookOpen size={12} /> Apply
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
            {!filtered.length && (
              <div className="col-span-3 glass rounded-2xl p-12 border border-white/[0.06] text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No internships found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
