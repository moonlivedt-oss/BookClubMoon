<?php
require_once __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);

$in = json_input();

$username = trim($in['username'] ?? '');
$email    = trim($in['email']    ?? '');
$password = (string)($in['password'] ?? '');

// --- Валидация ----------------------------------------------------
if (mb_strlen($username) < 3 || mb_strlen($username) > 50) {
    fail('Имя пользователя: от 3 до 50 символов');
}
if (!preg_match('/^[A-Za-zА-Яа-яЁё0-9_\- ]+$/u', $username)) {
    fail('Имя пользователя содержит недопустимые символы');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Некорректный e-mail');
}
if (strlen($password) < 6) {
    fail('Пароль: минимум 6 символов');
}

try {
    $pdo  = db();

    // Проверка уникальности
    $st = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
    $st->execute([$username, $email]);
    if ($st->fetch()) fail('Пользователь с таким именем или e-mail уже существует', 409);

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $st = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    $st->execute([$username, $email, $hash]);

    $id = (int) $pdo->lastInsertId();
    $_SESSION['user_id'] = $id;

    ok([
        'user' => [
            'id'             => $id,
            'username'       => $username,
            'email'          => $email,
            'full_name'      => null,
            'bio'            => null,
            'favorite_genre' => null,
            'avatar_url'     => null,
            'avatar_path'    => null,
        ],
    ]);
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
