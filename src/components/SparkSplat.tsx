import { ParsedSplat } from 'src/useSplatCycler'
import '../spark-catalog'

export const SparkSplat = ({ splat }: { splat: ParsedSplat }) => {
  return (
    <splatMesh
      key={splat.localUrl} // force reinit on change
      args={[{ url: splat.localUrl }]} // load one splat
      quaternion={[1, 0, 0, 0]}
      position={[0, 0, -3]}
    />
  )
}
