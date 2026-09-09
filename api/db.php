<?php
// Autoload Composer dependencies (vlucas/phpdotenv, phpmailer, etc.)
require_once __DIR__ . '/vendor/autoload.php';

// Initialize and load environment variables safely using phpdotenv
$dotenvPath = dirname(__DIR__);
if (file_exists($dotenvPath . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($dotenvPath);
    $dotenv->safeLoad();
    // Validate required environment variables in production
    $dotenv->required(['DB_HOST', 'DB_NAME', 'DB_USER']);
}

// Set environment mode from .env or default to production for security
define('ENVIRONMENT', $_ENV['APP_ENV'] ?? 'production');

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

// 3. Global Exception Handler (Always returns JSON instead of breaking the frontend)
set_exception_handler(function($e) {
    http_response_code(500);
    
    // Always log the full detailed error securely on the server
    error_log("Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    
    if (ENVIRONMENT === 'development') {
        // Safe for dev: Show full trace in the browser
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine(),
            "trace" => $e->getTraceAsString()
        ]);
    } else {
        // Safe for prod: Hide sensitive paths/SQL details from browser
        echo json_encode([
            "status" => "error",
            "message" => "An internal server error occurred. Please contact support."
        ]);
    }
    exit;
});

// 4. Convert specific PHP errors into Catchable Exceptions (ignore warnings/notices)
set_error_handler(function($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
        return; 
    }
    
    // Only throw exceptions for actual errors, log everything else
    if (in_array($severity, [E_USER_ERROR, E_RECOVERABLE_ERROR])) {
        throw new ErrorException($message, 0, $severity, $file, $line);
    }
    
    // For warnings/notices, just log them and continue execution
    error_log("PHP Error [$severity]: $message in $file on line $line");
    return true; // prevent default PHP error handler
});

// 5. Fatal Error Handler (Catches memory exhaustion, parse errors, etc.)
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

// Database credentials loaded via $_ENV without hardcoded fallback credentials
$host = $_ENV['DB_HOST'] ?? null;
$dbname = $_ENV['DB_NAME'] ?? null;
$username = $_ENV['DB_USER'] ?? null;
$password = $_ENV['DB_PASSWORD'] ?? '';

if (!$host || !$dbname || !$username) {
    error_log("CRITICAL ERROR: Missing Database Configuration in .env");
    if (ENVIRONMENT === 'development') {
        die(json_encode(["status" => "error", "message" => "CRITICAL ERROR: Missing Database Configuration in .env"]));
    } else {
        die(json_encode(["status" => "error", "message" => "Database configuration error. Please contact support."]));
    }
}

date_default_timezone_set('Asia/Kolkata');

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Explicitly set fetch mode to associative array globally
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Database Connection Failed: " . $e->getMessage());
    if (ENVIRONMENT === 'development') {
        die(json_encode(["status" => "error", "message" => "Connection Failed: " . $e->getMessage()]));
    } else {
        die(json_encode(["status" => "error", "message" => "Database connection failed. Please try again later."]));
    }
}
