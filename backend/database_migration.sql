-- ============================================================
--  Миграция «всё-что-нужно» — безопасно запускать многократно.
--  Скопируй ВЕСЬ файл в phpMyAdmin → SQL → Вперёд.
-- ============================================================

USE bookclub;

-- ── 1. Добавляем avatar_path, если ещё нет ───────────────────
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'bookclub'
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'avatar_path'
);
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN avatar_path VARCHAR(255) DEFAULT NULL AFTER avatar_url',
  'SELECT "avatar_path уже существует" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── 2. Создаём таблицу user_books, если ещё нет ──────────────
CREATE TABLE IF NOT EXISTS user_books (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED NOT NULL,
  isbn         VARCHAR(32)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  author       VARCHAR(255) DEFAULT NULL,
  cover_css    VARCHAR(255) DEFAULT NULL,
  status       ENUM('favorite','read','want') NOT NULL,
  added_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_user_book_status (user_id, isbn, status),
  KEY idx_user_status (user_id, status),
  CONSTRAINT fk_user_books_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Готово ───────────────────────────────────────────────────
SELECT 'Миграция завершена ✓' AS status;
