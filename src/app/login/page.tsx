'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'

type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN'

export default function LoginPage() {
  const [role, setRole]       = useState<Role>('STUDENT')
  const [id, setId]           = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuthStore()
  const { add }     = useToast()
  const router      = useRouter()

  const roleConfig = {
    STUDENT:   { label: 'Student',   gradient: 'from-blue-500 to-cyan-400',    idLabel: 'Student ID',   idPlaceholder: 'Enter your student ID' },
    RECRUITER: { label: 'Recruiter', gradient: 'from-violet-500 to-purple-400', idLabel: 'Recruiter ID', idPlaceholder: 'Enter your recruiter ID' },
    ADMIN:     { label: 'Admin',     gradient: 'from-amber-500 to-orange-400',  idLabel: '',             idPlaceholder: '' },
  }
  const cfg = roleConfig[role]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: role !== 'ADMIN' ? id : undefined, password, role }),
      })
      const json = await res.json()
      if (!json.success) { add(json.error, 'error'); return }
      setUser(json.data)
      add(`Welcome, ${json.data.name}!`, 'success')
      router.push({ STUDENT: '/student', RECRUITER: '/recruiter', ADMIN: '/admin' }[role])
    } catch {
      add('Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.gradient} mx-auto mb-4 flex items-center justify-center shadow-2xl`}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-1">PlacePro</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/[0.08] shadow-2xl">
          {/* Role selector — pill style */}
          <div className="flex gap-2 mb-6">
            {(['STUDENT','RECRUITER','ADMIN'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setId(''); setPassword('') }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  role === r
                    ? `bg-gradient-to-r ${roleConfig[r].gradient} text-white border-transparent shadow-lg`
                    : 'bg-white/[0.04] text-muted-foreground border-white/[0.08] hover:bg-white/[0.08] hover:text-foreground'
                }`}
              >
                {roleConfig[r].label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID field — only for student/recruiter */}
            {role !== 'ADMIN' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{cfg.idLabel}</label>
                <input
                  type="number"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  placeholder={cfg.idPlaceholder}
                  className="input-field"
                  required
                  min="1"
                />
              </div>
            )}

            {/* Password field */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {role === 'ADMIN' ? 'Admin Secret Key' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={role === 'ADMIN' ? 'Enter admin secret' : 'Enter your password'}
                  className="input-field pr-10"
                  required
                />
                {/* Only show toggle for non-admin */}
                {role !== 'ADMIN' && (
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r ${cfg.gradient} text-white shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn size={16} /> Sign In</>
              }
            </motion.button>
          </form>

          {role !== 'ADMIN' && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">Register</Link>
            </p>
          )}
        </div>

        {/* Default credentials hint */}
        <div className="glass rounded-xl p-3 border border-white/[0.06] mt-3">
          <p className="text-[11px] text-muted-foreground text-center">
            Default passwords — Students: <span className="text-blue-400 font-mono">student123</span> &nbsp;·&nbsp;
            Recruiters: <span className="text-violet-400 font-mono">recruiter123</span> &nbsp;·&nbsp;
            Admin: <span className="text-amber-400 font-mono">admin2026</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
