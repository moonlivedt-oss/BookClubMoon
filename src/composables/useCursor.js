import { ref, onMounted, onUnmounted } from 'vue'

const MODES = [
  { cls: '',              ico: '●', label: 'Курсор: круг' },
  { cls: 'cur-crosshair', ico: '✛', label: 'Курсор: прицел' },
  { cls: 'cur-pen',       ico: '✒', label: 'Курсор: перо' },
  { cls: 'cur-star',      ico: '✦', label: 'Курсор: звезда' },
  { cls: 'cur-default',   ico: '↖', label: 'Курсор: стандарт' },
]

const modeIdx = ref(0)
const cursorMode = ref(MODES[0])

export function useCursor() {
  function cycle() {
    const body = document.body
    MODES.forEach(m => { if (m.cls) body.classList.remove(m.cls) })
    modeIdx.value = (modeIdx.value + 1) % MODES.length
    cursorMode.value = MODES[modeIdx.value]
    if (cursorMode.value.cls) body.classList.add(cursorMode.value.cls)
  }

  return { cursorMode, cycle }
}

export function useCursorFollow() {
  const cx = ref(0), cy = ref(0)
  let mx = 0, my = 0, raf = 0

  function onMove(e) {
    mx = e.clientX; my = e.clientY
    const dot = document.getElementById('cursor-dot')
    if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px' }
    if (Math.random() > .75) spawnSparkle(mx, my)
  }

  function tick() {
    cx.value += (mx - cx.value) * .12
    cy.value += (my - cy.value) * .12
    const cur = document.getElementById('cursor')
    if (cur) { cur.style.left = cx.value + 'px'; cur.style.top = cy.value + 'px' }
    raf = requestAnimationFrame(tick)
  }

  function spawnSparkle(x, y) {
    const s = document.createElement('div')
    s.className = 'sparkle'
    const dx = (Math.random() - .5) * 60, dy = (Math.random() - .5) * 60
    const sz = 3 + Math.random() * 5
    s.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${Math.random() > .5 ? '#C9A84C' : '#E8C96A'};--dx:${dx}px;--dy:${dy}px;`
    document.body.appendChild(s)
    setTimeout(() => s.remove(), 800)
  }

  onMounted(() => {
    document.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
  })
  onUnmounted(() => {
    document.removeEventListener('mousemove', onMove)
    cancelAnimationFrame(raf)
  })
}
