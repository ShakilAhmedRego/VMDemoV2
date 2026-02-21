'use client'

import { supabase } from './supabase'
import { VERTICALS } from './verticals'

export async function getUnlockedIds(verticalKey: string): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const vertical = VERTICALS[verticalKey]
  if (!vertical) return []

  const { data, error } = await supabase
    .from(vertical.accessTable)
    .select(vertical.accessIdField)
    .eq('user_id', user.id)

  if (error || !data) return []
  return data.map((row: Record<string, string>) => row[vertical.accessIdField])
}

export async function unlockIds(verticalKey: string, ids: string[]): Promise<{ error: string | null }> {
  const vertical = VERTICALS[verticalKey]
  if (!vertical) return { error: 'Unknown vertical' }

  const { error } = await supabase.rpc(vertical.rpc, {
    [vertical.rpcParam]: ids
  })

  if (error) return { error: error.message }
  return { error: null }
}
