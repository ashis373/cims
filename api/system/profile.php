<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

header('Content-Type: application/json');
require '../db.php';
require_once '../auth_middleware.php';



$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        $stmt = $conn->prepare("SELECT id, full_name, email, mobile, designation, department, profile_photo, notification_preferences FROM cims_users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $user['notification_preferences'] = json_decode($user['notification_preferences'], true);
            echo json_encode(["status" => "success", "data" => $user]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($action === 'profile') {
            $stmt = $conn->prepare("UPDATE cims_users SET full_name=?, email=?, mobile=?, designation=?, department=? WHERE id=?");
            $stmt->execute([$data['full_name'], $data['email'], $data['mobile'], $data['designation'], $data['department'], $user_id]);
            echo json_encode(["status" => "success", "message" => "Profile updated"]);
        } 
        elseif ($action === 'password') {
            // In a real app, verify current password first
            $hashed = password_hash($data['new_password'], PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE cims_users SET password_hashed=? WHERE id=?");
            $stmt->execute([$hashed, $user_id]);
            echo json_encode(["status" => "success", "message" => "Password updated"]);
        } 
        elseif ($action === 'notifications') {
            $prefs = json_encode($data['preferences']);
            $stmt = $conn->prepare("UPDATE cims_users SET notification_preferences=? WHERE id=?");
            $stmt->execute([$prefs, $user_id]);
            echo json_encode(["status" => "success", "message" => "Preferences updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
        }
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
