<template>
  <section id="catalog">
    <div class="sec-in">
      <div class="catalog-head rev">
        <div>
          <span class="sec-lb">Каталог</span>
          <h2 class="sec-h">Наша <em>коллекция</em></h2>
          <div class="sec-div"></div>
        </div>
        <div class="src-mode">
          <button :class="{ on: mode === 'local' }" @click="switchToLocal">Наш каталог</button>
          <button :class="{ on: mode === 'ol' }"    @click="switchToOL">🌍 Весь мир</button>
        </div>
      </div>

      <div class="cat-top rev">
        <div class="search-w">
          <input v-model="query" @input="onSearch"
            :placeholder="mode === 'local' ? 'Поиск книги или автора...' : 'Поиск в Open Library...'" />
        </div>
        <div class="pills" v-if="mode === 'local'">
          <button class="pill" v-for="g in GENRES" :key="g.k"
            :class="{ on: genre === g.k }" @click="setGenre(g.k)">{{ g.l }}</button>
        </div>
      </div>

      <div class="books-grid">
        <!-- Loading -->
        <div class="ol-loading" v-if="loading">🔍 Ищем в Open Library…</div>

        <!-- Empty states -->
        <template v-else-if="!displayBooks.length">
          <div class="ol-empty" v-if="mode === 'ol' && !query">
            Введите название для поиска по Open Library.
          </div>
          <div class="ol-empty" v-else-if="mode === 'ol' && query">
            Ничего не найдено. Попробуйте другой запрос.
          </div>
          <div class="ol-empty" v-else>
            По вашему запросу ничего не найдено.
          </div>
        </template>

        <!-- Cards — NO rev class, appear instantly -->
        <template v-else>
          <div class="bcard" v-for="b in displayBooks" :key="b.t + b.a + b.isbn">
            <div class="bcard-in">
              <div class="bf">
                <div class="bf-cover" :style="{ background: b.c }">
                  <img :src="`https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`"
                    :alt="b.t" loading="lazy"
                    @load="e => e.target.nextElementSibling.style.opacity = 0"
                    @error="e => e.target.style.display = 'none'" />
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
                  <button class="bb-read" @click.stop="onReadClick(b)">Читать</button>
                </div>
              </div>
            </div>

            <!-- Кнопки статуса — ВНЕ .bcard-in, не зависят от флипа -->
            <div class="bcard-actions" v-if="b.isbn">
              <button
                class="bcard-act"
                :class="{ on: isBookIn(b.isbn, 'favorite') }"
                @click.stop="toggleBook(b, 'favorite')"
                :title="isBookIn(b.isbn, 'favorite') ? 'Убрать из избранного' : 'В избранное'"
              >❤</button>
              <button
                class="bcard-act"
                :class="{ on: isBookIn(b.isbn, 'read') }"
                @click.stop="toggleBook(b, 'read')"
                :title="isBookIn(b.isbn, 'read') ? 'Убрать из прочитанного' : 'Прочитано'"
              >✓</button>
              <button
                class="bcard-act"
                :class="{ on: isBookIn(b.isbn, 'want') }"
                @click.stop="toggleBook(b, 'want')"
                :title="isBookIn(b.isbn, 'want') ? 'Убрать из планов' : 'Хочу прочитать'"
              >★</button>
            </div>

            <div class="bcard-meta">
              <div class="bcard-nm">{{ b.t }}</div>
              <div class="bcard-at">{{ b.a }}</div>
            </div>
          </div>
        </template>
      </div>

      <!-- OL Pagination — show only when there are results -->
      <div class="ol-pages" v-if="mode === 'ol' && totalPages > 1 && !loading && olResults.length">
        <button class="ol-pg-btn" @click="goPage(olPage - 1)" :disabled="olPage <= 1">←</button>
        <template v-for="p in pageRange" :key="p">
          <span class="ol-pg-info" v-if="p === '…'">…</span>
          <button class="ol-pg-btn" v-else :class="{ on: p === olPage }" @click="goPage(p)">{{ p }}</button>
        </template>
        <button class="ol-pg-btn" @click="goPage(olPage + 1)" :disabled="olPage >= totalPages">→</button>
        <span class="ol-pg-info">{{ olTotal.toLocaleString('ru') }} книг</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { BOOKS, GENRES } from '@/data/books.js'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['open-reader'])

const { isAuthed, isBookIn, addBook, removeBook, openModal } = useAuth()

async function toggleBook(b, status) {
  if (!isAuthed.value) { openModal('login'); return }
  if (isBookIn(b.isbn, status)) {
    await removeBook(b.isbn, status)
  } else {
    await addBook(b, status)
  }
}

function onReadClick(b) {
  // Передаём всю книгу — ридер использует объект, чтобы показать кнопки статуса
  emit('open-reader', b.t, b.a, b.ch || 0, b)
}

const mode      = ref('local')
const genre     = ref('all')
const query     = ref('')
const loading   = ref(false)
const olResults = ref([])
const olPage    = ref(1)
const olTotal   = ref(0)
let   timer     = null

// ── Computed ────────────────────────────────────────────────────────────────
const displayBooks = computed(() => {
  if (mode.value === 'ol') return olResults.value
  const q = query.value.toLowerCase().trim()
  return BOOKS.filter(b =>
    (genre.value === 'all' || b.g === genre.value) &&
    (!q || b.t.toLowerCase().includes(q) || b.a.toLowerCase().includes(q))
  )
})

const totalPages = computed(() => Math.min(Math.ceil(olTotal.value / 12), 50))

const pageRange = computed(() => {
  const tp = totalPages.value, cp = olPage.value, r = []
  const add = p => { if (p >= 1 && p <= tp && !r.includes(p)) r.push(p) }
  add(1)
  if (cp - 2 > 2) r.push('…')
  for (let p = Math.max(2, cp - 1); p <= Math.min(tp - 1, cp + 1); p++) add(p)
  if (cp + 2 < tp - 1) r.push('…')
  if (tp > 1) add(tp)
  return r
})

// ── Methods ─────────────────────────────────────────────────────────────────
function setGenre(g) {
  genre.value = g
  // query stays intact — genre change just re-filters instantly via computed
}

function switchToLocal() {
  mode.value  = 'local'
  olResults.value = []
  olTotal.value   = 0
}

function switchToOL() {
  mode.value = 'ol'
  if (query.value.trim()) {
    olPage.value = 1
    fetchOL()
  }
}

function onSearch() {
  if (mode.value === 'local') return   // local: computed handles it instantly
  clearTimeout(timer)
  timer = setTimeout(() => { olPage.value = 1; fetchOL() }, 450)
}

async function fetchOL() {
  const q = query.value.trim()
  if (!q) {
    olResults.value = []
    olTotal.value   = 0
    return
  }
  loading.value = true
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12&page=${olPage.value}`
    )
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const d = await res.json()
    olTotal.value   = d.num_found || 0
    olResults.value = (d.docs || []).slice(0, 12).map(doc => ({
      t:    doc.title || 'Без названия',
      a:    (doc.author_name || ['Автор неизвестен'])[0],
      g:    'modern',
      r:    doc.ratings_average ? (+doc.ratings_average).toFixed(1) : '—',
      isbn: (doc.isbn || [''])[0] || '',
      c:    'linear-gradient(150deg,#1C2A3A,#0A1420)',
      desc: [
        doc.first_publish_year ? 'Год: ' + doc.first_publish_year : '',
        doc.number_of_pages_median ? doc.number_of_pages_median + ' стр.' : '',
      ].filter(Boolean).join(' · '),
      ch: 0,
    }))
  } catch (e) {
    console.error('OL fetch error:', e)
    olResults.value = []
    olTotal.value   = 0
  } finally {
    loading.value = false
  }
}

function goPage(p) {
  if (p < 1 || p > totalPages.value) return
  olPage.value = p
  fetchOL()
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
section { padding:5rem 2.5rem; background:var(--bg1); }
.catalog-head { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:3rem; }

/* Плавное появление карточек без rev-класса */
.bcard {
  animation: cardIn .35s ease both;
}
@keyframes cardIn {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:none; }
}

/* Кнопки статуса книги — закреплены НА .bcard (вне .bcard-in, который флипается).
   Они всегда видны и кликабельны независимо от того, какая сторона показана. */
.bcard {
  position: relative; /* нужно для absolute-позиционирования .bcard-actions */
}
.bcard-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity .25s ease, transform .25s ease;
  pointer-events: none;
}
/* Показываем при hover на саму карточку и при фокусе на любую кнопку */
.bcard:hover .bcard-actions,
.bcard:focus-within .bcard-actions {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
/* Если книга уже в каком-то статусе — кнопки видны всегда */
.bcard:has(.bcard-act.on) .bcard-actions {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
.bcard-act {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(20, 15, 8, .85);
  border: 1px solid rgba(201, 168, 76, .35);
  color: var(--cream);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background .15s, color .15s, border-color .15s, transform .15s;
  backdrop-filter: blur(4px);
}
.bcard-act:hover {
  background: rgba(201, 168, 76, .25);
  color: var(--gold);
  border-color: var(--gold);
  transform: scale(1.08);
}
.bcard-act.on {
  background: var(--gold);
  color: var(--bg0);
  border-color: var(--gold);
}
</style>
