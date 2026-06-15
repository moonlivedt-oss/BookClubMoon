<template>
  <header :class="{ scrolled, 'search-open': searchOpen }">
    <!-- ── Прогресс-бар чтения страницы (золотая линия внизу) ── -->
    <div class="head-progress">
      <div class="head-progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- ── Логотип ─────────────────────────────────────────── -->
    <div class="logo-w" @click="goHome">
      <div class="logo-emb">
        <span class="logo-emb-letter">S</span>
      </div>
      <div class="logo-text">
        <span class="logo-nm">Страница</span>
        <span class="logo-sb">Книжный клуб</span>
      </div>
    </div>

    <!-- ── Навигация ────────────────────────────────────────── -->
    <nav>
      <a
        v-for="item in navItems" :key="item.sel"
        :class="{ active: route === 'home' && activeSection === item.id }"
        @click="goTo(item.sel)"
      >{{ item.label }}</a>
    </nav>

    <!-- ── Правая панель ─────────────────────────────────────── -->
    <div class="head-actions">
      <!-- Поиск книг -->
      <div class="head-search" :class="{ open: searchOpen }" v-click-outside="closeSearch">
        <button class="ico-btn" @click="toggleSearch" :title="searchOpen ? 'Закрыть' : 'Поиск книг'">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <input
          ref="searchInput"
          v-show="searchOpen"
          v-model="searchQuery"
          type="text"
          class="head-search-in"
          placeholder="Найти книгу или автора…"
          @keydown.esc="closeSearch"
          @keydown.enter="onSearchEnter"
        />
        <!-- Результаты -->
        <div v-if="searchOpen && searchQuery.trim()" class="head-search-drop">
          <div v-if="searchResults.length === 0" class="hsd-empty">
            Ничего не найдено по «{{ searchQuery }}»
          </div>
          <button
            v-for="b in searchResults" :key="b.isbn + b.t"
            class="hsd-item"
            @click="onResultClick(b)"
          >
            <div class="hsd-cover" :style="{ background: b.c }"></div>
            <div class="hsd-info">
              <div class="hsd-title" v-html="highlight(b.t)"></div>
              <div class="hsd-author" v-html="highlight(b.a)"></div>
            </div>
            <span class="hsd-genre">{{ genreLabel(b.g) }}</span>
          </button>
        </div>
      </div>

      <!-- Переключатель темы -->
      <button class="ico-btn theme-btn" @click="toggleTheme" :title="`Тема: ${themeLabel}`">
        <span class="theme-icon">{{ themeIcon }}</span>
      </button>

      <!-- Не авторизован -->
      <template v-if="!isAuthed">
        <a class="auth-link" @click="openModal('login')">Войти</a>
        <button class="nav-btn" @click="openModal('register')">Регистрация</button>
      </template>

      <!-- Авторизован -->
      <template v-else>
        <button
          class="nav-user"
          @click="navigate('profile')"
          @contextmenu.prevent="openModal('profile')"
          :title="`${user.email} · ПКМ — быстрый просмотр`"
        >
          <span class="nav-user-av" :style="avatarStyle">
            <span v-if="!avatarUrl">{{ initials }}</span>
          </span>
          <span class="nav-user-nm">{{ user.full_name || user.username }}</span>
        </button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useI18n } from '../composables/useI18n.js'
import { BOOKS, GNLABELS } from '@/data/books.js'

const { user, isAuthed, openModal, navigate, avatarSrc, route } = useAuth()
const { theme, setTheme } = useI18n()

// ── Состояние ──────────────────────────────────────────────────
const scrolled       = ref(false)
const progress       = ref(0)
const activeSection  = ref('home')
const searchOpen     = ref(false)
const searchQuery    = ref('')
const searchInput    = ref(null)

// ── Навигация ──────────────────────────────────────────────────
const navItems = [
  { sel: '#catalog',   id: 'catalog',   label: 'Каталог' },
  { sel: '#genres',    id: 'genres',    label: 'Жанры' },
  { sel: '#map-sec',   id: 'map-sec',   label: 'Карта' },
  { sel: '#challenge', id: 'challenge', label: 'Марафон' },
  { sel: '#meetings',  id: 'meetings',  label: 'Встречи' },
]

function goHome() {
  if (route.value !== 'home') navigate('home')
  else document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })
}

function goTo(sel) {
  if (route.value !== 'home') {
    navigate('home')
    setTimeout(() => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' }), 200)
  } else {
    document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' })
  }
}

// ── Скролл: scrolled + прогресс ────────────────────────────────
function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 60
  const docH = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docH > 0 ? Math.min(100, (y / docH) * 100) : 0
}

// ── Активный раздел через IntersectionObserver ─────────────────
let io = null
function setupSectionObserver() {
  if (io) io.disconnect()
  const ids = ['home', ...navItems.map(i => i.id)]
  const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
  if (!elements.length) return

  io = new IntersectionObserver((entries) => {
    // Берём все видимые секции, выбираем самую близкую к верху
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) activeSection.value = visible[0].target.id
  }, { rootMargin: '-80px 0px -55% 0px', threshold: 0 })

  elements.forEach(el => io.observe(el))
}

// При смене маршрута — переустанавливаем observer (главная пере-рендерилась)
watch(() => route.value, async (v) => {
  if (v === 'home') {
    await nextTick()
    setTimeout(setupSectionObserver, 100)
  }
})

// ── Поиск книг ─────────────────────────────────────────────────
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return BOOKS.filter(b =>
    b.t.toLowerCase().includes(q) || b.a.toLowerCase().includes(q)
  ).slice(0, 6)
})

function genreLabel(g) { return GNLABELS[g] || g }

function highlight(text) {
  const q = searchQuery.value.trim()
  if (!q) return text
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
  return text.replace(re, '<mark>$1</mark>')
}

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    searchQuery.value = ''
  }
}
function closeSearch() {
  searchOpen.value = false
  searchQuery.value = ''
}
function onResultClick(b) {
  closeSearch()
  if (route.value !== 'home') {
    navigate('home')
    setTimeout(() => scrollToBookCard(b), 250)
  } else {
    scrollToBookCard(b)
  }
}
function onSearchEnter() {
  if (searchResults.value.length > 0) onResultClick(searchResults.value[0])
}
function scrollToBookCard(b) {
  // Прокрутить к каталогу и подсветить (не строго — лучше чем ничего)
  document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' })
}

// ── Переключатель темы (циклически dark→light→auto→dark) ───────
const themeOrder = ['dark', 'light', 'auto']
function toggleTheme() {
  const i = themeOrder.indexOf(theme.value)
  setTheme(themeOrder[(i + 1) % themeOrder.length])
}
const themeIcon = computed(() => ({
  dark: '🌙', light: '☀️', auto: '⚙',
}[theme.value] || '⚙'))
const themeLabel = computed(() => ({
  dark: 'Тёмная', light: 'Светлая', auto: 'Авто',
}[theme.value] || 'Авто'))

// ── Аватар авторизованного пользователя ─────────────────────────
const initials = computed(() => {
  if (!user.value) return ''
  return (user.value.full_name || user.value.username || '?').trim().slice(0, 1).toUpperCase()
})
const avatarUrl   = computed(() => avatarSrc(user.value))
const avatarStyle = computed(() => avatarUrl.value
  ? { backgroundImage: `url(${avatarUrl.value})` } : {})

// ── v-click-outside директива (локально) ───────────────────────
const vClickOutside = {
  mounted(el, binding) {
    el._handler = (e) => { if (!el.contains(e.target)) binding.value() }
    document.addEventListener('mousedown', el._handler)
  },
  unmounted(el) { document.removeEventListener('mousedown', el._handler) },
}

// ── Lifecycle ──────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  setTimeout(setupSectionObserver, 200)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  io?.disconnect()
})
</script>

<style scoped>
/* ──────────────────────────────────────────────────────────────
   ШАПКА: стеклянная, с прогресс-баром, активным разделом, поиском
   ────────────────────────────────────────────────────────────── */
header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 0 2.2rem; height: 70px;
  display: flex; align-items: center; gap: 2rem;
  transition: background .45s ease, backdrop-filter .45s, border-color .45s, height .25s, box-shadow .35s;
}

/* По умолчанию — прозрачная (поверх hero) */
header::before {
  content: ''; position: absolute; inset: 0;
  background: transparent;
  transition: background .45s, backdrop-filter .45s;
  pointer-events: none;
  z-index: -1;
}

/* СКРОЛЛ — стеклянная двухслойная */
header.scrolled {
  height: 62px;
  border-bottom: 1px solid rgba(201, 168, 76, .15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, .35), 0 1px 0 rgba(201, 168, 76, .08) inset;
}
header.scrolled::before {
  background:
    linear-gradient(180deg, rgba(14, 11, 7, .65) 0%, rgba(14, 11, 7, .85) 100%);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
}
:global(html[data-theme="light"]) header.scrolled {
  border-bottom: 1px solid rgba(140, 110, 26, .25);
  box-shadow: 0 6px 28px rgba(140, 110, 26, .08);
}
:global(html[data-theme="light"]) header.scrolled::before {
  background: linear-gradient(180deg, rgba(248, 242, 228, .75) 0%, rgba(248, 242, 228, .92) 100%);
}

/* Прогресс-бар чтения */
.head-progress {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: transparent;
  pointer-events: none;
}
.head-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, var(--gold) 30%, var(--gold2) 70%, transparent 100%);
  box-shadow: 0 0 8px rgba(201, 168, 76, .6);
  transition: width .15s linear;
}

/* ── Логотип ─────────────────────────────────────────── */
.logo-w {
  display: flex; align-items: center; gap: 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform .3s;
}
.logo-w:hover { transform: translateX(2px); }

.logo-emb {
  width: 42px; height: 42px;
  border: 1.5px solid var(--gold);
  background: var(--gp);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  transition: border-color .3s, box-shadow .3s;
}
.logo-emb::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, transparent 30%, rgba(232, 201, 106, .25) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform .6s;
}
.logo-w:hover .logo-emb { box-shadow: 0 0 14px rgba(201, 168, 76, .35); }
.logo-w:hover .logo-emb::after { transform: translateX(100%); }
.logo-emb-letter {
  font-family: var(--fh); font-size: 19px; color: var(--gold);
  position: relative; z-index: 1;
}

.logo-text { display: flex; flex-direction: column; line-height: 1.05; }
.logo-nm {
  font-family: var(--fa); font-size: 1.15rem;
  letter-spacing: .15em; color: var(--cream);
  text-shadow: 0 1px 4px rgba(0, 0, 0, .5);
}
.logo-sb {
  font-size: 10px; letter-spacing: .25em;
  text-transform: uppercase; color: var(--gold);
  opacity: .85; margin-top: 1px;
}

:global(html[data-theme="light"]) .logo-nm { text-shadow: none; }

/* ── Навигация ────────────────────────────────────────── */
nav {
  display: flex; align-items: center; gap: 1.7rem;
  flex: 1; justify-content: center;
}
nav a {
  font-family: var(--fs); font-size: 13px; letter-spacing: .08em;
  color: var(--cream);
  opacity: .7;
  text-decoration: none; cursor: pointer;
  position: relative;
  padding: 4px 0;
  transition: color .25s, opacity .25s;
}
nav a::before {
  content: ''; position: absolute; left: 50%; bottom: -2px;
  width: 0; height: 1px; background: var(--gold);
  transition: width .35s ease, left .35s ease;
}
nav a:hover { color: var(--gold); opacity: 1; }
nav a:hover::before { width: 100%; left: 0; }

/* Активный раздел — золотая засветка */
nav a.active {
  color: var(--gold);
  opacity: 1;
}
nav a.active::before {
  width: 100%; left: 0;
  box-shadow: 0 0 8px var(--gold);
}

header:not(.scrolled) nav a {
  text-shadow: 0 1px 4px rgba(0, 0, 0, .55);
}
:global(html[data-theme="light"]) header:not(.scrolled) nav a {
  text-shadow: none; opacity: .85;
}

/* ── Правая панель ─────────────────────────────────────── */
.head-actions {
  display: flex; align-items: center; gap: 12px;
  flex-shrink: 0;
}

/* Иконочные кнопки (поиск, тема) */
.ico-btn {
  width: 38px; height: 38px;
  background: transparent;
  border: 1px solid var(--bord);
  border-radius: 50%;
  color: var(--cream);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all .25s;
  flex-shrink: 0;
}
.ico-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gp);
  transform: scale(1.05);
}
.theme-btn .theme-icon {
  font-size: 16px;
  display: inline-block;
  transition: transform .4s ease;
}
.theme-btn:hover .theme-icon { transform: rotate(20deg) scale(1.1); }

/* ── Поиск ─────────────────────────────────────────────── */
.head-search {
  position: relative;
  width: 38px;
  flex-shrink: 0;
  transition: width .35s ease;
}
.head-search.open { width: 280px; }
.head-search .ico-btn {
  position: relative;
  z-index: 2;
}
.head-search.open .ico-btn {
  position: absolute;
  right: 3px; top: 50%; transform: translateY(-50%);
  width: 32px; height: 32px;
  border: none; background: transparent;
}
.head-search.open .ico-btn:hover {
  transform: translateY(-50%) scale(1.05);
}

.head-search-in {
  width: 100%;
  background: var(--bg2);
  border: 1px solid var(--gb);
  border-radius: 30px;
  padding: 9px 40px 9px 18px;
  color: var(--cream);
  font-family: var(--fs); font-size: 13px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.head-search-in:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gp);
}

/* Выпадающий список результатов */
.head-search-drop {
  position: absolute;
  top: calc(100% + 8px); right: 0;
  width: 360px;
  background: var(--bg1);
  border: 1px solid var(--gb);
  border-radius: 6px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .55);
  overflow: hidden;
  max-height: 70vh; overflow-y: auto;
  animation: hsd-in .25s ease;
}
@keyframes hsd-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
:global(html[data-theme="light"]) .head-search-drop {
  box-shadow: 0 24px 60px rgba(140, 110, 26, .15);
}
.hsd-empty {
  padding: 1.5rem;
  text-align: center;
  font-family: var(--fb); font-style: italic;
  color: var(--cream2); font-size: 14px;
}
.hsd-item {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  background: transparent;
  border: none; border-bottom: 1px solid var(--bord);
  text-align: left;
  cursor: pointer;
  transition: background .15s;
}
.hsd-item:last-child { border-bottom: none; }
.hsd-item:hover { background: var(--gp); }
.hsd-cover {
  width: 36px; height: 52px;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .4);
}
.hsd-info { flex: 1; min-width: 0; }
.hsd-title {
  font-family: var(--fh); font-size: 13px;
  color: var(--cream); line-height: 1.3;
  margin-bottom: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hsd-author {
  font-family: var(--fb); font-style: italic;
  font-size: 12px; color: var(--gold);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.hsd-genre {
  font-family: var(--fa); font-size: 9px;
  letter-spacing: .15em; text-transform: uppercase;
  color: var(--cream2);
  background: var(--gp); padding: 3px 8px; border-radius: 30px;
  flex-shrink: 0;
}
:deep(.hsd-title mark),
:deep(.hsd-author mark) {
  background: var(--gold); color: var(--bg0);
  padding: 0 2px; border-radius: 2px;
}

/* ── Кнопки авторизации ────────────────────────────────── */
.auth-link {
  font-family: var(--fs); font-size: 13px; letter-spacing: .08em;
  color: var(--cream); cursor: pointer;
  transition: color .2s;
}
.auth-link:hover { color: var(--gold); }

.nav-btn {
  background: transparent;
  border: 1px solid var(--gb);
  color: var(--gold);
  padding: 8px 18px; border-radius: 2px;
  font-family: var(--fs); font-size: 13px; letter-spacing: .08em;
  cursor: pointer; transition: all .2s;
  white-space: nowrap;
}
.nav-btn:hover {
  background: var(--gp);
  border-color: var(--gold);
  box-shadow: 0 0 12px rgba(201, 168, 76, .25);
}

.nav-user {
  display: flex; align-items: center; gap: 10px;
  background: transparent;
  border: 1px solid var(--gb);
  color: var(--cream);
  padding: 4px 14px 4px 4px;
  border-radius: 30px;
  font-family: var(--fs); font-size: 13px;
  cursor: pointer; transition: all .25s;
}
.nav-user:hover {
  background: var(--gp);
  border-color: var(--gold);
  box-shadow: 0 0 12px rgba(201, 168, 76, .2);
}
.nav-user-av {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--gp) center/cover no-repeat;
  border: 1px solid var(--gold);
  color: var(--gold);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--fh); font-size: 13px;
  flex-shrink: 0;
}
.nav-user-nm {
  max-width: 110px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Адаптив ───────────────────────────────────────────── */
@media (max-width: 1100px) {
  .head-search.open { width: 220px; }
  .head-search-drop { width: 320px; }
}
@media (max-width: 900px) {
  header { padding: 0 1.2rem; gap: 1rem; }
  nav { gap: 1rem; }
  nav > a:not(.auth-link) { display: none; }
  .logo-text { display: none; }
  .head-search.open { width: 180px; }
  .head-search-drop {
    position: fixed; top: 80px; right: 1rem; left: 1rem;
    width: auto;
  }
  .nav-user-nm { display: none; }
  .nav-user { padding: 4px; }
}
</style>
