'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Building2, FileText, Briefcase, BookOpen, Award } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import { SkeletonCard } from '@/components/ui/Skeleton'

const RESULT_COLORS: Record<string, string> = { Pass: '#10b981', Fail: '#ef4444' }
const DEPT_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316','#a855f7']

const Tip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="glass border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
    <p className="text-muted-foreground mb-1">{label}</p>
    {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>)}
  </div>
) : null

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()).then(d => d.data),
  })
  const s = data?.summary

  const interviewPie = (data?.interviewStats ?? []).map((x: any) => ({
    name: x.result ?? 'Unknown',
    value: x._count?.result ?? 0,
  }))
  const deptBar = data?.departmentStats ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">System-wide statistics and insights</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard title="Students"     value={s?.totalStudents ?? 0}     icon={Users}     color="blue"    delay={0}    />
              <StatCard title="Companies"    value={s?.totalCompanies ?? 0}    icon={Building2} color="violet"  delay={0.05} />
              <StatCard title="Applications" value={s?.totalApplications ?? 0} icon={FileText}  color="cyan"    delay={0.1}  />
              <StatCard title="Placements"   value={s?.totalPlacements ?? 0}   icon={Briefcase} color="emerald" delay={0.15} />
              <StatCard title="Internships"  value={s?.totalInternships ?? 0}  icon={BookOpen}  color="amber"   delay={0.2}  />
              <StatCard title="Selected %"   value={`${s?.placementRate ?? 0}%`} icon={Award}  color="emerald" delay={0.25} />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Interview Pass/Fail Pie */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <h2 className="font-display font-semibold text-sm text-foreground mb-4">Interview Results</h2>
            {isLoading ? <div className="h-48 skeleton rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={interviewPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {interviewPie.map((e: any, i: number) => <Cell key={i} fill={RESULT_COLORS[e.name] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                  <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Department bar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-5 border border-white/[0.06] lg:col-span-2"
          >
            <h2 className="font-display font-semibold text-sm text-foreground mb-4">Students per Department</h2>
            {isLoading ? <div className="h-48 skeleton rounded-xl" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptBar} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="dept_name" tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="total"  name="Total"    fill="#3b82f6" radius={[4,4,0,0]} fillOpacity={0.7} />
                  <Bar dataKey="placed" name="Selected" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* Bottom tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top companies */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <h2 className="font-display font-semibold text-sm text-foreground mb-4">Top Companies by Applications</h2>
            <div className="space-y-2">
              {(data?.topCompanies ?? []).map((c: any, i: number) => (
                <div key={c.company_id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-xs font-bold text-blue-400">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{c.company_name}</p>
                    <p className="text-xs text-muted-foreground">{c.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-400 font-medium">{c._count?.applications ?? 0} apps</p>
                    <p className="text-[10px] text-muted-foreground">{c._count?.placements ?? 0} placements</p>
                  </div>
                </div>
              ))}
              {!data?.topCompanies?.length && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
            </div>
          </motion.div>

          {/* Recent applications */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-5 border border-white/[0.06]"
          >
            <h2 className="font-display font-semibold text-sm text-foreground mb-4">Recent Applications</h2>
            <div className="space-y-2">
              {(data?.recentApplications ?? []).map((a: any) => (
                <div key={a.application_id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {a.student?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.student?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">→ {a.company?.company_name}</p>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">#{a.application_id}</span>
                </div>
              ))}
              {!data?.recentApplications?.length && <p className="text-xs text-muted-foreground text-center py-4">No data</p>}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
