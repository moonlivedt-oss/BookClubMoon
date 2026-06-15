<?php
require_once __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);
$uid = require_login();

$in           = json_input();
$password     = (string)($in['password']     ?? '');
$confirm_name = trim((string)($in['confirm_username'] ?? ''));

if ($password === '') fail('Подтвердите паролем');

try {
    $st = db()->prepare('SELECT username, password_hash FROM users WHERE id = ?');
    $st->execute([$uid]);
    $row = $st->fetch();

    if (!$row || !password_verify($password, $row['password_hash'])) {
        fail('Неверный пароль', 401);
    }
    if ($confirm_name !== $row['username']) {
        fail('Имя пользователя для подтверждения не совпадает');
    }

    // Удаляем файл аватара (если есть)
    $dir = __DIR__ . '/uploads/avatars';
    foreach (glob($dir . "/{$uid}.*") as $old) @unlink($old);

    // FOREIGN KEY ... ON DELETE CASCADE автоматически удалит user_books
    $st = db()->prepare('DELETE FROM users WHERE id = ?');
    $st->execute([$uid]);

    // Завершаем сессию
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'] ?? '', $p['secure'] ?? false, $p['httponly'] ?? true);
    }
    session_destroy();

    ok();
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
