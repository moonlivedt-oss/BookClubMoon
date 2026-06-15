<?php
require_once __DIR__ . '/_common.php';

if (empty($_SESSION['user_id'])) ok(['user' => null]);

try {
    $st = db()->prepare(
        'SELECT id, username, email, full_name, bio, favorite_genre, avatar_url, avatar_path, created_at
           FROM users WHERE id = ? LIMIT 1'
    );
    $st->execute([$_SESSION['user_id']]);
    $row = $st->fetch();

    if (!$row) {
        // На всякий случай — пользователь удалён, чистим сессию
        session_destroy();
        ok(['user' => null]);
    }
    $row['id'] = (int) $row['id'];
    ok(['user' => $row]);
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
