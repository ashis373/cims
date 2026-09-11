<?php
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');
require '../db.php';

$email = trim($_GET['email'] ?? '');
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email is required"]);
    exit;
}

try {
    // 1. Clean up attempts older than 15 minutes
    $conn->exec("DELETE FROM cims_login_attempts WHERE attempt_time < (NOW() - INTERVAL 15 MINUTE)");

    $maxAttemptsPerEmail = 5;
    $maxAttemptsPerIp = 15;

    // 2. Query active attempts in database
    $stmt = $conn->prepare("
        SELECT 
            SUM(CASE WHEN email = ? THEN 1 ELSE 0 END) as email_attempts,
            SUM(CASE WHEN ip_address = ? THEN 1 ELSE 0 END) as ip_attempts,
            TIMESTAMPDIFF(SECOND, NOW(), MIN(attempt_time) + INTERVAL 15 MINUTE) as remaining_seconds
        FROM cims_login_attempts 
        WHERE attempt_time > (NOW() - INTERVAL 15 MINUTE)
    ");
    $stmt->execute([$email, $clientIp]);
    $res = $stmt->fetch(PDO::FETCH_ASSOC);

    $emailAttempts = (int)($res['email_attempts'] ?? 0);
    $ipAttempts = (int)($res['ip_attempts'] ?? 0);
    $remainingSeconds = max(0, (int)($res['remaining_seconds'] ?? 0));

    $isLocked = ($emailAttempts >= $maxAttemptsPerEmail || $ipAttempts >= $maxAttemptsPerIp);
    $remainingAttempts = max(0, $maxAttemptsPerEmail - $emailAttempts);

    // Also check if user exists and is active in database
    $userStmt = $conn->prepare("SELECT id, is_active FROM cims_users WHERE email = ?");
    $userStmt->execute([$email]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    $isDeactivated = ($user && (int)$user['is_active'] === 0);

    echo json_encode([
        "status" => "success",
        "email" => $email,
        "is_locked" => $isLocked,
        "is_deactivated" => $isDeactivated,
        "failed_attempts" => $emailAttempts,
        "remaining_attempts" => $remainingAttempts,
        "retry_after" => $isLocked ? $remainingSeconds : 0
    ]);
} catch (\Throwable $e) {
    error_log("Check Lockout Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database check failed"]);
}
