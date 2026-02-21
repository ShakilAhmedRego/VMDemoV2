'use client'

import TopNav from './TopNav'
import VerticalRenderer from './verticals/VerticalRenderer'
import { VERTICALS } from '@/lib/verticals'

interface Props {
  verticalKey: string
}

export default function VerticalPageClient({ verticalKey }: Props) {
  const vertical = VERTICALS[verticalKey]

  return (
    <div className={vertical?.accentClass ?? ''}>
      <TopNav verticalKey={verticalKey} />
      <main className="min-h-[calc(100vh-3rem)]">
        <VerticalRenderer verticalKey={verticalKey} />
      </main>
    </div>
  )
}
