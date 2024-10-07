import React, { forwardRef, useEffect, useRef } from "react";
import { LumaSplatsThree } from "@lumaai/luma-web";
import { extend, Object3DNode, useFrame } from "@react-three/fiber";
import { SplatDataset } from "../useSplatData";
import { Matrix4, Vector3 } from "three";

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For TypeScript support
declare module '@react-three/fiber' {
  interface ThreeElements {
    lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>;
  }
}

export const CustomSplat = forwardRef<LumaSplatsThree, { splat: SplatDataset }>(({ splat }, ref) => {
  const lumaSplatRef = useRef<LumaSplatsThree>(null);

  // Uniforms for the shader
  const clipRadiusUniform = useRef({ value: splat.scale ?? 1 });
  const inverseGlobeUniform = useRef({ value: new Matrix4() });
  const offsetUniform = useRef({ value: new Vector3() });

  useEffect(() => {
    if (lumaSplatRef.current) {
      const splat = lumaSplatRef.current;
      // Enable Three.js shader integration
      splat.enableThreeShaderIntegration = true;

      splat.setShaderHooks({
        vertexShaderHooks: {
          additionalUniforms: {
            inverseGlobe: ['mat4', inverseGlobeUniform.current],
            splatOffset: ['vec3', offsetUniform.current],

          },
          additionalGlobals: /* glsl */ `
            varying float vDist;
          `,
          onMainEnd: /* glsl */ `
            () {

    // Convert the 3D position to a 4D vector (homogeneous coordinates)
    vec4 position4D = vec4(splatOffset, 1.0);

    // Multiply the 4x4 matrix with the 4D position vector
    vec4 transformedPos = inverseGlobe * position4D;

    // Assign the result to vDist, using only the xyz components of the result
    vDist = length(transformedPos.xyz);
            }
          `,


          // getSplatColor: /* glsl */ `
          //   (vec4 rgba, vec3 position, uint layersBitmask) {
          //     // Calculate color based on distance from globe center
          //     float maxDistance = clipRadius ; // Define maximum distance

          //     // Normalize the distance to the range [0, 1]
          //     float t = clamp(length(position - splatOffset) / maxDistance, 0.0, 1.0); // Normalize distance

          //     // Set color based on normalized distance
          //     return vec4(mix(vec3(1.0), vec3(0.0), t), 1.0); // White to black based on distance
          //   }
          // `
        },


        fragmentShaderHooks: {
          additionalUniforms: {
            clipRadius: ['float', clipRadiusUniform.current],
            splatOffset: ['vec3', offsetUniform.current],

          },
          additionalGlobals: /* glsl */ `
            varying float vDist;
          `,
          getFragmentColor: /* glsl */ `
            (vec4 fragColor) {
              // Calculate distance from the center of the globe

              // Check if the distance exceeds the clip radius; if so, discard
              if (vDist > clipRadius) {
                discard;
              }

              
              // If not discarded, set the fragment color
              // fragColor.rgb = vec3(1.0); // Default color (white) for visible fragments
              return fragColor  ;
            }
          `
        },

      });
    }
  }, []);

  // Update uniforms whenever clipCenter or clipRadius changes
  useEffect(() => {
    if (lumaSplatRef.current && lumaSplatRef.current.parent) {
      const { center, radius } = splat.clip ?? { center: [0, 0, 0], radius: 1 };
      const { offset } = splat;
      if (offset) offsetUniform.current.value.set(...offset);
      if (splat.ratio) clipRadiusUniform.current.value = splat.ratio / splat.scale; // Update clip radius
      console.log(clipRadiusUniform.current.value)
    }
  }, [splat.ratio, lumaSplatRef.current, splat.clip?.radius]);

  // Update the globe's inverse matrix each frame
  useFrame(() => {
    if (lumaSplatRef.current && lumaSplatRef.current.parent) {
      const globeMesh = lumaSplatRef.current.parent.children[0]; // Assuming parent is the GlassGlobe
      globeMesh.updateMatrixWorld(); // Ensure the matrix is updated
      inverseGlobeUniform.current.value.copy(globeMesh.matrixWorld).invert(); // Store the inverse matrix
    }
  });

  return (
    <lumaSplats
      position={splat.offset ?? [0, 0, 0]} // Still use this if you want to apply any later
      scale={splat.scale ?? 1}
      ref={lumaSplatRef}
      source={`https://lumalabs.ai/capture/${splat.id}`}
    />
  );
});
