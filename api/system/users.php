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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT u.id, u.full_name, u.email, u.mobile, u.profile_photo, u.designation, u.department, u.is_active, u.created_at, r.role_name as role, r.id as role_id,
            (SELECT log_time FROM cims_audit_logs WHERE user_id = u.id AND action = 'Login' ORDER BY log_time DESC LIMIT 1) as last_login
            FROM cims_users u
            LEFT JOIN cims_roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $users]);
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['email']) || empty($data['password']) || empty($data['full_name']) || empty($data['role_id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            exit;
        }

        // Check duplicate email
        $check = $conn->prepare("SELECT id FROM cims_users WHERE email = ?");
        $check->execute([$data['email']]);
        if ($check->fetch()) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email already exists"]);
            exit;
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO cims_users (full_name, email, mobile, designation, department, password_hashed, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['full_name'],
            $data['email'],
            $data['mobile'] ?? null,
            $data['designation'] ?? null,
            $data['department'] ?? null,
            $hashedPassword,
            $data['role_id'],
            isset($data['is_active']) ? $data['is_active'] : 1
        ]);
        
        $new_id = $conn->lastInsertId();
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Create User', 'Users', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['created_user_id' => $new_id, 'email' => $data['email']])]);
        
        echo json_encode(["status" => "success", "message" => "User created successfully"]);
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        if ($action === 'reset_password') {
            if (empty($data['password'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "New password is required"]);
                exit;
            }
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE cims_users SET password_hashed = ? WHERE id = ?");
            $stmt->execute([$hashedPassword, $id]);
            
            $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Reset Password', 'Users', ?)");
            $logStmt->execute([$_SESSION['user_id'], json_encode(['target_user_id' => $id])]);
            
            echo json_encode(["status" => "success", "message" => "Password reset successfully"]);
            exit;
        }
        
        if ($action === 'toggle_status') {
            if ($id == 1 || $id == '1' || $data['email'] === 'ashiskrout1@gmail.com') {
                // We should check the email from DB just to be sure, but we can do a quick check:
                $checkSuper = $conn->prepare("SELECT email FROM cims_users WHERE id = ?");
                $checkSuper->execute([$id]);
                if ($checkSuper->fetchColumn() === 'ashiskrout1@gmail.com' || $id == 1) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "The core Administrator account can never be deactivated."]);
                    exit;
                }
            }
            
            // Prevent toggling last Administrator
            $checkAdmin = $conn->prepare("SELECT r.role_name FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
            $checkAdmin->execute([$id]);
            $roleName = $checkAdmin->fetchColumn();
            
            if ($roleName === 'Administrator' && $data['is_active'] == 0) {
                // Check if it's the last active admin
                $countAdmins = $conn->query("SELECT COUNT(*) FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE r.role_name = 'Administrator' AND u.is_active = 1")->fetchColumn();
                if ($countAdmins <= 1) {
                    http_response_code(400);
                    echo json_encode(["status" => "error", "message" => "Cannot deactivate the last active Administrator account."]);
                    exit;
                }
            }
            
            $stmt = $conn->prepare("UPDATE cims_users SET is_active = ? WHERE id = ?");
            $new_status = $data['is_active'] ? 1 : 0;
            $stmt->execute([$new_status, $id]);
            
            $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Toggle Status', 'Users', ?)");
            $logStmt->execute([$_SESSION['user_id'], json_encode(['target_user_id' => $id, 'new_status' => $new_status])]);
            
            echo json_encode(["status" => "success", "message" => "Status updated"]);
            exit;
        }

        // Regular update
        $stmt = $conn->prepare("UPDATE cims_users SET full_name = ?, email = ?, mobile = ?, designation = ?, department = ?, role_id = ?, is_active = ? WHERE id = ?");
        $stmt->execute([
            $data['full_name'],
            $data['email'],
            $data['mobile'] ?? null,
            $data['designation'] ?? null,
            $data['department'] ?? null,
            $data['role_id'],
            $data['is_active'] ? 1 : 0,
            $id
        ]);
        
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Update User', 'Users', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['target_user_id' => $id, 'role_id' => $data['role_id']])]);
        
        echo json_encode(["status" => "success", "message" => "User updated successfully"]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        $checkSuper = $conn->prepare("SELECT email FROM cims_users WHERE id = ?");
        $checkSuper->execute([$id]);
        if ($checkSuper->fetchColumn() === 'ashiskrout1@gmail.com' || $id == 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "The core Administrator account can never be deleted."]);
            exit;
        }

        // Prevent deleting last Administrator
        $checkAdmin = $conn->prepare("SELECT r.role_name FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
        $checkAdmin->execute([$id]);
        $roleName = $checkAdmin->fetchColumn();
        
        if ($roleName === 'Administrator') {
            $countAdmins = $conn->query("SELECT COUNT(*) FROM cims_users u JOIN cims_roles r ON u.role_id = r.id WHERE r.role_name = 'Administrator'")->fetchColumn();
            if ($countAdmins <= 1) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Cannot delete the last Administrator account."]);
                exit;
            }
        }

        $stmt = $conn->prepare("DELETE FROM cims_users WHERE id = ?");
        $stmt->execute([$id]);
        
        $logStmt = $conn->prepare("INSERT INTO cims_audit_logs (user_id, action, module, details) VALUES (?, 'Delete User', 'Users', ?)");
        $logStmt->execute([$_SESSION['user_id'], json_encode(['target_user_id' => $id])]);
        
        echo json_encode(["status" => "success", "message" => "User deleted successfully"]);
        exit;
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
