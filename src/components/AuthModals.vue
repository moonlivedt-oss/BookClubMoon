<template>
  <Teleport to="body">
    <!-- ── BACKDROP ──────────────────────────────────────── -->
    <Transition name="auth-fade">
      <div v-if="modal" class="auth-backdrop" @click.self="closeModal">
        <!-- ── LOGIN ───────────────────────────────────── -->
        <div v-if="modal === 'login'" class="auth-card" role="dialog" aria-modal="true">
          <button class="auth-x" @click="closeModal" aria-label="Закрыть">×</button>
          <div class="auth-eyebrow">Вход</div>
          <h2 class="auth-title">С возвращением</h2>
          <div class="auth-div"></div>

          <form @submit.prevent="onLogin" class="auth-form">
            <label class="auth-field">
              <span>Имя пользователя или e-mail</span>
              <input v-model="loginForm.login" type="text" autocomplete="username" required />
            </label>
            <label class="auth-field">
              <span>Пароль</span>
              <input v-model="loginForm.password" type="password" autocomplete="current-password" required />
            </label>

            <p v-if="error" class="auth-err">{{ error }}</p>

            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? 'Входим…' : 'Войти' }}
            </button>

            <p class="auth-foot">
              Нет аккаунта?
              <a @click="openModal('register')">Зарегистрироваться</a>
            </p>
          </form>
        </div>

        <!-- ── REGISTER ────────────────────────────────── -->
        <div v-else-if="modal === 'register'" class="auth-card" role="dialog" aria-modal="true">
          <button class="auth-x" @click="closeModal" aria-label="Закрыть">×</button>
          <div class="auth-eyebrow">Регистрация</div>
          <h2 class="auth-title">Стать членом клуба</h2>
          <div class="auth-div"></div>

          <form @submit.prevent="onRegister" class="auth-form">
            <label class="auth-field">
              <span>Имя пользователя</span>
              <input v-model="regForm.username" type="text" autocomplete="username" minlength="3" maxlength="50" required />
            </label>
            <label class="auth-field">
              <span>E-mail</span>
              <input v-model="regForm.email" type="email" autocomplete="email" required />
            </label>
            <label class="auth-field">
              <span>Пароль <small>(мин. 6 символов)</small></span>
              <input v-model="regForm.password" type="password" autocomplete="new-password" minlength="6" required />
            </label>

            <p v-if="error" class="auth-err">{{ error }}</p>

            <button type="submit" class="auth-btn" :disabled="loading">
              {{ loading ? 'Создаём…' : 'Создать аккаунт' }}
            </button>

            <p class="auth-foot">
              Уже с нами?
              <a @click="openModal('login')">Войти</a>
            </p>
          </form>
        </div>

        <!-- ── PROFILE ─────────────────────────────────── -->
        <div v-else-if="modal === 'profile' && user" class="auth-card profile" role="dialog" aria-modal="true">
          <button class="auth-x" @click="closeModal" aria-label="Закрыть">×</button>

          <div class="prof-head">
            <div class="prof-avatar" :style="avatarStyle">
              <span v-if="!avatarUrl">{{ initials }}</span>
            </div>
            <div>
              <div class="auth-eyebrow">Профиль</div>
              <h2 class="auth-title">{{ user.full_name || user.username }}</h2>
              <div class="prof-meta">@{{ user.username }} · {{ user.email }}</div>
            </div>
          </div>
          <div class="auth-div"></div>

          <button type="button" class="open-page-btn" @click="goToProfilePage">
            ⛬ Открыть полную страницу профиля →
          </button>

          <form @submit.prevent="onSaveProfile" class="auth-form">
            <label class="auth-field">
              <span>Полное имя</span>
              <input v-model="profForm.full_name" type="text" maxlength="120" />
            </label>

            <label class="auth-field">
              <span>Любимый жанр</span>
              <input v-model="profForm.favorite_genre" type="text" maxlength="60" placeholder="Например: классика, фантастика…" />
            </label>

            <label class="auth-field">
              <span>Ссылка на аватар (необязательно)</span>
              <input v-model="profForm.avatar_url" type="url" maxlength="255" placeholder="https://…" />
            </label>

            <label class="auth-field">
              <span>О себе</span>
              <textarea v-model="profForm.bio" maxlength="1000" rows="3" placeholder="Что вы любите читать?"></textarea>
            </label>

            <p v-if="error" class="auth-err">{{ error }}</p>
            <p v-if="saved"  class="auth-ok">Сохранено ✓</p>

            <div class="prof-actions">
              <button type="submit" class="auth-btn" :disabled="loading">
                {{ loading ? 'Сохраняем…' : 'Сохранить' }}
              </button>
              <button type="button" class="auth-btn ghost" @click="onLogout">Выйти</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, computed, watch, ref } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const {
  user, loading, error, modal,
  register, login, logout, updateProfile,
  openModal, closeModal, navigate, avatarSrc,
} = useAuth()

const loginForm = reactive({ login: '', password: '' })
const regForm   = reactive({ username: '', email: '', password: '' })
const profForm  = reactive({ full_name: '', favorite_genre: '', avatar_url: '', bio: '' })
const saved     = ref(false)

// Сбрасываем формы при смене модалки + заполняем профиль текущими данными
watch(modal, (m) => {
  saved.value = false
  if (m === 'login')    Object.assign(loginForm, { login: '', password: '' })
  if (m === 'register') Object.assign(regForm,   { username: '', email: '', password: '' })
  if (m === 'profile' && user.value) {
    profForm.full_name      = user.value.full_name      ?? ''
    profForm.favorite_genre = user.value.favorite_genre ?? ''
    profForm.avatar_url     = user.value.avatar_url     ?? ''
    profForm.bio            = user.value.bio            ?? ''
  }
})

const initials = computed(() => {
  if (!user.value) return ''
  const src = user.value.full_name || user.value.username || ''
  return src.trim().slice(0, 1).toUpperCase()
})

const avatarUrl = computed(() => avatarSrc(user.value))
const avatarStyle = computed(() => avatarUrl.value
  ? { backgroundImage: `url(${avatarUrl.value})` }
  : {})

async function onLogin()    { await login(loginForm) }
async function onRegister() { await register(regForm) }

async function onSaveProfile() {
  saved.value = false
  const ok = await updateProfile({ ...profForm })
  if (ok) {
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  }
}

async function onLogout() { await logout() }

function goToProfilePage() {
  closeModal()
  navigate('profile')
}
</script>

<style scoped>
.auth-backdrop {
  position: fixed; inset: 0; z-index: 100000;
  background: rgba(8, 6, 3, .85);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

.auth-card {
  position: relative;
  width: 100%; max-width: 440px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: linear-gradient(180deg, var(--bg2), var(--bg1));
  border: 1px solid var(--gb);
  border-radius: 4px;
  padding: 38px 36px 32px;
  box-shadow: 0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(201,168,76,.06) inset;
  font-family: var(--fs);
}
.auth-card.profile { max-width: 520px; }

.auth-x {
  position: absolute; top: 10px; right: 14px;
  width: 32px; height: 32px;
  background: transparent; border: none;
  color: var(--cream2); font-size: 26px; line-height: 1;
  cursor: pointer; transition: color .2s;
}
.auth-x:hover { color: var(--gold); }

.auth-eyebrow {
  font-family: var(--fa); font-size: 11px;
  letter-spacing: .3em; text-transform: uppercase;
  color: var(--gold); opacity: .8; margin-bottom: .5rem;
}
.auth-title {
  font-family: var(--fh); font-size: 1.6rem;
  color: var(--cream); line-height: 1.15; font-weight: 700;
}
.auth-div {
  width: 60px; height: 2px;
  background: linear-gradient(to right, var(--gold), transparent);
  margin: .9rem 0 1.5rem;
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.auth-field { display: flex; flex-direction: column; gap: 6px; }
.auth-field span {
  font-family: var(--fa); font-size: 11px;
  letter-spacing: .2em; text-transform: uppercase;
  color: var(--cream2);
}
.auth-field span small { letter-spacing: .05em; text-transform: none; opacity: .7; }

.auth-field input,
.auth-field textarea {
  width: 100%;
  background: rgba(0,0,0,.25);
  border: 1px solid var(--bord);
  border-radius: 2px;
  padding: 11px 14px;
  color: var(--cream);
  font-family: var(--fs); font-size: 14px;
  transition: border-color .2s, background .2s;
  cursor: none;
}
.auth-field textarea { resize: vertical; min-height: 70px; }
.auth-field input:focus,
.auth-field textarea:focus {
  outline: none;
  border-color: var(--gold);
  background: rgba(0,0,0,.4);
}

.auth-btn {
  background: var(--gold); color: var(--bg0);
  padding: 12px 22px; border: none; border-radius: 2px;
  font-family: var(--fh); font-size: 13px; letter-spacing: .12em;
  cursor: pointer; transition: all .2s;
  margin-top: 6px;
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

.auth-err {
  background: rgba(180, 60, 60, .12);
  border: 1px solid rgba(220, 90, 90, .35);
  color: #f1c2c2;
  padding: 9px 12px; border-radius: 2px;
  font-size: 13px; line-height: 1.4;
}
.auth-ok {
  color: var(--gold); font-size: 13px; letter-spacing: .05em;
}

.auth-foot {
  margin-top: 4px; text-align: center;
  font-size: 13px; color: var(--cream2);
}
.auth-foot a {
  color: var(--gold); cursor: pointer;
  text-decoration: none; margin-left: 4px;
  border-bottom: 1px solid transparent;
  transition: border-color .2s;
}
.auth-foot a:hover { border-bottom-color: var(--gold); }

/* ── Profile head ─────────────────────────────────────── */
.prof-head {
  display: flex; align-items: center; gap: 18px;
}
.prof-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 1.5px solid var(--gold);
  background: var(--gp) center/cover no-repeat;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--fh); font-size: 26px;
  color: var(--gold);
  flex-shrink: 0;
}
.prof-meta {
  font-size: 12px; color: var(--cream2);
  margin-top: 4px; word-break: break-all;
}
.prof-actions {
  display: flex; gap: 10px; margin-top: 8px;
}
.prof-actions .auth-btn { flex: 1; margin-top: 0; }

.open-page-btn {
  width: 100%;
  background: var(--gp);
  border: 1px solid var(--gb);
  color: var(--gold);
  padding: 10px 14px;
  border-radius: 2px;
  font-family: var(--fa);
  font-size: 12px;
  letter-spacing: .15em;
  cursor: pointer;
  transition: all .2s;
  margin-bottom: 1.2rem;
}
.open-page-btn:hover {
  background: var(--gold);
  color: var(--bg0);
}

/* ── Animation ────────────────────────────────────────── */
.auth-fade-enter-active, .auth-fade-leave-active {
  transition: opacity .25s ease;
}
.auth-fade-enter-active .auth-card,
.auth-fade-leave-active .auth-card {
  transition: transform .3s ease, opacity .3s ease;
}
.auth-fade-enter-from, .auth-fade-leave-to { opacity: 0; }
.auth-fade-enter-from .auth-card,
.auth-fade-leave-to   .auth-card { transform: translateY(20px) scale(.97); opacity: 0; }

@media (max-width: 520px) {
  .auth-card { padding: 30px 22px 24px; }
  .prof-head { gap: 14px; }
  .prof-avatar { width: 54px; height: 54px; font-size: 22px; }
}
</style>
