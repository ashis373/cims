<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';

try {
    // Fetch active queue items (Pending, Processing)
    $queueStmt = $conn->query("
        SELECT 
            CONCAT('q_', q.id) as id, 
            q.recipient_email as recipient, 
            q.subject, 
            q.body,
            q.status, 
            q.last_error as error_message,
            q.unique_hash,
            c.name as candidate_name,
            t.name as template_name,
            DATE_FORMAT(q.created_at, '%b %d, %Y, %h:%i %p') as date,
            UNIX_TIMESTAMP(q.created_at) as timestamp_sort
        FROM cims_email_queue q
        LEFT JOIN cims_candidates c ON q.candidate_id = c.id
        LEFT JOIN cims_email_templates t ON q.template_id = t.id
        WHERE q.status IN ('Pending', 'Processing')
        ORDER BY q.created_at DESC
    ");
    $queueItems = $queueStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch historical logs (Sent, Failed)
    $logStmt = $conn->query("
        SELECT 
            CONCAT('l_', l.id) as id, 
            l.recipient_email as recipient, 
            l.subject, 
            l.body,
            l.status, 
            l.error_message,
            l.unique_hash,
            c.name as candidate_name,
            t.name as template_name,
            DATE_FORMAT(IFNULL(l.sent_at, CURRENT_TIMESTAMP), '%b %d, %Y, %h:%i %p') as date,
            UNIX_TIMESTAMP(IFNULL(l.sent_at, CURRENT_TIMESTAMP)) as timestamp_sort
        FROM cims_email_logs l
        LEFT JOIN cims_candidates c ON l.candidate_id = c.id
        LEFT JOIN cims_email_templates t ON l.template_id = t.id
        ORDER BY l.id DESC 
        LIMIT 100
    ");
    $logs = $logStmt->fetchAll(PDO::FETCH_ASSOC);

    // Merge and sort
    $allLogs = array_merge($queueItems, $logs);
    usort($allLogs, function($a, $b) {
        return $b['timestamp_sort'] <=> $a['timestamp_sort'];
    });

    echo json_encode(array_slice($allLogs, 0, 100));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
