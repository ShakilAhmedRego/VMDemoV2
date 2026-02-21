'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': '#06b6d4',
  'Phase 2': '#3b82f6',
  'Phase 3': '#8b5cf6',
  'Phase 4': '#ec4899',
  'Preclinical': '#f59e0b',
  'Other': '#6b7280',
}

const STATUS_COLORS: Record<string, string> = {
  'recruiting': '#16a34a',
  'active': '#2563eb',
  'completed': '#6b7280',
  'suspended': '#dc2626',
  'unknown': '#9ca3af',
}

const DRAWER_TABS = ['Overview', 'Eligibility', 'Locations', 'Sponsor']

export default function ClinicalIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const {
    rows,
    unlockedIds,
    selectedIds,
    loading,
    unlocking,
    drawerRow,
    toggleSelect,
    selectAll,
    clearSelection,
    handleUnlock,
    setDrawerRow
  } = useVerticalData(verticalKey)

  const [activeTab, setActiveTab] = useState('Overview')

  const recruiting = rows.filter(r =>
    String(r.recruitment_status ?? '').toLowerCase() === 'recruiting'
  ).length

  const avgComplexity =
    rows.length
      ? (
          rows.reduce((s, r) => s + (Number(r.complexity_score) || 0), 0) /
          rows.length
        ).toFixed(1)
      : '0'

  // ✅ FIXED REDUCER
  const phaseCounts = rows.reduce<Record<string, number>>((acc, r) => {
    const p = String(r.phase ?? 'Other')
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(phaseCounts).map(([name, value]) => ({
    name,
    value
  }))

  const selectedArr = Array.from(selectedIds)
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))

  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading)
    return (
      <div className="p-6 text-gray-400 text-sm">
        Loading clinical trial data…
      </div>
    )

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
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Phase Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={PHASE_COLORS[entry.name] ?? '#6b7280'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Clinical Trials
            </h3>
            <button
              onClick={rows.length === selectedIds.size ? clearSelection : selectAll}
              className="text-xs text-cyan-600"
            >
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const status = String(row.recruitment_status ?? 'unknown').toLowerCase()

                  return (
                    <tr
                      key={id}
                      onClick={() => setDrawerRow(row)}
                      className={`border-t cursor-pointer ${
                        selected ? 'bg-cyan-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare size={14} /> : <Square size={14} />}
                      </td>
                      <td>{String(row.trial_title ?? '—')}</td>
                      <td>{String(row.phase ?? '—')}</td>
                      <td style={{ color: STATUS_COLORS[status] ?? '#6b7280' }}>
                        {status}
                      </td>
                      <td>{row.complexity_score ?? '—'}</td>
                      <td>
                        {unlocked ? <Unlock size={12} /> : <Lock size={12} />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UnlockBar
        selectedCount={selectedIds.size}
        newCount={newIds.length}
        unlocking={unlocking}
        onUnlock={handleUnlock}
        onClear={clearSelection}
      />

      {drawerRow && (
        <Drawer
          row={drawerRow}
          onClose={() => setDrawerRow(null)}
          isUnlocked={drawerUnlocked}
          onUnlock={async () => {}}
          unlocking={unlocking}
          title={String(drawerRow.trial_title ?? 'Trial')}
          tabs={DRAWER_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor="#0891b2"
        >
          <DrawerSection title="Trial Info">
            <DrawerField label="Title" value={drawerRow.trial_title} />
            <DrawerField label="Phase" value={drawerRow.phase} />
            <DrawerField label="Status" value={drawerRow.recruitment_status} />
          </DrawerSection>
        </Drawer>
      )}
    </div>
  )
}
