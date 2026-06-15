<?php
/**
 * Общие утилиты: CORS, чтение JSON, сессии, единый ответ.
 * Подключается в каждом эндпоинте первой строкой.
 */

// --- CORS (для dev: Vite на 5173, прод обычно на одном домене) ----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost',
    'http://127.0.0.1',
];
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- Сессии (используем PHPSESSID-cookie для авторизации) ---------
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 7, // неделя
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

require_once __DIR__ . '/config.php';

// --- Утилиты ответа ----------------------------------------------
function json_input(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond(array $payload, int $code = 200): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $code = 400): void {
    respond(['ok' => false, 'error' => $message], $code);
}

function ok(array $data = []): void {
    respond(array_merge(['ok' => true], $data));
}

function require_login(): int {
    if (empty($_SESSION['user_id'])) fail('Не авторизован', 401);
    return (int) $_SESSION['user_id'];
}
