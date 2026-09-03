<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
header('Content-Type: application/json');
require '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('system_settings');
$type = $_GET['type'] ?? '';
try {
    if ($method === 'GET') {
        if ($type === 'company') {
            $stmt = $conn->query("SELECT * FROM cims_company_settings ORDER BY id DESC LIMIT 1");
            echo json_encode(["status" => "success", "data" => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } elseif ($type === 'recruitment') {
            $stmt = $conn->query("SELECT * FROM cims_recruitment_settings ORDER BY id DESC LIMIT 1");
            echo json_encode(["status" => "success", "data" => $stmt->fetch(PDO::FETCH_ASSOC)]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid settings type"]);
        }
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if ($type === 'company') {
            $stmt = $conn->prepare("UPDATE cims_company_settings SET company_name=?, logo=?, website=?, timezone=?, date_format=? WHERE id=?");
            $stmt->execute([
                $data['company_name'], 
                $data['logo'] ?? null, 
                $data['website'], 
                $data['timezone'], 
                $data['date_format'], 
                $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Company settings updated"]);
        } 
        elseif ($type === 'recruitment') {
            $stmt = $conn->prepare("UPDATE cims_recruitment_settings SET notice_period=?, max_rounds=?, auto_duplicate_check=?, blacklist_approval=?, offer_expiry_days=? WHERE id=?");
            $stmt->execute([
                $data['notice_period'], 
                $data['max_rounds'], 
                $data['auto_duplicate_check'] ? 1 : 0, 
                $data['blacklist_approval'] ? 1 : 0, 
                $data['offer_expiry_days'], 
                $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Recruitment settings updated"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid settings type"]);
        }
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
