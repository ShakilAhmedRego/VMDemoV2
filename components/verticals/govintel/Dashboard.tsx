'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, Clock } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Procurement', 'Timeline', 'Awards']

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.round((target - now) / 86400000)
}

export default function GovIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const openOpps = rows.filter(r => String(r.status ?? '').toLowerCase() === 'open').length
  const totalAward = rows.reduce((s, r) => s + (Number(r.award_amount) || 0), 0)
  const within30 = rows.filter(r => {
    if (!r.deadline) return false
    const d = daysUntil(String(r.deadline))
    return d >= 0 && d <= 30
  }).length

  // Urgency list
  const urgentList = rows
    .filter(r => r.deadline && daysUntil(String(r.deadline)) >= 0)
    .sort((a, b) => daysUntil(String(a.deadline)) - daysUntil(String(b.deadline)))
    .slice(0, 6)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading government intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Open Opportunities" value={openOpps} icon="🏛️" sub="Active solicitations" trend="up" />
        <KPICard label="Total Award Value" value={totalAward > 0 ? `$${(totalAward / 1e6).toFixed(0)}M` : '—'} icon="💵" sub="Aggregate opportunity value" />
        <KPICard label="Deadlines in 30 Days" value={within30} icon="⏰" sub="Urgent opportunities" trend={within30 > 0 ? 'down' : 'neutral'} />
        <KPICard label="Total Opportunities" value={rows.length} icon="📄" sub="In database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Deadline urgency panel */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-2.5">
            {urgentList.length === 0 && <p className="text-xs text-gray-400">No upcoming deadlines</p>}
            {urgentList.map((opp, i) => {
              const days = daysUntil(String(opp.deadline))
              const urgencyColor = days <= 7 ? '#dc2626' : days <= 14 ? '#f59e0b' : '#2563eb'
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="text-xs font-bold px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: urgencyColor }}>
                    {days}d
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{String(opp.opportunity_title ?? '—')}</p>
                    <p className="text-xs text-gray-400">{String(opp.agency ?? '—')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Gov Opportunities</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-blue-700">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Opportunity</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Agency</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Award</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-blue-700" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{String(row.opportunity_title ?? '—')}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{String(row.agency ?? '—')}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                        {row.award_amount ? `$${(Number(row.award_amount) / 1e6).toFixed(1)}M` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{String(row.deadline ?? '—')}</td>
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
          title={String(drawerRow.opportunity_title ?? 'Opportunity').substring(0, 50)} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#1d4ed8">
          {activeTab === 'Overview' && <DrawerSection title="Opportunity"><DrawerField label="Title" value={drawerRow.opportunity_title} /><DrawerField label="Agency" value={drawerRow.agency} /><DrawerField label="Type" value={drawerRow.solicitation_type} /><DrawerField label="Status" value={drawerRow.status} /></DrawerSection>}
          {activeTab === 'Procurement' && <DrawerSection title="Procurement Details"><DrawerField label="NAICS Code" value={drawerRow.naics_code} /><DrawerField label="Set-Aside" value={drawerRow.set_aside_type} /><DrawerField label="POC" value={drawerRow.point_of_contact} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Timeline' && <DrawerSection title="Timeline"><DrawerField label="Posted Date" value={drawerRow.posted_date} /><DrawerField label="Response Deadline" value={drawerRow.deadline} /><DrawerField label="Award Date" value={drawerRow.expected_award_date} /></DrawerSection>}
          {activeTab === 'Awards' && <DrawerSection title="Award Info"><DrawerField label="Award Amount" value={drawerRow.award_amount} /><DrawerField label="Awardee" value={drawerRow.awardee} locked={!drawerUnlocked} /><DrawerField label="Contract #" value={drawerRow.contract_number} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
