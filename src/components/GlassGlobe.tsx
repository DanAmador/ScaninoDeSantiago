import React, { useRef, useEffect, useState } from 'react'
import { Mesh, FrontSide, Box3, Vector3, DoubleSide } from 'three'
import { SplatDataset } from '../useSplatData'
import { LumaSplatsThree } from '@lumaai/luma-web'
import { extend, Object3DNode } from '@react-three/fiber'
import { CustomSplat } from "./LumaSplat"

export const GlassGlobe: React.FC<{ splat: SplatDataset }> = ({ splat }: { splat: SplatDataset }) => {
  const globeRef = useRef<Mesh>(null)

  console.log(splat.scale)
  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[splat?.scale ?? 1, 32, 32]} />
      <meshPhysicalMaterial
        color={"red"}
        roughness={0}
        metalness={0.2}
        transmission={0.9} // Controls transparency effect (glass-like refraction)
        ior={1.341} // Index of refraction for glass (~1.33 for glass)
        thickness={0.5} // Adjust thickness to make refraction more visible
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


export const GlassGlobeWithLuma: React.FC<SplatDataset> = (
  splat,
) => {
  return (
    <group>
      <GlassGlobe splat={splat} />
      <CustomSplat splat={splat} />
    </group>
  )
}
