<template>
  <teleport to="body">
    <transition name="modal">
      <div class="reader-overlay" v-if="isOpen" @click.self="close">
        <div class="reader-wrap" :class="{ night: nightMode }">

          <!-- Top bar -->
          <div class="rdr-bar">
            <span class="rdr-title">{{ title }}<template v-if="author"> · {{ author }}</template></span>
            <div class="rdr-ctrls">
              <!-- Кнопки статуса книги — показываются, только если есть объект книги с isbn -->
              <template v-if="currentBook && currentBook.isbn">
                <button
                  class="rc rc-stat"
                  :class="{ on: isBookIn(currentBook.isbn, 'favorite') }"
                  @click="toggleBook('favorite')"
                  :title="isBookIn(currentBook.isbn, 'favorite') ? 'Убрать из избранного' : 'В избранное'"
                >❤</button>
                <button
                  class="rc rc-stat"
                  :class="{ on: isBookIn(currentBook.isbn, 'read') }"
                  @click="toggleBook('read')"
                  :title="isBookIn(currentBook.isbn, 'read') ? 'Убрать из прочитанного' : 'Прочитано'"
                >✓</button>
                <button
                  class="rc rc-stat"
                  :class="{ on: isBookIn(currentBook.isbn, 'want') }"
                  @click="toggleBook('want')"
                  :title="isBookIn(currentBook.isbn, 'want') ? 'Убрать из планов' : 'Хочу прочитать'"
                >★</button>
                <span class="rc-sep"></span>
              </template>
              <button class="rc" :class="{ on: fontSize === 'sm' }" @click="fontSize = 'sm'">А–</button>
              <button class="rc" :class="{ on: fontSize === 'md' }" @click="fontSize = 'md'">А</button>
              <button class="rc" :class="{ on: fontSize === 'lg' }" @click="fontSize = 'lg'">А+</button>
              <button class="rc" @click="nightMode = !nightMode">{{ nightMode ? '☀️ День' : '🌙 Ночь' }}</button>
              <button class="rc" @click="showDrop = !showDrop" title="Загрузить TXT-книгу">📂 Файл</button>
              <button class="rdr-close" @click="close">✕</button>
            </div>
          </div>

          <!-- Progress bar + dots -->
          <div class="rdr-prog-wrap">
            <div class="rdr-prog"><div class="rdr-prog-fill" :style="{ width: progress + '%' }"></div></div>
            <div class="rdr-dots">
              <div class="rdot" v-for="(_, i) in pages" :key="i"
                :class="{ act: i === curPage }" @click="curPage = i"></div>
            </div>
          </div>

          <!-- File drop zone -->
          <div class="reader-drop" v-if="showDrop"
            @click="$refs.fileIn.click()"
            @dragover.prevent="dropActive = true"
            @dragleave="dropActive = false"
            @drop.prevent="onFileDrop"
            :class="{ dragover: dropActive }">
            <div class="rd-icon">📄</div>
            <div class="rd-text">Перетащите TXT-файл или нажмите</div>
            <div class="rd-hint">Скачайте книгу на gutenberg.org → .txt → сюда</div>
            <button class="rd-btn" @click.stop="$refs.fileIn.click()">Выбрать файл</button>
            <input ref="fileIn" type="file" accept=".txt,.text" style="display:none" @change="onFileChange" />
          </div>

          <!-- Pages -->
          <div class="rdr-pages" v-if="!showDrop">
            <div class="rdr-page">
              <div class="rdr-text" :class="fontSize" v-html="leftPage"></div>
              <span class="rdr-pn left">{{ curPage * 2 + 1 }}</span>
            </div>
            <div class="rdr-page">
              <div class="rdr-text" :class="fontSize" v-html="rightPage"></div>
              <span class="rdr-pn right">{{ curPage * 2 + 2 }}</span>
            </div>
          </div>

          <!-- Navigation -->
          <div class="rdr-nav">
            <button class="rnv" @click="curPage--" :disabled="curPage <= 0">← Назад</button>
            <span class="rdr-info">Страница {{ curPage + 1 }} из {{ pages.length }}</span>
            <button class="rnv" @click="curPage++" :disabled="curPage >= pages.length - 1">Далее →</button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useReader } from '@/composables/useReader.js'
import { useAuth } from '@/composables/useAuth.js'

const { isOpen, title, author, pages, curPage, currentBook, close } = useReader()
const { isAuthed, isBookIn, addBook, removeBook, openModal } = useAuth()

async function toggleBook(status) {
  const b = currentBook.value
  if (!b || !b.isbn) return
  if (!isAuthed.value) { openModal('login'); return }
  if (isBookIn(b.isbn, status)) {
    await removeBook(b.isbn, status)
  } else {
    await addBook(b, status)
  }
}

const fontSize  = ref('md')
const nightMode = ref(false)
const showDrop  = ref(false)
const dropActive = ref(false)

const progress = computed(() =>
  pages.value.length ? ((curPage.value + 1) / pages.value.length * 100) : 0
)

function splitPage(pg) {
  const mid = pg.lastIndexOf('</p>', Math.ceil(pg.length / 2))
  if (mid > 0) return [pg.substring(0, mid + 4), pg.substring(mid + 4)]
  return [pg, '']
}

const leftPage  = computed(() => splitPage(pages.value[curPage.value] || '')[0])
const rightPage = computed(() => {
  const r = splitPage(pages.value[curPage.value] || '')[1]
  return r || '<p style="opacity:.25;text-align:center;padding-top:5rem;font-style:italic;font-size:1.2rem;">— ✦ —</p>'
})

function onKeydown(e) {
  if (!isOpen.value) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { if (curPage.value < pages.value.length - 1) curPage.value++ }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { if (curPage.value > 0) curPage.value-- }
  if (e.key === 'Escape') close()
}

function onFileChange(e) { loadTxt(e.target.files[0]) }
function onFileDrop(e)   { dropActive.value = false; loadTxt(e.dataTransfer.files[0]) }

function loadTxt(file) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    let text = ev.target.result
    const s = text.indexOf('*** START OF'); const end = text.indexOf('*** END OF')
    if (s > -1) text = text.substring(text.indexOf('\n', s) + 1)
    if (end > -1) text = text.substring(0, end)
    const paras = text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 20)
    const chunks = []
    let chunk = ''
    paras.forEach(p => {
      const line = '<p>' + p.replace(/\n/g, ' ').trim() + '</p>'
      if ((chunk + line).length > 1600 && chunk) { chunks.push(chunk); chunk = line }
      else chunk += line
    })
    if (chunk) chunks.push(chunk)
    pages.value  = chunks
    title.value  = file.name.replace(/\.[^.]+$/, '')
    author.value = ''
    curPage.value = 0
    showDrop.value = false
  }
  reader.readAsText(file, 'utf-8')
}

onMounted(()  => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.reader-overlay { position:fixed; inset:0; z-index:5000; background:rgba(0,0,0,.92); display:flex; align-items:center; justify-content:center; padding:2rem; backdrop-filter:blur(6px); }
.reader-wrap { background:var(--bg1); border:1px solid var(--gb); border-radius:6px; width:100%; max-width:1000px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; }
.reader-wrap.night { background:#070504; }
.reader-wrap.night .rdr-text { color:#C8B89A; }
.rdr-bar { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem; border-bottom:1px solid var(--bord); flex-shrink:0; gap:1rem; }
.rdr-title { font-family:var(--fh); font-size:13px; letter-spacing:.1em; color:var(--cream); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rdr-ctrls { display:flex; align-items:center; gap:.75rem; flex-shrink:0; }
.rc { background:transparent; border:1px solid var(--bord); color:var(--cream2); padding:5px 12px; border-radius:2px; font-size:12px; cursor:pointer; font-family:var(--fs); transition:all .2s; }
.rc:hover { border-color:var(--gold); color:var(--gold); }
.rc.on { background:var(--gp); border-color:var(--gold); color:var(--gold); }
/* Кнопки статуса (❤ ✓ ★) — иконочные, чуть компактнее */
.rc-stat { padding:5px 9px; min-width:32px; font-size:14px; line-height:1; }
.rc-stat.on { background:var(--gold); border-color:var(--gold); color:var(--bg0); }
.rc-stat.on:hover { color:var(--bg0); }
.rc-sep { display:inline-block; width:1px; height:20px; background:var(--bord); margin:0 .25rem; align-self:center; }
.rdr-close { background:transparent; border:none; color:var(--cream2); font-size:22px; cursor:pointer; }
.rdr-prog-wrap { display:flex; align-items:center; gap:.75rem; padding:.5rem 1.5rem; border-bottom:1px solid var(--bord); flex-shrink:0; }
.rdr-prog { flex:1; height:2px; background:var(--bg2); }
.rdr-prog-fill { height:100%; background:var(--gold); transition:width .5s cubic-bezier(.4,0,.2,1); }
.rdr-dots { display:flex; gap:5px; }
.rdot { width:6px; height:6px; border-radius:50%; background:var(--bord); cursor:pointer; transition:background .2s,transform .2s; }
.rdot.act { background:var(--gold); transform:scale(1.3); }
.rdr-pages { display:grid; grid-template-columns:1fr 1fr; flex:1; overflow:hidden; }
.rdr-page { padding:3rem; position:relative; }
.rdr-page:first-child { border-right:1px solid var(--bord); }
.rdr-text { font-family:var(--fb); line-height:1.95; color:var(--cream); }
.rdr-text.sm { font-size:14px; } .rdr-text.md { font-size:16px; } .rdr-text.lg { font-size:19px; }
:deep(.rdr-text p) { margin-bottom:1.2em; text-indent:2em; }
:deep(.rdr-text p:first-child) { text-indent:0; }
:deep(.rdr-text .dc::first-letter) { font-size:4em; float:left; line-height:.8; margin:4px 8px 0 0; color:var(--gold); font-family:var(--fh); }
.rdr-pn { position:absolute; bottom:1.25rem; font-family:var(--fs); font-size:12px; color:var(--cream2); opacity:.4; }
.rdr-pn.left { left:3rem; } .rdr-pn.right { right:3rem; }
.rdr-nav { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.5rem; border-top:1px solid var(--bord); flex-shrink:0; }
.rnv { background:transparent; border:1px solid var(--gb); color:var(--gold); padding:8px 22px; border-radius:2px; font-family:var(--fh); font-size:11px; letter-spacing:.12em; cursor:pointer; transition:all .2s; }
.rnv:hover { background:var(--gp); } .rnv:disabled { opacity:.25; cursor:default; }
.rdr-info { font-family:var(--fs); font-size:13px; color:var(--cream2); }
.reader-drop { position:absolute; inset:0 0 52px 0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.75rem; background:rgba(8,6,3,.92); z-index:10; cursor:pointer; border:2px dashed var(--gb); }
.reader-drop.dragover { border-color:var(--gold); background:rgba(201,168,76,.05); }
.rd-icon { font-size:3rem; opacity:.6; }
.rd-text { font-family:var(--fh); font-size:14px; letter-spacing:.1em; color:var(--cream2); }
.rd-hint { font-family:var(--fs); font-size:12px; color:var(--cream2); opacity:.5; }
.rd-btn  { padding:8px 20px; background:var(--gp); border:1px solid var(--gb); border-radius:2px; font-family:var(--fh); font-size:11px; letter-spacing:.1em; color:var(--gold); cursor:pointer; }
.modal-enter-active, .modal-leave-active { transition:all .35s ease; }
.modal-enter-from, .modal-leave-to { opacity:0; }
.modal-enter-from .reader-wrap, .modal-leave-to .reader-wrap { transform:scale(.94) translateY(20px); }
</style>
