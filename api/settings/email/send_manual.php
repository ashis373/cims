<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

include '../../db.php';
$required_permission = 'can_add';
require_once '../../auth_middleware.php';
require_permission('email_settings');

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['candidate_id']) || !isset($data['template_id']) || !isset($data['to'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing parameters (candidate_id, template_id, to)."]);
    exit;
}

try {
    $recipient_email = trim($data['to']);
    $subject = trim($data['subject'] ?? '');
    $body = $data['body'] ?? '';
    $template_id = (int)$data['template_id'];
    $candidate_id = $data['candidate_id'];

    if (!filter_var($recipient_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid recipient email address."]);
        exit;
    }

    // Verify candidate access under caller's RBAC scope
    if (!check_candidate_access($candidate_id)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden: You are not authorized to send emails to this candidate."]);
        exit;
    }

    // Prevent open email relay: ensure recipient matches candidate's recorded email
    $candStmt = $conn->prepare("SELECT email FROM cims_candidates WHERE id = ?");
    $candStmt->execute([$candidate_id]);
    $candEmail = $candStmt->fetchColumn();

    if (!$candEmail) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Candidate record not found."]);
        exit;
    }

    if (strcasecmp($recipient_email, trim($candEmail)) !== 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Recipient email does not match candidate's registered email address."]);
        exit;
    }

    $unique_hash = $data['unique_hash'] ?? md5($candidate_id . $template_id . microtime(true) . bin2hex(random_bytes(4)));

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
    echo json_encode(["success" => false, "message" => "Failed to queue email. Please try again."]);
}
