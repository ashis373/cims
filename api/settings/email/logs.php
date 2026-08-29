<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

try {
    $stmt = $conn->query("
        SELECT 
            l.id, 
            l.recipient_email as recipient, 
            l.subject, 
            l.body,
            l.status, 
            l.error_message,
            l.unique_hash,
            c.name as candidate_name,
            t.name as template_name,
            DATE_FORMAT(l.sent_at, '%b %d, %Y, %h:%i %p') as date 
        FROM cims_email_logs l
        LEFT JOIN cims_candidates c ON l.candidate_id = c.id
        LEFT JOIN cims_email_templates t ON l.template_id = t.id
        ORDER BY l.sent_at DESC 
        LIMIT 100
    ");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
