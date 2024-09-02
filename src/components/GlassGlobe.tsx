import React, { useRef, useEffect, useState } from 'react'
import { Mesh, FrontSide, Box3, Vector3 } from 'three'

type GlassGlobeProps = {
  innerGlobeRadius: number
}

export const GlassGlobe: React.FC<GlassGlobeProps> = ({ innerGlobeRadius }) => {
  const globeRef = useRef<Mesh>(null)

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.scale.setScalar(innerGlobeRadius)
    }
  }, [innerGlobeRadius])

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial
        roughness={0}
        metalness={0}
        transmission={1}
        ior={1.341}
        thickness={1.52}
        envMapIntensity={1.2}
        clearcoat={1}
        side={FrontSide}
        transparent={true}
      />
    </mesh>
  )
}

import { LumaSplats } from './LumaSplat'
type GlassGlobeWithLumaProps = {
  innerGlobeRadius: number
  lumaSource: string
  scaleMultiplier?: number
}
export const GlassGlobeWithLuma: React.FC<GlassGlobeWithLumaProps> = ({
  innerGlobeRadius,
  lumaSource,
  scaleMultiplier = 1, // Default multiplier is 1 if not provided
}) => {
  const lumaRef = useRef<any>(null)
  const [ratio, setRatio] = useState(1)

  useEffect(() => {
    if (lumaRef.current) {
      const boundingBox = new Box3().setFromObject(lumaRef.current)
      const size = new Vector3()
      boundingBox.getSize(size)

      const maxDimension = Math.max(size.x, size.y, size.z)
      const calculatedRatio = innerGlobeRadius / maxDimension

      setRatio(calculatedRatio)
    }
  }, [innerGlobeRadius, lumaSource])

  return (
    <group>
      {/* Glass Globe */}
      {/* <GlassGlobe innerGlobeRadius={innerGlobeRadius} /> */}

      {/* Luma Splats inside the globe with calculated scale */}
      <LumaSplats
        position={[0, 0, 0]}
        scale={[
          ratio * scaleMultiplier,
          ratio * scaleMultiplier,
          ratio * scaleMultiplier,
        ]}
        source={lumaSource}
      />
    </group>
  )
}
