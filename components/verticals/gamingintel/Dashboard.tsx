'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'

const DRAWER_TABS = ['Overview', 'Tech & Team', 'Releases', 'Community']
const ENGINE_COLORS: Record<string, string> = {
  'Unreal': '#0070f3', 'Unity': '#777777', 'Godot': '#478cbf', 'In-house': '#9333ea', 'Other': '#6b7280',
}

export default function GamingIntelDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const avgMetacritic = rows.length ? Math.round(rows.reduce((s, r) => s + (Number(r.avg_metacritic) || 0), 0) / rows.length) : 0

  const engineCounts = rows.reduce((acc, r) => {
    const e = String(r.engine_used ?? 'Other')
    acc[e] = (acc[e] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading gaming intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Avg Metacritic Score" value={avgMetacritic} icon="🎮" sub="Quality benchmark" trend={avgMetacritic >= 75 ? 'up' : 'neutral'} />
        <KPICard label="Studios Tracked" value={rows.length} icon="🏭" sub="Active game studios" />
        <KPICard label="Engine Diversity" value={Object.keys(engineCounts).length} icon="⚙️" sub="Distinct engines in use" />
        <KPICard label="Unreal Studios" value={engineCounts['Unreal'] ?? 0} icon="🔵" sub="Using Unreal Engine" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Engine breakdown */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Engine Distribution</h3>
          <div className="space-y-3">
            {Object.entries(engineCounts).sort((a, b) => b[1] - a[1]).map(([engine, count]) => (
              <div key={engine}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{engine}</span>
                  <span className="text-gray-400">{count} studios · {rows.length ? Math.round(count / rows.length * 100) : 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${rows.length ? (count / rows.length * 100) : 0}%`, backgroundColor: ENGINE_COLORS[engine] ?? '#6b7280' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Game Studios</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-purple-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Studio</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Engine</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Metacritic</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const mc = Number(row.avg_metacritic ?? 0)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.studio_name ?? '—')}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: ENGINE_COLORS[String(row.engine_used)] ?? '#6b7280' }}>
                          {String(row.engine_used ?? '—')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs font-bold ${mc >= 80 ? 'text-green-600' : mc >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>{mc || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{String(row.country ?? '—')}</td>
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
          title={String(drawerRow.studio_name ?? 'Studio')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#9333ea">
          {activeTab === 'Overview' && <DrawerSection title="Studio Overview"><DrawerField label="Studio Name" value={drawerRow.studio_name} /><DrawerField label="Country" value={drawerRow.country} /><DrawerField label="Founded" value={drawerRow.founded_year} /><DrawerField label="Funding Stage" value={drawerRow.funding_stage} /></DrawerSection>}
          {activeTab === 'Tech & Team' && <DrawerSection title="Tech Stack"><DrawerField label="Engine" value={drawerRow.engine_used} /><DrawerField label="Team Size" value={drawerRow.team_size} /><DrawerField label="Tech Lead" value={drawerRow.tech_lead} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Releases' && <DrawerSection title="Game Releases"><DrawerField label="Latest Title" value={drawerRow.latest_title} /><DrawerField label="Release Date" value={drawerRow.latest_release_date} /><DrawerField label="Avg Metacritic" value={drawerRow.avg_metacritic} /></DrawerSection>}
          {activeTab === 'Community' && <DrawerSection title="Community"><DrawerField label="Discord Members" value={drawerRow.discord_members} /><DrawerField label="Steam Followers" value={drawerRow.steam_followers} /><DrawerField label="Contact" value={drawerRow.contact_email} locked={!drawerUnlocked} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
