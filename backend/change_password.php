<?php
require_once __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);
$uid = require_login();

$in           = json_input();
$current_pass = (string)($in['current_password'] ?? '');
$new_pass     = (string)($in['new_password'] ?? '');

if ($current_pass === '' || $new_pass === '') fail('Введите текущий и новый пароли');
if (strlen($new_pass) < 6) fail('Новый пароль: минимум 6 символов');

try {
    $st = db()->prepare('SELECT password_hash FROM users WHERE id = ?');
    $st->execute([$uid]);
    $row = $st->fetch();

    if (!$row || !password_verify($current_pass, $row['password_hash'])) {
        fail('Неверный текущий пароль', 401);
    }

    $hash = password_hash($new_pass, PASSWORD_BCRYPT);
    $st = db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $st->execute([$hash, $uid]);

    ok();
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
