import { ref, computed } from 'vue'
import { CHAPTERS } from '@/data/chapters.js'

const isOpen   = ref(false)
const title    = ref('')
const author   = ref('')
const pages    = ref([])
const curPage  = ref(0)
const fontSize = ref('md')
const nightMode = ref(false)
// Текущая книга целиком (нужна для кнопок статуса в ридере). Может быть null,
// если книгу открыли без объекта (например, через TXT-файл).
const currentBook = ref(null)

export function useReader() {
  const totalPages = computed(() => pages.value.length)
  const progress   = computed(() => totalPages.value ? ((curPage.value + 1) / totalPages.value * 100) : 0)

  function open(bookTitle, bookAuthor, chIdx = 0, book = null) {
    title.value   = bookTitle
    author.value  = bookAuthor
    pages.value   = CHAPTERS[chIdx] || CHAPTERS[0]
    curPage.value = 0
    currentBook.value = book
    isOpen.value  = true
    document.body.style.overflow = 'hidden'
  }

  function close() {
    isOpen.value = false
    currentBook.value = null
    document.body.style.overflow = ''
  }

  function nextPage() { if (curPage.value < totalPages.value - 1) curPage.value++ }
  function prevPage() { if (curPage.value > 0) curPage.value-- }
  function goToPage(n) { curPage.value = Math.max(0, Math.min(totalPages.value - 1, n)) }

  function loadFromFile(text, name) {
    const paras = text.split(/\n\s*\n/).filter(p => p.trim().length > 20)
    const chunks = []
    let chunk = ''
    paras.forEach(p => {
      const line = '<p>' + p.replace(/\n/g, ' ').trim() + '</p>'
      if ((chunk + line).length > 1600 && chunk) { chunks.push(chunk); chunk = line }
      else chunk += line
    })
    if (chunk) chunks.push(chunk)
    title.value  = name
    author.value = ''
    pages.value  = chunks
    curPage.value = 0
    currentBook.value = null
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  return {
    isOpen, title, author, pages, curPage, fontSize, nightMode, currentBook,
    totalPages, progress,
    open, close, nextPage, prevPage, goToPage, loadFromFile
  }
}
