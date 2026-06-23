<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

header('Content-Type: application/json');
require '../db.php';
$allowed_roles = ['Administrator'];
require_once '../auth_middleware.php';
if (session_status() === PHP_SESSION_NONE) { session_start(); }

$method = $_SERVER['REQUEST_METHOD'];
$role_id = $_GET['role_id'] ?? null;

try {
    if ($method === 'GET') {
        if (!$role_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "role_id required"]);
            exit;
        }
        $stmt = $conn->prepare("SELECT * FROM system_permissions WHERE role_id = ?");
        $stmt->execute([$role_id]);
        $perms = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $perms]);
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $role_id = $data['role_id'];
        $permissions = $data['permissions']; // Array of permissions

        $conn->beginTransaction();
        
        $stmt = $conn->prepare("
            INSERT INTO system_permissions (role_id, module_name, can_view, can_add, can_edit, can_delete) 
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            can_view=VALUES(can_view), can_add=VALUES(can_add), can_edit=VALUES(can_edit), can_delete=VALUES(can_delete)
        ");

        foreach ($permissions as $p) {
            $stmt->execute([
                $role_id, 
                $p['module_name'], 
                $p['can_view'] ? 1 : 0,
                $p['can_add'] ? 1 : 0,
                $p['can_edit'] ? 1 : 0,
                $p['can_delete'] ? 1 : 0
            ]);
        }
        
        $conn->commit();
        
        $logStmt = $conn->prepare("INSERT INTO system_audit_logs (user_id, action, module, details) VALUES (?, 'Update Permissions', 'Roles', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['role_id' => $role_id])]);
        
        echo json_encode(["status" => "success", "message" => "Permissions updated"]);
    }
} catch(PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
