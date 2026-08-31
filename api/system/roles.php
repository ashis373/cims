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

try {
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT r.*, COUNT(u.id) as user_count 
            FROM cims_roles r 
            LEFT JOIN cims_users u ON r.id = u.role_id 
            GROUP BY r.id
        ");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $roles]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO cims_roles (role_name, description) VALUES (?, ?)");
        $stmt->execute([$data['role_name'], $data['description']]);
        $new_id = $conn->lastInsertId();
        
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Create Role', 'Roles', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['role_id' => $new_id, 'role_name' => $data['role_name']])]);
        
        echo json_encode(["status" => "success", "message" => "Role created", "id" => $new_id]);
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("UPDATE cims_roles SET role_name=?, description=? WHERE id=?");
        $stmt->execute([$data['role_name'], $data['description'], $data['id']]);
        
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Update Role', 'Roles', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['role_id' => $data['id']])]);
        
        echo json_encode(["status" => "success", "message" => "Role updated"]);
    }
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Role ID is required"]);
            exit;
        }

        $checkAdmin = $conn->prepare("SELECT role_name FROM cims_roles WHERE id = ?");
        $checkAdmin->execute([$id]);
        $roleName = $checkAdmin->fetchColumn();
        
        if ($roleName === 'Administrator') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Cannot delete the Administrator role."]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM cims_roles WHERE id = ?");
        $stmt->execute([$id]);
        
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Delete Role', 'Roles', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['role_id' => $id, 'role_name' => $roleName])]);
        
        echo json_encode(["status" => "success", "message" => "Role deleted successfully"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
