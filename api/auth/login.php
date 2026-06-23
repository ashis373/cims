<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require '../db.php';

if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT u.id, u.full_name, u.email, u.password_hashed, u.designation, u.department, u.profile_photo, u.role_id, r.role_name 
        FROM system_users u 
        LEFT JOIN system_roles r ON u.role_id = r.id 
        WHERE u.email = ? AND u.is_active = 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hashed'])) {
        // Prevent session fixation
        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['LAST_ACTIVITY'] = time();
        
        $logStmt = $conn->prepare("INSERT INTO system_audit_logs (user_id, action, module, details) VALUES (?, 'Login', 'Authentication', ?)");
        $logStmt->execute([$user['id'], json_encode(['ip' => $_SERVER['REMOTE_ADDR'] ?? ''])]);
        
        unset($user['password_hashed']);
        
        // Fetch permissions for this role
        $permStmt = $conn->prepare("SELECT module_name, can_view, can_add, can_edit, can_delete FROM system_permissions WHERE role_id = ?");
        $permStmt->execute([$user['role_id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "status" => "success", 
            "message" => "Login successful", 
            "data" => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
