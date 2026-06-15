import { ref, computed } from 'vue'
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost/bookclub/backend'

// ── Общее реактивное состояние (одно на всё приложение) ─────────
const user    = ref(null)
const loading = ref(false)
const error   = ref('')

const modal = ref(null)

const userBooks = ref({ favorite: [], read: [], want: [] })

const route = ref(parseRoute())

function parseRoute() {
  const h = window.location.hash || ''
  if (h.startsWith('#/')) return h.slice(2) || 'home'
  return 'home'
}

function navigate(routeName) {
  window.location.hash = routeName === 'home' ? '' : '/' + routeName
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => { route.value = parseRoute() })
}

const isAuthed = computed(() => user.value !== null)

function avatarSrc(u) {
  if (!u) return ''
  if (u.avatar_url)  return u.avatar_url
  if (u.avatar_path) return `${API_BASE}/${u.avatar_path}`
  return ''
}

// ── HTTP-обёртка ───────────────────────────────────────────────
async function api(path, body = null) {
  const opts = {
    method: body ? 'POST' : 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}/${path}`, opts)
  let data
  try { data = await res.json() } catch { data = { ok: false, error: 'Сервер вернул не-JSON' } }
  if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// ── Auth actions ───────────────────────────────────────────────
async function fetchMe() {
  try {
    const { user: u } = await api('me.php')
    user.value = u
    if (u) await fetchUserBooks()
  } catch {
    user.value = null
  }
}

async function register({ username, email, password }) {
  loading.value = true; error.value = ''
  try {
    const { user: u } = await api('register.php', { username, email, password })
    user.value = u
    modal.value = null
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

async function login({ login: l, password }) {
  loading.value = true; error.value = ''
  try {
    const { user: u } = await api('login.php', { login: l, password })
    user.value = u
    modal.value = null
    await fetchUserBooks()
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

async function logout() {
  try { await api('logout.php', {}) } catch {}
  user.value = null
  modal.value = null
  userBooks.value = { favorite: [], read: [], want: [] }
  if (route.value === 'profile') navigate('home')
}

async function updateProfile(payload) {
  loading.value = true; error.value = ''
  try {
    const { user: u } = await api('update_profile.php', payload)
    user.value = u
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

async function changePassword({ current_password, new_password }) {
  loading.value = true; error.value = ''
  try {
    await api('change_password.php', { current_password, new_password })
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

async function deleteAccount({ password, confirm_username }) {
  loading.value = true; error.value = ''
  try {
    await api('delete_account.php', { password, confirm_username })
    user.value = null
    userBooks.value = { favorite: [], read: [], want: [] }
    if (route.value === 'profile') navigate('home')
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

// ── Загрузка файла аватара ────────────────────────────────────
async function uploadAvatar(file) {
  loading.value = true; error.value = ''
  try {
    const fd = new FormData()
    fd.append('avatar', file)
    const res = await fetch(`${API_BASE}/upload_avatar.php`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    })
    const data = await res.json()
    if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`)
    user.value = data.user
    return true
  } catch (e) {
    error.value = e.message
    return false
  } finally {
    loading.value = false
  }
}

// ── Книги пользователя ────────────────────────────────────────
async function fetchUserBooks() {
  try {
    const { books } = await api('user_books.php')
    userBooks.value = books
  } catch {
    userBooks.value = { favorite: [], read: [], want: [] }
  }
}

async function addBook(book, status) {
  if (!isAuthed.value) { openModal('login'); return false }
  try {
    await api('user_books.php', {
      action: 'add',
      isbn:   book.isbn,
      title:  book.t,
      author: book.a,
      cover_css: book.c,
      status,
    })
    // Локально обновляем — чтобы UI откликнулся сразу, без ожидания запроса
    const list = userBooks.value[status]
    if (!list.find(b => b.isbn === book.isbn)) {
      list.unshift({
        isbn:      book.isbn,
        title:     book.t,
        author:    book.a,
        cover_css: book.c,
        status,
        added_at:  new Date().toISOString(),
      })
    }
    return true
  } catch (e) {
    error.value = e.message
    return false
  }
}

async function removeBook(isbn, status) {
  try {
    await api('user_books.php', { action: 'remove', isbn, status })
    userBooks.value[status] = userBooks.value[status].filter(b => b.isbn !== isbn)
    return true
  } catch (e) {
    error.value = e.message
    return false
  }
}

// Проверка: книга уже в этом статусе у пользователя?
function isBookIn(isbn, status) {
  return userBooks.value[status]?.some(b => b.isbn === isbn) ?? false
}

function openModal(name) { error.value = ''; modal.value = name }
function closeModal()    { error.value = ''; modal.value = null }

export function useAuth() {
  return {
    // state
    user, loading, error, modal, isAuthed, userBooks, route,
    // utils
    avatarSrc, navigate,
    // auth actions
    fetchMe, register, login, logout, updateProfile, uploadAvatar,
    changePassword, deleteAccount,
    // books actions
    fetchUserBooks, addBook, removeBook, isBookIn,
    // modal helpers
    openModal, closeModal,
  }
}
