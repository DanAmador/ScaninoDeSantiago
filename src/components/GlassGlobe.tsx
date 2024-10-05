import React, { useRef, useEffect, useState } from 'react'
import { Mesh, FrontSide, Box3, Vector3, DoubleSide } from 'three'
import { LumaSplats } from './LumaSplat'

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
        metalness={0.2}
        transmission={0.9} // Controls transparency effect (glass-like refraction)
        ior={1.341} // Index of refraction for glass (~1.33 for glass)
        thickness={1.0} // Adjust thickness to make refraction more visible
        // envMap={envMap} // Add environment map for proper reflections
        envMapIntensity={1.2}
        clearcoat={0.1}
        side={FrontSide} // Experiment with FrontSide for correct refractions
        transparent={true}
        depthWrite={false} // Helps prevent z-fighting or depth issues
      />
    </mesh>
  )
}

const CustomSplat = ({
  innerGlobeRadius,
  lumaSource,
}: {
  innerGlobeRadius: Number
  lumaSource: String
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
    <LumaSplats
      position={[0, 0, 0]}
      scale={[ratio, ratio, ratio]}
      source={lumaSource}
    // source='https://lumalabs.ai/capture/2f4a6b64-f0bd-4e3e-a41a-c3aec8b96517'
    />
  )
}
type GlassGlobeWithLumaProps = {
  innerGlobeRadius: number
  lumaSource: string
  scaleMultiplier?: number
}
export const GlassGlobeWithLuma: React.FC<GlassGlobeWithLumaProps> = ({
  innerGlobeRadius,
  lumaSource,
}) => {
  return (
    <group>
      {/* Glass Globe */}
      <GlassGlobe innerGlobeRadius={innerGlobeRadius} />
      <CustomSplat innerGlobeRadius={innerGlobeRadius} lumaSource={lumaSource} />
      {/* Luma Splats inside the globe with calculated scale */}
    </group>
  )
}
