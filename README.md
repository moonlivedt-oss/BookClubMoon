# Библиотека «Страница» — Book Club

Лендинг книжного клуба с каталогом книг, читательскими профилями и встроенным ридером.

## Стек

- **Frontend**: Vue 3 + Vite
- **Backend**: PHP 8 + PDO (MySQL/MariaDB)
- **3D**: Three.js
- **Окружение**: XAMPP (локальная разработка)

## Функциональность

- Каталог книг с 3D-обложками и встроенным ридером
- Регистрация / вход / профиль пользователя
- Полка пользователя: «Избранное», «Прочитано», «Хочу прочитать»
- Карта библиотек, встречи клуба, цитаты
- Анимированные частицы, кастомный курсор, reveal-анимации
- Мультиязычность (i18n)

## Быстрый старт

### Требования

- [XAMPP](https://www.apachefriends.org/) (PHP 8.x + MySQL)
- [Node.js](https://nodejs.org/) 18+

### Установка

```bash
# 1. Клонировать репозиторий в папку htdocs
git clone <repo-url> D:/xampp/htdocs/bookclub
cd D:/xampp/htdocs/bookclub

# 2. Установить зависимости
npm install

# 3. Настроить базу данных
#    Скопировать конфиг и заполнить своими данными
cp backend/config.example.php backend/config.php

# 4. Создать базу данных в phpMyAdmin или через CLI:
#    mysql -u root -p < backend/database.sql

# 5. Запустить фронтенд (Vite dev-сервер)
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173).

Бэкенд работает через Apache — убедитесь, что XAMPP запущен и папка проекта находится в `htdocs/bookclub`.

### Продакшн-сборка

```bash
npm run build
# Артефакты в папке dist/
```

## Структура проекта

```
bookclub/
├── src/
│   ├── components/     # Vue-компоненты
│   ├── composables/    # Логика (auth, reader, shelf, i18n, ...)
│   └── data/           # Статические данные (книги, цитаты, библиотеки)
├── backend/            # PHP API
│   ├── config.example.php  # Шаблон конфига БД
│   ├── database.sql        # Схема БД
│   └── *.php               # Эндпоинты
├── public/             # Статика
└── index.html
```

## Переменные окружения

Фронтенд принимает переменные через `.env`-файл (Vite):

| Переменная       | По умолчанию                          | Описание              |
|------------------|---------------------------------------|-----------------------|
| `VITE_API_BASE`  | `http://localhost/bookclub/backend`   | URL PHP-бэкенда       |

Создайте `.env.local` чтобы переопределить значения локально (файл уже в `.gitignore`).
