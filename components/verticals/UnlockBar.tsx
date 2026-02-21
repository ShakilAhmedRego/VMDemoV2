'use client'

import { Lock, Unlock, X } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

interface UnlockBarProps {
  selectedCount: number
  newCount: number
  unlocking: boolean
  onUnlock: () => void
  onClear: () => void
}

export default function UnlockBar({ selectedCount, newCount, unlocking, onUnlock, onClear }: UnlockBarProps) {
  const { creditBalance } = useAuth()
  if (selectedCount === 0) return null

  const canAfford = creditBalance >= newCount

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 animate-slide-down">
      <div className="flex items-center gap-3 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{selectedCount}</span>
          <span className="text-gray-400">selected</span>
          {newCount < selectedCount && (
            <span className="text-blue-400">· {selectedCount - newCount} already unlocked</span>
          )}
        </div>
        
        <div className="w-px h-4 bg-gray-700" />
        
        {newCount > 0 && (
          <div className="text-sm">
            <span className="text-amber-400 font-semibold">{newCount}</span>
            <span className="text-gray-400"> credits to unlock</span>
            {!canAfford && <span className="text-red-400 ml-2">· Insufficient credits</span>}
          </div>
        )}

        {newCount === 0 && (
          <span className="text-green-400 text-sm">All selected already unlocked</span>
        )}

        <button
          onClick={onUnlock}
          disabled={unlocking || newCount === 0 || !canAfford}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors"
        >
          {unlocking ? (
            <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Unlocking…</>
          ) : (
            <><Unlock className="w-3.5 h-3.5" />Unlock {newCount > 0 ? newCount : ''}</>
          )}
        </button>

        <button
          onClick={onClear}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
