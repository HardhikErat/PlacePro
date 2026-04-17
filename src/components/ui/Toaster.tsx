'use client'
import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  remove: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
}

const colors = {
  success: 'border-emerald-500/20 bg-emerald-500/5',
  error: 'border-red-500/20 bg-red-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
}

export function Toaster() {
  const { toasts, remove } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl glass border ${colors[t.type]} shadow-xl min-w-[280px] max-w-[380px]`}
          >
            {icons[t.type]}
            <p className="text-sm text-foreground flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
