'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Coins, Shield, LogOut } from 'lucide-react'
import { useAuth } from './AuthProvider'
import VerticalSwitcher from './VerticalSwitcher'
import { VERTICALS } from '@/lib/verticals'

interface TopNavProps {
  verticalKey: string
}

export default function TopNav({ verticalKey }: TopNavProps) {
  const { user, isAdmin, creditBalance, refreshCredits } = useAuth()
  const [dark, setDark] = useState(false)
  const router = useRouter()
  const vertical = VERTICALS[verticalKey]

  useEffect(() => {
    const saved = localStorage.getItem('vm-dark')
    const isDark = saved === 'true'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    localStorage.setItem('vm-dark', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  async function handleSignOut() {
    const { supabase } = await import('@/lib/supabase')
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-12 flex items-center px-4 gap-3 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
      {/* Logo */}
      <Link href="/dashboard/dealflow" className="flex items-center gap-2 shrink-0 mr-2">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">VM</span>
        </div>
        <span className="text-gray-900 dark:text-gray-100 font-bold text-sm hidden lg:block" style={{ fontFamily: 'Syne, sans-serif' }}>
          VerifiedMeasure
        </span>
      </Link>

      {/* Vertical switcher */}
      <VerticalSwitcher currentKey={verticalKey} />

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <span>{vertical?.label ?? verticalKey}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Credits */}
        <button
          onClick={refreshCredits}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 transition-colors"
          title="Click to refresh credits"
        >
          <Coins className="w-3 h-3" />
          <span>{creditBalance.toLocaleString()}</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Admin link */}
        {isAdmin && (
          <Link
            href="/admin"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            title="Admin Panel"
          >
            <Shield className="w-3.5 h-3.5" />
          </Link>
        )}

        {/* Sign out */}
        {user && (
          <button
            onClick={handleSignOut}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  )
}
