<?php
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');
require '../db.php';
require '../jwt_utils.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit;
}

// Production security settings
$isProduction = (defined('ENVIRONMENT') && ENVIRONMENT === 'production') || 
                (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'production') || 
                (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on');

// Use reliable TCP connection IP to prevent X-Forwarded-For header spoofing
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

try {
    // ----------------------------------------------------
    // Rate Limiting & Brute-Force Protection
    // ----------------------------------------------------
    // Clean up attempts older than 15 minutes
    $conn->exec("DELETE FROM cims_login_attempts WHERE attempt_time < (NOW() - INTERVAL 15 MINUTE)");

    $maxAttemptsPerEmail = 5;
    $maxAttemptsPerIp = 15;

    // Check failed attempts in the last 15 minutes
    $rateStmt = $conn->prepare("
        SELECT 
            SUM(CASE WHEN ip_address = ? THEN 1 ELSE 0 END) as ip_attempts,
            SUM(CASE WHEN email = ? THEN 1 ELSE 0 END) as email_attempts,
            TIMESTAMPDIFF(SECOND, NOW(), MIN(attempt_time) + INTERVAL 15 MINUTE) as remaining_seconds
        FROM cims_login_attempts 
        WHERE attempt_time > (NOW() - INTERVAL 15 MINUTE)
    ");
    $rateStmt->execute([$clientIp, $email]);
    $attemptCounts = $rateStmt->fetch(PDO::FETCH_ASSOC);

    $currentEmailAttempts = (int)($attemptCounts['email_attempts'] ?? 0);
    $currentIpAttempts = (int)($attemptCounts['ip_attempts'] ?? 0);
    $remainingSeconds = max(1, (int)($attemptCounts['remaining_seconds'] ?? 900));

    if ($currentEmailAttempts >= $maxAttemptsPerEmail || $currentIpAttempts >= $maxAttemptsPerIp) {
        http_response_code(429);
        echo json_encode([
            "status" => "error", 
            "locked" => true,
            "retry_after" => $remainingSeconds,
            "message" => "Too many failed login attempts. Account temporarily locked. Please try again after 15 minutes."
        ]);
        exit;
    }

    $stmt = $conn->prepare("
        SELECT u.id, u.full_name, u.email, u.password_hashed, u.designation, u.department, u.profile_photo, u.role_id, r.role_name 
        FROM cims_users u 
        LEFT JOIN cims_roles r ON u.role_id = r.id 
        WHERE u.email = ? AND u.is_active = 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hashed'])) {
        // Clear failed login attempts for this user and IP on successful login
        $clearAttempts = $conn->prepare("DELETE FROM cims_login_attempts WHERE email = ? OR ip_address = ?");
        $clearAttempts->execute([$email, $clientIp]);

        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details, ip_address) VALUES (?, 'Login', 'Authentication', ?, ?)");
        $logStmt->execute([
            $user['id'], 
            json_encode(['ip' => $clientIp, 'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '']),
            $clientIp
        ]);
        
        // Update last_login timestamp
        $updateStmt = $conn->prepare("UPDATE cims_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        unset($user['password_hashed']);
        
        // Fetch permissions for this role
        $permStmt = $conn->prepare("SELECT module_name, can_view, can_add, can_edit, can_delete, can_approve, can_export, scope FROM cims_permissions WHERE role_id = ?");
        $permStmt->execute([$user['role_id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Generate JWT Token
        $payload = [
            'user_id' => $user['id'],
            'role_id' => $user['role_id'],
            'iat' => time(),
            'exp' => time() + (3 * 60 * 60) // 3 hours expiration
        ];
        $jwt = generate_jwt($payload);
        
        // Set HTTP-only cookie for authentication (Secure=true in production/HTTPS, SameSite=Lax)
        if (PHP_VERSION_ID >= 70300) {
            setcookie("auth_token", $jwt, [
                'expires' => time() + (3 * 60 * 60),
                'path' => '/',
                'domain' => '',
                'secure' => $isProduction,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
        } else {
            setcookie("auth_token", $jwt, time() + (3 * 60 * 60), "/", "", $isProduction, true);
        }
        
        echo json_encode([
            "status" => "success", 
            "message" => "Login successful", 
            "token" => $jwt,
            "data" => $user
        ]);
    } else {
        // Record failed attempt
        $recordStmt = $conn->prepare("INSERT INTO cims_login_attempts (ip_address, email) VALUES (?, ?)");
        $recordStmt->execute([$clientIp, $email]);

        $newFailedCount = $currentEmailAttempts + 1;
        $remainingAttempts = max(0, $maxAttemptsPerEmail - $newFailedCount);

        if ($remainingAttempts <= 0) {
            http_response_code(429);
            $msg = "Too many failed login attempts. Account temporarily locked. Please try again after 15 minutes.";
            echo json_encode([
                "status" => "error", 
                "locked" => true,
                "retry_after" => 900,
                "message" => $msg
            ]);
        } else {
            http_response_code(401);
            $msg = "Invalid email or password";
            echo json_encode([
                "status" => "error", 
                "locked" => false,
                "remaining_attempts" => $remainingAttempts,
                "message" => $msg
            ]);
        }
    }
} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    http_response_code(500);
    if (defined('ENVIRONMENT') && ENVIRONMENT === 'development') {
        echo json_encode(["status" => "error", "message" => "Login failed: " . $e->getMessage()]);
    } else {
        echo json_encode(["status" => "error", "message" => "An internal server error occurred during login. Please try again later."]);
    }
}
?>
