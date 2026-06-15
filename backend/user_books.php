<?php
require_once __DIR__ . '/_common.php';

/**
 * Маршруты для книг пользователя.
 *   GET  user_books.php                 — все книги текущего пользователя
 *   POST user_books.php  {action:'add',    isbn, title, author?, cover_css?, status}
 *   POST user_books.php  {action:'remove', isbn, status}
 *
 * status ∈ {favorite, read, want}
 */

$uid    = require_login();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$VALID_STATUSES = ['favorite', 'read', 'want'];

// --- GET: список ---------------------------------------------------
if ($method === 'GET') {
    try {
        $st = db()->prepare(
            'SELECT id, isbn, title, author, cover_css, status, added_at
               FROM user_books WHERE user_id = ?
              ORDER BY added_at DESC'
        );
        $st->execute([$uid]);
        $rows = $st->fetchAll();

        // Группируем по статусу для удобства фронта
        $grouped = ['favorite' => [], 'read' => [], 'want' => []];
        foreach ($rows as $r) {
            $r['id'] = (int) $r['id'];
            $grouped[$r['status']][] = $r;
        }
        ok(['books' => $grouped]);
    } catch (PDOException $e) {
        fail('Ошибка базы данных: ' . $e->getMessage(), 500);
    }
}

// --- POST: добавить или удалить -----------------------------------
if ($method === 'POST') {
    $in     = json_input();
    $action = $in['action'] ?? '';
    $isbn   = trim((string)($in['isbn'] ?? ''));
    $status = $in['status'] ?? '';

    if (!in_array($status, $VALID_STATUSES, true)) fail('Неверный статус');
    if ($isbn === '' || mb_strlen($isbn) > 32)     fail('Неверный ISBN');

    try {
        if ($action === 'add') {
            $title     = trim((string)($in['title']     ?? ''));
            $author    = trim((string)($in['author']    ?? ''));
            $cover_css = trim((string)($in['cover_css'] ?? ''));
            if ($title === '') fail('Не указано название книги');
            if (mb_strlen($title)  > 255) fail('Название слишком длинное');
            if (mb_strlen($author) > 255) fail('Автор слишком длинный');
            if (mb_strlen($cover_css) > 255) fail('cover_css слишком длинный');

            // INSERT IGNORE — если уже есть пара (user, isbn, status), просто игнорируем
            $st = db()->prepare(
                'INSERT IGNORE INTO user_books (user_id, isbn, title, author, cover_css, status)
                                       VALUES (?, ?, ?, ?, ?, ?)'
            );
            $st->execute([$uid, $isbn, $title, $author ?: null, $cover_css ?: null, $status]);
            ok(['added' => $st->rowCount() > 0]);
        }
        elseif ($action === 'remove') {
            $st = db()->prepare(
                'DELETE FROM user_books WHERE user_id = ? AND isbn = ? AND status = ?'
            );
            $st->execute([$uid, $isbn, $status]);
            ok(['removed' => $st->rowCount() > 0]);
        }
        else {
            fail('Неизвестное действие');
        }
    } catch (PDOException $e) {
        fail('Ошибка базы данных: ' . $e->getMessage(), 500);
    }
}

fail('Метод не разрешён', 405);
