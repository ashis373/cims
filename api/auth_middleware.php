<?php
if (session_status() === PHP_SESSION_NONE) {
    // Basic session config for cookies
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: No active session"]);
    exit;
}

// 3-hour inactivity timeout logic (3 * 60 * 60 = 10800 seconds)
$timeout_duration = 10800;

if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY']) > $timeout_duration) {
    // Session expired
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Session expired"]);
    exit;
}

// Update last activity time stamp
$_SESSION['LAST_ACTIVITY'] = time();
?>
