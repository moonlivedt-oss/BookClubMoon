<?php
require_once __DIR__ . '/_common.php';

/**
 * Загрузка файла аватара.
 *   POST  upload_avatar.php   multipart/form-data, поле "avatar"
 * Возвращает обновлённого пользователя.
 *
 * Файлы складываются в backend/uploads/avatars/{user_id}.{ext}
 * и доступны по URL: http://localhost/bookclub/backend/uploads/avatars/{user_id}.{ext}
 */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);
$uid = require_login();

if (empty($_FILES['avatar']) || ($_FILES['avatar']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    fail('Файл не загружен');
}

$file = $_FILES['avatar'];
$max  = 2 * 1024 * 1024; // 2 МБ
if ($file['size'] > $max) fail('Файл слишком большой (макс. 2 МБ)');

// Проверка реального типа файла, а не расширения
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime  = $finfo->file($file['tmp_name']);

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
];
if (!isset($allowed[$mime])) fail('Допустимы только JPEG, PNG, WebP или GIF');

$ext = $allowed[$mime];

// Папка для аватаров
$dir = __DIR__ . '/uploads/avatars';
if (!is_dir($dir)) {
    if (!mkdir($dir, 0775, true) && !is_dir($dir)) {
        fail('Не удалось создать папку для аватаров', 500);
    }
}

// Удаляем старые файлы пользователя (любого расширения)
foreach (glob($dir . "/{$uid}.*") as $old) @unlink($old);

$filename = $uid . '.' . $ext;
$dest     = $dir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    fail('Не удалось сохранить файл', 500);
}

// Относительный путь для отдачи браузеру (cache-buster через mtime)
$relPath = 'uploads/avatars/' . $filename . '?v=' . time();

try {
    $st = db()->prepare('UPDATE users SET avatar_path = ? WHERE id = ?');
    $st->execute([$relPath, $uid]);

    $st = db()->prepare(
        'SELECT id, username, email, full_name, bio, favorite_genre, avatar_url, avatar_path, created_at
           FROM users WHERE id = ?'
    );
    $st->execute([$uid]);
    $row = $st->fetch();
    $row['id'] = (int) $row['id'];

    ok(['user' => $row]);
} catch (PDOException $e) {
    fail('Ошибка базы данных: ' . $e->getMessage(), 500);
}
