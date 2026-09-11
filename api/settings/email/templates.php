<?php
require_once __DIR__ . '/../../cors.php';
header('Content-Type: application/json');

include '../../db.php';
$method = $_SERVER['REQUEST_METHOD'];

// Include auth middleware first without generic require_permission
require_once '../../auth_middleware.php';

if ($method === 'GET') {
    require_permission('email_settings', 'view');
    try {
        $stmt = $conn->query("SELECT id, name, subject, body, category as type, is_active, sending_method, DATE_FORMAT(updated_at, '%Y-%m-%d') as updatedAt FROM cims_email_templates ORDER BY id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "An error occurred while fetching email templates."]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    if ($action === 'create') {
        require_permission('email_settings', 'add');
        try {
            if (empty($data['name']) || empty($data['subject']) || empty($data['body'])) {
                http_response_code(400);
                echo json_encode(["error" => "Template Name, Subject, and Body are required."]);
                exit;
            }
            $stmt = $conn->prepare("INSERT INTO cims_email_templates (name, subject, category, body, sending_method, is_active) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                trim($data['name']),
                trim($data['subject']),
                $data['type'] ?? 'General',
                $data['body'],
                $data['sending_method'] ?? 'Automatic',
                isset($data['is_active']) ? (int)$data['is_active'] : 1
            ]);
            echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while creating the template."]);
        }
    } elseif ($action === 'update') {
        require_permission('email_settings', 'edit');
        try {
            if (empty($data['id']) || empty($data['name']) || empty($data['subject']) || empty($data['body'])) {
                http_response_code(400);
                echo json_encode(["error" => "Template ID, Name, Subject, and Body are required."]);
                exit;
            }
            $stmt = $conn->prepare("UPDATE cims_email_templates SET name = ?, subject = ?, category = ?, body = ?, sending_method = ?, is_active = ? WHERE id = ?");
            $stmt->execute([
                trim($data['name']),
                trim($data['subject']),
                $data['type'] ?? 'General',
                $data['body'],
                $data['sending_method'] ?? 'Automatic',
                isset($data['is_active']) ? (int)$data['is_active'] : 1,
                (int)$data['id']
            ]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while updating the template."]);
        }
    } elseif ($action === 'toggle' && isset($data['id']) && isset($data['is_active'])) {
        require_permission('email_settings', 'edit');
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET is_active = ? WHERE id = ?");
            $stmt->execute([(int)$data['is_active'], (int)$data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while toggling the template."]);
        }
    } elseif ($action === 'toggle_all' && isset($data['is_active'])) {
        require_permission('email_settings', 'edit');
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET is_active = ?");
            $stmt->execute([(int)$data['is_active']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while toggling all templates."]);
        }
    } elseif ($action === 'update_method' && isset($data['id']) && isset($data['sending_method'])) {
        require_permission('email_settings', 'edit');
        try {
            $stmt = $conn->prepare("UPDATE cims_email_templates SET sending_method = ? WHERE id = ?");
            $stmt->execute([$data['sending_method'], (int)$data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while updating the sending method."]);
        }
    } elseif ($action === 'delete' && isset($data['id'])) {
        require_permission('email_settings', 'delete');
        try {
            $stmt = $conn->prepare("DELETE FROM cims_email_templates WHERE id = ?");
            $stmt->execute([(int)$data['id']]);
            echo json_encode(["success" => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "An error occurred while deleting the template."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid request or action."]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
