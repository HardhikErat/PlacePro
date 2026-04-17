'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, GraduationCap, Building2, Award,
  Pencil, Trash2, KeyRound, Save, X, AlertTriangle, Eye, EyeOff, CheckCircle
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useToast } from '@/components/ui/Toaster'
import { useAuthStore } from '@/stores/auth'

export default function StudentProfile() {
  const { setUser } = useAuthStore()
  const { add }     = useToast()
  const router      = useRouter()
  const qc          = useQueryClient()

  // UI state
  const [editMode, setEditMode]         = useState(false)
  const [showPwSection, setShowPwSection] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew, setShowNew]           = useState(false)
  const [showDelPass, setShowDelPass]   = useState(false)

  // Form state
  const [form, setForm] = useState({ name: '', cgpa: '', dept_id: '' })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [deletePassword, setDeletePassword] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-profile'],
    queryFn: () => fetch('/api/students').then(r => r.json()).then(d => d.data),
    onSuccess: (data: any) => {
      if (data) setForm({ name: data.name ?? '', cgpa: String(data.cgpa ?? ''), dept_id: String(data.dept_id ?? '') })
    },
  } as any)

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetch('/api/departments').then(r => r.json()).then(d => d.data ?? []),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      fetch('/api/students/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Profile updated successfully!', 'success')
      setEditMode(false)
      setShowPwSection(false)
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
      qc.invalidateQueries({ queryKey: ['student-profile'] })
    },
    onError: () => add('Failed to update profile', 'error'),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch('/api/students/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      }).then(r => r.json()),
    onSuccess: (json) => {
      if (!json.success) { add(json.error, 'error'); return }
      add('Account deleted. Goodbye!', 'info')
      setUser(null)
      router.push('/login')
    },
    onError: () => add('Failed to delete account', 'error'),
  })

  function handleSaveProfile() {
    if (!form.name.trim()) { add('Name cannot be empty', 'error'); return }
    updateMutation.mutate({ name: form.name, cgpa: form.cgpa, dept_id: form.dept_id })
  }

  function handleChangePassword() {
    if (!pwForm.current_password) { add('Enter your current password', 'error'); return }
    if (!pwForm.new_password)     { add('Enter a new password', 'error'); return }
    if (pwForm.new_password !== pwForm.confirm_password) { add('Passwords do not match', 'error'); return }
    if (pwForm.new_password.length < 4) { add('Password must be at least 4 characters', 'error'); return }
    updateMutation.mutate({ current_password: pwForm.current_password, new_password: pwForm.new_password })
  }

  function handleCancelEdit() {
    setEditMode(false)
    setShowPwSection(false)
    setPwForm({ current_password: '', new_password: '', confirm_password: '' })
    if (profile) setForm({ name: profile.name ?? '', cgpa: String(profile.cgpa ?? ''), dept_id: String(profile.dept_id ?? '') })
  }

  if (isLoading) return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="glass rounded-2xl h-24 border border-white/[0.06] animate-pulse" />)}
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <button onClick={() => setEditMode(true)} className="btn-secondary py-2 text-xs">
                  <Pencil size={14} /> Edit Profile
                </button>
                <button onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                  <Trash2 size={14} /> Delete Account
                </button>
              </>
            ) : (
              <button onClick={handleCancelEdit} className="btn-ghost py-2 text-xs">
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-violet-500/5 flex items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {profile?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">{profile?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.department?.dept_name}</p>
            <p className="text-xs text-blue-400 font-mono mt-1">student_id: {profile?.student_id}</p>
          </div>
        </motion.div>

        {/* View mode */}
        <AnimatePresence mode="wait">
          {!editMode ? (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[
                { icon: User,          label: 'Name',        value: profile?.name,                         color: 'text-blue-400' },
                { icon: GraduationCap, label: 'CGPA',        value: profile?.cgpa,                         color: 'text-emerald-400' },
                { icon: Building2,     label: 'Department',  value: profile?.department?.dept_name ?? '—',  color: 'text-violet-400' },
                { icon: Award,         label: 'Results',     value: `${profile?.placement_results?.length ?? 0} placement record(s)`, color: 'text-amber-400' },
              ].map((item, i) => (
                <motion.div key={item.label}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass rounded-xl p-4 border border-white/[0.06] flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0">
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                </motion.div>
              ))}

              {/* Stats */}
              <div className="glass rounded-2xl p-5 border border-white/[0.06]">
                <h2 className="font-display font-semibold text-sm text-foreground mb-3">Activity Summary</h2>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Applications', value: profile?.applications?.length ?? 0, color: 'text-blue-400' },
                    { label: 'Interviews', value: (profile?.applications ?? []).reduce((n: number, a: any) => n + (a.interviews?.length ?? 0), 0), color: 'text-violet-400' },
                    { label: 'Results', value: profile?.placement_results?.length ?? 0, color: 'text-emerald-400' },
                  ].map(s => (
                    <div key={s.label} className="glass rounded-xl py-3 border border-white/[0.06]">
                      <p className={`text-xl font-bold font-display ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          ) : (
            /* Edit mode */
            <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Edit fields */}
              <div className="glass rounded-2xl p-5 border border-blue-500/20 space-y-4">
                <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                  <Pencil size={14} className="text-blue-400" /> Edit Details
                </h2>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
                  <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" className="input-field"
                    value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))} placeholder="e.g. 8.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</label>
                  <select className="input-field" value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
                    <option value="">Select department</option>
                    {(departments ?? []).map((d: any) => (
                      <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                    ))}
                  </select>
                </div>

                <motion.button onClick={handleSaveProfile} disabled={updateMutation.isPending} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {updateMutation.isPending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Save size={15} /> Save Changes</>
                  }
                </motion.button>
              </div>

              {/* Change password section */}
              <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => setShowPwSection(!showPwSection)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <KeyRound size={15} className="text-amber-400" /> Change Password
                  </span>
                  <motion.div animate={{ rotate: showPwSection ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <X size={14} className={`text-muted-foreground transition-transform ${showPwSection ? 'rotate-0' : 'rotate-45'}`} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showPwSection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/[0.06] px-5 pb-5 pt-4 space-y-3"
                    >
                      {[
                        { key: 'current_password', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                        { key: 'new_password',     label: 'New Password',     show: showNew,     toggle: () => setShowNew(!showNew) },
                        { key: 'confirm_password', label: 'Confirm New Password', show: showNew,  toggle: () => setShowNew(!showNew) },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                          <div className="relative">
                            <input
                              type={f.show ? 'text' : 'password'}
                              className="input-field pr-10"
                              placeholder="••••••••"
                              value={(pwForm as any)[f.key]}
                              onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                            />
                            <button type="button" onClick={f.toggle}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Password match indicator */}
                      {pwForm.new_password && pwForm.confirm_password && (
                        <p className={`text-xs flex items-center gap-1.5 ${pwForm.new_password === pwForm.confirm_password ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pwForm.new_password === pwForm.confirm_password
                            ? <><CheckCircle size={12} /> Passwords match</>
                            : <><X size={12} /> Passwords do not match</>
                          }
                        </p>
                      )}

                      <button onClick={handleChangePassword} disabled={updateMutation.isPending}
                        className="btn-secondary w-full justify-center py-2.5 text-sm border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                      >
                        {updateMutation.isPending
                          ? <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                          : <><KeyRound size={14} /> Update Password</>
                        }
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
                className="glass rounded-2xl p-6 border border-red-500/30 w-full max-w-sm shadow-2xl bg-red-500/5"
                onClick={e => e.stopPropagation()}
              >
                {/* Warning icon */}
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={22} className="text-red-400" />
                </div>

                <h2 className="font-display font-bold text-xl text-foreground text-center mb-1">Delete Account</h2>
                <p className="text-sm text-muted-foreground text-center mb-5">
                  This will permanently delete your account and <strong className="text-foreground">all your data</strong> — applications, interviews, and results. This cannot be undone.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Confirm with your password</label>
                    <div className="relative">
                      <input
                        type={showDelPass ? 'text' : 'password'}
                        className="input-field pr-10 border-red-500/20 focus:ring-red-500/30"
                        placeholder="Enter your password"
                        value={deletePassword}
                        onChange={e => setDeletePassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowDelPass(!showDelPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showDelPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setShowDeleteModal(false); setDeletePassword('') }} className="btn-secondary flex-1 justify-center">
                      Cancel
                    </button>
                    <button
                      disabled={!deletePassword || deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate()}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                      {deleteMutation.isPending
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Trash2 size={14} /> Delete Forever</>
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}
