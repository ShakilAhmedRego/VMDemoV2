import { VERTICAL_KEYS, VERTICALS } from '@/lib/verticals'
import VerticalPageClient from '@/components/VerticalPageClient'
import { notFound } from 'next/navigation'

interface Props {
  params: { verticalKey: string }
}

export function generateStaticParams() {
  return VERTICAL_KEYS.map(k => ({ verticalKey: k }))
}

export default function VerticalPage({ params }: Props) {
  const { verticalKey } = params
  if (!VERTICALS[verticalKey]) {
    notFound()
  }
  return <VerticalPageClient verticalKey={verticalKey} />
}
