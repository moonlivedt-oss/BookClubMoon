<template>
  <main class="profile-page">
    <!-- Не авторизован -->
    <section v-if="!user" class="prof-empty sec-in">
      <div class="auth-eyebrow">{{ t('auth.profile.eyebrow') }}</div>
      <h1 class="sec-h"><em>{{ t('profile.required_title') }}</em></h1>
      <div class="sec-div"></div>
      <p class="muted">{{ t('profile.required_desc') }}</p>
      <div class="prof-empty-actions">
        <button class="btn-gold" @click="openModal('login')">{{ t('nav.login') }}</button>
        <button class="btn-ghost" @click="openModal('register')">{{ t('nav.register') }}</button>
        <button class="btn-ghost" @click="navigate('home')">{{ t('profile.back') }}</button>
      </div>
    </section>

    <!-- Авторизован -->
    <template v-else>
      <!-- ── HERO ─────────────────────────────────────── -->
      <section class="prof-hero sec-in">
        <a class="back-link" @click="navigate('home')">{{ t('profile.back') }}</a>

        <div class="prof-hero-row">
          <!-- Аватар + загрузка -->
          <div class="avatar-wrap">
            <div class="avatar-lg" :style="bigAvatarStyle">
              <span v-if="!avatarUrl">{{ initials }}</span>
            </div>
            <label class="avatar-up" :class="{ disabled: loading }">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="onAvatarFile"
                hidden
              />
              {{ loading ? t('profile.uploading') : t('profile.change_photo') }}
            </label>
            <p v-if="uploadMsg" class="upload-msg">{{ uploadMsg }}</p>
          </div>

          <!-- Имя/инфо -->
          <div class="prof-info">
            <div class="auth-eyebrow">{{ t('auth.profile.eyebrow') }}</div>
            <h1 class="prof-name">{{ user.full_name || user.username }}</h1>
            <div class="prof-handle">@{{ user.username }}</div>
            <div class="prof-meta-row">
              <span class="meta-pill">📧 {{ user.email }}</span>
              <span v-if="user.favorite_genre" class="meta-pill gold">
                ✦ {{ user.favorite_genre }}
              </span>
              <span v-if="user.created_at" class="meta-pill">
                {{ t('profile.member_since', { date: formatDate(user.created_at) }) }}
              </span>
            </div>

            <p v-if="user.bio" class="prof-bio">{{ user.bio }}</p>

            <div class="prof-cta">
              <button class="btn-gold" @click="openModal('profile')">{{ t('profile.edit') }}</button>
              <button class="btn-ghost" @click="onLogout">{{ t('auth.profile.logout') }}</button>
            </div>
          </div>
        </div>

        <!-- ── СТАТИСТИКА ─────────────────────────────── -->
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-num">{{ userBooks.read.length }}</div>
            <div class="stat-lb">{{ t('profile.stat.read') }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ userBooks.favorite.length }}</div>
            <div class="stat-lb">{{ t('profile.stat.fav') }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ userBooks.want.length }}</div>
            <div class="stat-lb">{{ t('profile.stat.want') }}</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">{{ topGenre || '—' }}</div>
            <div class="stat-lb">{{ t('profile.stat.genre') }}</div>
          </div>
        </div>
      </section>

      <!-- ── ТАБЫ ──────────────────────────────────────── -->
      <section class="sec-in books-sec">
        <div class="tabs">
          <button
            v-for="tb in tabs" :key="tb.key"
            class="tab" :class="{ active: tab === tb.key }"
            @click="tab = tb.key"
          >
            <span class="tab-ico">{{ tb.ico }}</span>
            <span>{{ t(tb.labelKey) }}</span>
            <span v-if="tb.cnt !== undefined" class="tab-cnt">{{ tb.cnt }}</span>
          </button>
        </div>

        <!-- Список книг -->
        <template v-if="tab !== 'settings'">
          <div v-if="currentList.length === 0" class="empty">
            <div class="empty-ico">{{ activeTab.ico }}</div>
            <p>{{ t(activeTab.emptyKey) }}</p>
            <button class="btn-ghost" @click="navigate('home'); scrollToCatalog()">
              {{ t('profile.empty.go_catalog') }}
            </button>
          </div>

          <div v-else class="book-grid">
            <div v-for="b in currentList" :key="b.isbn + b.status" class="ub-card">
              <div class="ub-cover" :style="{ background: b.cover_css || 'linear-gradient(150deg,#3A2A10,#1A1008)' }">
                <span class="ub-cover-t">{{ b.title }}</span>
              </div>
              <div class="ub-body">
                <div class="ub-title">{{ b.title }}</div>
                <div class="ub-author">{{ b.author }}</div>
                <div class="ub-foot">
                  <span class="ub-date">{{ formatDate(b.added_at) }}</span>
                  <button class="ub-rm" @click="onRemove(b)" :title="t('auth.close')">✕</button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── НАСТРОЙКИ ──────────────────────────────── -->
        <template v-else>
          <div class="settings-wrap">
            <!-- Внешний вид -->
            <div class="set-block">
              <h3 class="set-h">{{ t('settings.appearance') }}</h3>

              <div class="set-row">
                <div class="set-label">{{ t('settings.theme') }}</div>
                <div class="seg">
                  <button class="seg-btn" :class="{ on: theme === 'dark' }"  @click="setTheme('dark')">{{ t('settings.theme.dark') }}</button>
                  <button class="seg-btn" :class="{ on: theme === 'light' }" @click="setTheme('light')">{{ t('settings.theme.light') }}</button>
                  <button class="seg-btn" :class="{ on: theme === 'auto' }"  @click="setTheme('auto')">{{ t('settings.theme.auto') }}</button>
                </div>
              </div>

              <div class="set-row">
                <div class="set-label">{{ t('settings.language') }}</div>
                <div class="seg">
                  <button class="seg-btn" :class="{ on: lang === 'ru' }" @click="setLang('ru')">{{ t('settings.lang.ru') }}</button>
                  <button class="seg-btn" :class="{ on: lang === 'en' }" @click="setLang('en')">{{ t('settings.lang.en') }}</button>
                </div>
              </div>
            </div>

            <!-- Безопасность -->
            <div class="set-block">
              <h3 class="set-h">{{ t('settings.security') }}</h3>

              <form @submit.prevent="onChangePassword" class="set-form">
                <label class="set-field">
                  <span>{{ t('settings.pwd.current') }}</span>
                  <input v-model="pwdForm.current" type="password" autocomplete="current-password" required />
                </label>
                <label class="set-field">
                  <span>{{ t('settings.pwd.new') }}</span>
                  <input v-model="pwdForm.next" type="password" autocomplete="new-password" minlength="6" required />
                </label>
                <label class="set-field">
                  <span>{{ t('settings.pwd.repeat') }}</span>
                  <input v-model="pwdForm.repeat" type="password" autocomplete="new-password" minlength="6" required />
                </label>

                <p v-if="pwdMsg.error" class="set-err">{{ pwdMsg.error }}</p>
                <p v-if="pwdMsg.ok"    class="set-ok">{{ t('settings.pwd.changed') }}</p>

                <button type="submit" class="auth-btn" :disabled="loading">
                  {{ loading ? t('settings.pwd.changing') : t('settings.pwd.submit') }}
                </button>
              </form>
            </div>

            <!-- Опасная зона -->
            <div class="set-block danger">
              <h3 class="set-h danger-h">⚠ {{ t('settings.danger') }}</h3>
              <p class="set-desc">{{ t('settings.delete_desc') }}</p>

              <button v-if="!showDelete" class="auth-btn danger-btn" @click="showDelete = true">
                {{ t('settings.delete_btn') }}
              </button>

              <form v-else @submit.prevent="onDeleteAccount" class="set-form">
                <label class="set-field">
                  <span>{{ t('settings.delete_confirm') }} <strong>{{ user.username }}</strong></span>
                  <input v-model="delForm.username" type="text" required />
                </label>
                <label class="set-field">
                  <span>{{ t('settings.pwd.current') }}</span>
                  <input v-model="delForm.password" type="password" autocomplete="current-password" required />
                </label>

                <p v-if="delErr" class="set-err">{{ delErr }}</p>

                <div class="del-actions">
                  <button type="button" class="auth-btn ghost" @click="showDelete = false">
                    {{ t('auth.close') }}
                  </button>
                  <button
                    type="submit"
                    class="auth-btn danger-btn"
                    :disabled="loading || delForm.username !== user.username"
                  >
                    {{ loading ? t('settings.delete_processing') : t('settings.delete_btn') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </template>
      </section>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'
import { useI18n } from '../composables/useI18n.js'

const {
  user, userBooks, loading, avatarSrc,
  openModal, navigate, logout, uploadAvatar, removeBook, fetchUserBooks,
  changePassword, deleteAccount,
} = useAuth()

const { t, lang, theme, setLang, setTheme } = useI18n()

const tab = ref('favorite')
const uploadMsg = ref('')

// Формы для настроек
const pwdForm = reactive({ current: '', next: '', repeat: '' })
const pwdMsg  = reactive({ error: '', ok: false })

const showDelete = ref(false)
const delForm    = reactive({ username: '', password: '' })
const delErr     = ref('')

const tabs = computed(() => [
  { key: 'favorite', labelKey: 'profile.tab.fav',      ico: '❤', emptyKey: 'profile.empty.fav',  cnt: userBooks.value.favorite.length },
  { key: 'read',     labelKey: 'profile.tab.read',     ico: '✓', emptyKey: 'profile.empty.read', cnt: userBooks.value.read.length },
  { key: 'want',     labelKey: 'profile.tab.want',     ico: '★', emptyKey: 'profile.empty.want', cnt: userBooks.value.want.length },
  { key: 'settings', labelKey: 'profile.tab.settings', ico: '⚙' },
])

const activeTab   = computed(() => tabs.value.find(tb => tb.key === tab.value))
const currentList = computed(() =>
  tab.value !== 'settings' ? userBooks.value[tab.value] : []
)

const initials = computed(() => {
  if (!user.value) return ''
  return (user.value.full_name || user.value.username || '?').trim().slice(0, 1).toUpperCase()
})

const avatarUrl      = computed(() => avatarSrc(user.value))
const bigAvatarStyle = computed(() => avatarUrl.value
  ? { backgroundImage: `url(${avatarUrl.value})` }
  : {})

const topGenre = computed(() => {
  if (user.value?.favorite_genre) return user.value.favorite_genre
  const all = [...userBooks.value.favorite, ...userBooks.value.read]
  if (!all.length) return ''
  const cnt = {}
  for (const b of all) {
    if (!b.author) continue
    cnt[b.author] = (cnt[b.author] || 0) + 1
  }
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : ''
})

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T'))
  if (isNaN(d)) return ''
  const isRu = lang.value === 'ru'
  const months = isRu
    ? ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return isRu
    ? `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
    : `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

async function onAvatarFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    uploadMsg.value = t.value('profile.uploading') + ' — > 2 MB'
    setTimeout(() => uploadMsg.value = '', 3000)
    return
  }
  const ok = await uploadAvatar(file)
  uploadMsg.value = ok ? t.value('auth.profile.saved') : '✕'
  setTimeout(() => uploadMsg.value = '', 3000)
}

async function onRemove(b) {
  await removeBook(b.isbn, b.status)
}

async function onLogout() {
  await logout()
}

async function onChangePassword() {
  pwdMsg.error = ''
  pwdMsg.ok = false

  if (pwdForm.next !== pwdForm.repeat) {
    pwdMsg.error = t.value('settings.pwd.mismatch')
    return
  }

  const ok = await changePassword({
    current_password: pwdForm.current,
    new_password:     pwdForm.next,
  })
  if (ok) {
    pwdMsg.ok = true
    pwdForm.current = pwdForm.next = pwdForm.repeat = ''
    setTimeout(() => { pwdMsg.ok = false }, 3000)
  } else {
    // ошибка уже в auth.error, скопируем
    const { error } = useAuth()
    pwdMsg.error = error.value
  }
}

async function onDeleteAccount() {
  delErr.value = ''
  const ok = await deleteAccount({
    password:         delForm.password,
    confirm_username: delForm.username,
  })
  if (!ok) {
    const { error } = useAuth()
    delErr.value = error.value
  }
}

function scrollToCatalog() {
  setTimeout(() => {
    document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' })
  }, 200)
}

onMounted(() => {
  if (user.value) fetchUserBooks()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 110px 2.5rem 80px;
}

.sec-in { max-width: 1200px; margin: 0 auto; }
.muted { color: var(--cream2); margin-top: 1rem; }

.back-link {
  display: inline-block;
  font-family: var(--fa);
  font-size: 12px; letter-spacing: .2em;
  color: var(--cream2); text-decoration: none;
  cursor: pointer; transition: color .2s;
  margin-bottom: 2rem;
}
.back-link:hover { color: var(--gold); }

/* ── Hero ─────────────────────────────────────────────── */
.prof-hero {
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--bord);
  margin-bottom: 3rem;
}
.prof-hero-row {
  display: flex; gap: 3rem; align-items: flex-start;
  flex-wrap: wrap;
}
.avatar-wrap {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; flex-shrink: 0;
}
.avatar-lg {
  width: 160px; height: 160px;
  border-radius: 50%;
  border: 2px solid var(--gold);
  background: var(--gp) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--fh); font-size: 64px;
  color: var(--gold);
  box-shadow: 0 20px 60px rgba(201,168,76,.15);
}
.avatar-up {
  display: inline-block;
  background: transparent;
  border: 1px solid var(--gb);
  color: var(--gold);
  padding: 8px 16px; border-radius: 2px;
  font-family: var(--fa); font-size: 11px; letter-spacing: .15em;
  cursor: pointer; transition: all .2s;
}
.avatar-up:hover { background: var(--gp); }
.avatar-up.disabled { opacity: .5; pointer-events: none; }
.upload-msg {
  font-size: 12px; color: var(--gold);
  font-family: var(--fa); letter-spacing: .1em;
}

.prof-info { flex: 1; min-width: 280px; }
.prof-name {
  font-family: var(--fh);
  font-size: clamp(2rem, 4vw, 2.8rem);
  color: var(--cream); line-height: 1.1;
  margin: .4rem 0 .3rem;
}
.prof-handle {
  font-family: var(--fa); font-size: 13px;
  color: var(--gold); letter-spacing: .15em;
  margin-bottom: 1.2rem;
}
.prof-meta-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 1rem;
}
.meta-pill {
  background: rgba(0,0,0,.3);
  border: 1px solid var(--bord);
  padding: 6px 12px; border-radius: 30px;
  font-size: 12px; color: var(--cream2);
  font-family: var(--fs);
}
:global(html[data-theme="light"]) .meta-pill { background: rgba(0,0,0,.04); }
.meta-pill.gold { color: var(--gold); border-color: var(--gb); }

.prof-bio {
  font-family: var(--fb);
  font-size: 1.05rem; line-height: 1.7;
  color: var(--cream); opacity: .85;
  max-width: 60ch; margin-bottom: 1.4rem;
}
.prof-cta { display: flex; gap: 12px; flex-wrap: wrap; }

/* ── Statistics ───────────────────────────────────────── */
.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1px;
  margin-top: 2.5rem;
  background: var(--bord);
  border: 1px solid var(--bord);
}
.stat-box {
  background: var(--bg1);
  padding: 1.5rem 1rem;
  text-align: center;
}
.stat-num {
  font-family: var(--fh);
  font-size: 2rem; color: var(--gold);
  line-height: 1; margin-bottom: 4px;
  word-break: break-word;
}
.stat-lb {
  font-family: var(--fa); font-size: 11px;
  letter-spacing: .25em; text-transform: uppercase;
  color: var(--cream2);
}

/* ── Tabs ─────────────────────────────────────────────── */
.tabs {
  display: flex; gap: 4px;
  border-bottom: 1px solid var(--bord);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.tab {
  background: transparent; border: none;
  color: var(--cream2);
  padding: 12px 18px;
  font-family: var(--fa);
  font-size: 13px; letter-spacing: .15em;
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 2px solid transparent;
  transition: all .2s;
  margin-bottom: -1px;
}
.tab:hover { color: var(--cream); }
.tab.active { color: var(--gold); border-bottom-color: var(--gold); }
.tab-ico { font-size: 14px; }
.tab-cnt {
  font-family: var(--fs);
  background: var(--gp);
  padding: 2px 9px; border-radius: 30px;
  font-size: 11px; letter-spacing: 0;
  min-width: 22px; text-align: center;
}

/* ── Empty ────────────────────────────────────────────── */
.empty {
  text-align: center; padding: 4rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  border: 1px dashed var(--bord);
  border-radius: 4px;
}
.empty-ico { font-size: 48px; color: var(--gold); opacity: .4; }
.empty p { color: var(--cream2); max-width: 36ch; }

/* ── Book grid ────────────────────────────────────────── */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}
.ub-card {
  background: var(--bg1);
  border: 1px solid var(--bord);
  border-radius: 2px;
  overflow: hidden;
  transition: all .25s;
  display: flex; flex-direction: column;
}
.ub-card:hover {
  border-color: var(--gb);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0,0,0,.4);
}
.ub-cover {
  aspect-ratio: 2 / 3;
  display: flex; align-items: flex-end;
  padding: 1rem; position: relative;
}
.ub-cover::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.6));
}
.ub-cover-t {
  position: relative;
  font-family: var(--fh);
  font-size: 13px; color: #F2E8D4;
  line-height: 1.2;
  text-shadow: 0 2px 6px rgba(0,0,0,.6);
}
.ub-body { padding: .9rem 1rem; flex: 1; display: flex; flex-direction: column; }
.ub-title {
  font-family: var(--fh); font-size: 14px;
  color: var(--cream); line-height: 1.3;
  margin-bottom: 4px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.ub-author {
  font-family: var(--fs); font-size: 12px;
  color: var(--cream2); margin-bottom: auto;
}
.ub-foot {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px solid var(--bord);
}
.ub-date {
  font-family: var(--fa); font-size: 10px;
  letter-spacing: .15em; color: var(--cream2); opacity: .7;
}
.ub-rm {
  background: transparent; border: 1px solid var(--bord);
  color: var(--cream2);
  width: 26px; height: 26px;
  border-radius: 50%;
  font-size: 14px; cursor: pointer;
  transition: all .2s;
  display: flex; align-items: center; justify-content: center;
}
.ub-rm:hover {
  border-color: rgba(220,90,90,.6);
  color: #e89090;
  background: rgba(180,60,60,.1);
}

/* ── Settings ─────────────────────────────────────────── */
.settings-wrap {
  display: flex; flex-direction: column;
  gap: 2rem;
  max-width: 720px;
}
.set-block {
  background: var(--bg1);
  border: 1px solid var(--bord);
  border-radius: 2px;
  padding: 1.75rem 1.5rem;
}
.set-h {
  font-family: var(--fh); font-size: 1.15rem;
  color: var(--cream);
  margin-bottom: 1.25rem;
  padding-bottom: .75rem;
  border-bottom: 1px solid var(--bord);
}
.set-row {
  display: flex; justify-content: space-between; align-items: center;
  gap: 1rem; flex-wrap: wrap;
  padding: .75rem 0;
}
.set-row + .set-row { border-top: 1px solid var(--bord); }
.set-label {
  font-family: var(--fa); font-size: 12px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--cream2);
}

.seg {
  display: flex; flex-wrap: wrap;
  background: var(--bg2);
  border: 1px solid var(--bord);
  border-radius: 30px;
  padding: 3px;
  gap: 2px;
}
.seg-btn {
  background: transparent; border: none;
  color: var(--cream2);
  padding: 7px 14px;
  border-radius: 30px;
  font-family: var(--fs); font-size: 12px;
  cursor: pointer; transition: all .2s;
}
.seg-btn:hover { color: var(--cream); }
.seg-btn.on {
  background: var(--gold);
  color: var(--bg0);
}

/* Set form */
.set-form { display: flex; flex-direction: column; gap: 12px; }
.set-field { display: flex; flex-direction: column; gap: 6px; }
.set-field span {
  font-family: var(--fa); font-size: 11px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--cream2);
}
.set-field input {
  width: 100%;
  background: var(--bg2);
  border: 1px solid var(--bord);
  border-radius: 2px;
  padding: 11px 14px;
  color: var(--cream);
  font-family: var(--fs); font-size: 14px;
  transition: border-color .2s;
}
.set-field input:focus {
  outline: none;
  border-color: var(--gold);
}
.set-err {
  background: rgba(180, 60, 60, .12);
  border: 1px solid rgba(220, 90, 90, .35);
  color: #f1c2c2;
  padding: 9px 12px; border-radius: 2px;
  font-size: 13px;
}
.set-ok { color: var(--gold); font-size: 13px; letter-spacing: .05em; }
.set-desc {
  color: var(--cream2); font-size: 14px;
  margin-bottom: 1rem; line-height: 1.6;
}

.auth-btn {
  background: var(--gold); color: var(--bg0);
  padding: 12px 22px; border: none; border-radius: 2px;
  font-family: var(--fh); font-size: 13px; letter-spacing: .12em;
  cursor: pointer; transition: all .2s;
  margin-top: 6px; align-self: flex-start;
}
.auth-btn:hover:not(:disabled) {
  background: var(--gold2);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(201,168,76,.25);
}
.auth-btn:disabled { opacity: .55; cursor: not-allowed; }
.auth-btn.ghost {
  background: transparent;
  color: var(--cream);
  border: 1px solid rgba(242,232,212,.2);
}
.auth-btn.ghost:hover:not(:disabled) {
  border-color: var(--gold);
  color: var(--gold);
  box-shadow: none;
  background: var(--gp);
}

/* Danger */
.set-block.danger {
  border-color: rgba(220, 90, 90, .35);
}
.danger-h { color: #e89090; }
.auth-btn.danger-btn {
  background: rgba(180, 60, 60, .15);
  color: #e89090;
  border: 1px solid rgba(220, 90, 90, .5);
}
.auth-btn.danger-btn:hover:not(:disabled) {
  background: rgba(220, 90, 90, .8);
  color: white;
  box-shadow: 0 8px 20px rgba(220, 90, 90, .25);
}
.del-actions { display: flex; gap: 10px; margin-top: 6px; }

/* Empty unauthenticated */
.prof-empty { padding: 4rem 0; }
.prof-empty-actions {
  display: flex; gap: 12px; margin-top: 2rem; flex-wrap: wrap;
}

@media (max-width: 700px) {
  .profile-page { padding: 90px 1.2rem 60px; }
  .prof-hero-row { gap: 1.5rem; }
  .avatar-lg { width: 120px; height: 120px; font-size: 48px; }
  .prof-name { font-size: 1.7rem; }
  .set-row { flex-direction: column; align-items: flex-start; }
}
</style>
