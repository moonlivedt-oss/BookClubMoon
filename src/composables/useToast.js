import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

const ICONS = { success: '✓', error: '✕', info: '📚', shelf: '📖', warn: '⚠' }

export function useToast() {
  function add(msg, type = 'info', duration = 3200) {
    const id = ++nextId
    toasts.value.push({ id, msg, type, icon: ICONS[type] ?? '•' })
    setTimeout(() => remove(id), duration)
  }
  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  return { toasts, add, remove }
}
