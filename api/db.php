<?php
// Autoload Composer dependencies (vlucas/phpdotenv, phpmailer, etc.)
require_once __DIR__ . '/vendor/autoload.php';

// Initialize and load environment variables safely using phpdotenv
$possibleEnvPaths = [
    __DIR__,                    // /api/.env
    dirname(__DIR__),           // /root/.env
    dirname(dirname(__DIR__)),  // parent directory
];

foreach ($possibleEnvPaths as $path) {
    $envFile = $path . '/.env';
    if (file_exists($envFile)) {
        // Try Dotenv if available
        if (class_exists('Dotenv\Dotenv')) {
            try {
                $dotenv = Dotenv\Dotenv::createImmutable($path);
                $dotenv->safeLoad();
            } catch (\Throwable $e) {
                error_log("Dotenv load error in $path: " . $e->getMessage());
            }
        }
        // Direct parse fallback to guarantee values are populated in $_ENV and getenv
        if ($lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)) {
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line && strpos($line, '#') !== 0 && strpos($line, '=') !== false) {
                    list($key, $val) = explode('=', $line, 2);
                    $key = trim($key);
                    $val = trim(trim($val), '"\'');
                    if (!isset($_ENV[$key]) || $_ENV[$key] === '') {
                        $_ENV[$key] = $val;
                    }
                    if (!isset($_SERVER[$key]) || $_SERVER[$key] === '') {
                        $_SERVER[$key] = $val;
                    }
                    putenv("$key=$val");
                }
            }
        }
    }
}

// Helper to get env variable from $_ENV, $_SERVER, or getenv()
function get_env_val($key, $default = null) {
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;
    return $default;
}

// Set environment mode
define('ENVIRONMENT', get_env_val('APP_ENV', 'production'));

// 1. Log all errors securely
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// 2. Hide or show errors based on environment
if (ENVIRONMENT === 'development') {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(E_ALL);
}

// 3. Global Exception Handler
set_exception_handler(function($e) {
    http_response_code(500);
    error_log("Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    if (ENVIRONMENT === 'development') {
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine(),
            "trace" => $e->getTraceAsString()
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "An internal server error occurred. Please contact support."
        ]);
    }
    exit;
});

// 4. Convert specific PHP errors into Catchable Exceptions
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return; 
    }
    if (in_array($severity, [E_USER_ERROR, E_RECOVERABLE_ERROR])) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    }
    error_log("PHP Error [$severity]: $message in $file on line $line");
    return true;
});

// 5. Fatal Error Handler
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        error_log("Fatal Error: " . $error['message'] . " in " . $error['file'] . " on line " . $error['line']);
        
        if (ENVIRONMENT === 'development') {
            echo json_encode([
                "status" => "error",
                "message" => "Fatal Error: " . $error['message'],
                "file" => $error['file'],
                "line" => $error['line']
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "A critical internal server error occurred."
            ]);
        }
    }
});

// Database credentials loaded via $_ENV, $_SERVER, or getenv
$host = get_env_val('DB_HOST');
$dbname = get_env_val('DB_NAME');
$username = get_env_val('DB_USER');
$password = get_env_val('DB_PASSWORD', '');

if (!$host || !$dbname || !$username) {
    error_log("CRITICAL ERROR: Missing Database Configuration. Host: " . ($host ? 'OK' : 'MISSING') . ", DB: " . ($dbname ? 'OK' : 'MISSING') . ", User: " . ($username ? 'OK' : 'MISSING'));
    $missingKeys = [];
    if (!$host) $missingKeys[] = 'DB_HOST';
    if (!$dbname) $missingKeys[] = 'DB_NAME';
    if (!$username) $missingKeys[] = 'DB_USER';

    die(json_encode([
        "status" => "error", 
        "message" => "Database configuration error. Missing parameters: " . implode(', ', $missingKeys) . ". Please check .env file at /dev/cims/api/.env or /dev/cims/.env"
    ]));
}

date_default_timezone_set('Asia/Kolkata');

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Explicitly set fetch mode to associative array globally
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Align MySQL session timezone with PHP's Asia/Kolkata (+05:30)
    try {
        $conn->exec("SET time_zone = '+05:30'");
    } catch (\Throwable $tzErr) {
        // Fallback or ignore if MySQL timezone tables are not configured
    }
} catch (PDOException $e) {
    error_log("Database Connection Failed: " . $e->getMessage());
    if (ENVIRONMENT === 'development') {
        die(json_encode(["status" => "error", "message" => "Connection Failed: " . $e->getMessage()]));
    } else {
        die(json_encode(["status" => "error", "message" => "Database connection failed. Please try again later."]));
    }
}
