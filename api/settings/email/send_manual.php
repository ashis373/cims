<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

$required_module = 'Email';
$required_permission = 'can_add';
require_once '../../auth_middleware.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['candidate_id']) || !isset($data['template_id']) || !isset($data['to'])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

try {
    $recipient_email = $data['to'];
    $subject = $data['subject'];
    $body = $data['body'];
    $template_id = $data['template_id'];
    $candidate_id = $data['candidate_id'];
    $unique_hash = $data['unique_hash'] ?? md5($candidate_id . $template_id . time());

    // Insert into queue
    $stmt = $conn->prepare("
        INSERT INTO cims_email_queue (candidate_id, recipient_email, template_id, subject, body, sending_method, unique_hash, status)
        VALUES (?, ?, ?, ?, ?, 'Manual', ?, 'Pending')
    ");
    $stmt->execute([
        $candidate_id,
        $recipient_email,
        $template_id,
        $subject,
        $body,
        $unique_hash
    ]);

    echo json_encode(["success" => true, "message" => "Email queued successfully!"]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
