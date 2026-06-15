<template>
  <section id="models3d">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">3D · Интерактив</span>
        <h2 class="sec-h">Книги <em>в пространстве</em></h2>
        <div class="sec-div"></div>
      </div>

      <div class="model-grid">
        <div class="model-slot" v-for="(slot, i) in slots" :key="i">
          <!-- Drop zone -->
          <div class="model-drop" v-if="!slot.loaded"
            :class="{ dragover: slot.dragover }"
            @click="triggerInput(i)"
            @dragover.prevent="slot.dragover = true"
            @dragleave="slot.dragover = false"
            @drop.prevent="onDrop($event, i)">
            <div class="mdrop-icon">📁</div>
            <div class="mdrop-title">{{ slot.label }}</div>
            <div class="mdrop-hint">Перетащите папку с моделью или нажмите</div>
            <button class="mdrop-btn" @click.stop="triggerInput(i)">Выбрать папку</button>
            <input type="file" webkitdirectory multiple style="display:none"
              :ref="el => fileInputs[i] = el"
              @change="onFileChange($event, i)" />
          </div>

          <!-- Loading -->
          <div class="model-loading" v-if="slot.loading">
            <div class="ml-spin"></div>Загрузка…
          </div>

          <!-- Canvas -->
          <canvas :ref="el => canvases[i] = el" class="model-canvas"></canvas>
          <div class="model-label">{{ slot.label }}</div>
        </div>
      </div>

      <p class="model-hint rev">
        Выберите папку с моделью (содержит scene.gltf + textures/) · Наведите для вращения
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as THREE from 'three'
import { GLTFLoader }     from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls }  from 'three/examples/jsm/controls/OrbitControls.js'

const slots = reactive([
  { label: 'Средневековая книга', loaded: false, loading: false, dragover: false },
  { label: 'Старинные книги',     loaded: false, loading: false, dragover: false },
  { label: 'Открытая книга',      loaded: false, loading: false, dragover: false },
])

const canvases   = ref([])
const fileInputs = ref([])

function triggerInput(i) { fileInputs.value[i]?.click() }

function onFileChange(e, i) { loadFiles(i, e.target.files) }
function onDrop(e, i)       { loadFiles(i, e.dataTransfer.files) }

function loadFiles(i, files) {
  if (!files?.length) return
  const map = {}
  let gltfUrl = null
  Array.from(files).forEach(f => {
    const url = URL.createObjectURL(f)
    map[f.name] = url
    if (f.name.endsWith('.gltf')) gltfUrl = url
  })
  if (!gltfUrl) { alert('Файл scene.gltf не найден в выбранной папке'); return }
  slots[i].loading = true
  setupScene(i, gltfUrl, map)
}

function setupScene(idx, gltfUrl, fileMap) {
  const canvas = canvases.value[idx]
  if (!canvas) return

  const W = Math.max(canvas.parentElement?.offsetWidth || 400, 300)
  const H = 300
  canvas.width = W; canvas.height = H

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setSize(W, H)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x0E0B07, 1)
  renderer.shadowMap.enabled = true

  const scene  = new THREE.Scene()
  scene.fog    = new THREE.Fog(0x0E0B07, 10, 25)
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.01, 100)
  camera.position.set(0, 1.2, 3.8)

  scene.add(new THREE.AmbientLight(0xF2E8D4, 0.5))
  const kl = new THREE.DirectionalLight(0xC9A84C, 1.6); kl.position.set(4, 7, 5); kl.castShadow = true; scene.add(kl)
  const fl = new THREE.DirectionalLight(0x8B4513, 0.35); fl.position.set(-4, 2, -3); scene.add(fl)
  const rl = new THREE.DirectionalLight(0xFFD080, 0.25); rl.position.set(0, 5, -6); scene.add(rl)

  const ctrl = new OrbitControls(camera, canvas)
  ctrl.enableDamping = true; ctrl.dampingFactor = 0.06
  ctrl.autoRotate = true; ctrl.autoRotateSpeed = 1.4
  ctrl.enablePan = false; ctrl.minDistance = 1; ctrl.maxDistance = 9
  ctrl.maxPolarAngle = Math.PI * 0.78

  const mgr = new THREE.LoadingManager()
  mgr.setURLModifier(url => {
    const fname = url.split('/').pop().split('\\').pop()
    return fileMap[fname] || url
  })

  new GLTFLoader(mgr).load(gltfUrl, gltf => {
    slots[idx].loading = false
    slots[idx].loaded  = true
    const model = gltf.scene
    const box   = new THREE.Box3().setFromObject(model)
    const ctr   = new THREE.Vector3(); box.getCenter(ctr)
    const sz    = new THREE.Vector3(); box.getSize(sz)
    model.position.sub(ctr)
    model.scale.setScalar(2.4 / Math.max(sz.x, sz.y, sz.z))
    model.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } })
    scene.add(model)
  }, undefined, err => {
    slots[idx].loading = false
    console.warn('Ошибка загрузки модели:', err.message || err)
  })

  const loop = () => { requestAnimationFrame(loop); ctrl.update(); renderer.render(scene, camera) }
  loop()

  canvas.addEventListener('mouseenter', () => ctrl.autoRotate = false)
  canvas.addEventListener('mouseleave', () => ctrl.autoRotate = true)

  window.addEventListener('resize', () => {
    const nW = Math.max(canvas.parentElement?.offsetWidth || 400, 300)
    camera.aspect = nW / H; camera.updateProjectionMatrix()
    renderer.setSize(nW, H)
  })
}
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg0); }
.model-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.model-slot { background:var(--bg2); border:1px solid var(--bord); border-radius:6px; overflow:hidden; position:relative; transition:border-color .3s; }
.model-slot:hover { border-color:var(--gb); }
.model-canvas { width:100%; height:300px; display:block; }
.model-label { font-family:var(--fh); font-size:12px; letter-spacing:.1em; color:var(--cream2); text-align:center; padding:.75rem; border-top:1px solid var(--bord); }
.model-drop { position:absolute; inset:0 0 40px 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.6rem; background:var(--bg2); z-index:2; cursor:pointer; transition:background .2s; }
.model-drop.dragover, .model-drop:hover { background:rgba(201,168,76,.07); }
.mdrop-icon  { font-size:2.2rem; opacity:.6; }
.mdrop-title { font-family:var(--fh); font-size:12px; letter-spacing:.1em; color:var(--cream2); text-align:center; }
.mdrop-hint  { font-family:var(--fs); font-size:11px; color:var(--cream2); opacity:.45; text-align:center; padding:0 1rem; }
.mdrop-btn   { padding:6px 16px; background:var(--gp); border:1px solid var(--gb); border-radius:2px; font-family:var(--fh); font-size:11px; letter-spacing:.08em; color:var(--gold); cursor:pointer; transition:all .2s; }
.mdrop-btn:hover { background:rgba(201,168,76,.25); }
.model-loading { position:absolute; inset:0 0 40px 0; display:flex; align-items:center; justify-content:center; background:var(--bg2); z-index:3; font-family:var(--fs); font-size:13px; color:var(--gold); gap:.75rem; }
.ml-spin { width:24px; height:24px; border:2px solid var(--gb); border-top-color:var(--gold); border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.model-hint { text-align:center; font-family:var(--fs); font-size:13px; color:var(--cream2); margin-top:1.5rem; opacity:.5; }
</style>
