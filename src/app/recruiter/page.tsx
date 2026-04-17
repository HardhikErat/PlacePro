'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Users, Briefcase, BookOpen, ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/stores/auth'

export default function RecruiterDashboard() {
  const { user } = useAuthStore()

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['recruiter-applications'],
    queryFn: () => fetch('/api/applications?limit=50').then(r => r.json()).then(d => d.data),
  })

  const { data: interviewsData } = useQuery({
    queryKey: ['recruiter-interviews'],
    queryFn: () => fetch('/api/interviews').then(r => r.json()).then(d => d.data),
  })

  const apps       = appsData?.applications ?? []
  const interviews = interviewsData ?? []
  const passes     = interviews.filter((iv: any) => iv.result === 'Pass').length
  const fails      = interviews.filter((iv: any) => iv.result === 'Fail').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-pink-500/5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recruiter Portal</p>
              <h1 className="font-display text-2xl font-bold text-foreground">Hello, {user?.name} 👋</h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">recruiter_id: {user?.id}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/recruiter/internships/new" className="btn-secondary text-xs py-2">
                <BookOpen size={14} /> Post Internship
              </Link>
              <Link href="/recruiter/placements/new" className="btn-primary text-xs py-2">
                <Plus size={14} /> Post Placement
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard title="Applications" value={apps.length}       icon={FileText}  color="blue"    delay={0}    />
              <StatCard title="Interviews"   value={interviews.length} icon={Users}     color="violet"  delay={0.05} />
              <StatCard title="Pass"         value={passes}            icon={Briefcase} color="emerald" delay={0.1}  />
              <StatCard title="Fail"         value={fails}             icon={FileText}  color="amber"   delay={0.15} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Applications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-5 border border-white/[0.06] xl:col-span-2"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-semibold text-sm text-foreground">Applications</h2>
              <Link href="/recruiter/applications" className="text-xs text-primary flex items-center gap-1 hover:text-primary/80">
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mb-3">SELECT * FROM application WHERE company_id = {'{your_company}'}</p>
            <div className="space-y-2">
              {apps.slice(0, 6).map((a: any, i: number) => (
                <motion.div key={a.application_id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {a.student?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.student?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      student_id: {a.student_id} · dept: {a.student?.department?.dept_name} · cgpa: {a.student?.cgpa}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-[10px] text-blue-400">app #{a.application_id}</p>
                    <p className="text-[10px] text-muted-foreground">{a.interviews?.length ?? 0} interviews</p>
                  </div>
                </motion.div>
              ))}
              {!apps.length && <p className="text-xs text-muted-foreground text-center py-6">No applications yet</p>}
            </div>
          </motion.div>

          {/* Interviews */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <h2 className="font-display font-semibold text-sm text-foreground mb-1">Interviews</h2>
            <p className="text-[10px] text-muted-foreground font-mono mb-3">interview table records</p>
            <div className="space-y-2">
              {interviews.slice(0, 7).map((iv: any) => (
                <div key={iv.interview_id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-foreground">{iv.application?.student?.name}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono
                      ${iv.result === 'Pass' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {iv.result}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    id:{iv.interview_id} · round_no:{iv.round_no} · app:{iv.application_id}
                  </p>
                </div>
              ))}
              {!interviews.length && <p className="text-xs text-muted-foreground text-center py-4">No interviews recorded</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
