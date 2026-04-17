'use client'
import Sidebar from '@/components/dashboard/Sidebar'
import { motion } from 'framer-motion'
import { Search, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-white/[0.06] glass flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 w-64">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-white/[0.08]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
