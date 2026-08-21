// Type surface for the <three-d-stage> custom element defined in threeDStage.js,
// so TSX can both render it and call its imperative API off a ref.
import type * as THREE from 'three'

export interface ThreeDStageElement extends HTMLElement {
  ready: Promise<{ THREE: typeof THREE }>
  setObject(object: THREE.Object3D): void
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'three-d-stage': React.DetailedHTMLProps<React.HTMLAttributes<ThreeDStageElement>, ThreeDStageElement> & {
        name?: string
        background?: string
        autorotate?: boolean
      }
    }
  }
}
