import { ref, computed } from 'vue'

const shelf = ref([])

export function useShelf() {
  const count = computed(() => shelf.value.length)

  function addBook(book) {
    if (!shelf.value.find(b => b.t === book.t)) shelf.value.push(book)
  }

  function decl(n) {
    const m = n % 10, h = n % 100
    if (m === 1 && h !== 11) return 'книга'
    if (m >= 2 && m <= 4 && (h < 10 || h >= 20)) return 'книги'
    return 'книг'
  }

  return { shelf, count, addBook, decl }
}
