'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square, Shield, AlertTriangle, Wifi } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Attack Surface', 'CVEs', 'Breach History']

function PostureScore({ score }: { score: number }) {
  const color = score >= 70 ? '#059669' : score >= 40 ? '#f59e0b' : '#dc2626'
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2" style={{ borderColor: color, color }}>
        {score}
      </div>
    </div>
  )
}

export default function CyberIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const avgPosture = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.security_posture_score) || 0), 0) / rows.length) : 0
  const totalBreaches = rows.reduce((s, r) => s + (Number(r.breach_count_12m) || 0), 0)
  const avgAttackSurface = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.attack_surface_score) || 0), 0) / rows.length) : 0

  // High-risk orgs (threat alerts)
  const threatAlerts = [...rows]
    .filter(r => Number(r.breach_count_12m ?? 0) > 0 || Number(r.security_posture_score ?? 100) < 40)
    .slice(0, 5)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading cybersecurity intelligence…</div>

  return (
    // Cyber gets a dark interior even in light mode
    <div className="p-6 space-y-5 bg-gray-950 min-h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Avg Security Posture', value: avgPosture, icon: '🛡️', sub: 'Org-wide score (0-100)' },
          { label: 'Total Breaches (12m)', value: totalBreaches, icon: '🔴', sub: 'Known breach events' },
          { label: 'Avg Attack Surface', value: avgAttackSurface, icon: '🌐', sub: 'Exposure score' },
          { label: 'Orgs Tracked', value: rows.length, icon: '🏢', sub: 'In cyber database' },
        ].map((kpi, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</span>
              <span className="text-lg opacity-60">{kpi.icon}</span>
            </div>
            <span className="text-2xl font-bold text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{kpi.value}</span>
            <p className="text-xs text-gray-600">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Threat alerts panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <h3 className="text-sm font-semibold text-gray-200">Active Threats</h3>
          </div>
          <div className="space-y-2">
            {threatAlerts.length === 0 && <p className="text-xs text-gray-500">No active threats detected</p>}
            {threatAlerts.map((org, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-gray-800 last:border-0">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: Number(org.breach_count_12m ?? 0) > 0 ? '#dc2626' : '#f59e0b' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-300 truncate">{String(org.organization_name ?? '—')}</p>
                  <p className="text-xs text-gray-600">{Number(org.breach_count_12m ?? 0) > 0 ? `${org.breach_count_12m} breach(es)` : 'Low posture score'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-gray-200">Organizations</h3>
            </div>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-emerald-400">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800/80">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posture</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Attack Surface</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Breaches</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-emerald-900/30' : 'hover:bg-gray-800/50'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> : <Square className="w-3.5 h-3.5 text-gray-700" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-200">{String(row.organization_name ?? '—')}</td>
                      <td className="px-3 py-3 text-center"><PostureScore score={Number(row.security_posture_score ?? 0)} /></td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-xs font-mono text-gray-400">{row.attack_surface_score ?? '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {Number(row.breach_count_12m ?? 0) > 0 ? (
                          <span className="text-xs font-bold text-red-400">{row.breach_count_12m}</span>
                        ) : <span className="text-gray-700 text-xs">0</span>}
                      </td>
                      <td className="px-3 py-2.5">{unlocked ? <Unlock className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-gray-700" />}</td>
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
          title={String(drawerRow.organization_name ?? 'Organization')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#059669">
          {activeTab === 'Overview' && <DrawerSection title="Org Overview"><DrawerField label="Name" value={drawerRow.organization_name} /><DrawerField label="Industry" value={drawerRow.industry} /><DrawerField label="Size" value={drawerRow.employee_count} /></DrawerSection>}
          {activeTab === 'Attack Surface' && <DrawerSection title="Attack Surface"><DrawerField label="Attack Surface Score" value={drawerRow.attack_surface_score} /><DrawerField label="Open Ports" value={drawerRow.open_ports} locked={!drawerUnlocked} /><DrawerField label="Exposed Services" value={drawerRow.exposed_services} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'CVEs' && <DrawerSection title="Vulnerabilities"><DrawerField label="Critical CVEs" value={drawerRow.critical_cve_count} /><DrawerField label="High CVEs" value={drawerRow.high_cve_count} /><DrawerField label="CVE Details" value={drawerRow.cve_details} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Breach History' && <DrawerSection title="Breach History"><DrawerField label="Breaches (12m)" value={drawerRow.breach_count_12m} /><DrawerField label="Last Breach Date" value={drawerRow.last_breach_date} /><DrawerField label="Breach Details" value={drawerRow.breach_details} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
