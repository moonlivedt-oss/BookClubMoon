<template>
  <section id="genres">
    <div class="sec-in">
      <div class="rev" style="margin-bottom:2.5rem">
        <span class="sec-lb">Жанры</span>
        <h2 class="sec-h">Найдите <em>своё</em></h2>
        <div class="sec-div"></div>
      </div>

      <div class="genre-grid">
        <div
          class="genre-card rev"
          v-for="(g, i) in genres"
          :key="g.key"
          :class="[{ sel: active === g.key }, i > 0 ? `d${Math.min(i,4)}` : '']"
          @click="toggle(g.key)"
        >
          <!-- Image — always rendered, never touched by v-show/v-if -->
          <div class="gc-img" :style="{ backgroundImage: `url('${g.img}')` }"></div>

          <!-- Static gradient overlay — no class changes, no opacity changes -->
          <div class="gc-overlay"></div>

          <!-- Selection ring — CSS-only, zero JS/DOM mutation -->
          <div class="gc-sel-ring"></div>

          <div class="gc-content">
            <span class="gc-icon">{{ g.icon }}</span>
            <div class="gc-name">{{ g.label }}</div>
            <div class="gc-count">{{ bookCount(g.key) }} книг</div>
          </div>
        </div>
      </div>

      <!-- Drawer: v-show so DOM stays alive, no card re-renders -->
      <div class="genre-drawer" v-show="active !== null" ref="drawerRef">
        <div class="gd-inner">
          <div class="gd-head">
            <div class="gd-title-wrap">
              <span class="gd-orn">✦</span>
              <span class="gd-title">{{ activeLabel }}</span>
              <span class="gd-orn">✦</span>
            </div>
            <button class="gd-close" @click="active = null">✕</button>
          </div>
          <div class="gd-grid">
            <div class="bcard" v-for="b in drawerBooks" :key="b.t">
              <div class="bcard-in">
                <div class="bf">
                  <div class="bf-cover" :style="{ background: b.c }">
                    <img
                      :src="`https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`"
                      :alt="b.t" loading="lazy"
                      @load="e => e.target.nextElementSibling.style.opacity = 0"
                      @error="e => e.target.style.display = 'none'"
                    />
                    <div class="bf-cover-fb">
                      <div class="bf-ct">{{ b.t }}</div>
                      <div class="bf-ca">{{ b.a }}</div>
                    </div>
                  </div>
                </div>
                <div class="bb">
                  <div>
                    <div class="bb-t">{{ b.t }}</div>
                    <div class="bb-a">{{ b.a }}</div>
                    <div class="bb-d">{{ b.desc }}</div>
                  </div>
                  <div class="bb-row">
                    <span class="bb-stars">★ {{ b.r }}</span>
                    <button class="bb-read" @click="$emit('open-reader', b.t, b.a, b.ch || 0, b)">Читать</button>
                  </div>
                </div>
              </div>
              <div class="bcard-meta">
                <div class="bcard-nm">{{ b.t }}</div>
                <div class="bcard-at">{{ b.a }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { BOOKS, GNLABELS } from '@/data/books.js'

defineEmits(['open-reader'])

const active    = ref(null)
const drawerRef = ref(null)

const genres = [
  { key:'classic', label:'Классика',    icon:'📜', img:'/public/image/Классика.jpg' },
  { key:'modern',  label:'Современные', icon:'🌆', img:'/public/image/Современные.jpg' },
  { key:'fantasy', label:'Фантастика',  icon:'🔮', img:'/public/image/фантастика.jpg' },
  { key:'mystery', label:'Детектив',    icon:'🔍', img:'/public/image/детектив.jpg' },
  { key:'poetry',  label:'Поэзия',      icon:'✒️', img:'/public/image/поэзия.jpg' },
  { key:'all',     label:'Все книги',   icon:'📚', img:'/public/image/общее.jpg' },
]

const drawerBooks = computed(() =>
  active.value ? BOOKS.filter(b => active.value === 'all' || b.g === active.value) : []
)
const activeLabel = computed(() => GNLABELS[active.value] || '')
const bookCount   = key => BOOKS.filter(b => key === 'all' || b.g === key).length

function toggle(key) {
  if (active.value === key) {
    active.value = null
  } else {
    active.value = key
    nextTick(() => {
      drawerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }
}
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg0); }

/* ── GRID ── */
.genre-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }

/* ── CARD ── */
.genre-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  height: 300px;          /* fixed tall height instead of aspect-ratio */
  border: 1.5px solid transparent;
  transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
}
.genre-card:hover {
  transform: scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,.5);
}

/* ── SELECTED STATE — pure CSS, zero DOM mutation ── */
.genre-card.sel {
  border-color: var(--gold);
  box-shadow:
    0 0 0 1px var(--gold),
    0 0 24px rgba(201,168,76,.3),
    0 12px 40px rgba(0,0,0,.5);
  transform: scale(1.02);
}

/* ── IMAGE — own compositing layer, never flickers ── */
.gc-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: translateZ(0);   /* force GPU layer — prevents flicker */
  will-change: transform;
  transition: transform .5s ease;
}
.genre-card:hover .gc-img,
.genre-card.sel   .gc-img { transform: translateZ(0) scale(1.06); }

/* ── OVERLAY — static, no class changes ── */
.gc-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(8,6,3,.80) 0%,
    rgba(8,6,3,.10) 55%,
    transparent     100%
  );
  /* overlay stays the same regardless of selection — no opacity change */
}

/* ── SELECTION RING — CSS only, no JS ── */
.gc-sel-ring {
  position: absolute;
  inset: 0;
  border-radius: 7px;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(201,168,76,.15) 0%, transparent 55%);
  opacity: 0;
  transition: opacity .3s ease;
}
.genre-card.sel .gc-sel-ring {
  opacity: 1;
  animation: shimmer 2.5s ease-in-out infinite;
}
@keyframes shimmer { 0%,100%{ opacity:.6; } 50%{ opacity:1; } }

/* ── CONTENT ── */
.gc-content { position:absolute; bottom:0; left:0; right:0; padding:1.5rem 1.75rem; }
.gc-icon  { font-size:2.2rem; margin-bottom:.6rem; display:block; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)); }
.gc-name  { font-family:var(--fh); font-size:1.15rem; letter-spacing:.08em; color:var(--cream); margin-bottom:5px; text-shadow:0 1px 4px rgba(0,0,0,.7); }
.gc-count { font-family:var(--fs); font-size:12px; color:var(--gold); opacity:.85; }

/* ── DRAWER ── */
.genre-drawer { margin-top:1.5rem; }
.gd-inner { background:var(--bg2); border:1px solid var(--gb); border-radius:8px; padding:2rem; }
.gd-head  { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.75rem; }
.gd-title-wrap { display:flex; align-items:center; gap:.75rem; }
.gd-title { font-family:var(--fh); font-size:1.1rem; color:var(--gold); letter-spacing:.12em; }
.gd-orn   { color:var(--gold); opacity:.4; font-size:12px; }
.gd-close {
  background:transparent; border:1px solid var(--bord); color:var(--cream2);
  width:30px; height:30px; border-radius:50%; cursor:pointer; font-size:14px;
  display:flex; align-items:center; justify-content:center; transition:all .2s;
}
.gd-close:hover { border-color:var(--gold); color:var(--gold); }
.gd-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(155px,1fr)); gap:1.5rem; }

</style>
