<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once '../db.php';

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
            // Ignore if it's already revoked or DB error
        }
    }
}

// Delete the JWT auth token cookie
setcookie("auth_token", "", time() - 3600, "/", "", false, true);

// If using any legacy sessions, destroy them
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$_SESSION = array();
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}
session_destroy();

echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
?>
