import { useControls } from 'leva'
import { useEffect, useCallback } from 'react'
import { SplatMetadata } from './useSplatData'

export const useSplatControls = (
  currentSplat: Partial<SplatMetadata> | null,
  onSplatChange: (updatedSplat: Partial<SplatMetadata>) => void
) => {
  // Use Leva controls for ratio, defaulting to 1 if currentSplat is null
  const { ratio, scale, offset } = useControls('Splat Properties', {
    ratio: {
      value: currentSplat?.ratio || 1,
      min: 0.001,
      max: 3,
      step: 0.001,
    },
    offset: {
      value: [0, 0, 0],
      step: 1,
    },
    scale: {
      value: currentSplat?.scale || 1,
      min: 0.01,
      max: 2,
      step: 0.001,
    },
  })

  // Callback to handle splat change
  const handleSplatChange = useCallback(() => {
    if (!onSplatChange) return
    const updatedSplat: Partial<SplatMetadata> = {
      ratio,
      scale,
      offset,
    }
    onSplatChange(updatedSplat)
  }, [ratio, scale, onSplatChange])

  // Automatically trigger handleSplatChange whenever the ratio changes
  useEffect(() => {
    handleSplatChange()
  }, [ratio, handleSplatChange])
}
