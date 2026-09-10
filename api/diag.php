<?php
header('Content-Type: application/json');

$results = [
    'php_version' => PHP_VERSION,
    'current_dir' => __DIR__,
    'parent_dir' => dirname(__DIR__),
    'vendor_autoload_exists' => file_exists(__DIR__ . '/vendor/autoload.php'),
    'env_in_current_dir' => file_exists(__DIR__ . '/.env'),
    'env_in_parent_dir' => file_exists(dirname(__DIR__) . '/.env'),
    'pdo_mysql_installed' => extension_loaded('pdo_mysql'),
    'loaded_extensions' => [
        'pdo' => extension_loaded('pdo'),
        'pdo_mysql' => extension_loaded('pdo_mysql'),
        'openssl' => extension_loaded('openssl'),
        'json' => extension_loaded('json')
    ]
];

// Check if dotenv can load
if ($results['vendor_autoload_exists']) {
    require_once __DIR__ . '/vendor/autoload.php';
    if ($results['env_in_current_dir']) {
        try {
            $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
            $dotenv->safeLoad();
            $results['dotenv_loaded_from_current'] = true;
        } catch (\Throwable $e) {
            $results['dotenv_loaded_from_current_error'] = $e->getMessage();
        }
    }
}

// Read raw .env directly if file exists
if ($results['env_in_current_dir']) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $results['api_env_keys_found'] = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line && strpos($line, '#') !== 0 && strpos($line, '=') !== false) {
            list($k, $v) = explode('=', $line, 2);
            $results['api_env_keys_found'][] = trim($k);
        }
    }
}

// Check environment variables
function test_get_env($key) {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return 'FOUND in $_ENV';
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return 'FOUND in $_SERVER';
    $val = getenv($key);
    if ($val !== false && $val !== '') return 'FOUND in getenv()';
    return 'MISSING';
}

$results['env_vars_status'] = [
    'APP_ENV' => test_get_env('APP_ENV'),
    'DB_HOST' => test_get_env('DB_HOST'),
    'DB_NAME' => test_get_env('DB_NAME'),
    'DB_USER' => test_get_env('DB_USER'),
    'DB_PASSWORD' => test_get_env('DB_PASSWORD'),
    'JWT_SECRET' => test_get_env('JWT_SECRET'),
];

// Try testing direct PDO connection if variables found
$host = $_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? getenv('DB_HOST') ?: null;
$dbname = $_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? getenv('DB_NAME') ?: null;
$user = $_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? getenv('DB_USER') ?: null;
$pass = $_ENV['DB_PASSWORD'] ?? $_SERVER['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';

if ($host && $dbname && $user) {
    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $results['database_connection_test'] = 'SUCCESS: Connected to ' . $dbname . ' on ' . $host;
    } catch (\PDOException $e) {
        $results['database_connection_test'] = 'FAILED: ' . $e->getMessage();
    }
} else {
    $results['database_connection_test'] = 'SKIPPED: Missing host, dbname, or user in environment';
}

echo json_encode($results, JSON_PRETTY_PRINT);
