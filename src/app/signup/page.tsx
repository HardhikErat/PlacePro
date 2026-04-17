'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/Toaster'

type Role = 'STUDENT' | 'RECRUITER'

export default function SignupPage() {
  const [role, setRole]           = useState<Role>('STUDENT')
  const [studentId, setStudentId] = useState('')
  const [name, setName]           = useState('')
  const [cgpa, setCgpa]           = useState('')
  const [deptId, setDeptId]       = useState('')
  const [recruiterId, setRecruiterId] = useState('')
  const [recName, setRecName]     = useState('')
  const [companyId, setCompanyId] = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [companies, setCompanies]     = useState<any[]>([])
  const [loading, setLoading]     = useState(false)

  const { setUser } = useAuthStore()
  const { add }     = useToast()
  const router      = useRouter()

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(d => d.data && setDepartments(d.data))
    fetch('/api/companies').then(r => r.json()).then(d => d.data && setCompanies(d.data))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const body = role === 'STUDENT'
        ? { role, student_id: studentId, name, cgpa, dept_id: deptId, password }
        : { role, recruiter_id: recruiterId, recruiter_name: recName, company_id: companyId, password }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) { add(json.error, 'error'); return }
      setUser(json.data)
      add(`Registered! Your ID is ${json.data.id}`, 'success')
      router.push(role === 'STUDENT' ? '/student' : '/recruiter')
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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-1">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join the placement portal</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/[0.08] shadow-2xl">
          {/* Role tabs */}
          <div className="flex gap-2 mb-5">
            {(['STUDENT','RECRUITER'] as Role[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  role === r
                    ? r === 'STUDENT'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-transparent shadow-lg'
                      : 'bg-gradient-to-r from-violet-500 to-purple-400 text-white border-transparent shadow-lg'
                    : 'bg-white/[0.04] text-muted-foreground border-white/[0.08] hover:bg-white/[0.08] hover:text-foreground'
                }`}
              >
                {r === 'STUDENT' ? 'Student' : 'Recruiter'}
              </button>
            ))}
          </div>

          <div className="glass rounded-xl px-3 py-2.5 border border-blue-500/20 bg-blue-500/5 mb-4">
            <p className="text-xs text-blue-400">After registering, your assigned ID will be used to log in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {role === 'STUDENT' ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Student ID</label>
                  <input type="number" className="input-field" placeholder="Choose a unique number (e.g. 111)"
                    value={studentId} onChange={e => setStudentId(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                  <input className="input-field" placeholder="Your full name"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" className="input-field" placeholder="e.g. 8.5"
                    value={cgpa} onChange={e => setCgpa(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
                  <select className="input-field" value={deptId} onChange={e => setDeptId(e.target.value)}>
                    <option value="">Select department</option>
                    {departments.map((d: any) => (
                      <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Recruiter ID</label>
                  <input type="number" className="input-field" placeholder="Choose a unique number (e.g. 311)"
                    value={recruiterId} onChange={e => setRecruiterId(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                  <input className="input-field" placeholder="Your full name"
                    value={recName} onChange={e => setRecName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
                  <select className="input-field" value={companyId} onChange={e => setCompanyId(e.target.value)} required>
                    <option value="">Select company</option>
                    {companies.map((c: any) => (
                      <option key={c.company_id} value={c.company_id}>{c.company_name} — {c.location}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={4}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all mt-1"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={16} /> Register</>
              }
            </motion.button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
