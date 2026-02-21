interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  icon?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accent?: string
}

export function KPICard({ label, value, sub, icon, trend, trendValue, accent }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</span>
        {trendValue && (
          <span className={`text-xs font-medium pb-0.5 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export function KPIRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {children}
    </div>
  )
}
