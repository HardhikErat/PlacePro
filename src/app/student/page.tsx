'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Briefcase, BookOpen, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/stores/auth'

export default function StudentDashboard() {
  const { user } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => fetch('/api/students').then(r => r.json()).then(d => d.data),
  })

  const { data: internships } = useQuery({
    queryKey: ['internships'],
    queryFn: () => fetch('/api/internships').then(r => r.json()).then(d => d.data),
  })

  const { data: placements } = useQuery({
    queryKey: ['placements'],
    queryFn: () => fetch('/api/placements').then(r => r.json()).then(d => d.data),
  })

  const apps    = profile?.applications ?? []
  const results = profile?.placement_results ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-violet-500/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">student table</p>
              <h1 className="font-display text-2xl font-bold text-foreground">{profile?.name ?? user?.name} 👋</h1>
              <div className="mt-1.5 space-y-0.5">
                <p className="font-mono text-xs text-muted-foreground">student_id = <span className="text-blue-400">{profile?.student_id}</span></p>
                <p className="font-mono text-xs text-muted-foreground">
                  cgpa = <span className="text-emerald-400 font-semibold">{profile?.cgpa}</span> · dept_id = <span className="text-violet-400">{profile?.dept_id}</span> · {profile?.department?.dept_name}
                </p>
              </div>
            </div>
            {results.length > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-mono mb-1">placement_result</p>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${results[0].status === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {results[0].status === 'Selected' ? '🎉 Selected' : results[0].status}
                </span>
                <p className="text-xs text-muted-foreground mt-1">{results[0].placement?.company?.company_name}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard title="Applications"  value={apps.length}                         icon={FileText}  color="blue"    delay={0}    />
              <StatCard title="Interviews"     value={apps.reduce((n: number, a: any) => n + (a.interviews?.length ?? 0), 0)} icon={Award} color="violet" delay={0.05} />
              <StatCard title="Placements"     value={placements?.length ?? 0}             icon={Briefcase} color="emerald" delay={0.1}  />
              <StatCard title="Internships"    value={internships?.length ?? 0}            icon={BookOpen}  color="amber"   delay={0.15} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Internships */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-semibold text-sm text-foreground">Internships</h2>
              <Link href="/student/internships" className="text-xs text-primary flex items-center gap-1 hover:text-primary/80">View all <ArrowRight size={12} /></Link>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mb-3">internship table</p>
            <div className="space-y-2">
              {(internships ?? []).slice(0, 4).map((i: any) => (
                <div key={i.internship_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{i.company?.company_name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">duration_months: {i.duration_months}</p>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold whitespace-nowrap">₹{i.stipend?.toLocaleString()}</p>
                </div>
              ))}
              {!internships?.length && <p className="text-xs text-muted-foreground text-center py-4">No internships</p>}
            </div>
          </motion.div>

          {/* Applications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-semibold text-sm text-foreground">My Applications</h2>
              <Link href="/student/applications" className="text-xs text-primary flex items-center gap-1 hover:text-primary/80">View all <ArrowRight size={12} /></Link>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground mb-3">application table</p>
            <div className="space-y-2">
              {apps.slice(0, 4).map((a: any) => (
                <div key={a.application_id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                    {a.company?.company_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.company?.company_name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">app_id: {a.application_id} · company_id: {a.company_id}</p>
                  </div>
                  <span className="text-xs text-blue-400 font-mono">{a.interviews?.length ?? 0} ivs</span>
                </div>
              ))}
              {!apps.length && (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground mb-2">No applications yet</p>
                  <Link href="/student/placements" className="btn-primary text-xs py-1.5">Browse Placements</Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Placements */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-sm text-foreground">Placements</h2>
            <Link href="/student/placements" className="text-xs text-primary flex items-center gap-1 hover:text-primary/80">Browse all <ArrowRight size={12} /></Link>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mb-3">placement table</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(placements ?? []).slice(0, 6).map((p: any) => (
              <div key={p.placement_id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 hover:bg-primary/5 transition-all group">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.role}</p>
                  <p className="text-xs text-emerald-400 font-mono shrink-0">₹{p.ctc?.toLocaleString()}</p>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">{p.company?.company_name}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.placement_skills?.slice(0, 2).map((ps: any) => (
                    <span key={ps.skill_id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                      {ps.skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
