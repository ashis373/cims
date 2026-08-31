<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once '../auth_middleware.php';
require_once '../db.php';

$user_id = $_SESSION['user_id'];

try {
    $stmt = $conn->prepare("
        SELECT u.id, u.full_name, u.email, u.designation, u.department, u.profile_photo, u.role_id, r.role_name 
        FROM cims_users u 
        LEFT JOIN cims_roles r ON u.role_id = r.id 
        WHERE u.id = ? AND u.is_active = 1 
    ");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $permStmt = $conn->prepare("SELECT module_name, can_view, can_add, can_edit, can_delete, can_approve, can_export, scope FROM cims_permissions WHERE role_id = ?");
        $permStmt->execute([$user['role_id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $user]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "User not found or inactive"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error"]);
}
?>
