import { useCallback, useEffect, useMemo, useState } from 'react'
import { SplatMetadata } from './useSplatData'
type SplatLocation = {
  name: string
  latitude: number
  longitude: number
  isVisible: boolean
}

export type ParsedSplat = Partial<SplatMetadata> & {
  name: string
  date: string
  location: SplatLocation
  localUrl: string
}

export function useParsedSplats(): ParsedSplat[] {
  const [splats, setSplats] = useState<ParsedSplat[]>([])
  useEffect(() => {
    fetch('/splats.json')
      .then((r) => r.json())
      .then(setSplats)
  }, [])
  return splats
}
export function useSplatCycler(splats: ParsedSplat[]) {
  const list = useMemo(
    () => splats.filter((s) => s.location?.isVisible !== false),
    [splats]
  )
  const count = list.length
  const [index, setIndex] = useState(0)

  const clamp = useCallback(
    (i: number) => (count === 0 ? 0 : ((i % count) + count) % count),
    [count]
  )

  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp])
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) next()
      if (e.key === 'Backspace' && !e.repeat) prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  return {
    current: count ? list[index] : null,
    index,
    count,
    next,
    prev,
    setIndex: (i: number) => setIndex(clamp(i)),
  }
}
