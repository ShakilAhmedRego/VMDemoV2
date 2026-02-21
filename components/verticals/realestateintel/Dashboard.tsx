'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, AlertTriangle } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Ownership', 'Debt', 'Valuation']

export default function RealEstateIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const totalValuation = rows.reduce((s, r) => s + (Number(r.valuation_estimate) || 0), 0)
  const avgRisk = rows.length ? (rows.reduce((s, r) => s + (Number(r.risk_score) || 0), 0) / rows.length).toFixed(1) : '0'
  const debtMaturityFlags = rows.filter(r => r.debt_maturity_flag === true || r.debt_maturity_flag === 'true').length

  const valuationBands = [
    { label: '<$1M', count: rows.filter(r => Number(r.valuation_estimate ?? 0) < 1e6).length },
    { label: '$1M-$10M', count: rows.filter(r => { const v = Number(r.valuation_estimate ?? 0); return v >= 1e6 && v < 10e6 }).length },
    { label: '$10M-$50M', count: rows.filter(r => { const v = Number(r.valuation_estimate ?? 0); return v >= 10e6 && v < 50e6 }).length },
    { label: '$50M+', count: rows.filter(r => Number(r.valuation_estimate ?? 0) >= 50e6).length },
  ]

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading real estate intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Total Portfolio Value" value={`$${(totalValuation / 1e6).toFixed(0)}M`} icon="🏢" sub="Aggregate valuation estimate" trend="up" />
        <KPICard label="Avg Risk Score" value={avgRisk} icon="⚠️" sub="Portfolio-wide risk index" />
        <KPICard label="Debt Maturity Flags" value={debtMaturityFlags} icon="🚩" sub="Properties with near-term debt" trend={debtMaturityFlags > 0 ? 'down' : 'neutral'} />
        <KPICard label="Properties Tracked" value={rows.length} icon="📍" sub="In monitored portfolio" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Valuation bands */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Valuation Bands</h3>
          <div className="space-y-3">
            {valuationBands.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{b.label}</span>
                  <span className="text-gray-400">{b.count} properties</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full bg-teal-500" style={{ width: `${rows.length ? (b.count / rows.length * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Properties</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-teal-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">City / State</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valuation</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Debt Flag</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const hasFlag = row.debt_maturity_flag === true || row.debt_maturity_flag === 'true'
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-teal-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{String(row.property_name ?? '—')}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{[row.city, row.state].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                        {row.valuation_estimate ? `$${(Number(row.valuation_estimate) / 1e6).toFixed(1)}M` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {hasFlag ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mx-auto" /> : <span className="text-gray-200">—</span>}
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
          title={String(drawerRow.property_name ?? 'Property')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#0d9488">
          {activeTab === 'Overview' && <DrawerSection title="Property Info"><DrawerField label="Name" value={drawerRow.property_name} /><DrawerField label="Type" value={drawerRow.property_type} /><DrawerField label="City" value={drawerRow.city} /><DrawerField label="State" value={drawerRow.state} /></DrawerSection>}
          {activeTab === 'Ownership' && <DrawerSection title="Ownership"><DrawerField label="Owner" value={drawerRow.owner_name} locked={!drawerUnlocked} /><DrawerField label="Owner Type" value={drawerRow.owner_type} /><DrawerField label="Acquisition Date" value={drawerRow.acquisition_date} /></DrawerSection>}
          {activeTab === 'Debt' && <DrawerSection title="Debt Structure"><DrawerField label="Debt Amount" value={drawerRow.debt_amount} locked={!drawerUnlocked} /><DrawerField label="Lender" value={drawerRow.lender} locked={!drawerUnlocked} /><DrawerField label="Maturity Date" value={drawerRow.debt_maturity_date} /><DrawerField label="Maturity Flag" value={drawerRow.debt_maturity_flag ? '⚠️ Near-term' : 'Clear'} /></DrawerSection>}
          {activeTab === 'Valuation' && <DrawerSection title="Valuation"><DrawerField label="Est. Valuation" value={drawerRow.valuation_estimate} /><DrawerField label="Cap Rate" value={drawerRow.cap_rate} /><DrawerField label="Risk Score" value={drawerRow.risk_score} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
