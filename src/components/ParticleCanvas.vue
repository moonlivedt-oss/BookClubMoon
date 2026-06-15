<template>
  <canvas ref="canvas" id="ptcl-canvas"></canvas>
  <button id="ptcl-toggle" :class="{ off: !enabled }" @click="toggle">
    <span class="pt-dot"></span>Частицы
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas  = ref(null)
const enabled = ref(true)
let ctx, pts = [], raf

function mkPt() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight + 100,
    vx: (Math.random() - .5) * .4,
    vy: -.15 - Math.random() * .4,
    r: .8 + Math.random() * 2.2,
    o: .05 + Math.random() * .55,
    s: .994 + Math.random() * .005
  }
}

function resize() {
  if (!canvas.value) return
  canvas.value.width  = window.innerWidth
  canvas.value.height = window.innerHeight
}

function animate() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  if (enabled.value) {
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.o *= p.s
      if (p.y < -10 || p.o < .015) pts[i] = { ...mkPt(), y: canvas.value.height + 10 }
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(201,168,76,${p.o})`
      ctx.fill()
    })
  }
  raf = requestAnimationFrame(animate)
}

function toggle() { enabled.value = !enabled.value }

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  resize()
  for (let i = 0; i < 140; i++) pts.push(mkPt())
  animate()
  window.addEventListener('resize', resize)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
canvas { position:fixed; inset:0; pointer-events:none; z-index:1; }
</style>
