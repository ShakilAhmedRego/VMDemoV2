'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  creditBalance: number
  loading: boolean
  refreshCredits: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  creditBalance: 0,
  loading: true,
  refreshCredits: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [creditBalance, setCreditBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  async function fetchCreditBalance(userId: string) {
    const { data } = await supabase
      .from('credit_ledger')
      .select('delta')
      .eq('user_id', userId)
    if (data) {
      setCreditBalance(data.reduce((sum, r) => sum + (r.delta || 0), 0))
    }
  }

  async function fetchUserProfile(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (data) setIsAdmin(data.role === 'admin')
  }

  async function refreshCredits() {
    if (user) await fetchCreditBalance(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchUserProfile(u.id)
        fetchCreditBalance(u.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchUserProfile(u.id)
        fetchCreditBalance(u.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, creditBalance, loading, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
