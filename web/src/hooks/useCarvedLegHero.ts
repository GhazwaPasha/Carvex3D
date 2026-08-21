import { useEffect, useRef } from 'react'
import type * as THREE_NS from 'three'
import type { ThreeDStageElement } from '../lib/three-d-stage'

function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function spreadAt(p: number) {
  return Math.sin(Math.max(0, Math.min(1, p)) * Math.PI)
}

/** Loads the carved-leg model, builds a solid+wireframe pair, and drives its
 *  rotation/spread/material crossfade off a scroll-driven progress value
 *  (0–1) supplied by the caller each render — same behavior as the original
 *  HomeHero.html iframe, just driven directly instead of via postMessage.
 *
 *  The source asset is a compressed GLB (weld + KHR_mesh_quantization +
 *  EXT_meshopt_compression via gltf-transform), converted offline from the
 *  original 17.6MB / 352,859-triangle STL by scripts/convert-carved-leg.mjs.
 *  Same geometry, same triangle count — quantization and meshopt's entropy
 *  coding are lossless-enough (imperceptible) at web scale — just ~13x
 *  smaller and far cheaper to parse than raw STL, so it loads fast. The
 *  watermark-blob strip the STL needed is baked into that asset too, so it
 *  no longer runs on every page load. */
export function useCarvedLegHero(stageRef: React.RefObject<ThreeDStageElement | null>, progress: number) {
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let cancelled = false
    let rafId = 0

    stage.ready.then(async ({ THREE }) => {
      if (cancelled) return
      const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/libs/meshopt_decoder.module.js'),
      ])
      const loader = new GLTFLoader()
      loader.setMeshoptDecoder(MeshoptDecoder)
      const gltf = await loader.loadAsync('/uploads/carved-leg.glb')
      if (cancelled) return

      let geometry: THREE_NS.BufferGeometry | null = null
      gltf.scene.traverse((o) => {
        if (!geometry && (o as THREE_NS.Mesh).isMesh) geometry = (o as THREE_NS.Mesh).geometry
      })
      if (!geometry) return

      geometry.computeBoundingBox()
      const box = geometry.boundingBox!
      const center = new THREE.Vector3()
      box.getCenter(center)
      geometry.translate(-center.x, -center.y, -center.z)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      geometry.translate(0, -size.y * 0.05, 0)
      const scale = 0.2 / maxDim

      const mat = new THREE.MeshStandardMaterial({
        name: 'column_mat',
        color: 0xa9743f,
        metalness: 0.05,
        roughness: 0.55,
        transparent: true,
        opacity: 0,
        // The wireframe edges below share this exact geometry, so their
        // lines sit at the same depth as the solid mesh's faces. Without an
        // offset, floating-point depth precision flips which one wins as
        // the object rotates, making edges flicker in and out. Nudging the
        // solid faces back in the depth buffer keeps the wireframe reliably
        // on top.
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x8fd8ff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const mesh = new THREE.Mesh(geometry, mat)
      mesh.name = 'carved_column_solid'
      mesh.castShadow = true
      mesh.receiveShadow = true

      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), wireMat)
      edges.name = 'carved_column_wire'

      const group = new THREE.Group()
      group.name = 'carved_column'
      group.scale.setScalar(scale)
      group.rotation.z = Math.PI // flip vertically
      group.add(mesh, edges)

      const outer = new THREE.Group()
      outer.add(group)
      stage.setObject(outer)

      let idleSpin = 0
      const applyProgress = (p: number) => {
        outer.rotation.y = p * Math.PI * 5 + idleSpin
        // Lean the column diagonally across the frame instead of standing
        // it straight up — combined x/z tilt keeps it dynamic through the
        // spin instead of reading as a plain vertical post.
        outer.rotation.x = 0.32
        outer.rotation.z = 0.42
        const s = spreadAt(p)
        outer.scale.setScalar(1 + s * 0.08)
        outer.position.y = s * 0.015
        const solidness = smoothstep(0.32, 0.58, p)
        mat.opacity = solidness
        wireMat.opacity = 1 - solidness
      }
      applyProgress(0)

      const tick = () => {
        idleSpin += 0.0035
        applyProgress(progressRef.current)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
    }
    // Deliberately runs once — progress updates are read live via progressRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageRef])
}
