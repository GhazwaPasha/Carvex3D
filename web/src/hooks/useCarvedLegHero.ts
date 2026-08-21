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

/** Free STL downloads often carry a small disconnected watermark blob fused
 *  into the file — split into connected pieces and keep only the real object. */
function keepLargestSolid(THREE: typeof THREE_NS, geo: THREE_NS.BufferGeometry) {
  const pos = geo.attributes.position
  const triCount = pos.count / 3
  const parent = new Int32Array(pos.count)
  for (let i = 0; i < pos.count; i++) parent[i] = i
  function find(a: number): number {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  function union(a: number, b: number) {
    a = find(a)
    b = find(b)
    if (a !== b) parent[a] = b
  }

  const keyToVert = new Map<string, number>()
  const scale = 1e4
  for (let i = 0; i < pos.count; i++) {
    const k = Math.round(pos.getX(i) * scale) + '_' + Math.round(pos.getY(i) * scale) + '_' + Math.round(pos.getZ(i) * scale)
    if (keyToVert.has(k)) union(i, keyToVert.get(k)!)
    else keyToVert.set(k, i)
  }
  for (let t = 0; t < triCount; t++) {
    union(t * 3, t * 3 + 1)
    union(t * 3 + 1, t * 3 + 2)
  }
  const triRoot = new Int32Array(triCount)
  const sizeByRoot = new Map<number, number>()
  for (let t = 0; t < triCount; t++) {
    const r = find(t * 3)
    triRoot[t] = r
    sizeByRoot.set(r, (sizeByRoot.get(r) || 0) + 1)
  }
  if (sizeByRoot.size <= 1) return geo // single solid, nothing to strip

  const bboxByRoot = new Map<number, { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number }>()
  for (let t = 0; t < triCount; t++) {
    const r = triRoot[t]
    let bb = bboxByRoot.get(r)
    if (!bb) {
      bb = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity }
      bboxByRoot.set(r, bb)
    }
    for (let v = 0; v < 3; v++) {
      const idx = t * 3 + v
      const x = pos.getX(idx),
        y = pos.getY(idx),
        z = pos.getZ(idx)
      if (x < bb.minX) bb.minX = x
      if (x > bb.maxX) bb.maxX = x
      if (y < bb.minY) bb.minY = y
      if (y > bb.maxY) bb.maxY = y
      if (z < bb.minZ) bb.minZ = z
      if (z > bb.maxZ) bb.maxZ = z
    }
  }
  let overallMaxDiag = 0
  bboxByRoot.forEach((bb) => {
    const diag = Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY, bb.maxZ - bb.minZ)
    if (diag > overallMaxDiag) overallMaxDiag = diag
  })
  const keepRoots = new Set<number>()
  bboxByRoot.forEach((bb, root) => {
    const diag = Math.hypot(bb.maxX - bb.minX, bb.maxY - bb.minY, bb.maxZ - bb.minZ)
    if (diag >= overallMaxDiag * 0.12) keepRoots.add(root) // drop tiny watermark-scale blobs only
  })

  const keptTris: number[] = []
  for (let t = 0; t < triCount; t++) if (keepRoots.has(triRoot[t])) keptTris.push(t)
  if (keptTris.length === triCount) return geo // nothing to strip

  const newPos = new Float32Array(keptTris.length * 9)
  for (let i = 0; i < keptTris.length; i++) {
    const t = keptTris[i]
    for (let v = 0; v < 3; v++) {
      const src = t * 3 + v
      newPos[i * 9 + v * 3] = pos.getX(src)
      newPos[i * 9 + v * 3 + 1] = pos.getY(src)
      newPos[i * 9 + v * 3 + 2] = pos.getZ(src)
    }
  }
  const cleaned = new THREE.BufferGeometry()
  cleaned.setAttribute('position', new THREE.BufferAttribute(newPos, 3))
  cleaned.computeVertexNormals()
  return cleaned
}

/** Loads the carved-leg STL, builds a solid+wireframe pair, and drives its
 *  rotation/spread/material crossfade off a scroll-driven progress value
 *  (0–1) supplied by the caller each render — same behavior as the original
 *  HomeHero.html iframe, just driven directly instead of via postMessage. */
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
      const { STLLoader } = await import('three/addons/loaders/STLLoader.js')
      const rawGeometry = await new STLLoader().loadAsync('/uploads/cleaned-carved-leg.stl')
      if (cancelled) return

      const geometry = keepLargestSolid(THREE, rawGeometry)
      geometry.computeBoundingBox()
      geometry.computeVertexNormals()
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
        outer.rotation.x = 0.1
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
