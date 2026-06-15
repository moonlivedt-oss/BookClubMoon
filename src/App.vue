<template>
  <!-- Loader -->
  <div id="loader" :class="{ done: loaderDone }">
    <div class="ld-title">Библиотека «Страница»</div>
    <div class="ld-book">
      <div class="ld-cover"></div>
      <div class="ld-pg"></div><div class="ld-pg"></div><div class="ld-pg"></div>
    </div>
    <div class="ld-bar"><div class="ld-fill" :style="{ width: loadPct + '%' }"></div></div>
    <div class="ld-pct">{{ Math.floor(loadPct) }}%</div>
  </div>

  <!-- Custom cursor -->
  <div id="cursor"></div>
  <div id="cursor-dot"></div>

  <!-- Particles (full-screen fixed canvas) -->
  <ParticleCanvas />

  <!-- UI controls -->
  <button id="cursor-switcher" @click="cycleCursor">
    <span>{{ cursorMode.ico }}</span>{{ cursorMode.label }}
  </button>

  <!-- Shelf badge (показываем только на главной) -->
  <div
    v-if="route === 'home'"
    id="shelf-badge"
    :class="{ show: shelf.length > 0 }"
    @click="showShelf"
  >
    📚 Моя полка
    <span class="shelf-cnt">{{ shelf.length }}</span>
  </div>

  <!-- Шапка — на всех страницах -->
  <AppHeader />

  <!-- ── Маршрутизация ─────────────────────────────────── -->
  <ProfilePage v-if="route === 'profile'" />

  <!-- Главная -->
  <template v-else>
    <HeroSection @open-reader="openReader" />
    <FeaturesStrip />
    <CatalogSection @open-reader="openReader" />
    <StatsSection />
    <GenreExplorer @open-reader="openReader" />
    <MapSection />
    <ReadingChallenge />
    <TestimonialsSection />
    <MeetingsSection />
    <Models3DSection />
    <QuoteStrip />
    <AppFooter />
  </template>

  <!-- Reader modal (teleported to body) -->
  <ReaderModal />

  <!-- Auth modals (login / register / profile) -->
  <AuthModals />
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

import AppHeader          from './components/AppHeader.vue'
import HeroSection        from './components/HeroSection.vue'
import FeaturesStrip      from './components/FeaturesStrip.vue'
import CatalogSection     from './components/CatalogSection.vue'
import StatsSection       from './components/StatsSection.vue'
import GenreExplorer      from './components/GenreExplorer.vue'
import MapSection         from './components/MapSection.vue'
import ReadingChallenge   from './components/ReadingChallenge.vue'
import TestimonialsSection from './components/TestimonialsSection.vue'
import MeetingsSection    from './components/MeetingsSection.vue'
import Models3DSection    from './components/Models3DSection.vue'
import QuoteStrip         from './components/QuoteStrip.vue'
import AppFooter          from './components/AppFooter.vue'
import ParticleCanvas     from './components/ParticleCanvas.vue'
import ReaderModal        from './components/ReaderModal.vue'
import AuthModals         from './components/AuthModals.vue'
import ProfilePage        from './components/ProfilePage.vue'

import { useReader }  from './composables/useReader.js'
import { useShelf }   from './composables/useShelf.js'
import { useCursor, useCursorFollow } from './composables/useCursor.js'
import { useAuth }    from './composables/useAuth.js'

const { open: openReader } = useReader()
const { shelf }            = useShelf()
const { cursorMode, cycle: cycleCursor } = useCursor()
const { fetchMe, route }   = useAuth()
useCursorFollow()

function showShelf() {
  const n = shelf.value.length
  const f = ['книга','книги','книг']
  const m = n % 10, h = n % 100
  const w = (m===1&&h!==11)?f[0]:(m>=2&&m<=4&&(h<10||h>=20))?f[1]:f[2]
  alert(`На вашей полке ${n} ${w}!\n\nПродолжайте читать 📚`)
}

// ── Loader ──────────────────────────────────────────────────
const loadPct   = ref(0)
const loaderDone = ref(false)

// Перевешиваем reveal-наблюдатель и hover-эффекты на новые элементы
// при смене маршрута (пришли на профиль, ушли с профиля).
function attachInteractions() {
  const ro = new IntersectionObserver(
    es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('show') }),
    { threshold: 0.08 }
  )
  document.querySelectorAll('.rev').forEach(el => ro.observe(el))

  document.querySelectorAll('a,button,.bcard,.genre-card,.feat,.testi-card,.mtg-card,.ub-card,.tab,.meta-pill').forEach(el => {
    if (el._cursorBound) return
    el._cursorBound = true
    el.addEventListener('mouseenter', () => { const c = document.getElementById('cursor'); if(c) c.style.width = c.style.height = '28px' })
    el.addEventListener('mouseleave', () => { const c = document.getElementById('cursor'); if(c) { c.style.width = '14px'; c.style.height = '14px' } })
  })
}

watch(route, () => { nextTick(attachInteractions) })

onMounted(() => {
  fetchMe()

  const id = setInterval(() => {
    loadPct.value += Math.random() * 15
    if (loadPct.value >= 100) {
      loadPct.value = 100
      clearInterval(id)
      setTimeout(() => { loaderDone.value = true }, 400)
    }
  }, 80)

  setTimeout(attachInteractions, 200)
})
</script>

<style scoped>
#shelf-badge { display:none; }
#shelf-badge.show { display:flex; }
</style>
