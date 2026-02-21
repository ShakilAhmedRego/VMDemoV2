'use client'

import { supabase } from './supabase'

export async function getCreditBalance(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data, error } = await supabase
    .from('credit_ledger')
    .select('delta')
    .eq('user_id', user.id)

  if (error || !data) return 0
  return data.reduce((sum, row) => sum + (row.delta || 0), 0)
}
