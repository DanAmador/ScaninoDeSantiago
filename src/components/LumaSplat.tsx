import React, { forwardRef, useEffect, useRef } from "react"
import { LumaSplatsThree } from "@lumaai/luma-web"
import { extend, Object3DNode, useFrame } from "@react-three/fiber"
import { SplatDataset } from "../useSplatData"
import { Matrix4 } from "three"

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree })

// For TypeScript support
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
  }
}

export const CustomSplat = forwardRef<LumaSplatsThree, { splat: SplatDataset }>(({ splat }, ref) => {
  const lumaSplatRef = useRef<LumaSplatsThree>(null)

  // Uniforms for the shader
  const clipRadiusUniform = useRef({ value: splat.scale ?? 1 })
  const parentMatrixWorldUniform = useRef({ value: new Matrix4() })

  useEffect(() => {
    if (lumaSplatRef.current) {
      // Enable Three.js shader integration
      lumaSplatRef.current.enableThreeShaderIntegration = true

      lumaSplatRef.current.setShaderHooks({
        vertexShaderHooks: {
          additionalUniforms: {
            parentMatrixWorld: ['mat4', parentMatrixWorldUniform.current],
          },
          getSplatTransform: /* glsl */ `
            (vec3 splatPosition, uint layersBitmask) {
              // Apply the parent's transformation
              return parentMatrixWorld;
            }
          `,
          additionalGlobals: /* glsl */ `
            varying vec3 vWorldPosition;
          `,
          onMainEnd: /* glsl */ `
            () {
              vWorldPosition = position;
            }
          `,
        },
        fragmentShaderHooks: {
          additionalUniforms: {
            clipRadius: ['float', clipRadiusUniform.current],
          },
          additionalGlobals: /* glsl */ `
            varying vec3 vWorldPosition;
          `,
          getFragmentColor: /* glsl */ `
            (vec4 fragColor) {
              float dist = length(vWorldPosition);
              if (dist > 0.5) {
                discard;
              }
              return fragColor;
            }
          `,
        },
      })
    }
  }, [])

  // Update uniforms whenever clipCenter or clipRadius changes
  useEffect(() => {
    if (lumaSplatRef.current && lumaSplatRef.current.parent) {
      // Update the clipCenter uniform value in world space
      const { center, radius } = splat.clip ?? { center: [0, 0, 0], radius: 1 }

      // Update the clipRadius uniform value
      if (radius) clipRadiusUniform.current.value = radius
    }
  }, [splat.clip, lumaSplatRef.current])

  // Update the parent's matrixWorld each frame
  useFrame(() => {
    if (lumaSplatRef.current && lumaSplatRef.current.parent) {
      lumaSplatRef.current.parent.updateMatrixWorld()
      parentMatrixWorldUniform.current.value.copy(lumaSplatRef.current.parent.matrixWorld)
    }
  })

  // Expose the ref to the parent
  useEffect(() => {
    if (ref && lumaSplatRef.current) {
      if (typeof ref === 'function') {
        ref(lumaSplatRef.current)
      } else {
        // @ts-ignore
        ref.current = lumaSplatRef.current
      }
    }
  }, [ref, lumaSplatRef.current])

  return (
    <lumaSplats
      position={splat.offset ?? [0, 0, 0]}
      scale={splat.scale ?? 1}
      ref={lumaSplatRef}
      source={`https://lumalabs.ai/capture/${splat.id}`}
    />
  )
})

