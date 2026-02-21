'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, TrendingUp } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Capacity', 'Compliance', 'Certifications']

export default function IndustrialIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const expandingCount = rows.filter(r => r.is_expanding === true || r.is_expanding === 'true').length
  const avgRisk = rows.length ? (rows.reduce((s, r) => s + (Number(r.risk_score) || 0), 0) / rows.length).toFixed(1) : '0'
  const complianceEvents = rows.reduce((s, r) => s + (Number(r.compliance_event_count) || 0), 0)

  const facilityTypes = rows.reduce((acc, r) => {
    const t = String(r.facility_type ?? 'Other')
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading industrial intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Expanding Facilities" value={expandingCount} icon="📈" sub="Active expansion plans" trend="up" trendValue={`${rows.length ? Math.round(expandingCount / rows.length * 100) : 0}%`} />
        <KPICard label="Avg Risk Score" value={avgRisk} icon="⚠️" sub="Operational risk index" />
        <KPICard label="Compliance Events" value={complianceEvents} icon="📋" sub="Total incidents tracked" trend={complianceEvents > 10 ? 'down' : 'neutral'} />
        <KPICard label="Facilities Tracked" value={rows.length} icon="🏭" sub="In industrial database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Facility type breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">Facility Types</h3>
          <div className="space-y-2.5">
            {Object.entries(facilityTypes).sort((a, b) => b[1] - a[1]).map(([type, count], i) => {
              const COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{type}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${rows.length ? (count / rows.length * 100) : 0}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Industrial Facilities</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-amber-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expanding</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const risk = Number(row.risk_score ?? 0)
                  const expanding = row.is_expanding === true || row.is_expanding === 'true'
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-amber-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.facility_name ?? '—')}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{String(row.facility_type ?? '—')}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: risk >= 70 ? '#dc2626' : risk >= 40 ? '#f59e0b' : '#16a34a' }}>{risk}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {expanding ? <TrendingUp className="w-3.5 h-3.5 text-green-500 mx-auto" /> : <span className="text-gray-300 text-xs">—</span>}
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
          title={String(drawerRow.facility_name ?? 'Facility')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#d97706">
          {activeTab === 'Overview' && <DrawerSection title="Facility Info"><DrawerField label="Name" value={drawerRow.facility_name} /><DrawerField label="Type" value={drawerRow.facility_type} /><DrawerField label="Location" value={drawerRow.location} /><DrawerField label="Country" value={drawerRow.country} /></DrawerSection>}
          {activeTab === 'Capacity' && <DrawerSection title="Capacity"><DrawerField label="Production Capacity" value={drawerRow.production_capacity} /><DrawerField label="Utilization" value={drawerRow.utilization_rate} /><DrawerField label="Is Expanding" value={drawerRow.is_expanding ? 'Yes ↑' : 'No'} /><DrawerField label="Expansion Details" value={drawerRow.expansion_details} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Compliance' && <DrawerSection title="Compliance"><DrawerField label="Risk Score" value={drawerRow.risk_score} /><DrawerField label="Compliance Events" value={drawerRow.compliance_event_count} /><DrawerField label="Last Inspection" value={drawerRow.last_inspection_date} /><DrawerField label="Inspector Contact" value={drawerRow.inspector_contact} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Certifications' && <DrawerSection title="Certifications"><DrawerField label="ISO 14001" value={drawerRow.iso_14001 ? '✅' : '—'} /><DrawerField label="ISO 9001" value={drawerRow.iso_9001 ? '✅' : '—'} /><DrawerField label="Other Certs" value={drawerRow.other_certifications} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
