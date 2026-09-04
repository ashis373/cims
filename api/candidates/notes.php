<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['candidate_id']) || !isset($data['text'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }
    try {
        $stmt = $conn->prepare("INSERT INTO cims_candidate_notes (candidate_id, text, createdBy) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['candidate_id'],
            $data['text'],
            $data['createdBy'] ?? 'System'
        ]);
        
        $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, 'Note Added', ?, ?)");
        $stmtHist->execute([$data['candidate_id'], $data['text'], $userId]);
        
        echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['id']) || !isset($data['text'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }
    try {
        $stmt = $conn->prepare("UPDATE cims_candidate_notes SET text = ? WHERE id = ?");
        $stmt->execute([
            $data['text'],
            $data['id']
        ]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }
    try {
        $stmt = $conn->prepare("DELETE FROM cims_candidate_notes WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>

