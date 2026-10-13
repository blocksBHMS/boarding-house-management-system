<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { house, tenancyOfBed } from '../store/house'

const props = withDefaults(defineProps<{ mode?: 'top' | 'orbit' }>(), {
  mode: 'orbit',
})

const ROOM_W = 10
const ROOM_H = 4
const WALL   = 0.5
const GAP    = 3
const MIN_D  = 14
const PITCH  = 5

const container = ref<HTMLElement | null>(null)
const tip       = ref<{ x: number; y: number; lines: string[] } | null>(null)

let scene    : THREE.Scene
let camera   : THREE.PerspectiveCamera | THREE.OrthographicCamera
let renderer : THREE.WebGLRenderer
let controls : OrbitControls | null = null
let content  : THREE.Group
let grid     : THREE.GridHelper
let raf = 0
let ro  : ResizeObserver | null = null
let hovered   : THREE.Group | null = null
let maxPerFloor = 1
let maxDepth    = MIN_D
let lastSpan    = -1
const raycaster = new THREE.Raycaster()
const pointer   = new THREE.Vector2()

const bedsForRoom = (roomId: number) => house.beds.filter(b => b.room_id === roomId)
const depthOfRoom = (roomId: number) => {
  const letters = new Set(bedsForRoom(roomId).map(b => b.bed_label.charAt(0)))
  return Math.max(MIN_D, Math.ceil(letters.size / 2) * PITCH + 5)
}

const box = (w: number, h: number, d: number, side: number, top: number) => {
  const geo     = new THREE.BoxGeometry(w, h, d)
  const sideMat = new THREE.MeshBasicMaterial({ color: side })
  sideMat.userData.base = side
  const topMat  = new THREE.MeshBasicMaterial({ color: top })
  topMat.userData.base  = top
  const mesh = new THREE.Mesh(geo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat])
  const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x141414 }))
  const g = new THREE.Group()
  g.add(mesh, line)
  return g
}

const makeLabel = (text: string) => {
  const c   = document.createElement('canvas')
  c.width   = 256
  c.height  = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f6f4e7'
  ctx.fillRect(0, 0, 256, 64)
  ctx.strokeStyle = '#141414'
  ctx.lineWidth   = 4
  ctx.strokeRect(2, 2, 252, 60)
  ctx.fillStyle    = '#141414'
  ctx.font         = 'bold 28px monospace'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 34)
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 1),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) }),
  )
  mesh.rotation.x = -Math.PI / 2
  return mesh
}

const makeBedSlot = (bed: any, roomId: number) => {
  const isOcc = !!tenancyOfBed(bed.id)
  const tone = isOcc ? 0x1f7a7d : 0xc8c8c8
  const g = new THREE.Group()
  
  const frame = box(2.6, 0.6, 4.2, 0x8b5a2b, 0x8b5a2b)
  frame.position.y = 0.3
  const mattress = box(2.4, 0.35, 4, tone, tone)
  mattress.position.y = 0.775
  const pillow = box(1.6, 0.25, 0.9, 0xffffff, 0xffffff)
  pillow.position.set(0, 1.075, -1.5)
  
  g.add(frame, mattress, pillow)
  g.userData = { kind: 'bed', bedId: bed.id, roomId }
  return g
}

// FIX: Generates a distinct 3D ladder visible from the Top-Down overview
const makeLadder = () => {
  const g = new THREE.Group()
  const railGeo = new THREE.BoxGeometry(0.15, 3.8, 0.15)
  const rungGeo = new THREE.BoxGeometry(0.8, 0.15, 0.15)
  const mat = new THREE.MeshBasicMaterial({ color: 0x8b5a2b })
  mat.userData.base = 0x8b5a2b

  const makeMesh = (geo: THREE.BoxGeometry, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat)
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x141414 }))
    const p = new THREE.Group()
    p.add(m, lines)
    p.position.set(x, y, z)
    return p
  }

  g.add(makeMesh(railGeo, -0.4, 1.9, 0))
  g.add(makeMesh(railGeo,  0.4, 1.9, 0))
  for(let i=0; i<5; i++) {
    g.add(makeMesh(rungGeo, 0, 0.6 + i*0.6, 0))
  }
  return g
}

const makeBunkBed = (bottomBed: any, topBed: any, roomId: number) => {
  const g = new THREE.Group()

  if (topBed) {
    const postGeo = new THREE.BoxGeometry(0.3, 3.8, 0.3)
    const makePost = (x: number, z: number) => {
      const p = new THREE.Group()
      const postMat = new THREE.MeshBasicMaterial({ color: 0x8b5a2b })
      postMat.userData.base = 0x8b5a2b
      p.add(new THREE.Mesh(postGeo, postMat))
      p.add(new THREE.LineSegments(new THREE.EdgesGeometry(postGeo), new THREE.LineBasicMaterial({ color: 0x141414 })))
      p.position.set(x, 1.9, z)
      return p
    }
    g.add(makePost(-1.15, -1.95))
    g.add(makePost(1.15, -1.95))
    g.add(makePost(-1.15, 1.95))
    g.add(makePost(1.15, 1.95))

    // Attach ladder to the foot of the bed
    const ladder = makeLadder()
    ladder.position.set(0, 0, 2.15) 
    g.add(ladder)
  }

  if (bottomBed) {
    const bottom = makeBedSlot(bottomBed, roomId)
    bottom.position.y = 0 
    g.add(bottom)
  }

  if (topBed) {
    const top = makeBedSlot(topBed, roomId)
    top.position.y = 1.8 
    g.add(top)
  }

  return g
}

const makeRoom = (roomId: number, roomNumber: string) => {
  const beds = bedsForRoom(roomId)
  const d    = depthOfRoom(roomId)
  const g    = new THREE.Group()
  const w = ROOM_W, h = ROOM_H, t = WALL

  const floor  = box(w, t, d, 0xc19a6b, 0xc19a6b); floor.position.y = t / 2
  const back   = box(w, h, t, 0xdeb887, 0x888888); back.position.set(0, h / 2, -d / 2 + t / 2)
  const left   = box(t, h, d, 0xdeb887, 0x888888); left.position.set(-w / 2 + t / 2, h / 2, 0)
  const right  = box(t, h, d, 0xdeb887, 0x888888); right.position.set(w / 2 - t / 2, h / 2, 0)
  const fw     = (w - 4) / 2
  const frontL = box(fw, h, t, 0xdeb887, 0x888888); frontL.position.set(-w / 2 + fw / 2, h / 2, d / 2 - t / 2)
  const frontR = box(fw, h, t, 0xdeb887, 0x888888); frontR.position.set(w / 2 - fw / 2, h / 2, d / 2 - t / 2)
  g.add(floor, back, left, right, frontL, frontR)

  const label = makeLabel(roomNumber.toUpperCase())
  label.position.set(0, t + 0.02, -d / 2 + 1.2)
  g.add(label)

  const letters = [...new Set(beds.map(b => b.bed_label.charAt(0)))]
  letters.forEach((letter, index) => {
    const groupBeds = beds.filter(b => b.bed_label.charAt(0) === letter)
    const upperBed = groupBeds.find(b => b.bed_label.includes('Upper'))
    const lowerBed = groupBeds.find(b => b !== upperBed)
    
    const bGroup = makeBunkBed(lowerBed, upperBed, roomId)
    bGroup.position.set(index % 2 === 0 ? -2.4 : 2.4, t, -d / 2 + 4.5 + Math.floor(index / 2) * PITCH)
    g.add(bGroup)
  })

  g.userData = { kind: 'room', roomId, roomNumber }
  return g
}

const clearContent = () => {
  for (const child of [...content.children]) {
    content.remove(child)
    child.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
        o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => {
          ;(m as THREE.MeshBasicMaterial).map?.dispose()
          m.dispose()
        })
      }
    })
  }
  hovered    = null
  tip.value  = null
}

const fit = () => {
  const el = container.value
  if (!el || !camera || !renderer) return
  const w = el.clientWidth, h = el.clientHeight
  if (!w || !h) return
  renderer.setSize(w, h, false)
  const aspect = w / h
  if (camera instanceof THREE.PerspectiveCamera) {
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    return
  }
  const extX  = maxPerFloor * (ROOM_W + GAP) + GAP
  const extZ  = maxDepth + GAP * 2
  const halfH = Math.max(extZ / 2, extX / 2 / aspect)
  camera.left   = -halfH * aspect
  camera.right  =  halfH * aspect
  camera.top    =  halfH
  camera.bottom = -halfH
  camera.updateProjectionMatrix()
}

const build = () => {
  if (!content) return
  clearContent()
  const rooms = house.rooms
  maxPerFloor = Math.max(1, rooms.length)
  maxDepth    = MIN_D

  rooms.forEach((room, i) => {
    maxDepth = Math.max(maxDepth, depthOfRoom(room.id))
    const g  = makeRoom(room.id, room.room_number)
    g.position.set((i - (rooms.length - 1) / 2) * (ROOM_W + GAP), 0, 0)
    content.add(g)
  })

  if (props.mode === 'orbit' && camera instanceof THREE.PerspectiveCamera) {
    const span = Math.max(maxPerFloor * (ROOM_W + GAP), maxDepth + GAP * 2)
    if (Math.abs(span - lastSpan) > 0.5) {
      lastSpan = span
      const k  = Math.max(span, 24)
      camera.position.set(k * 0.9, k, k * 0.9)
      controls?.target.set(0, 0, 0)
      controls?.update()
    }
  }
  fit()
}

const setupCamera = () => {
  controls?.dispose()
  controls  = null
  lastSpan  = -1
  if (props.mode === 'top') {
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500)
    cam.position.set(0, 100, 0)
    cam.up.set(0, 0, -1)
    cam.lookAt(0, 0, 0)
    camera = cam
  } else {
    camera   = new THREE.PerspectiveCamera(40, 1, 1, 1000)
    camera.position.set(30, 35, 30)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping  = true
    controls.dampingFactor  = 0.1
    controls.maxPolarAngle  = Math.PI / 2 - 0.05
  }
  grid.visible = props.mode === 'orbit'
}

const tint = (g: THREE.Group, on: boolean) => {
  g.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return
    const mats = (Array.isArray(o.material) ? o.material : [o.material]) as THREE.MeshBasicMaterial[]
    mats.forEach((m) => {
      if (typeof m.userData.base !== 'number') return
      m.color.set(m.userData.base)
      if (on) m.color.offsetHSL(0, 0, 0.12)
    })
  })
}

const describe = (g: THREE.Group): string[] => {
  const { kind, bedId, roomId, roomNumber } = g.userData
  if (kind === 'bed') {
    const bed  = house.beds.find(b => b.id === bedId)
    const room = house.rooms.find(r => r.id === roomId)
    if (!bed || !room) return []
    const isOcc = !!tenancyOfBed(bedId)
    return [
      `${room.room_number} — ${bed.bed_label}`,
      isOcc ? 'Occupied' : 'Vacant',
    ]
  }
  const roomBeds = bedsForRoom(roomId)
  const occ      = roomBeds.filter(b => !!tenancyOfBed(b.id)).length
  return [
    roomNumber ?? `Room ${roomId}`,
    `${occ} of ${roomBeds.length} slots occupied`,
  ]
}

const onMove = (e: PointerEvent) => {
  const el = container.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  pointer.set(
    ((e.clientX - rect.left) / rect.width)  * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1,
  )
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(content.children, true).find(i => i.object instanceof THREE.Mesh)

  let o: THREE.Object3D | null = hit?.object ?? null
  while (o && !o.userData.kind) o = o.parent
  const target = (o as THREE.Group | null) ?? null

  if (target !== hovered) {
    if (hovered) tint(hovered, false)
    hovered = target
    if (hovered) tint(hovered, true)
  }
  if (!target) { tip.value = null; return }
  tip.value = {
    x:     Math.max(0, Math.min(e.clientX - rect.left + 12, rect.width  - 200)),
    y:     Math.max(0, Math.min(e.clientY - rect.top  + 12, rect.height - 70)),
    lines: describe(target),
  }
}

const onLeave = () => {
  if (hovered) tint(hovered, false)
  hovered   = null
  tip.value = null
}

onMounted(() => {
  const el = container.value
  if (!el) return

  scene            = new THREE.Scene()
  scene.background = new THREE.Color('#ebe9d8')

  renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
  el.appendChild(renderer.domElement)

  grid = new THREE.GridHelper(120, 120, 0x141414, 0x141414)
  const gm    = grid.material as THREE.LineBasicMaterial
  gm.opacity  = 0.12
  gm.transparent = true
  scene.add(grid)

  content = new THREE.Group()
  scene.add(content)

  setupCamera()
  build()

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  ro = new ResizeObserver(fit)
  ro.observe(el)

  const animate = () => {
    raf = requestAnimationFrame(animate)
    controls?.update()
    renderer.render(scene, camera)
  }
  animate()
})

watch(() => house.rooms,  build, { deep: true })
watch(() => house.beds,   build, { deep: true })
watch(() => house.tenancies, build, { deep: true }) 
watch(() => props.mode, () => { setupCamera(); build() })

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ro?.disconnect()
  container.value?.removeEventListener('pointermove', onMove)
  container.value?.removeEventListener('pointerleave', onLeave)
  if (content) clearContent()
  controls?.dispose()
  grid?.geometry.dispose()
  ;(grid?.material as THREE.Material | undefined)?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div ref="container" class="relative h-full w-full overflow-hidden bg-[#ebe9d8] border-2 border-black">
    <p
      v-if="house.rooms.length === 0"
      class="absolute inset-0 z-10 grid place-items-center p-6 text-center text-gray-500 font-mono text-sm font-bold uppercase tracking-wider"
    >
      No rooms yet. Add rooms and beds on the Rooms page.
    </p>
    <div
      v-if="tip"
      class="pointer-events-none absolute z-10 whitespace-nowrap border-4 border-black bg-white px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0_#000]"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <div v-for="(l, i) in tip.lines" :key="i" :class="i === 0 ? 'text-sm mb-1' : 'text-gray-600'">{{ l }}</div>
    </div>
  </div>
</template>