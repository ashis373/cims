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
$type = $_GET['type'] ?? ''; // 'rejection' or 'blacklist'
$id = $_GET['id'] ?? null;
if (!in_array($type, ['rejection', 'blacklist'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid reason type"]);
    exit;
}
$table = "system_{$type}_reasons";
try {
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM $table ORDER BY id DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO $table (reason_text) VALUES (?)");
        $stmt->execute([$data['reason_text']]);
        echo json_encode(["status" => "success", "message" => "Reason added", "id" => $conn->lastInsertId()]);
    } 
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID required for update"]);
            exit;
        }
        $stmt = $conn->prepare("UPDATE $table SET reason_text=? WHERE id=?");
        $stmt->execute([$data['reason_text'], $id]);
        echo json_encode(["status" => "success", "message" => "Reason updated"]);
    } 
    elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID required for deletion"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM $table WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Reason deleted"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
