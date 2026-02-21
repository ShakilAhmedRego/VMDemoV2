'use client'

import { useState } from 'react'
import { useVerticalData } from '../useVerticalData'
import { KPICard, KPIRow } from '../KPICard'
import UnlockBar from '../UnlockBar'
import Drawer, { DrawerField, DrawerSection } from '../Drawer'
import { Lock, Unlock, CheckSquare, Square } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const DRAWER_TABS = ['Overview', 'Trends', 'Sentiment', 'Products']

export default function MarketResearchDashboard({ verticalKey }: { verticalKey: string }) {
  const { rows, unlockedIds, selectedIds, loading, unlocking, drawerRow, toggleSelect, selectAll, clearSelection, handleUnlock, setDrawerRow } = useVerticalData(verticalKey)
  const [activeTab, setActiveTab] = useState('Overview')

  const avgTrend = rows.length ? (rows.reduce((s, r) => s + (Number(r.trend_score) || 0), 0) / rows.length).toFixed(1) : '0'
  const avgSentiment = rows.length ? (rows.reduce((s, r) => s + (Number(r.sentiment_score) || 0), 0) / rows.length).toFixed(1) : '0'
  const categories = new Set(rows.map(r => String(r.category ?? ''))).size

  const scatterData = rows.map(r => ({
    x: Number(r.trend_score ?? 0),
    y: Number(r.sentiment_score ?? 0),
    name: String(r.brand_name ?? ''),
    id: String(r.id),
  }))

  const selectedArr = [...selectedIds]
  const newIds = selectedArr.filter(id => !unlockedIds.has(id))
  const drawerId = drawerRow ? String(drawerRow.id) : null
  const drawerUnlocked = drawerId ? unlockedIds.has(drawerId) : false

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading market research…</div>

  return (
    <div className="p-6 space-y-5">
      <KPIRow>
        <KPICard label="Avg Trend Score" value={avgTrend} icon="📈" sub="Market momentum index" trend="up" />
        <KPICard label="Avg Sentiment" value={avgSentiment} icon="💬" sub="Brand sentiment (0-100)" />
        <KPICard label="Categories" value={categories} icon="🏷️" sub="Distinct market segments" />
        <KPICard label="Market Entities" value={rows.length} icon="📊" sub="Brands & entities tracked" />
      </KPIRow>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Trend vs Sentiment</h3>
          <p className="text-xs text-gray-400 mb-3">Each dot is a brand entity</p>
          <ResponsiveContainer width="100%" height={190}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" name="Trend" tick={{ fontSize: 9 }} label={{ value: 'Trend Score', position: 'insideBottom', offset: -3, fontSize: 9 }} />
              <YAxis dataKey="y" name="Sentiment" tick={{ fontSize: 9 }} label={{ value: 'Sentiment', angle: -90, position: 'insideLeft', fontSize: 9 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0]?.payload
                return <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs shadow"><p className="font-medium">{d?.name}</p><p>Trend: {d?.x} · Sentiment: {d?.y}</p></div>
              }} />
              <Scatter data={scatterData} fill="#ea580c" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Market Entities</h3>
            <button onClick={rows.length === selectedIds.size ? clearSelection : selectAll} className="text-xs text-orange-600">
              {rows.length === selectedIds.size ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Brand</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trend</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sentiment</th>
                  <th className="w-6 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const id = String(row.id)
                  const unlocked = unlockedIds.has(id)
                  const selected = selectedIds.has(id)
                  const trend = Number(row.trend_score ?? 0)
                  const sent = Number(row.sentiment_score ?? 0)
                  return (
                    <tr key={id} onClick={() => setDrawerRow(row)} className={`border-t border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors ${selected ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                      <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(id) }}>
                        {selected ? <CheckSquare className="w-3.5 h-3.5 text-orange-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100">{String(row.brand_name ?? '—')}</td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{String(row.category ?? '—')}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 w-12 overflow-hidden">
                            <div className="h-full rounded-full bg-orange-400" style={{ width: `${trend}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{trend}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 w-12 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sent}%`, backgroundColor: sent >= 60 ? '#16a34a' : sent >= 40 ? '#f59e0b' : '#dc2626' }} />
                          </div>
                          <span className="text-xs text-gray-500">{sent}</span>
                        </div>
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
          title={String(drawerRow.brand_name ?? 'Brand')} tabs={DRAWER_TABS} activeTab={activeTab} onTabChange={setActiveTab} accentColor="#ea580c">
          {activeTab === 'Overview' && <DrawerSection title="Brand Overview"><DrawerField label="Brand" value={drawerRow.brand_name} /><DrawerField label="Category" value={drawerRow.category} /><DrawerField label="HQ Region" value={drawerRow.hq_region} /></DrawerSection>}
          {activeTab === 'Trends' && <DrawerSection title="Trend Data"><DrawerField label="Trend Score" value={drawerRow.trend_score} /><DrawerField label="Trend Direction" value={drawerRow.trend_direction} /><DrawerField label="Search Volume" value={drawerRow.search_volume} locked={!drawerUnlocked} /></DrawerSection>}
          {activeTab === 'Sentiment' && <DrawerSection title="Sentiment Analysis"><DrawerField label="Sentiment Score" value={drawerRow.sentiment_score} /><DrawerField label="Social Mentions" value={drawerRow.social_mentions} locked={!drawerUnlocked} /><DrawerField label="Review Rating" value={drawerRow.avg_review_rating} /></DrawerSection>}
          {activeTab === 'Products' && <DrawerSection title="Products"><DrawerField label="Product Lines" value={drawerRow.product_lines} locked={!drawerUnlocked} /><DrawerField label="SKU Count" value={drawerRow.sku_count} /></DrawerSection>}
        </Drawer>
      )}
    </div>
  )
}
