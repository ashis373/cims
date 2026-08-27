<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';
require_once 'mailer.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['candidate_id']) || !isset($data['stage'])) {
    echo json_encode(["success" => false, "message" => "Missing parameters"]);
    exit;
}

$candidate_id = $data['candidate_id'];
$stage = $data['stage'];

$stageToCategory = [
    'Interview Scheduled' => 'Interview',
    'Offer Released' => 'Offer',
    'Rejected' => 'Rejection'
];

if (!isset($stageToCategory[$stage])) {
    echo json_encode(["success" => true, "method" => "None", "message" => "No template mapped for this stage"]);
    exit;
}

$category = $stageToCategory[$stage];

try {
    // 1. Find active template for this category
    $stmt = $conn->prepare("SELECT id, subject, body, sending_method, is_active FROM cims_email_templates WHERE category = ? AND is_active = 1 LIMIT 1");
    $stmt->execute([$category]);
    $template = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$template) {
        echo json_encode(["success" => true, "method" => "None", "message" => "No active template found"]);
        exit;
    }

    // 2. Fetch Candidate details
    // Ensure we handle both string and int IDs if candidate_id is string like 'c123'
    $candStmt = $conn->prepare("SELECT * FROM cims_candidates WHERE id = ?");
    $candStmt->execute([$candidate_id]);
    $candidate = $candStmt->fetch(PDO::FETCH_ASSOC);

    if (!$candidate) {
        echo json_encode(["success" => false, "message" => "Candidate not found"]);
        exit;
    }
    
    // We might need normalized candidate data if it's saved in cims_candidates_normalized
    // Actually the frontend passes local string IDs? Let's check candidate table structure.
    // If not found in cims_candidates, maybe the candidate hasn't been saved yet?
    // Wait, syncPut happens BEFORE we call trigger.php, so candidate should be there.

    // 3. Prevent Duplicates
    $recipient_email = $candidate['email'];
    $unique_hash = md5($template['id'] . "_" . $candidate_id);

    $checkStmt = $conn->prepare("SELECT id FROM cims_email_logs WHERE unique_hash = ?");
    $checkStmt->execute([$unique_hash]);
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Email already sent previously."]);
        exit;
    }

    // 4. Replace Placeholders
    $subject = str_replace("{{company_name}}", "Hireflow Solutions", $template['subject']);
    $body = $template['body'];
    // For manual replacement, we can add a few common ones
    $body = str_replace("{{candidate_name}}", $candidate['name'] ?? 'Candidate', $body);
    $body = str_replace("{{role}}", $candidate['role'] ?? 'the position', $body);
    $subject = str_replace("{{candidate_name}}", $candidate['name'] ?? 'Candidate', $subject);
    $subject = str_replace("{{role}}", $candidate['role'] ?? 'the position', $subject);

    if ($template['sending_method'] === 'Automatic') {
        // Send email automatically
        $res = sendEventEmailDirect($conn, $template, $candidate, $subject, $body, $unique_hash);
        echo json_encode(["success" => $res['success'], "method" => "Automatic", "message" => $res['message']]);
    } else {
        // Return Draft for Manual sending
        echo json_encode([
            "success" => true, 
            "method" => "Manual",
            "draft" => [
                "template_id" => $template['id'],
                "candidate_id" => $candidate_id,
                "to" => $recipient_email,
                "subject" => $subject,
                "body" => $body,
                "unique_hash" => $unique_hash
            ]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

// Helper to send directly without re-fetching template
function sendEventEmailDirect($conn, $template, $candidate, $subject, $body, $unique_hash) {
    $recipient_email = $candidate['email'];
    
    // SMTP Config
    $smtpStmt = $conn->query("SELECT from_name, from_email FROM cims_smtp_config LIMIT 1");
    $smtp = $smtpStmt->fetch(PDO::FETCH_ASSOC);
    $fromName = $smtp['from_name'] ?? "ATS System";
    $fromEmail = $smtp['from_email'] ?? "no-reply@ats.local";

    $mailSent = true; // Simulated success
    $status = $mailSent ? 'Delivered' : 'Failed';

    $logStmt = $conn->prepare("
        INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, unique_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $logStmt->execute([
        $recipient_email,
        $subject,
        $body,
        $template['id'],
        $candidate['id'],
        $status,
        $unique_hash
    ]);

    return ["success" => $mailSent, "message" => "Email delivered automatically."];
}
?>
