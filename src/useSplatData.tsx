import { useState, useEffect, useRef } from 'react'
import { Vector3Like, Vector4Like } from 'three'
import { ParsedSplat } from './useSplatCycler'
export type SplatMetadata = {
  clip: { center: [number, number, number]; radius: number }
  transform: {
    position: Vector3Like
    rotation: Vector4Like // [x,y,z,w]
    scale: number
  }
}
// useSplatDat.ts

// Hook to read and update splats.json
const useSplatData = (pollInterval = 5000) => {
  const [splats, setSplats] = useState<ParsedSplat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const dataRef = useRef<ParsedSplat[]>(splats)

  const fetchData = async () => {
    try {
      const response = await fetch('/splats.json', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch splats.json')
      const result: ParsedSplat[] = await response.json()

      if (JSON.stringify(result) !== JSON.stringify(dataRef.current)) {
        setSplats(result)
        dataRef.current = result
      }
      setLoading(false)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load data')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, pollInterval)
    return () => clearInterval(id)
  }, [pollInterval])

  // Require localUrl and accept partial patch (including nested clip/transform)
  const updateSplat = async (
    patch: Partial<ParsedSplat> & Pick<ParsedSplat, 'localUrl'>
  ) => {
    try {
      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg || 'Failed to update the splat')
      }

      const { updatedEntry } = await response.json()

      // Replace the updated item with server's merged version
      setSplats((prev) => {
        const next = prev.map((s) =>
          s.localUrl === updatedEntry.localUrl ? updatedEntry : s
        )
        dataRef.current = next
        return next
      })

      return updatedEntry as ParsedSplat
    } catch (e: any) {
      setError(e.message ?? 'Failed to update the splat')
      throw e
    }
  }

  // Optional helper: update just metadata
  const updateSplatMetadata = async (
    localUrl: string,
    meta: Partial<NonNullable<Pick<ParsedSplat, 'clip' | 'transform'>>>
  ) => updateSplat({ localUrl, ...meta })

  return { splats, updateSplat, updateSplatMetadata, reload: fetchData, loading, error }
}

export default useSplatData
