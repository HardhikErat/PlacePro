'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Briefcase, BookOpen, FileText, Users,
  Building2, Award, BarChart3, ChevronLeft, LogOut, Settings, Star
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface NavItem { label: string; href: string; icon: React.ReactNode }

const studentNav: NavItem[] = [
  { label: 'Dashboard',       href: '/student',              icon: <LayoutDashboard size={18} /> },
  { label: 'Internships',     href: '/student/internships',  icon: <BookOpen size={18} /> },
  { label: 'Placements',      href: '/student/placements',   icon: <Briefcase size={18} /> },
  { label: 'My Applications', href: '/student/applications', icon: <FileText size={18} /> },
  { label: 'Interviews',      href: '/student/interviews',   icon: <Users size={18} /> },
  { label: 'My Result',       href: '/student/result',       icon: <Award size={18} /> },
  { label: 'Profile',         href: '/student/profile',      icon: <Settings size={18} /> },
]

const recruiterNav: NavItem[] = [
  { label: 'Dashboard',       href: '/recruiter',                  icon: <LayoutDashboard size={18} /> },
  { label: 'Post Internship', href: '/recruiter/internships/new',  icon: <BookOpen size={18} /> },
  { label: 'Post Placement',  href: '/recruiter/placements/new',   icon: <Briefcase size={18} /> },
  { label: 'Applications',    href: '/recruiter/applications',     icon: <FileText size={18} /> },
  { label: 'Interviews',      href: '/recruiter/interviews',       icon: <Users size={18} /> },
  { label: 'Results',         href: '/recruiter/results',          icon: <Award size={18} /> },
  { label: 'Profile',         href: '/recruiter/profile',          icon: <Settings size={18} /> },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard',    href: '/admin',                icon: <LayoutDashboard size={18} /> },
  { label: 'Students',     href: '/admin/students',       icon: <Users size={18} /> },
  { label: 'Companies',    href: '/admin/companies',      icon: <Building2 size={18} /> },
  { label: 'Placements',   href: '/admin/placements',     icon: <Briefcase size={18} /> },
  { label: 'Internships',  href: '/admin/internships',    icon: <BookOpen size={18} /> },
  { label: 'Applications', href: '/admin/applications',   icon: <FileText size={18} /> },
  { label: 'Skills',       href: '/admin/skills',         icon: <Star size={18} /> },
  { label: 'Analytics',    href: '/admin/analytics',      icon: <BarChart3 size={18} /> },
]

const navByRole: Record<string, NavItem[]> = { STUDENT: studentNav, RECRUITER: recruiterNav, ADMIN: adminNav }
const roleGradient: Record<string, string> = {
  STUDENT:   'from-blue-500 to-cyan-400',
  RECRUITER: 'from-violet-500 to-purple-400',
  ADMIN:     'from-amber-500 to-orange-400',
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const pathname = usePathname()

  if (!user) return null
  const navItems = navByRole[user.role] || []
  const grad = roleGradient[user.role]

  // Roots that should NOT prefix-match (only exact)
  const exactRoots = ['/student', '/recruiter', '/admin']

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col glass border-r border-white/[0.06] overflow-hidden shrink-0 relative z-20"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-lg`}>
          <span className="text-white font-bold text-sm font-display">P</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <p className="font-display font-bold text-foreground tracking-tight">PlacePro</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role.toLowerCase()} portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(item => {
          const isExact = exactRoots.includes(item.href)
          const isActive = isExact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? item.label : undefined}>
                <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && <motion.div layoutId={`dot-${user.role}`} className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
        <button onClick={() => logout()}
          className={`sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[4.5rem] w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-30"
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronLeft size={12} />
        </motion.div>
      </button>
    </motion.aside>
  )
}
