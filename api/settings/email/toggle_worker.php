<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$data = json_decode(file_get_contents("php://input"), true);
$enabled = isset($data['enabled']) && $data['enabled'] ? 1 : 0;

$stmt = $conn->prepare("UPDATE cims_smtp_config SET worker_enabled = ?");
$stmt->execute([$enabled]);

echo json_encode(["success" => true, "message" => "Worker status updated.", "worker_enabled" => (bool)$enabled]);
?>
