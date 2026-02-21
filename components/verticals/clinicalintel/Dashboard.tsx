'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': '#06b6d4', 'Phase 2': '#3b82f6', 'Phase 3': '#8b5cf6',
  'Phase 4': '#ec4899', 'Preclinical': '#f59e0b', 'Other': '#6b7280',
}
const STATUS_COLORS: Record<string, string> = {
  'recruiting': '#16a34a', 'active': '#2563eb', 'completed': '#6b7280',
  'suspended': '#dc2626', 'unknown': '#9ca3af',
}

const DRAWER_TABS = ['Overview', 'Eligibility', 'Locations', 'Sponsor']

export default function ClinicalIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const recruiting = rows.filter(r => String(r.recruitment_status ?? '').toLowerCase() === 'recruiting').length
  const avgComplexity = rows.length ? (rows.reduce((s, r) => s + (Number(r.complexity_score) || 0), 0) / rows.length).toFixed(1) : '0'

  const phaseCounts = rows.reduce((acc, r) => {
    const p = String(r.phase ?? 'Other')
    acc[p] = (acc[p] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(phaseCounts).map(([name, value]) => ({ name, value }))

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading clinical trial data…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Actively Recruiting" value={recruiting} icon="🔬" sub="Accepting participants" trend="up" />
        <KPICard label="Phase 3 Trials" value={rows.filter(r => String(r.phase ?? '') === 'Phase 3').length} icon="💉" sub="Late-stage development" />
        <KPICard label="Avg Complexity" value={avgComplexity} icon="🧬" sub="Protocol complexity score" />
        <KPICard label="Total Trials" value={rows.length} icon="📋" sub="In tracked database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Phase Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
                {pieData.map((entry, i) => <Cell key={i} fill={PHASE_COLORS[entry.name] ?? '#6b7280'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Clinical Trials</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-cyan-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trial</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phase</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Complexity</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const status = String(row.recruitment_status ?? 'unknown').toLowerCase()
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-cyan-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{String(row.trial_title ?? '—')}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: PHASE_COLORS[String(row.phase)] ?? '#6b7280' }}>{String(row.phase ?? '—')}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLORS[status] ?? '#6b7280'}20`, color: STATUS_COLORS[status] ?? '#6b7280' }}>{status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">{row.complexity_score ?? '—'}</td>
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
          title={String(drawerRow.trial_title ?? 'Trial').substring(0, 50)} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#0891b2">
          {activeTab === 'Overview' && <DrawerSection title="Trial Info"><DrawerField label="Title" value={drawerRow.trial_title} /><DrawerField label="Phase" value={drawerRow.phase} /><DrawerField label="Status" value={drawerRow.recruitment_status} /><DrawerField label="Condition" value={drawerRow.condition} /></DrawerSection>}
          {activeTab === 'Eligibility' && <DrawerSection title="Eligibility Criteria"><DrawerField label="Min Age" value={drawerRow.min_age} /><DrawerField label="Max Age" value={drawerRow.max_age} /><DrawerField label="Gender" value={drawerRow.gender} /><DrawerField label="Criteria" value={drawerRow.inclusion_criteria} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Locations' && <DrawerSection title="Trial Locations"><DrawerField label="Primary Location" value={drawerRow.primary_location} /><DrawerField label="Countries" value={drawerRow.countries} /><DrawerField label="Site Count" value={drawerRow.site_count} /></DrawerSection>}
          {activeTab === 'Sponsor' && <DrawerSection title="Sponsor Details"><DrawerField label="Sponsor" value={drawerRow.sponsor} /><DrawerField label="PI Name" value={drawerRow.principal_investigator} locked={!drawerUnlocked} /><DrawerField label="Contact" value={drawerRow.contact_email} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
