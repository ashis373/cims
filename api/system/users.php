<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

header('Content-Type: application/json');
require '../db.php';
require_once '../auth_middleware.php';
session_start();

try {
    $stmt = $conn->query("
        SELECT u.id, u.full_name as name, r.role_name as role, u.profile_photo as avatar
        FROM system_users u
        LEFT JOIN system_roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
        LIMIT 10
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fallback if avatar is empty
    foreach ($users as &$user) {
        if (empty($user['avatar'])) {
            $user['avatar'] = substr($user['name'], 0, 1);
        }
    }
    
    echo json_encode(["status" => "success", "data" => $users]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
