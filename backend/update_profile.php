<?php
require_once __DIR__ . '/_common.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('Метод не разрешён', 405);
$uid = require_login();

$in = json_input();
$full_name      = isset($in['full_name'])      ? trim((string)$in['full_name'])      : null;
$bio            = isset($in['bio'])            ? trim((string)$in['bio'])            : null;
$favorite_genre = isset($in['favorite_genre']) ? trim((string)$in['favorite_genre']) : null;
$avatar_url     = isset($in['avatar_url'])     ? trim((string)$in['avatar_url'])     : null;

if ($full_name !== null && mb_strlen($full_name) > 120) fail('Имя слишком длинное');
if ($bio !== null && mb_strlen($bio) > 1000)            fail('Био слишком длинное (макс. 1000 символов)');
if ($favorite_genre !== null && mb_strlen($favorite_genre) > 60) fail('Жанр слишком длинный');
if ($avatar_url !== null && mb_strlen($avatar_url) > 255) fail('Слишком длинная ссылка на аватар');

try {
    $st = db()->prepare(
        'UPDATE users
            SET full_name      = ?,
                bio            = ?,
                favorite_genre = ?,
                avatar_url     = ?
          WHERE id = ?'
    );
    $st->execute([
        $full_name ?: null,
        $bio ?: null,
        $favorite_genre ?: null,
        $avatar_url ?: null,
        $uid,
    ]);

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
