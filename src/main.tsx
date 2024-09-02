import { Canvas } from '@react-three/fiber'
import 'maplibre-gl/dist/maplibre-gl.css'

import { Leva } from 'leva'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { Scene } from './Scene'
import './styles/main.css'
import Map from 'react-map-gl/maplibre'
// import { Canvas } from "react-three-map/maplibre"

function Main() {
  return (
    <div className='main'>
      <Leva
        collapsed={false}
        oneLineLabels={false}
        flat={true}
        theme={{
          sizes: {
            titleBarHeight: '28px',
          },
          fontSizes: {
            root: '10px',
          },
        }}
      />
      {/* <Map
        antialias
        initialViewState={{
          latitude: 51,
          longitude: 0,
          zoom: 13,
          pitch: 60,
        }}
        mapStyle='https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
      > */}
      <Canvas
        // latitude={51} longitude={0}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{
          fov: 55,
          near: 0.1,
          far: 200,
          position: [3, 2, 9],
        }}
        shadows
      >
        <Scene />
      </Canvas>
      {/* </Map> */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
