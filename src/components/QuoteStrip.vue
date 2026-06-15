<template>
  <div class="quote-s">
    <div class="qs-wrap rev">
      <div class="qs-shimmer" :class="{ run: shimmer }"></div>
      <blockquote>
        <span v-for="(ch, i) in chars" :key="tick + '-' + i"
          class="qchar" :class="animClass"
          :style="{ animationDelay: i * 22 + 'ms', '--rx': randX[i] + 'px', '--ry': randY[i] + 'px' }">{{ ch }}</span>
      </blockquote>
      <cite>{{ current.c }}</cite>
      <div class="qs-controls">
        <button class="qs-btn" @click="prev" title="Предыдущая">←</button>
        <button class="qs-btn qs-copy" @click="copyQuote" :title="copied ? 'Скопировано!' : 'Копировать цитату'">
          {{ copied ? '✓' : '⎘' }}
        </button>
        <button class="qs-btn" @click="next" title="Следующая">→</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { QUOTES } from '@/data/quotes.js'

const idx       = ref(0)
const tick      = ref(0)
const animClass = ref('qin')
const shimmer   = ref(false)
const copied    = ref(false)
let   interval  = null

const current = computed(() => QUOTES[idx.value])
const chars   = computed(() => [...current.value.q].map(c => c === ' ' ? '\u00A0' : c))
const randX   = computed(() => chars.value.map(() => (Math.random() - .5) * 120))
const randY   = computed(() => chars.value.map(() => (20 + Math.random() * 40) * (Math.random() > .5 ? 1 : -1)))

function switchTo(newIdx) {
  animClass.value = 'qout'
  clearInterval(interval)
  setTimeout(() => {
    idx.value       = ((newIdx % QUOTES.length) + QUOTES.length) % QUOTES.length
    tick.value++
    animClass.value = 'qin'
    shimmer.value   = false
    setTimeout(() => { shimmer.value = true }, 50)
  }, 420)
  interval = setInterval(() => switchTo(idx.value + 1), 6000)
}

function next() { switchTo(idx.value + 1) }
function prev() { switchTo(idx.value - 1) }

async function copyQuote() {
  const text = `\u00AB${current.value.q}\u00BB \u2014 ${current.value.c}`
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}

onMounted(() => {
  shimmer.value = true
  interval = setInterval(() => switchTo(idx.value + 1), 6000)
})
onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.quote-s { background:linear-gradient(135deg,rgba(122,18,32,.3),var(--bg1)); border-top:1px solid var(--gb); border-bottom:1px solid var(--gb); padding:5rem 2.5rem; text-align:center; position:relative; overflow:hidden; }
.quote-s::before { content:''; position:absolute; left:50%; top:0; width:1px; height:100%; background:linear-gradient(to bottom,transparent,rgba(201,168,76,.2),transparent); transform:translateX(-50%); }
.qs-wrap { position:relative; display:inline-block; max-width:780px; }
.qs-shimmer { position:absolute; top:0; width:60%; height:100%; background:linear-gradient(to right,transparent,rgba(201,168,76,.12),transparent); pointer-events:none; }
.qs-shimmer.run { animation:shimmer 3s ease-in-out; }
@keyframes shimmer { 0%{left:-60%;} 100%{left:110%;} }
blockquote { font-family:var(--fh); font-size:clamp(1.3rem,3vw,1.9rem); font-style:italic; color:var(--cream); line-height:1.65; min-height:2.5em; }
cite { display:block; margin-top:1.25rem; font-family:var(--fs); font-size:13px; letter-spacing:.2em; color:var(--gold); font-style:normal; opacity:.85; }
.qchar { display:inline; }
.qchar.qin  { animation:charIn  .55s cubic-bezier(.215,.61,.355,1) both; }
.qchar.qout { animation:charOut .4s ease-in forwards; }
@keyframes charIn  { 0%{opacity:0;transform:translate(var(--rx,0px),var(--ry,20px)) scale(.8);filter:blur(2px);color:var(--gold2);} 60%{filter:blur(0);color:var(--gold);} 100%{opacity:1;transform:none;color:var(--cream);} }
@keyframes charOut { 0%{opacity:1;transform:none;} 100%{opacity:0;transform:translate(var(--rx,0px),var(--ry,-20px)) scale(.7);filter:blur(3px);} }
.qs-controls { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:1.5rem; }
.qs-btn { background:transparent; border:1px solid var(--gb); border-radius:20px; color:var(--gold); padding:5px 16px; font-family:var(--fh); font-size:14px; cursor:pointer; transition:all .2s; backdrop-filter:blur(4px); }
.qs-btn:hover { background:var(--gp); border-color:var(--gold); }
.qs-copy { width:34px; padding:5px 0; font-size:16px; }
.qs-copy:hover { transform:scale(1.1); }
</style>
