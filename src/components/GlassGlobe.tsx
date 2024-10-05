import React, { useRef, useEffect, useState } from 'react'
import { Mesh, FrontSide, Box3, Vector3, DoubleSide } from 'three'
import { LumaSplats } from './LumaSplat'
import { SplatDataset } from '../useSplatData'
import { LumaSplatsThree } from '@lumaai/luma-web'
import { extend, Object3DNode } from '@react-three/fiber'

export const GlassGlobe: React.FC = () => {
  const globeRef = useRef<Mesh>(null)

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
// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree })

// For TypeScript support
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
  }
}

const CustomSplat = ({
  splat,
}: {
  splat: SplatDataset
}) => {
  const lumaRef = useRef<any>(null)
  const [ratio, setRatio] = useState(splat.ratio)
  const lumaSplatRef = useRef<LumaSplatsThree>(new LumaSplatsThree())
  console.log(splat.ratio)
  return <lumaSplats
    // semanticsMask={LumaSplatsSemantics.FOREGROUND}
    ref={lumaSplatRef}
    // position={position}
    scale={splat.ratio ?? 1}
    // rotation={rotation}
    source={`https://lumalabs.ai/capture/${splat.id}`}
  />
}

export const GlassGlobeWithLuma: React.FC<SplatDataset> = (
  splat,
) => {
  return (
    <group>
      <GlassGlobe />
      <CustomSplat splat={splat} />
    </group>
  )
}
