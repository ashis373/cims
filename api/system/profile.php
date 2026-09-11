<?php
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');
require '../db.php';
require_once '../auth_middleware.php';



$user_id = $currentUser;
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        $stmt = $conn->prepare("
            SELECT u.id, u.full_name, u.email, u.mobile, u.designation, u.department, u.profile_photo, u.notification_preferences, 
                   u.created_at, u.last_login, u.last_password_change, u.is_active, r.role_name as role_name, r.permissions
            FROM cims_users u 
            LEFT JOIN cims_roles r ON u.role_id = r.id
            WHERE u.id = ?
        ");
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
            $current_password = $data['current_password'] ?? '';
            $new_password = $data['new_password'] ?? '';

            if (empty($current_password) || empty($new_password)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Current password and new password are required"]);
                exit;
            }

            if (strlen($new_password) < 6) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "New password must be at least 6 characters long"]);
                exit;
            }

            // Fetch stored hash
            $stmt = $conn->prepare("SELECT password_hashed FROM cims_users WHERE id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($current_password, $user['password_hashed'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Incorrect current password"]);
                exit;
            }

            $hashed = password_hash($new_password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE cims_users SET password_hashed=?, last_password_change=CURRENT_TIMESTAMP WHERE id=?");
            $stmt->execute([$hashed, $user_id]);
            echo json_encode(["status" => "success", "message" => "Password updated successfully"]);
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
    elseif ($method === 'POST') {
        if ($action === 'photo') {
            if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "No file uploaded or upload error"]);
                exit;
            }
            
            $file = $_FILES['photo'];
            if ($file['size'] > 5 * 1024 * 1024) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Image exceeds 5MB limit"]);
                exit;
            }
            
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $mime = mime_content_type($file['tmp_name']);
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
            $allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
            
            if (!in_array($ext, $allowedExts) || !in_array($mime, $allowedMimes)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid file type. Only JPG, PNG, and GIF are allowed."]);
                exit;
            }
            
            $uploadDir = '../../uploads/profiles/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $fileName = 'user_' . $user_id . '_' . time() . '.' . $ext;
            $destPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($file['tmp_name'], $destPath)) {
                $photoUrl = '../../uploads/profiles/' . $fileName;
                $stmt = $conn->prepare("UPDATE cims_users SET profile_photo=? WHERE id=?");
                $stmt->execute([$photoUrl, $user_id]);
                
                echo json_encode(["status" => "success", "message" => "Photo updated", "photo_url" => $photoUrl]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to save file"]);
            }
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

