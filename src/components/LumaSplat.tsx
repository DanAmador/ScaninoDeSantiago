import { LumaSplatsThree } from "@lumaai/luma-web"
import { extend, Object3DNode } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import { SplatDataset } from "../useSplatData"
import { Vector3 } from "three"

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree })

// For TypeScript support
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
  }
}

export const CustomSplat = ({ splat }: { splat: SplatDataset }) => {
  const lumaSplatRef = useRef<LumaSplatsThree>(null)

  // Initial values for clipCenter and clipRadius



  // Uniforms for the shader (using refs to keep the same object reference)
  const clipCenterUniformRef = useRef(new Vector3(...splat.clip?.center || [0, 0, 0]))
  const clipCenterUniform = useRef({ value: clipCenterUniformRef.current })
  const clipRadiusUniform = useRef({ value: 1 })
  // Initialize shader hooks (only once)
  useEffect(() => {
    if (lumaSplatRef.current) {
      // Enable Three.js shader integration
      lumaSplatRef.current.enableThreeShaderIntegration = true

      // Set shader hooks with initial uniforms
      lumaSplatRef.current.setShaderHooks({
        vertexShaderHooks: {
          // Declare a varying to pass the position to the fragment shader
          additionalGlobals: /* glsl */ `
            varying vec3 vPosition;
          `,
          // Assign the position to the varying
          onMainEnd: /* glsl */ `
            () {
              vPosition = position;
            }
          `,
        },
        fragmentShaderHooks: {
          // Pass the uniforms to the shader
          additionalUniforms: {
            clipCenter: ['vec3', clipCenterUniform.current],
            clipRadius: ['float', clipRadiusUniform.current],
          },
          // Declare the varying in the fragment shader
          additionalGlobals: /* glsl */ `
            varying vec3 vPosition;
          `,
          // Discard fragments outside the sphere
          getFragmentColor: /* glsl */ `
            (vec4 fragColor) {
              if (distance(vPosition, clipCenter) > clipRadius) {
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
    // Update the clipCenter uniform value
    const { center, radius } = splat?.clip ?? { center: [0, 0, 0], radius: 1 }
    if (center) clipCenterUniform.current.value.set(...center)
    // Update the clipRadius uniform value
    if (radius) clipRadiusUniform.current.value = radius
  }, [splat.clip])

  return (
    <lumaSplats
      ref={lumaSplatRef}
      scale={splat.ratio ?? 1}
      position={splat.offset}
      source={`https://lumalabs.ai/capture/${splat.id}`}
    />
  )
}