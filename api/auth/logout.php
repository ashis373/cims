<?php
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');
require_once '../db.php';

$isProduction = (defined('ENVIRONMENT') && ENVIRONMENT === 'production') || 
                (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production') || 
                (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');

// Try to get token from Authorization header or cookie
$jwt = null;
$headers = array_change_key_case(getallheaders(), CASE_LOWER);
if (isset($headers['authorization']) && strpos($headers['authorization'], 'Bearer ') === 0) {
    $jwt = substr($headers['authorization'], 7);
} elseif (isset($_COOKIE['auth_token'])) {
    $jwt = $_COOKIE['auth_token'];
}

// Add token signature to revoked tokens table
if ($jwt) {
    $parts = explode('.', $jwt);
    if (count($parts) === 3) {
        $signature = $parts[2];
        try {
            $stmt = $conn->prepare("INSERT IGNORE INTO cims_revoked_tokens (token_signature) VALUES (?)");
            $stmt->execute([$signature]);
        } catch (Exception $e) {
            // Log the error instead of silently ignoring it
            error_log("Logout Error - Failed to revoke token signature: " . $e->getMessage());
        }
    }
}

// Delete the JWT auth token cookie (matching domain, path, and secure settings)
if (PHP_VERSION_ID >= 70300) {
    setcookie("auth_token", "", [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => $isProduction,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
} else {
    setcookie("auth_token", "", time() - 3600, "/", "", $isProduction, true);
}

// If using any legacy sessions, destroy them
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    if (PHP_VERSION_ID >= 70300) {
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params["path"],
            'domain' => $params["domain"],
            'secure' => $isProduction || $params["secure"],
            'httponly' => $params["httponly"],
            'samesite' => $params["samesite"] ?? 'Lax'
        ]);
    } else {
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $isProduction || $params["secure"], $params["httponly"]
        );
    }
}
session_destroy();

echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
?>
