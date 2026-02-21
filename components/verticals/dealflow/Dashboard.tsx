'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, TrendingUp, CheckSquare, Square } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const STAGE_COLORS: Record<string, string> = {
  'Seed': '#6366f1', 'Series A': '#3b82f6', 'Series B': '#0891b2',
  'Series C': '#16a34a', 'Series D+': '#ca8a04', 'Growth': '#ea580c', 'PE': '#7c3aed',
}

const DRAWER_TABS = ['Overview', 'Investors', 'Financials', 'Workflow']

export default function DealFlowDashboard({ verticalKey }: { verticalKey: string }) {
  const {
    rows, unlockedIds, selectedIds, loading, unlocking, drawerRow,
    toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow
  } = useVerticalData(verticalKey)

  const [activeTab, setActiveTab] = useState('Overview')

  // KPIs
  const totalRaised = rows.reduce((s, r) => s + (Number(r.total_raised) || 0), 0)
  const avgIntel = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.intelligence_score) || 0), 0) / rows.length) : 0
  const stageCounts = rows.reduce((acc, r) => {
    const stage = String(r.funding_stage ?? 'Unknown')
    acc[stage] = (acc[stage] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const chartData = Object.entries(stageCounts).map(([name, count]) => ({ name, count }))

  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  async function unlockDrawerRow() {
    if (!drawerRow) return
    const id = String(drawerRow.id)
    await (async () => {
      const { supabase } = await import('@/lib/supabase')
      const vert = (await import('@/lib/verticals')).VERTICALS[verticalKey]
      await supabase.rpc(vert.rpc, { [vert.rpcParam]: [id] })
    })()
  }

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading deal flow…</div>

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <KPIRow>
        <KPICard label="Total Capital Raised" value={`$${(totalRaised / 1e6).toFixed(1)}M`} icon="💰" sub="Across all tracked companies" />
        <KPICard label="Active Deals" value={rows.length} icon="📋" sub="Companies in pipeline" />
        <KPICard label="Avg Intelligence Score" value={avgIntel} icon="🧠" sub="Out of 100" trend={avgIntel > 70 ? 'up' : 'neutral'} />
        <KPICard label="Funding Stages" value={Object.keys(stageCounts).length} icon="📈" sub="Distinct stage types tracked" />
      </KPIRow>

      {/* Chart + Table layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage distribution chart */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Funding Stage Mix</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(v) => [`${v} companies`, 'Count']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={STAGE_COLORS[entry.name] ?? '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Companies</h3>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{rows.length}</span>
            </div>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-blue-600 hover:text-blue-700">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Raised</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sector</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  return (
                    <tr
                      key={id}
                      onClick={() => setDrawerRow(row)}
                      className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                    >
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected
                          ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                          : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.company_name ?? '—')}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STAGE_COLORS[String(row.funding_stage)] ?? '#6b7280' }}>
                          {String(row.funding_stage ?? '—')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {row.total_raised ? `$${(Number(row.total_raised) / 1e6).toFixed(1)}M` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{String(row.sector ?? '—')}</td>
                      <td className="px-3 py-2.5">
                        {unlocked
                          ? <Unlock className="w-3 h-3 text-green-500" />
                          : <Lock className="w-3 h-3 text-gray-300" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unlock bar */}
      <UnlockBar
        selectedCount={selectedIds.size}
        newCount={newIds.length}
        unlocking={unlocking}
        onUnlock={handleUnlock}
        onClear={clearSelection}
      />

      {/* Drawer */}
      {drawerRow && (
        <Drawer
          row={drawerRow}
          onClose={() => setDrawerRow(null)}
          isUnlocked={drawerUnlocked}
          onUnlock={unlockDrawerRow}
          unlocking={unlocking}
          title={String(drawerRow.company_name ?? 'Company')}
          tabs={DRAWER_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor="#2563eb"
        >
          {activeTab === 'Overview' && (
            <>
              <DrawerSection title="Company Info">
                <DrawerField label="Company Name" value={drawerRow.company_name} />
                <DrawerField label="Sector" value={drawerRow.sector} />
                <DrawerField label="Founded" value={drawerRow.founded_year} />
                <DrawerField label="HQ" value={drawerRow.hq_location} />
              </DrawerSection>
              <DrawerSection title="Intelligence">
                <DrawerField label="Intelligence Score" value={drawerRow.intelligence_score} />
                <DrawerField label="Description" value={drawerRow.description} />
              </DrawerSection>
            </>
          )}
          {activeTab === 'Investors' && (
            <DrawerSection title="Investor Data">
              <DrawerField label="Lead Investors" value={drawerRow.lead_investors} locked={!drawerUnlocked} />
              <DrawerField label="Investor Count" value={drawerRow.investor_count} locked={!drawerUnlocked} />
              <DrawerField label="Board Members" value={drawerRow.board_members} locked={!drawerUnlocked} />
            </DrawerSection>
          )}
          {activeTab === 'Financials' && (
            <DrawerSection title="Financial Data">
              <DrawerField label="Total Raised" value={drawerRow.total_raised ? `$${Number(drawerRow.total_raised).toLocaleString()}` : '—'} />
              <DrawerField label="Last Round" value={drawerRow.last_round_date} />
              <DrawerField label="Valuation" value={drawerRow.valuation} locked={!drawerUnlocked} />
              <DrawerField label="Revenue Estimate" value={drawerRow.revenue_estimate} locked={!drawerUnlocked} />
            </DrawerSection>
          )}
          {activeTab === 'Workflow' && (
            <DrawerSection title="Workflow Status">
              <DrawerField label="Stage" value={drawerRow.funding_stage} />
              <DrawerField label="Status" value={drawerRow.workflow_status} />
              <DrawerField label="Next Action" value={drawerRow.next_action} locked={!drawerUnlocked} />
              <DrawerField label="Owner" value={drawerRow.deal_owner} locked={!drawerUnlocked} />
            </DrawerSection>
          )}
        </Drawer>
      )}
    </div>
  )
}
