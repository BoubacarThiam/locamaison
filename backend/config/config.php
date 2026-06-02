<?php
// ── Base de données ──────────────────────────────────────────────
define('DB_HOST',    'localhost');
define('DB_NAME',    'locamaison');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');

// ── JWT ───────────────────────────────────────────────────────────
define('JWT_SECRET', 'locamaison_sn_jwt_s3cr3t_!@#2024');
define('JWT_EXPIRY', 86400 * 7);   // 7 jours

// ── Upload ────────────────────────────────────────────────────────
define('UPLOAD_DIR',      __DIR__ . '/../uploads/');
define('UPLOAD_URL',      '/uploads/');
define('MAX_FILE_SIZE',   5 * 1024 * 1024);   // 5 MB
define('ALLOWED_MIME',    ['image/jpeg','image/png','image/webp']);

// ── Paiement Wave CI ──────────────────────────────────────────────
define('WAVE_API_KEY',        getenv('WAVE_API_KEY')        ?: 'wave_sn_test_key');
define('WAVE_API_URL',        'https://api.wave.com/v1');
define('WAVE_WEBHOOK_SECRET', getenv('WAVE_WEBHOOK_SECRET') ?: 'wave_webhook_secret');

// ── Paiement Orange Money ─────────────────────────────────────────
define('OM_CLIENT_ID',     getenv('OM_CLIENT_ID')     ?: 'om_client_id');
define('OM_CLIENT_SECRET', getenv('OM_CLIENT_SECRET') ?: 'om_client_secret');
define('OM_API_URL',       'https://api.orange.com/orange-money-webpay/sn/v1');

// ── URLs ──────────────────────────────────────────────────────────
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:3000');
define('BACKEND_URL',  getenv('BACKEND_URL')  ?: 'http://localhost/locamaison/backend');

// ── Environnement ─────────────────────────────────────────────────
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('DEBUG',   APP_ENV === 'development');
