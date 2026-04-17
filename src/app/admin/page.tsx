'use client'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Building2, FileText, Briefcase, BookOpen, Award, ArrowRight, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatCard from '@/components/dashboard/StatCard'
import { SkeletonCard } from '@/components/ui/Skeleton'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(r => r.json()).then(d => d.data),
  })
  const s = data?.summary

  const quickLinks = [
    { label: 'Students',     href: '/admin/students',     icon: Users,     color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    count: s?.totalStudents     },
    { label: 'Companies',    href: '/admin/companies',    icon: Building2, color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  count: s?.totalCompanies    },
    { label: 'Applications', href: '/admin/applications', icon: FileText,  color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    count: s?.totalApplications },
    { label: 'Placements',   href: '/admin/placements',   icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', count: s?.totalPlacements   },
    { label: 'Internships',  href: '/admin/internships',  icon: BookOpen,  color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   count: s?.totalInternships  },
    { label: 'Analytics',    href: '/admin/analytics',    icon: BarChart3, color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/20',    count: undefined            },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor the entire placement portal</p>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard title="Students"     value={s?.totalStudents ?? 0}     icon={Users}     color="blue"    delay={0}    />
              <StatCard title="Companies"    value={s?.totalCompanies ?? 0}    icon={Building2} color="violet"  delay={0.05} />
              <StatCard title="Applications" value={s?.totalApplications ?? 0} icon={FileText}  color="cyan"    delay={0.1}  />
              <StatCard title="Placements"   value={s?.totalPlacements ?? 0}   icon={Briefcase} color="emerald" delay={0.15} />
              <StatCard title="Internships"  value={s?.totalInternships ?? 0}  icon={BookOpen}  color="amber"   delay={0.2}  />
              <StatCard title="Selected"     value={`${s?.placementRate ?? 0}%`} icon={Award}  color="emerald" delay={0.25} />
            </>
          )}
        </div>

        {/* Quick navigation cards */}
        <div>
          <h2 className="font-display font-semibold text-sm text-foreground mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((item, i) => (
              <motion.div key={item.href}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link href={item.href}>
                  <div className={`glass-hover rounded-xl p-4 border ${item.border} flex items-center gap-3 group cursor-pointer`}>
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      {item.count !== undefined && (
                        <p className={`text-xs font-mono ${item.color}`}>{item.count} records</p>
                      )}
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="glass rounded-2xl p-5 border border-white/[0.06]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-foreground">Recent Applications</h2>
            <Link href="/admin/applications" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.recentApplications ?? []).map((a: any, i: number) => (
              <motion.div key={a.application_id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.04 }}
                className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {a.student?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.student?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">→ {a.company?.company_name}</p>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">#{a.application_id}</span>
              </motion.div>
            ))}
            {!data?.recentApplications?.length && !isLoading && (
              <p className="text-xs text-muted-foreground text-center py-4">No applications yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
