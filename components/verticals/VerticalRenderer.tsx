'use client'

import dynamic from 'next/dynamic'
import { VERTICALS } from '@/lib/verticals'

const verticalDashboards: Record<string, React.ComponentType<{ verticalKey: string }>> = {
  dealflow: dynamic(() => import('./dealflow/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  salesintel: dynamic(() => import('./salesintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  supplyintel: dynamic(() => import('./supplyintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  clinicalintel: dynamic(() => import('./clinicalintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  legalintel: dynamic(() => import('./legalintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  marketresearch: dynamic(() => import('./marketresearch/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  academicintel: dynamic(() => import('./academicintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  creatorintel: dynamic(() => import('./creatorintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  gamingintel: dynamic(() => import('./gamingintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  realestateintel: dynamic(() => import('./realestateintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  privatecreditintel: dynamic(() => import('./privatecreditintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  cyberintel: dynamic(() => import('./cyberintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  biopharmintel: dynamic(() => import('./biopharmintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  industrialintel: dynamic(() => import('./industrialintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  govintel: dynamic(() => import('./govintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
  insuranceintel: dynamic(() => import('./insuranceintel/Dashboard'), { loading: () => <VerticalSkeleton /> }),
}

function VerticalSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="h-80 rounded-xl bg-gray-100 dark:bg-gray-800" />
    </div>
  )
}

interface Props {
  verticalKey: string
}

export default function VerticalRenderer({ verticalKey }: Props) {
  const Dashboard = verticalDashboards[verticalKey] ?? verticalDashboards['dealflow']
  return <Dashboard verticalKey={verticalKey} />
}
