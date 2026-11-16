'use client'

import { useEffect, useRef, type RefObject } from 'react'
import type { Material, Object3D } from 'three'
import { clamp01, onFrame, prefersReducedMotion, viewProgress } from '@/lib/ticker'

/** The real construction sequence of a house. `until` is the build progress at which the stage ends. */
const STAGES = [
  { until: 0.12, name: 'Foundation', note: 'Excavation, footings and plinth' },
  { until: 0.45, name: 'Grey Structure', note: 'Columns and slabs, ground floor then first floor' },
  { until: 0.65, name: 'Brickwork & Services', note: 'Walls, electrical conduits and plumbing' },
  { until: 0.9, name: 'Finishing', note: 'Plaster, paint, windows, gate and lawn' },
  { until: 2, name: 'Finished House', note: '100% complete — ready for handover' },
]

// House dimensions (scene units)
const PLINTH = 0.2
const GROUND = 1.25
const SLAB = 0.12
const UPPER_BASE = PLINTH + GROUND + SLAB
const UPPER = 1.15
const ROOF_TOP = UPPER_BASE + UPPER + SLAB

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

type Part = {
  object: Object3D
  from: number
  to: number
  /** rise: grows upward · spread: grows outward like a poured slab · pop: scales in */
  mode: 'rise' | 'spread' | 'pop'
}

type Props = {
  /**
   * The tall block the scene is pinned inside (the scene's sticky parent is marked with `data-pin`).
   * The build runs from 0% when the pin starts to 100% just before it releases.
   */
  trackRef: RefObject<HTMLElement | null>
}

export function HouseScene({ trackRef }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const numberRef = useRef<HTMLSpanElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const noteRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    let cancelled = false
    let cleanup = () => {}

    import('three').then((THREE) => {
      if (cancelled) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
      const cameraTarget = new THREE.Vector3(0, 1, 0)
      const cameraOffset = new THREE.Vector3(8.5, 4.6, 10.5)

      scene.add(new THREE.HemisphereLight(0xffffff, 0xe8dcc2, 1.3))
      const sun = new THREE.DirectionalLight(0xfff0d4, 1.9)
      sun.position.set(6, 10, 8)
      scene.add(sun)

      const site = new THREE.Group()
      scene.add(site)

      // Site circle
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(4.7, 72),
        new THREE.MeshBasicMaterial({ color: 0xb8934a, transparent: true, opacity: 0.08 }),
      )
      ground.rotation.x = -Math.PI / 2
      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x8c6c26, transparent: true, opacity: 0.4 })
      const ring = new THREE.Mesh(new THREE.RingGeometry(4.66, 4.7, 96), ringMaterial)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.001
      site.add(ground, ring)

      // The plot is deeper at the front (lawn and driveway), so the house sits slightly back.
      const house = new THREE.Group()
      house.position.z = -0.6
      site.add(house)

      // Colours: raw concrete and brick first, finished surfaces later.
      const concrete = new THREE.Color(0xa9a59c)
      const brick = new THREE.Color(0xb98a6a)
      const paintedFrame = new THREE.Color(0xefe7d6)
      const paintedWall = new THREE.Color(0xfbf8f1)
      const fascia = new THREE.Color(0x5a4c38)
      const stone = new THREE.Color(0xc2a06a)

      const structureMaterial = new THREE.MeshStandardMaterial({ color: concrete, roughness: 0.9 })
      const slabMaterial = new THREE.MeshStandardMaterial({ color: concrete, roughness: 0.9 })
      const wallMaterial = new THREE.MeshStandardMaterial({ color: brick, roughness: 0.95 })
      const accentMaterial = new THREE.MeshStandardMaterial({ color: brick, roughness: 0.95 })
      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x34424a,
        roughness: 0.15,
        metalness: 0.4,
        emissive: 0xffc97a,
        emissiveIntensity: 0,
      })
      const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.7 })
      const boundaryMaterial = new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: 0.9 })
      const gateMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3f30, roughness: 0.5, metalness: 0.4 })
      const lawnMaterial = new THREE.MeshStandardMaterial({ color: 0x9fb07c, roughness: 1 })
      const driveMaterial = new THREE.MeshStandardMaterial({ color: 0xd9d2c2, roughness: 1 })
      const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x7f9a62, roughness: 1 })

      const parts: Part[] = []

      /** A box whose origin is at its base, so it can grow upward from where it stands. */
      const box = (
        size: [number, number, number],
        position: [number, number, number],
        material: Material,
        from: number,
        to: number,
        mode: Part['mode'] = 'rise',
      ) => {
        const geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
        geometry.translate(0, size[1] / 2, 0)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(position[0], position[1], position[2])
        mesh.visible = false
        house.add(mesh)
        parts.push({ object: mesh, from, to, mode })
        return mesh
      }

      const columnsX = [-2, -0.6, 0.8, 2]
      const columnsZ = [-1.5, 0, 1.5]

      // 01 — Foundation
      columnsX.forEach((x, column) => {
        columnsZ.forEach((z, row) => {
          const start = (column * 3 + row) * 0.003
          box([0.36, 0.1, 0.36], [x, 0, z], structureMaterial, start, start + 0.04, 'pop')
        })
      })
      box([4.4, PLINTH, 3.4], [0, 0, 0], structureMaterial, 0.04, 0.12, 'spread')

      // 02 — Grey structure: ground floor
      columnsX.forEach((x, column) => {
        columnsZ.forEach((z, row) => {
          const start = 0.12 + (column * 3 + row) * 0.004
          box([0.16, GROUND, 0.16], [x, PLINTH, z], structureMaterial, start, start + 0.08)
        })
      })
      box([0.16, PLINTH + GROUND, 0.16], [0.95, 0, 2.75], structureMaterial, 0.2, 0.26)
      box([0.16, PLINTH + GROUND, 0.16], [2.15, 0, 2.75], structureMaterial, 0.21, 0.27)
      box([4.3, SLAB, 3.3], [0, PLINTH + GROUND, 0], slabMaterial, 0.25, 0.31, 'spread')
      box([1.5, 0.1, 1.5], [1.55, PLINTH + GROUND + 0.02, 2.2], slabMaterial, 0.28, 0.33, 'spread')

      // 02 — Grey structure: first floor (set back, leaving a terrace on the right)
      columnsX.slice(0, 3).forEach((x, column) => {
        columnsZ.forEach((z, row) => {
          const start = 0.31 + (column * 3 + row) * 0.004
          box([0.16, UPPER, 0.16], [x, UPPER_BASE, z], structureMaterial, start, start + 0.05)
        })
      })
      box([3.2, SLAB, 3.3], [-0.6, UPPER_BASE + UPPER, 0], slabMaterial, 0.39, 0.45, 'spread')

      // 03 — Brickwork
      box([3.9, GROUND, 2.9], [0, PLINTH, 0], wallMaterial, 0.45, 0.54)
      box([2.7, UPPER, 2.9], [-0.6, UPPER_BASE, 0], wallMaterial, 0.53, 0.61)
      box([0.8, ROOF_TOP + 0.3 - PLINTH, 0.14], [-1.55, PLINTH, 1.52], accentMaterial, 0.55, 0.63)
      // Roof parapet
      box([3.2, 0.24, 0.08], [-0.6, ROOF_TOP, 1.61], wallMaterial, 0.61, 0.65)
      box([3.2, 0.24, 0.08], [-0.6, ROOF_TOP, -1.61], wallMaterial, 0.61, 0.65)
      box([0.08, 0.24, 3.3], [-2.16, ROOF_TOP, 0], wallMaterial, 0.61, 0.65)
      box([0.08, 0.24, 3.3], [0.96, ROOF_TOP, 0], wallMaterial, 0.61, 0.65)
      // Terrace parapet
      box([1.3, 0.3, 0.08], [1.5, UPPER_BASE, 1.61], wallMaterial, 0.61, 0.65)
      box([1.3, 0.3, 0.08], [1.5, UPPER_BASE, -1.61], wallMaterial, 0.61, 0.65)
      box([0.08, 0.3, 3.3], [2.11, UPPER_BASE, 0], wallMaterial, 0.61, 0.65)

      // 04 — Finishing: door and windows
      box([0.5, 1, 0.05], [-0.75, PLINTH, 1.47], woodMaterial, 0.74, 0.8, 'pop')
      box([1, 0.75, 0.05], [0.15, PLINTH + 0.3, 1.47], glassMaterial, 0.75, 0.81, 'pop')
      box([0.8, 0.7, 0.05], [1.4, PLINTH + 0.3, 1.47], glassMaterial, 0.76, 0.82, 'pop')
      box([1.5, 0.8, 0.05], [-0.3, UPPER_BASE + 0.2, 1.47], glassMaterial, 0.77, 0.83, 'pop')
      box([0.16, 2, 0.04], [-1.55, PLINTH + 0.5, 1.6], glassMaterial, 0.78, 0.84, 'pop')
      box([0.05, 0.65, 0.7], [1.97, PLINTH + 0.35, 0.7], glassMaterial, 0.76, 0.82, 'pop')
      box([0.05, 0.65, 0.7], [1.97, PLINTH + 0.35, -0.7], glassMaterial, 0.77, 0.83, 'pop')
      box([0.05, 0.9, 1.3], [0.77, UPPER_BASE + 0.05, 0], glassMaterial, 0.78, 0.84, 'pop')

      // 04 — Finishing: lawn, driveway, boundary wall and gate
      box([3.6, 0.03, 1.6], [-1, 0, 2.5], lawnMaterial, 0.8, 0.86, 'spread')
      box([2, 0.03, 1.6], [1.8, 0, 2.5], driveMaterial, 0.8, 0.86, 'spread')
      box([5.6, 0.5, 0.08], [0, 0, -2.1], boundaryMaterial, 0.83, 0.89)
      box([0.08, 0.5, 5.4], [-2.8, 0, 0.6], boundaryMaterial, 0.83, 0.89)
      box([0.08, 0.5, 5.4], [2.8, 0, 0.6], boundaryMaterial, 0.83, 0.89)
      box([3.7, 0.5, 0.08], [-0.95, 0, 3.3], boundaryMaterial, 0.84, 0.9)
      box([0.55, 0.5, 0.08], [2.525, 0, 3.3], boundaryMaterial, 0.84, 0.9)
      box([1.35, 0.45, 0.05], [1.575, 0, 3.3], gateMaterial, 0.87, 0.91, 'pop')

      // Two small trees on the lawn
      const trunkGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.5, 8)
      const crownGeometry = new THREE.SphereGeometry(0.3, 16, 12)
      ;[
        [-2.2, 2.7],
        [-0.2, 2.9],
      ].forEach(([x, z], index) => {
        const tree = new THREE.Group()
        const trunk = new THREE.Mesh(trunkGeometry, woodMaterial)
        trunk.position.y = 0.25
        const crown = new THREE.Mesh(crownGeometry, leafMaterial)
        crown.position.y = 0.72
        tree.add(trunk, crown)
        tree.position.set(x, 0, z)
        tree.visible = false
        house.add(tree)
        parts.push({ object: tree, from: 0.87 + index * 0.01, to: 0.92 + index * 0.01, mode: 'pop' })
      })

      const reduceMotion = prefersReducedMotion()
      const pin = wrapper.closest<HTMLElement>('[data-pin]')
      const pointer = { x: 0, eased: 0 }
      let pinned = false
      let pinTop = 0
      let shown = 0
      let visible = true
      let lastStage = -1
      let lastPercent = -1

      const resize = () => {
        const width = wrapper.clientWidth
        const height = wrapper.clientHeight
        if (width && height) {
          renderer.setSize(width, height, false)
          const aspect = width / height
          camera.aspect = aspect
          // Narrow (tall) boxes: step the camera back so the whole plot stays in view.
          const fit = Math.max(1, 1.15 / aspect)
          camera.position.copy(cameraTarget).addScaledVector(cameraOffset, fit)
          camera.lookAt(cameraTarget)
          camera.updateProjectionMatrix()
        }
        if (pin) {
          const style = window.getComputedStyle(pin)
          pinned = style.position === 'sticky'
          pinTop = parseFloat(style.top) || 0
        }
      }
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(wrapper)
      window.addEventListener('resize', resize)
      resize()

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
      })
      visibilityObserver.observe(wrapper)

      const onPointerMove = (event: PointerEvent) => {
        pointer.x = event.clientX / window.innerWidth - 0.5
      }
      window.addEventListener('pointermove', onPointerMove, { passive: true })

      const readProgress = () => {
        const track = trackRef.current
        if (pinned && pin && track) {
          const distance = track.getBoundingClientRect().height - pin.offsetHeight
          if (distance > 80) {
            // 0 the moment the scene pins, 100% a little before it lets go.
            return clamp01((pinTop - track.getBoundingClientRect().top) / (distance * 0.9))
          }
        }
        // Not pinned (very short screens): build while the scene crosses the screen.
        return clamp01((viewProgress(wrapper) - 0.2) / 0.5)
      }

      const stopFrame = onFrame((time) => {
        if (!visible) return

        const progress = readProgress()
        shown = reduceMotion ? progress : shown + (progress - shown) * 0.1
        if (Math.abs(progress - shown) < 0.0005) shown = progress
        pointer.eased += (pointer.x - pointer.eased) * 0.05

        parts.forEach((part) => {
          const t = easeOut(clamp01((shown - part.from) / (part.to - part.from)))
          part.object.visible = t > 0
          if (t <= 0) return
          const scale = Math.max(0.001, t)
          if (part.mode === 'rise') part.object.scale.set(1, scale, 1)
          else if (part.mode === 'spread') part.object.scale.set(scale, 1, scale)
          else part.object.scale.setScalar(scale)
        })

        // Plaster and paint
        const finish = easeOut(clamp01((shown - 0.65) / 0.15))
        const handover = clamp01((shown - 0.9) / 0.1)
        structureMaterial.color.copy(concrete).lerp(paintedFrame, finish)
        slabMaterial.color.copy(concrete).lerp(fascia, finish)
        wallMaterial.color.copy(brick).lerp(paintedWall, finish)
        accentMaterial.color.copy(brick).lerp(stone, finish)
        glassMaterial.emissiveIntensity = handover * 1.1
        ringMaterial.opacity = 0.4 + handover * 0.4

        const idle = reduceMotion ? 0 : Math.sin(time / 2400) * 0.04
        site.rotation.y = -0.35 + shown * 0.7 + pointer.eased * 0.3 + idle
        renderer.render(scene, camera)

        if (barRef.current) barRef.current.style.transform = `scaleX(${shown})`
        const percent = Math.round(shown * 100)
        if (percent !== lastPercent) {
          lastPercent = percent
          if (percentRef.current) percentRef.current.textContent = `${percent}%`
        }
        const stage = STAGES.findIndex((item) => shown < item.until)
        if (stage !== lastStage) {
          lastStage = stage
          if (numberRef.current) numberRef.current.textContent = String(stage + 1).padStart(2, '0')
          if (nameRef.current) nameRef.current.textContent = STAGES[stage].name
          if (noteRef.current) noteRef.current.textContent = STAGES[stage].note
        }
      })

      cleanup = () => {
        stopFrame()
        resizeObserver.disconnect()
        visibilityObserver.disconnect()
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onPointerMove)
        scene.traverse((object) => {
          const mesh = object as { geometry?: { dispose: () => void }; material?: Material | Material[] }
          mesh.geometry?.dispose()
          const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
          materials.forEach((material) => material.dispose())
        })
        renderer.dispose()
      }
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [trackRef])

  return (
    <div ref={wrapperRef} className="relative size-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="3D model of a house being built as you scroll: foundation, grey structure, brickwork, finishing and the finished house"
        className="absolute inset-0 size-full"
      />
      <div aria-hidden="true" className="absolute inset-x-4 bottom-3 flex flex-col gap-1.5 md:inset-x-6 md:bottom-5 md:gap-3">
        <p className="flex items-baseline gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground md:text-xs">
          Stage
          <span ref={numberRef} className="font-serif text-2xl tracking-normal text-primary md:text-3xl">
            01
          </span>
          / {String(STAGES.length).padStart(2, '0')}
          <span className="ml-auto tracking-[0.15em]">
            <span ref={percentRef} className="text-primary">
              0%
            </span>{' '}
            built
          </span>
        </p>
        <p className="flex flex-col gap-0.5">
          <span ref={nameRef} className="font-serif text-lg leading-tight md:text-2xl">
            {STAGES[0].name}
          </span>
          <span ref={noteRef} className="hidden text-xs leading-relaxed text-muted-foreground sm:block">
            {STAGES[0].note}
          </span>
        </p>
        <span className="block h-px w-full bg-border">
          <span ref={barRef} className="block size-full origin-left scale-x-0 bg-primary" />
        </span>
      </div>
    </div>
  )
}
