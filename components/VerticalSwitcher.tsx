'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VERTICAL_LIST } from '@/lib/verticals'
import { Search, ChevronDown, X } from 'lucide-react'

interface VerticalSwitcherProps {
  currentKey: string
}

export default function VerticalSwitcher({ currentKey }: VerticalSwitcherProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = VERTICAL_LIST.find(v => v.key === currentKey) ?? VERTICAL_LIST[0]

  const filtered = VERTICAL_LIST.filter(v =>
    query === '' ||
    v.label.toLowerCase().includes(query.toLowerCase()) ||
    v.shortLabel.toLowerCase().includes(query.toLowerCase()) ||
    v.description.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(key: string) {
    setOpen(false)
    setQuery('')
    router.push(`/dashboard/${key}`)
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Active vertical pill */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-sm font-medium"
      >
        <span className="text-base">{current.icon}</span>
        <span className="hidden sm:block text-gray-800 dark:text-gray-200">{current.shortLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Mega dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 animate-fade-in" onClick={() => { setOpen(false); setQuery('') }} />
          
          {/* Menu panel */}
          <div className="fixed left-1/2 -translate-x-1/2 top-14 w-[92vw] max-w-3xl z-50 animate-slide-down">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search verticals…"
                  className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
                <span className="text-xs text-gray-400">{filtered.length} / {VERTICAL_LIST.length}</span>
              </div>

              {/* Grid */}
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-96 overflow-y-auto">
                {filtered.map(v => (
                  <button
                    key={v.key}
                    onClick={() => handleSelect(v.key)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl text-left transition-all hover:scale-[0.98] ${
                      v.key === currentKey
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{v.icon}</span>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${v.key === currentKey ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {v.shortLabel}
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-2 leading-tight mt-0.5">{v.description}</div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-4 py-8 text-center text-gray-400 text-sm">No verticals match "{query}"</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
