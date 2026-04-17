'use client'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon: LucideIcon
  color?: 'blue' | 'violet' | 'emerald' | 'amber' | 'cyan'
  delay?: number
}

const colorMap = {
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/20',    glow: 'shadow-blue-500/10' },
  violet:  { bg: 'bg-violet-500/10',  icon: 'text-violet-400',  border: 'border-violet-500/20',  glow: 'shadow-violet-500/10' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20',   glow: 'shadow-amber-500/10' },
  cyan:    { bg: 'bg-cyan-500/10',    icon: 'text-cyan-400',    border: 'border-cyan-500/20',    glow: 'shadow-cyan-500/10' },
}

export default function StatCard({ title, value, change, positive, icon: Icon, color = 'blue', delay = 0 }: StatCardProps) {
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`glass-hover rounded-2xl p-5 border ${c.border} shadow-xl ${c.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</p>
          {change && (
            <p className={`text-xs mt-1.5 font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={`${c.bg} p-3 rounded-xl`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  )
}
