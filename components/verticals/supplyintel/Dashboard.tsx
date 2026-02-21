'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'

const RISK_COLOR = (score: number) =>
  score >= 75 ? '#dc2626' : score >= 50 ? '#f59e0b' : '#16a34a'

const DRAWER_TABS = ['Overview', 'Risk', 'Logistics', 'Certifications']

export default function SupplyIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const highRisk = rows.filter(r => Number(r.risk_score ?? 0) >= 75).length
  const avgRisk = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.risk_score) || 0), 0) / rows.length) : 0
  const compliantCount = rows.filter(r => String(r.compliance_status ?? '').toLowerCase() === 'compliant').length

  const riskBands = [
    { name: 'Low (<50)', count: rows.filter(r => Number(r.risk_score ?? 0) < 50).length, fill: '#16a34a' },
    { name: 'Med (50-74)', count: rows.filter(r => { const s = Number(r.risk_score ?? 0); return s >= 50 && s < 75 }).length, fill: '#f59e0b' },
    { name: 'High (75+)', count: highRisk, fill: '#dc2626' },
  ]

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading supply chain intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="High Risk Suppliers" value={highRisk} icon="⚠️" sub="Risk score ≥ 75" trend={highRisk > 5 ? 'down' : 'neutral'} />
        <KPICard label="Avg Risk Score" value={avgRisk} icon="📊" sub="Portfolio-wide average" />
        <KPICard label="Compliant" value={compliantCount} icon="✅" sub="Full compliance status" trend="up" />
        <KPICard label="Total Suppliers" value={rows.length} icon="🔗" sub="In monitored network" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskBands}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {riskBands.map((b, i) => <Cell key={i} fill={b.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Suppliers</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-red-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Compliance</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const risk = Number(row.risk_score ?? 0)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-red-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.supplier_name ?? '—')}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{String(row.country ?? '—')}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: RISK_COLOR(risk) }}>{risk}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">{String(row.compliance_status ?? '—')}</td>
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
          title={String(drawerRow.supplier_name ?? 'Supplier')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#dc2626">
          {activeTab === 'Overview' && <DrawerSection title="Supplier Overview"><DrawerField label="Name" value={drawerRow.supplier_name} /><DrawerField label="Country" value={drawerRow.country} /><DrawerField label="Category" value={drawerRow.category} /></DrawerSection>}
          {activeTab === 'Risk' && <DrawerSection title="Risk Assessment"><DrawerField label="Risk Score" value={drawerRow.risk_score} /><DrawerField label="Risk Level" value={drawerRow.risk_level} /><DrawerField label="Last Audit" value={drawerRow.last_audit_date} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Logistics' && <DrawerSection title="Logistics"><DrawerField label="Lead Time (days)" value={drawerRow.lead_time_days} /><DrawerField label="Shipping Mode" value={drawerRow.shipping_mode} /><DrawerField label="Contact" value={drawerRow.contact_email} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Certifications' && <DrawerSection title="Certifications"><DrawerField label="ISO Certified" value={drawerRow.iso_certified ? 'Yes' : 'No'} /><DrawerField label="Compliance Status" value={drawerRow.compliance_status} /><DrawerField label="Certifications" value={drawerRow.certifications} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
