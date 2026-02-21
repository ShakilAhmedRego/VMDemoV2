'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Lines', 'Licensing', 'Risk & Ratios']

const TYPE_COLORS: Record<string, string> = {
  'carrier': '#0f766e', 'broker': '#0d9488', 'mga': '#14b8a6', 'reinsurer': '#0891b2',
}

export default function InsuranceIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const avgCompliance = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.compliance_score) || 0), 0) / rows.length) : 0
  const carrierCount = rows.filter(r => String(r.account_type ?? '').toLowerCase() === 'carrier').length
  const brokerCount = rows.filter(r => String(r.account_type ?? '').toLowerCase() === 'broker').length

  const typeCounts = rows.reduce((acc, r) => {
    const t = String(r.account_type ?? 'other').toLowerCase()
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading insurance intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Avg Compliance Score" value={avgCompliance} icon="📊" sub="Regulatory compliance index" trend={avgCompliance >= 70 ? 'up' : 'down'} />
        <KPICard label="Carriers" value={carrierCount} icon="🏛️" sub="Insurance carriers tracked" />
        <KPICard label="Brokers" value={brokerCount} icon="🤝" sub="Insurance brokers tracked" />
        <KPICard label="Total Accounts" value={rows.length} icon="🔒" sub="In insurance database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Account type breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Type Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{type}</span>
                  <span className="text-gray-400">{count} · {rows.length ? Math.round(count / rows.length * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${rows.length ? (count / rows.length * 100) : 0}%`, backgroundColor: TYPE_COLORS[type] ?? '#0f766e' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Compliance gauge */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-2">Avg Compliance</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-gray-400 shadow" style={{ left: `${avgCompliance}%`, transform: 'translateX(-50%) translateY(-50%)' }} />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{avgCompliance}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Insurance Accounts</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-teal-700">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Compliance</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const accountType = String(row.account_type ?? 'other').toLowerCase()
                  const compliance = Number(row.compliance_score ?? 0)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-teal-700" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.account_name ?? '—')}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white capitalize" style={{ backgroundColor: TYPE_COLORS[accountType] ?? '#0f766e' }}>
                          {accountType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-1.5 w-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${compliance}%`, backgroundColor: compliance >= 70 ? '#059669' : compliance >= 40 ? '#f59e0b' : '#dc2626' }} />
                          </div>
                          <span className="text-xs text-gray-500">{compliance}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{String(row.hq_state ?? '—')}</td>
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
          title={String(drawerRow.account_name ?? 'Account')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#0f766e">
          {activeTab === 'Overview' && <DrawerSection title="Account Info"><DrawerField label="Account Name" value={drawerRow.account_name} /><DrawerField label="Type" value={drawerRow.account_type} /><DrawerField label="HQ State" value={drawerRow.hq_state} /></DrawerSection>}
          {activeTab === 'Lines' && <DrawerSection title="Lines of Business"><DrawerField label="Lines" value={drawerRow.lines_of_business} /><DrawerField label="Specialties" value={drawerRow.specialties} /><DrawerField label="Premium Volume" value={drawerRow.premium_volume} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Licensing' && <DrawerSection title="Licensing"><DrawerField label="Licensed States" value={drawerRow.licensed_states} /><DrawerField label="License Numbers" value={drawerRow.license_numbers} locked={!drawerUnlocked} /><DrawerField label="AM Best Rating" value={drawerRow.am_best_rating} /></DrawerSection>}
          {activeTab === 'Risk & Ratios' && <DrawerSection title="Risk Metrics"><DrawerField label="Compliance Score" value={drawerRow.compliance_score} /><DrawerField label="Loss Ratio" value={drawerRow.loss_ratio} /><DrawerField label="Combined Ratio" value={drawerRow.combined_ratio} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
