<?php
require_once __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);

$in = json_input();
$login    = trim($in['login']    ?? ''); // имя пользователя или e-mail
$password = (string)($in['password'] ?? '');

if ($login === '' || $password === '') fail('Введите логин и пароль');

try {
    $st = db()->prepare(
        'SELECT id, username, email, password_hash, full_name, bio, favorite_genre, avatar_url, avatar_path
           FROM users WHERE username = ? OR email = ? LIMIT 1'
    );
    $st->execute([$login, $login]);
    $row = $st->fetch();

    if (!$row || !password_verify($password, $row['password_hash'])) {
        fail('Неверный логин или пароль', 401);
    }

    $_SESSION['user_id'] = (int) $row['id'];
    unset($row['password_hash']);
    $row['id'] = (int) $row['id'];

    ok(['user' => $row]);
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
