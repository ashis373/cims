<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM cims_departments ORDER BY id ASC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['name'])) {
        http_response_code(400);
        echo json_encode(["error" => "Name is required"]);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("INSERT INTO cims_departments (name, color_theme) VALUES (?, ?)");
        $color = $data['color_theme'] ?? 'bg-slate-500/12 text-slate-700 dark:text-slate-300 border-slate-500/25';
        $stmt->execute([$data['name'], $color]);
        echo json_encode(["success" => true, "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "ID is required"]);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM cims_departments WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
