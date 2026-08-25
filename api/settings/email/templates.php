<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT id, name, subject, category as type, is_active, DATE_FORMAT(updated_at, '%Y-%m-%d') as updatedAt FROM cims_email_templates ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data['action']) && $data['action'] === 'toggle' && isset($data['id']) && isset($data['is_active'])) {
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET is_active = ? WHERE id = ?");
            $stmt->execute([$data['is_active'], $data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } elseif (isset($data['action']) && $data['action'] === 'toggle_all' && isset($data['is_active'])) {
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET is_active = ?");
            $stmt->execute([$data['is_active']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid request"]);
    }
}
?>
