'use client'

import { PortableText } from '@portabletext/react'

export default function PortableTextClient({ value }: { value: unknown[] }) {
  return <PortableText value={value as any} />
}
