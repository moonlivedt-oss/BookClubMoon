import { ref, computed } from 'vue'

const DICT = {
  ru: {
    // Header
    'nav.catalog':       'Каталог',
    'nav.genres':        'Жанры',
    'nav.map':           'Карта',
    'nav.challenge':     'Марафон',
    'nav.meetings':      'Встречи',
    'nav.login':         'Войти',
    'nav.register':      'Регистрация',

    // Auth modals
    'auth.login.title':     'С возвращением',
    'auth.login.eyebrow':   'Вход',
    'auth.login.field.login': 'Имя пользователя или e-mail',
    'auth.login.field.password': 'Пароль',
    'auth.login.submit':    'Войти',
    'auth.login.submitting':'Входим…',
    'auth.login.no_acc':    'Нет аккаунта?',
    'auth.login.go_reg':    'Зарегистрироваться',

    'auth.reg.title':       'Стать членом клуба',
    'auth.reg.eyebrow':     'Регистрация',
    'auth.reg.field.username': 'Имя пользователя',
    'auth.reg.field.email':    'E-mail',
    'auth.reg.field.password': 'Пароль',
    'auth.reg.password_hint':  '(мин. 6 символов)',
    'auth.reg.submit':      'Создать аккаунт',
    'auth.reg.submitting':  'Создаём…',
    'auth.reg.have_acc':    'Уже с нами?',
    'auth.reg.go_login':    'Войти',

    'auth.profile.eyebrow': 'Профиль',
    'auth.profile.full_name':'Полное имя',
    'auth.profile.fav_genre':'Любимый жанр',
    'auth.profile.fav_genre_ph':'Например: классика, фантастика…',
    'auth.profile.avatar_url':'Ссылка на аватар (необязательно)',
    'auth.profile.bio':     'О себе',
    'auth.profile.bio_ph':  'Что вы любите читать?',
    'auth.profile.save':    'Сохранить',
    'auth.profile.saving':  'Сохраняем…',
    'auth.profile.saved':   'Сохранено ✓',
    'auth.profile.logout':  'Выйти',
    'auth.profile.open_page':'⛬ Открыть полную страницу профиля →',
    'auth.close':           'Закрыть',

    // Profile page
    'profile.back':         '← На главную',
    'profile.required_title':'Сначала войдите',
    'profile.required_desc':'Чтобы увидеть свой профиль, войдите в аккаунт или создайте новый.',
    'profile.change_photo': '📷 Изменить фото',
    'profile.uploading':    'Загрузка…',
    'profile.edit':         'Редактировать',
    'profile.member_since': 'с {date}',
    'profile.stat.read':    'прочитано',
    'profile.stat.fav':     'в избранном',
    'profile.stat.want':    'в планах',
    'profile.stat.genre':   'любимый жанр',

    'profile.tab.fav':      'Любимые',
    'profile.tab.read':     'Прочитано',
    'profile.tab.want':     'Хочу прочитать',
    'profile.tab.settings': 'Настройки',

    'profile.empty.fav':    'Здесь пока пусто. Добавьте первую любимую книгу из каталога.',
    'profile.empty.read':   'Вы ещё не отметили ни одной прочитанной книги.',
    'profile.empty.want':   'Сохраняйте сюда книги, которые планируете прочесть.',
    'profile.empty.go_catalog':'Перейти в каталог',

    // Settings
    'settings.appearance':  'Внешний вид',
    'settings.theme':       'Тема',
    'settings.theme.dark':  '🌙 Тёмная',
    'settings.theme.light': '☀️ Светлая',
    'settings.theme.auto':  '⚙ Авто (системная)',

    'settings.language':    'Язык интерфейса',
    'settings.lang.ru':     '🇷🇺 Русский',
    'settings.lang.en':     '🇬🇧 English',

    'settings.security':    'Безопасность',
    'settings.change_pwd':  'Сменить пароль',
    'settings.pwd.current': 'Текущий пароль',
    'settings.pwd.new':     'Новый пароль',
    'settings.pwd.repeat':  'Повторите новый пароль',
    'settings.pwd.submit':  'Изменить пароль',
    'settings.pwd.changing':'Меняем…',
    'settings.pwd.changed': 'Пароль изменён ✓',
    'settings.pwd.mismatch':'Новые пароли не совпадают',

    'settings.danger':      'Опасная зона',
    'settings.delete_acc':  'Удалить аккаунт',
    'settings.delete_desc': 'Это действие необратимо. Будут удалены ваш профиль и все ваши книги.',
    'settings.delete_btn':  'Удалить мой аккаунт навсегда',
    'settings.delete_confirm':'Введите ваше имя пользователя, чтобы подтвердить:',
    'settings.delete_processing':'Удаляем…',
  },
  en: {
    'nav.catalog':       'Catalog',
    'nav.genres':        'Genres',
    'nav.map':           'Map',
    'nav.challenge':     'Challenge',
    'nav.meetings':      'Meetings',
    'nav.login':         'Sign in',
    'nav.register':      'Sign up',

    'auth.login.title':     'Welcome back',
    'auth.login.eyebrow':   'Sign in',
    'auth.login.field.login': 'Username or e-mail',
    'auth.login.field.password': 'Password',
    'auth.login.submit':    'Sign in',
    'auth.login.submitting':'Signing in…',
    'auth.login.no_acc':    'No account?',
    'auth.login.go_reg':    'Sign up',

    'auth.reg.title':       'Join the club',
    'auth.reg.eyebrow':     'Sign up',
    'auth.reg.field.username': 'Username',
    'auth.reg.field.email':    'E-mail',
    'auth.reg.field.password': 'Password',
    'auth.reg.password_hint':  '(min 6 chars)',
    'auth.reg.submit':      'Create account',
    'auth.reg.submitting':  'Creating…',
    'auth.reg.have_acc':    'Have an account?',
    'auth.reg.go_login':    'Sign in',

    'auth.profile.eyebrow': 'Profile',
    'auth.profile.full_name':'Full name',
    'auth.profile.fav_genre':'Favorite genre',
    'auth.profile.fav_genre_ph':'e.g. classics, sci-fi…',
    'auth.profile.avatar_url':'Avatar URL (optional)',
    'auth.profile.bio':     'About',
    'auth.profile.bio_ph':  'What do you love to read?',
    'auth.profile.save':    'Save',
    'auth.profile.saving':  'Saving…',
    'auth.profile.saved':   'Saved ✓',
    'auth.profile.logout':  'Sign out',
    'auth.profile.open_page':'⛬ Open full profile page →',
    'auth.close':           'Close',

    'profile.back':         '← Home',
    'profile.required_title':'Please sign in',
    'profile.required_desc':'To see your profile, sign in or create a new account.',
    'profile.change_photo': '📷 Change photo',
    'profile.uploading':    'Uploading…',
    'profile.edit':         'Edit',
    'profile.member_since': 'since {date}',
    'profile.stat.read':    'read',
    'profile.stat.fav':     'favorites',
    'profile.stat.want':    'to read',
    'profile.stat.genre':   'fav genre',

    'profile.tab.fav':      'Favorites',
    'profile.tab.read':     'Read',
    'profile.tab.want':     'To read',
    'profile.tab.settings': 'Settings',

    'profile.empty.fav':    'No favorites yet. Add a book from the catalog.',
    'profile.empty.read':   'You haven\'t marked any books as read yet.',
    'profile.empty.want':   'Save books you plan to read here.',
    'profile.empty.go_catalog':'Browse catalog',

    'settings.appearance':  'Appearance',
    'settings.theme':       'Theme',
    'settings.theme.dark':  '🌙 Dark',
    'settings.theme.light': '☀️ Light',
    'settings.theme.auto':  '⚙ Auto (system)',

    'settings.language':    'Interface language',
    'settings.lang.ru':     '🇷🇺 Русский',
    'settings.lang.en':     '🇬🇧 English',

    'settings.security':    'Security',
    'settings.change_pwd':  'Change password',
    'settings.pwd.current': 'Current password',
    'settings.pwd.new':     'New password',
    'settings.pwd.repeat':  'Repeat new password',
    'settings.pwd.submit':  'Change password',
    'settings.pwd.changing':'Changing…',
    'settings.pwd.changed': 'Password changed ✓',
    'settings.pwd.mismatch':'New passwords don\'t match',

    'settings.danger':      'Danger zone',
    'settings.delete_acc':  'Delete account',
    'settings.delete_desc': 'This action is irreversible. Your profile and all your books will be deleted.',
    'settings.delete_btn':  'Delete my account permanently',
    'settings.delete_confirm':'Type your username to confirm:',
    'settings.delete_processing':'Deleting…',
  },
}

const STORAGE_KEY_LANG  = 'bookclub:lang'
const STORAGE_KEY_THEME = 'bookclub:theme'

const lang  = ref(localStorage.getItem(STORAGE_KEY_LANG)  || 'ru')
const theme = ref(localStorage.getItem(STORAGE_KEY_THEME) || 'auto')

// Применяем тему к <html data-theme="...">
function applyTheme() {
  const html = document.documentElement
  let effective = theme.value
  if (effective === 'auto') {
    effective = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  html.setAttribute('data-theme', effective)
}

function setLang(v) {
  lang.value = v
  localStorage.setItem(STORAGE_KEY_LANG, v)
  document.documentElement.setAttribute('lang', v)
}

function setTheme(v) {
  theme.value = v
  localStorage.setItem(STORAGE_KEY_THEME, v)
  applyTheme()
}

// Слушаем смену системной темы (для auto)
if (typeof window !== 'undefined') {
  applyTheme()
  document.documentElement.setAttribute('lang', lang.value)
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (theme.value === 'auto') applyTheme()
  })
}

// Функция перевода с поддержкой подстановок {key}
function tr(key, vars) {
  let str = DICT[lang.value]?.[key] ?? DICT.ru[key] ?? key
  if (vars) {
    for (const k in vars) str = str.replaceAll(`{${k}}`, vars[k])
  }
  return str
}

// Реактивный t — пересчитывается при смене языка
const t = computed(() => (key, vars) => {
  // зависимость от lang.value — чтобы computed пересчитывался
  void lang.value
  return tr(key, vars)
})

export function useI18n() {
  return { lang, theme, t, setLang, setTheme }
}
