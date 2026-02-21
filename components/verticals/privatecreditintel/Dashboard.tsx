'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, AlertCircle } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Risk & Credit', 'UCC & Liens', 'Financials']

function CreditGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#dc2626' : score >= 50 ? '#f59e0b' : '#16a34a'
  const pct = Math.min(100, Math.max(0, score))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow" style={{ left: `${pct}%`, transform: `translateX(-50%) translateY(-50%)`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

export default function PrivateCreditIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const avgCreditRisk = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.credit_risk_score) || 0), 0) / rows.length) : 0
  const delinquencyFlags = rows.filter(r => r.delinquency_flag === true || r.delinquency_flag === 'true').length
  const totalRevenue = rows.reduce((s, r) => s + (Number(r.revenue_estimate) || 0), 0)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading private credit intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Avg Credit Risk Score" value={avgCreditRisk} icon="📊" sub="Portfolio-wide credit risk" trend={avgCreditRisk > 60 ? 'down' : 'neutral'} />
        <KPICard label="Delinquency Flags" value={delinquencyFlags} icon="⚠️" sub="Active delinquency signals" trend={delinquencyFlags > 0 ? 'down' : 'up'} />
        <KPICard label="Total Revenue Tracked" value={`$${(totalRevenue / 1e6).toFixed(0)}M`} icon="💰" sub="Aggregate revenue estimate" />
        <KPICard label="Companies Tracked" value={rows.length} icon="🏦" sub="In private credit database" />
      </KPIRow>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Private Companies</h3>
          <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-amber-700">
            {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="w-8 px-3 py-2"></th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Revenue Est.</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-32">Credit Risk</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Delinquency</th>
                <th className="w-6 px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const id = String(row.id)
                const unlocked = unlockedIds.has(id)
                const selected = selectedIds.has(id)
                const hasDelinquency = row.delinquency_flag === true || row.delinquency_flag === 'true'
                return (
                  <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                    <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                      {selected ? <CheckSquare className="w-3.5 h-3.5 text-amber-700" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.company_name ?? '—')}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                      {row.revenue_estimate ? `$${(Number(row.revenue_estimate) / 1e6).toFixed(1)}M` : '—'}
                    </td>
                    <td className="px-3 py-3 min-w-32">
                      <CreditGauge score={Number(row.credit_risk_score ?? 0)} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {hasDelinquency ? <AlertCircle className="w-3.5 h-3.5 text-red-500 mx-auto" /> : <span className="text-gray-200 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">{unlocked ? <Unlock className="w-3 h-3 text-green-500" /> : <Lock className="w-3 h-3 text-gray-300" />}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UnlockBar selectedCount={selectedIds.size} newCount={newIds.length} unlocking={unlocking} onUnlock={handleUnlock} onClear={clearSelection} />

      {drawerRow && (
        <Drawer row={drawerRow} onClose={() => setDrawerRow(null)} isUnlocked={drawerUnlocked} onUnlock={async () => {}} unlocking={unlocking}
          title={String(drawerRow.company_name ?? 'Company')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#b45309">
          {activeTab === 'Overview' && <DrawerSection title="Company Info"><DrawerField label="Name" value={drawerRow.company_name} /><DrawerField label="Industry" value={drawerRow.industry} /><DrawerField label="HQ" value={drawerRow.hq_location} /></DrawerSection>}
          {activeTab === 'Risk & Credit' && <DrawerSection title="Credit Risk"><DrawerField label="Credit Risk Score" value={drawerRow.credit_risk_score} /><DrawerField label="Delinquency Flag" value={drawerRow.delinquency_flag ? '⚠️ Yes' : 'No'} /><DrawerField label="Payment History" value={drawerRow.payment_history} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'UCC & Liens' && <DrawerSection title="UCC Filings & Liens"><DrawerField label="UCC Filings" value={drawerRow.ucc_filing_count} /><DrawerField label="Active Liens" value={drawerRow.lien_count} /><DrawerField label="Lien Details" value={drawerRow.lien_details} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Financials' && <DrawerSection title="Financial Data"><DrawerField label="Revenue Estimate" value={drawerRow.revenue_estimate} /><DrawerField label="EBITDA Estimate" value={drawerRow.ebitda_estimate} locked={!drawerUnlocked} /><DrawerField label="Debt Load" value={drawerRow.total_debt} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
