<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { house, loadHouse } from '../store/house' // Adjust path if needed

const canvasContainer = ref<HTMLElement | null>(null)
let scene: THREE.Scene, camera: THREE.OrthographicCamera, renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let resizeObserver: ResizeObserver | null = null

const placedObjects: THREE.Object3D[] = []
const ROOM_HEIGHT = 4

// --- CLEANUP ---
const clearScene = () => {
  placedObjects.forEach(obj => {
    scene.remove(obj)
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
        else child.material.dispose()
      }
    })
  })
  placedObjects.length = 0
}

// --- FACTORY ---
const createRetroBox = (w: number, h: number, d: number, sideColor: number, topColor: number) => {
  const geo = new THREE.BoxGeometry(w, h, d)
  const sideMat = new THREE.MeshBasicMaterial({ color: sideColor })
  const topMat = new THREE.MeshBasicMaterial({ color: topColor })
  const mesh = new THREE.Mesh(geo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat])
  const edges = new THREE.EdgesGeometry(geo)
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true }))
  const group = new THREE.Group()
  group.add(mesh, line)
  return group
}

const buildScene = () => {
  if (!scene) return
  clearScene()

  const rooms = house.rooms || []
  const beds = house.beds || []

  // Auto-Layout Grid Math
  const COLUMNS = 3
  const SPACING_X = 14
  const SPACING_Z = 16

  rooms.forEach((room, index) => {
    const col = index % COLUMNS
    const row = Math.floor(index / COLUMNS)
    const startX = -((COLUMNS - 1) * SPACING_X) / 2
    const x = startX + col * SPACING_X
    const z = -row * SPACING_Z

    // Spawn Room Shell
    const w = 12, d = 16, h = ROOM_HEIGHT, t = 0.5
    const roomGroup = new THREE.Group()
    
    // Floor & Walls
    const floor = createRetroBox(w, t, d, 0xC19A6B, 0xC19A6B)
    floor.position.y = t / 2
    const back = createRetroBox(w, h, t, 0xDEB887, 0x888888)
    back.position.set(0, h / 2, -d / 2 + t / 2)
    const left = createRetroBox(t, h, d, 0xDEB887, 0x888888)
    left.position.set(-w / 2 + t / 2, h / 2, 0)
    const right = createRetroBox(t, h, d, 0xDEB887, 0x888888)
    right.position.set(w / 2 - t / 2, h / 2, 0)
    
    roomGroup.add(floor, back, left, right)
    roomGroup.position.set(x, 0, z)
    scene.add(roomGroup)
    placedObjects.push(roomGroup)

    // Spawn Beds inside this room
    const roomBeds = beds.filter(b => b.room_id === room.id)
    roomBeds.forEach((bed, bIndex) => {
      const bedGroup = new THREE.Group()
      const base = createRetroBox(4, 1, 7, 0x5C7171, 0x5C7171)
      base.position.y = 0.5
      const mattress = createRetroBox(3.8, 0.4, 6.8, 0xEAE8DD, 0xEAE8DD)
      mattress.position.y = 1.2
      const pillow = createRetroBox(2.5, 0.3, 1.5, 0xFFFFFF, 0xFFFFFF)
      pillow.position.set(0, 1.55, -2)
      bedGroup.add(base, mattress, pillow)

      // Arrange beds neatly in the room
      const bX = bIndex % 2 === 0 ? -3 : 3
      const bZ = Math.floor(bIndex / 2) * -5 + 3
      bedGroup.position.set(x + bX, 0, z + bZ)
      
      scene.add(bedGroup)
      placedObjects.push(bedGroup)
    })
  })
}

const resizeRenderer = () => {
  if (!canvasContainer.value || !camera || !renderer) return
  const w = canvasContainer.value.clientWidth
  const h = canvasContainer.value.clientHeight
  const aspect = w / h
  const viewSize = 35
  camera.left = -viewSize * aspect
  camera.right = viewSize * aspect
  camera.top = viewSize
  camera.bottom = -viewSize
  camera.updateProjectionMatrix()
  renderer.setSize(w, h, false)
}

// Watch database state and rebuild 3D view automatically
watch(() => house.rooms, buildScene, { deep: true })
watch(() => house.beds, buildScene, { deep: true })

onMounted(async () => {
  const container = canvasContainer.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#EAE8DD')

  const aspect = container.clientWidth / container.clientHeight
  camera = new THREE.OrthographicCamera(-35 * aspect, 35 * aspect, 35, -35, 1, 1000)
  camera.position.set(50, 50, 50)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setSize(container.clientWidth, container.clientHeight, false)
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.maxPolarAngle = Math.PI / 2.5

  const gridHelper = new THREE.GridHelper(150, 50, 0x000000, 0x000000)
  const gridMat = gridHelper.material as THREE.LineBasicMaterial
  gridMat.opacity = 0.1
  gridMat.transparent = true
  scene.add(gridHelper)

  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(container)

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  await loadHouse(['rooms', 'beds'])
  buildScene()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  clearScene()
  controls?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div class="h-full w-full min-h-[400px] border-2 border-black shadow-[4px_4px_0_0_#000] relative bg-[#EAE8DD]">
    <div class="absolute top-4 left-4 z-10 pointer-events-none">
      <div class="font-bold uppercase tracking-wider text-[10px] bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">
        🎥 Left-Click Drag = Rotate | Right-Click = Pan
      </div>
    </div>
    <div ref="canvasContainer" class="absolute inset-0 outline-none cursor-move"></div>
  </div>
</template>