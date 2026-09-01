<?php
$origin = isset($_SERVER["HTTP_ORIGIN"]) ? $_SERVER["HTTP_ORIGIN"] : "*";
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT id, name, subject, body, category as type, is_active, sending_method, DATE_FORMAT(updated_at, '%Y-%m-%d') as updatedAt FROM cims_email_templates ORDER BY id DESC");
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
    } elseif (isset($data['action']) && $data['action'] === 'update_method' && isset($data['id']) && isset($data['sending_method'])) {
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET sending_method = ? WHERE id = ?");
            $stmt->execute([$data['sending_method'], $data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } elseif (isset($data['action']) && $data['action'] === 'create') {
        try {
            $stmt = $conn->prepare("INSERT INTO cims_email_templates (name, subject, category, body, sending_method, is_active) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data['name'], $data['subject'], $data['type'], $data['body'], $data['sending_method'] ?? 'Automatic', $data['is_active'] ?? 1]);
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } elseif (isset($data['action']) && $data['action'] === 'update') {
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET name = ?, subject = ?, category = ?, body = ?, sending_method = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$data['name'], $data['subject'], $data['type'], $data['body'], $data['sending_method'], $data['is_active'], $data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } elseif (isset($data['action']) && $data['action'] === 'delete') {
        try {
            $stmt = $conn->prepare("DELETE FROM cims_email_templates WHERE id = ?");
            $stmt->execute([$data['id']]);
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
