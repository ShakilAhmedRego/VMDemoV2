'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, AlertTriangle } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'active': '#7c3aed', 'settled': '#16a34a', 'dismissed': '#6b7280',
  'appeal': '#f59e0b', 'pending': '#3b82f6',
}

const DRAWER_TABS = ['Overview', 'Parties', 'Counsel', 'Timeline']

export default function LegalIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const activeCases = rows.filter(r => String(r.status ?? '').toLowerCase() === 'active').length
  const totalDamages = rows.reduce((s, r) => s + (Number(r.damages_claimed) || 0), 0)
  const jurisdictions = new Set(rows.map(r => String(r.jurisdiction ?? ''))).size

  const recentCases = [...rows].sort((a, b) => {
    const da = new Date(String(a.filed_date ?? '')).getTime()
    const db = new Date(String(b.filed_date ?? '')).getTime()
    return db - da
  }).slice(0, 5)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading legal intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Active Cases" value={activeCases} icon="⚖️" sub="Currently in litigation" trend={activeCases > 0 ? 'up' : 'neutral'} />
        <KPICard label="Total Damages Claimed" value={totalDamages > 0 ? `$${(totalDamages / 1e6).toFixed(0)}M` : '—'} icon="💵" sub="Aggregate across all cases" />
        <KPICard label="Jurisdictions" value={jurisdictions} icon="🏛️" sub="Distinct court jurisdictions" />
        <KPICard label="Total Cases" value={rows.length} icon="📁" sub="In tracked database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timeline panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Recent Filings</h3>
          <div className="space-y-3">
            {recentCases.length === 0 && <p className="text-xs text-gray-400">No recent filings</p>}
            {recentCases.map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: STATUS_COLORS[String(c.status ?? '').toLowerCase()] ?? '#6b7280' }} />
                  {i < recentCases.length - 1 && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{String(c.case_title ?? '—')}</p>
                  <p className="text-xs text-gray-400">{String(c.filed_date ?? '—')} · {String(c.jurisdiction ?? '—')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Legal Cases</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-purple-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Case</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jurisdiction</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Damages</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const status = String(row.status ?? 'unknown').toLowerCase()
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{String(row.case_title ?? '—')}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{String(row.jurisdiction ?? '—')}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                        {row.damages_claimed ? `$${(Number(row.damages_claimed) / 1e6).toFixed(1)}M` : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[status] ?? '#6b7280' }}>{status}</span>
                      </td>
                      <td className="px-3 py-2.5">{unlocked ? <Unlock className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-gray-300" />}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UnlockBar selectedCount={selectedIds.size} newCount={newIds.length} unlocking={unlocking} onUnlock={handleUnlock} onClear={clearSelection} />

      {drawerRow && (
        <Drawer row={drawerRow} onClose={() => setDrawerRow(null)} isUnlocked={drawerUnlocked} onUnlock={async () => {}} unlocking={unlocking}
          title={String(drawerRow.case_title ?? 'Case').substring(0, 50)} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#7c3aed">
          {activeTab === 'Overview' && <DrawerSection title="Case Summary"><DrawerField label="Title" value={drawerRow.case_title} /><DrawerField label="Jurisdiction" value={drawerRow.jurisdiction} /><DrawerField label="Filed Date" value={drawerRow.filed_date} /><DrawerField label="Status" value={drawerRow.status} /></DrawerSection>}
          {activeTab === 'Parties' && <DrawerSection title="Parties"><DrawerField label="Plaintiff" value={drawerRow.plaintiff} locked={!drawerUnlocked} /><DrawerField label="Defendant" value={drawerRow.defendant} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Counsel' && <DrawerSection title="Legal Counsel"><DrawerField label="Plaintiff Counsel" value={drawerRow.plaintiff_counsel} locked={!drawerUnlocked} /><DrawerField label="Defense Counsel" value={drawerRow.defense_counsel} locked={!drawerUnlocked} /><DrawerField label="Judge" value={drawerRow.judge} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Timeline' && <DrawerSection title="Case Timeline"><DrawerField label="Filed" value={drawerRow.filed_date} /><DrawerField label="Next Hearing" value={drawerRow.next_hearing_date} /><DrawerField label="Expected Resolution" value={drawerRow.expected_resolution} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
