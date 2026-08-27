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
            id, 
            recipient_email as recipient, 
            subject, 
            body,
            status, 
            error_message,
            DATE_FORMAT(sent_at, '%Y-%m-%d %h:%i %p') as date 
        FROM cims_email_logs 
        ORDER BY sent_at DESC 
        LIMIT 100
    ");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($logs);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
