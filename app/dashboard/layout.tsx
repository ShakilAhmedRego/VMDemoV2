import { AuthProvider } from '@/components/AuthProvider'
import TopNav from '@/components/TopNav'
import { VERTICALS } from '@/lib/verticals'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {children}
      </div>
    </AuthProvider>
  )
}
