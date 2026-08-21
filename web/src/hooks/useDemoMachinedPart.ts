import { useEffect } from 'react'
import type { ThreeDStageElement } from '../lib/three-d-stage'

/** Builds the procedural "vise jaw set" demo geometry used on every product
 *  page as a representative 3D preview (ported from ProductViewer.html —
 *  the original design never wired distinct geometry per catalog item
 *  either, this is the one 3D-modeled product in the demo). */
export function useDemoMachinedPart(stageRef: React.RefObject<ThreeDStageElement | null>) {
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let cancelled = false

    stage.ready.then(({ THREE }) => {
      if (cancelled) return

      const steel = new THREE.MeshStandardMaterial({ name: 'steel', color: 0x9aa0a6, roughness: 0.35, metalness: 0.35 })
      const neutral = new THREE.MeshStandardMaterial({ name: 'neutral_anno', color: 0xc7cad0, roughness: 0.4, metalness: 0.25 })

      const group = new THREE.Group()

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.14), steel)
      base.name = 'base_plate'
      base.position.set(0, 0.01, 0)
      base.castShadow = true
      base.receiveShadow = true
      group.add(base)

      const fixedJaw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.14), steel)
      fixedJaw.name = 'fixed_jaw'
      fixedJaw.position.set(-0.09, 0.065, 0)
      fixedJaw.castShadow = true
      fixedJaw.receiveShadow = true
      group.add(fixedJaw)

      const moveJaw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.14), steel)
      moveJaw.name = 'movable_jaw'
      moveJaw.position.set(0.04, 0.065, 0)
      moveJaw.castShadow = true
      moveJaw.receiveShadow = true
      group.add(moveJaw)

      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 24), steel)
      screw.name = 'lead_screw'
      screw.rotation.z = Math.PI / 2
      screw.position.set(-0.02, 0.065, 0.05)
      screw.castShadow = true
      group.add(screw)

      for (const zSign of [1, -1]) {
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 16), neutral)
        pin.name = 'dowel_pin_' + (zSign > 0 ? 'a' : 'b')
        pin.position.set(-0.02, 0.03, zSign * 0.055)
        pin.castShadow = true
        group.add(pin)
      }

      const knob = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.006, 12, 24), neutral)
      knob.name = 'screw_handle'
      knob.position.set(-0.09, 0.065, 0.14)
      knob.rotation.y = Math.PI / 2
      knob.castShadow = true
      group.add(knob)

      const bx = 0.1,
        bz = 0.06
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.024, 12), steel)
          bolt.name = 'mount_bolt'
          bolt.position.set(sx * bx, 0.03, sz * bz)
          bolt.castShadow = true
          group.add(bolt)
        }
      }

      group.position.y = 0
      stage.setObject(group)
    })

    return () => {
      cancelled = true
    }
  }, [stageRef])
}
