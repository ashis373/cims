<?php
require_once __DIR__ . '/../../cors.php';

include '../../db.php';
$allowed_roles = ['Administrator'];
require_once '../../auth_middleware.php';

$data = json_decode(file_get_contents("php://input"), true);
$enabled = isset($data['enabled']) && $data['enabled'] ? 1 : 0;

$stmt = $conn->prepare("UPDATE cims_smtp_config SET worker_enabled = ?");
$stmt->execute([$enabled]);

echo json_encode(["success" => true, "message" => "Worker status updated.", "worker_enabled" => (bool)$enabled]);
?>
