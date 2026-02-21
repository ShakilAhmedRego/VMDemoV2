'use client'

import { useEffect, useRef } from 'react'
import { X, Lock, Unlock } from 'lucide-react'

interface DrawerProps {
  row: Record<string, unknown> | null
  onClose: () => void
  isUnlocked: boolean
  onUnlock: () => void
  unlocking: boolean
  title: string
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  accentColor?: string
}

export default function Drawer({
  row,
  onClose,
  isUnlocked,
  onUnlock,
  unlocking,
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
  accentColor = '#2563eb',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!row) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 animate-fade-in" onClick={onClose} />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 z-50 animate-slide-in-right flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Record Detail</p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isUnlocked ? (
              <button
                onClick={onUnlock}
                disabled={unlocking}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-colors"
                style={{ backgroundColor: accentColor }}
              >
                {unlocking ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                Unlock (1 credit)
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                <Unlock className="w-3 h-3" />
                Unlocked
              </span>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-3 pb-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={activeTab === tab ? { backgroundColor: accentColor } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </>
  )
}

export function DrawerField({ label, value, locked }: { label: string; value: unknown; locked?: boolean }) {
  return (
    <div className="py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-800 dark:text-gray-200 font-medium ${locked ? 'locked-field select-none' : ''}`}>
        {locked ? '●●●●●●●●●●●' : String(value ?? '—')}
      </p>
    </div>
  )
}

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</h3>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
        {children}
      </div>
    </div>
  )
}
