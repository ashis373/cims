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
session_start();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT r.*, COUNT(u.id) as user_count 
            FROM system_roles r 
            LEFT JOIN system_users u ON r.id = u.role_id 
            GROUP BY r.id
        ");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $roles]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO system_roles (role_name, description) VALUES (?, ?)");
        $stmt->execute([$data['role_name'], $data['description']]);
        echo json_encode(["status" => "success", "message" => "Role created", "id" => $conn->lastInsertId()]);
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("UPDATE system_roles SET role_name=?, description=? WHERE id=?");
        $stmt->execute([$data['role_name'], $data['description'], $data['id']]);
        echo json_encode(["status" => "success", "message" => "Role updated"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
