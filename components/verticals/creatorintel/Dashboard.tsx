```tsx
'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#e1306c',
  tiktok: '#010101',
  youtube: '#ff0000',
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  twitch: '#9146ff',
}

const DRAWER_TABS = ['Overview', 'Audience', 'Performance', 'Brand Collabs']

export default function CreatorIntelDashboard({ verticalKey }: { verticalKey: string }) {
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
    setDrawerRow,
  } = useVerticalData(verticalKey)

  const [activeTab, setActiveTab] = useState('Overview')

  const totalFollowers = rows.reduce((s, r) => s + (Number(r.followers) || 0), 0)
  const verifiedCount = rows.filter(r => r.is_verified === true || r.is_verified === 'true').length
  const avgEngagement = rows.length
    ? (rows.reduce((s, r) => s + (Number(r.engagement_rate) || 0), 0) / rows.length).toFixed(2)
    : '0'

  // ✅ SAFE COUNTER (no reduce casting)
  const platformCounts: Record<string, number> = {}
  for (const r of rows) {
    const p = String(r.primary_platform ?? 'other').toLowerCase()
    platformCounts[p] = (platformCounts[p] || 0) + 1
  }
  const platformData = Object.entries(platformCounts).map(([name, count]) => ({ name, count }))

  // ✅ SAFE SET TO ARRAY
  const selectedArr = Array.from(selectedIds)
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading creator intelligence…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard
          label="Total Followers"
          value={totalFollowers >= 1e6 ? `${(totalFollowers / 1e6).toFixed(1)}M` : totalFollowers.toLocaleString()}
          icon="👥"
          sub="Combined audience reach"
          trend="up"
        />
        <KPICard label="Verified Creators" value={verifiedCount} icon="✅" sub="Verified platform accounts" />
        <KPICard label="Avg Engagement Rate" value={`${avgEngagement}%`} icon="💫" sub="Cross-platform average" />
        <KPICard label="Total Creators" value={rows.length} icon="✨" sub="In marketplace database" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Platform Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={65} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {platformData.map((e, i) => (
                  <Cell key={i} fill={PLATFORM_COLORS[e.name] ?? '#db2777'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Creators</h3>
            <button
              onClick={rows.length === selectedIds.size ? clearSelection : selectAll}
              className="text-xs text-pink-600"
            >
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Creator
                  </th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Platform
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Followers
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Eng. Rate
                  </th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const platform = String(row.primary_platform ?? 'other').toLowerCase()

                  return (
                    <tr
                      key={id}
                      onClick={() => setDrawerRow(row)}
                      className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${
                        selected
                          ? 'bg-pink-50 dark:bg-pink-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      }`}
                    >
                      <td
                        className="px-3 py-2.5"
                        onClick={e => {
                          e.stopPropagation()
                          toggleSelect(id)
                        }}
                      >
                        {selected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-pink-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-300" />
                        )}
                      </td>

                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">
                        {String(row.creator_name ?? '—')}
                      </td>

                      <td className="px-3 py-2.5">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white capitalize"
                          style={{ backgroundColor: PLATFORM_COLORS[platform] ?? '#db2777' }}
                        >
                          {platform}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono text-xs text-gray-600 dark:text-gray-400">
                        {row.followers
                          ? Number(row.followers) >= 1e6
                            ? `${(Number(row.followers) / 1e6).toFixed(1)}M`
                            : Number(row.followers).toLocaleString()
                          : '—'}
                      </td>

                      <td className="px-3 py-2.5 text-right text-xs font-semibold text-pink-600 dark:text-pink-400">
                        {row.engagement_rate ? `${Number(row.engagement_rate).toFixed(2)}%` : '—'}
                      </td>

                      <td className="px-3 py-2.5">
                        {unlocked ? (
                          <Unlock className="w-3 h-3 text-green-500" />
                        ) : (
                          <Lock className="w-3 h-3 text-gray-300" />
                        )}
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
          title={String(drawerRow.creator_name ?? 'Creator')}
          tabs={DRAWER_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor="#db2777"
        >
          {activeTab === 'Overview' && (
            <DrawerSection title="Creator Profile">
              <DrawerField label="Name" value={drawerRow.creator_name} />
              <DrawerField label="Platform" value={drawerRow.primary_platform} />
              <DrawerField label="Category / Niche" value={drawerRow.niche} />
            </DrawerSection>
          )}

          {activeTab === 'Audience' && (
            <DrawerSection title="Audience Data">
              <DrawerField label="Followers" value={drawerRow.followers} />
              <DrawerField label="Audience Location" value={drawerRow.audience_location} />
              <DrawerField label="Age Demographic" value={drawerRow.audience_age_range} />
              <DrawerField label="Contact" value={drawerRow.contact_email} locked={!drawerUnlocked} />
            </DrawerSection>
          )}

          {activeTab === 'Performance' && (
            <DrawerSection title="Performance">
              <DrawerField label="Engagement Rate" value={`${drawerRow.engagement_rate}%`} />
              <DrawerField label="Avg Views" value={drawerRow.avg_views} />
              <DrawerField label="Avg Likes" value={drawerRow.avg_likes} />
            </DrawerSection>
          )}

          {activeTab === 'Brand Collabs' && (
            <DrawerSection title="Brand Collaborations">
              <DrawerField label="Past Brands" value={drawerRow.past_brands} locked={!drawerUnlocked} />
              <DrawerField label="Rate Card" value={drawerRow.rate_card} locked={!drawerUnlocked} />
            </DrawerSection>
          )}
        </Drawer>
      )}
    </div>
  )
}
```
