'use client'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from '@/components/ui/Toaster'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <html lang="en" className="dark">
      <head>
        <title>PlacePro — Internship & Placement Portal</title>
        <meta name="description" content="Production-grade placement management system" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="noise-bg antialiased">
        {/* Background ambient orbs */}
        <div className="orb w-[600px] h-[600px] bg-blue-500 top-[-200px] left-[-200px]" />
        <div className="orb w-[400px] h-[400px] bg-violet-500 bottom-[-100px] right-[-100px]" style={{ animationDelay: '4s' }} />

        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  )
}
