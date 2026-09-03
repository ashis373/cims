<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include '../../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../../auth_middleware.php';
require_permission('email_settings');
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['candidate_id']) || !isset($data['template_id'])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}
$candidate_id = $data['candidate_id'];
$template_id = $data['template_id'];
try {
    // 1. Find template
    $stmt = $conn->prepare("SELECT id, subject, body FROM cims_email_templates WHERE id = ?");
    $stmt->execute([$template_id]);
    $template = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$template) {
        echo json_encode(["success" => false, "message" => "Template not found"]);
        exit;
    }
    // 2. Fetch Candidate details
    $candStmt = $conn->prepare("SELECT * FROM cims_candidates WHERE id = ?");
    $candStmt->execute([$candidate_id]);
    $candidate = $candStmt->fetch(PDO::FETCH_ASSOC);
    if (!$candidate) {
        echo json_encode(["success" => false, "message" => "Candidate not found"]);
        exit;
    }
    $recipient_email = $candidate['email'];
    $unique_hash = md5($template['id'] . "_" . $candidate_id . "_" . time());
    // 4. Replace Placeholders
    $subject = str_replace("{{company_name}}", "Hireflow Solutions", $template['subject']);
    $body = $template['body'];
    $body = str_replace("{{candidate_name}}", $candidate['name'] ?? 'Candidate', $body);
    $body = str_replace("{{role}}", $candidate['role'] ?? 'the position', $body);
    $subject = str_replace("{{candidate_name}}", $candidate['name'] ?? 'Candidate', $subject);
    $subject = str_replace("{{role}}", $candidate['role'] ?? 'the position', $subject);
    // Return Draft
    echo json_encode([
        "success" => true, 
        "draft" => [
            "template_id" => $template['id'],
            "candidate_id" => $candidate_id,
            "to" => $recipient_email,
            "subject" => $subject,
            "body" => $body,
            "unique_hash" => $unique_hash
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
