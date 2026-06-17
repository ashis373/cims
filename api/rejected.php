<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

try {
    $stmt = $conn->query("
        SELECT 
            cr.id as rejection_id,
            cr.type,
            cr.reason,
            cr.recordedAt,
            cr.recordedBy,
            c.id,
            c.name,
            c.email,
            a.role_applied as position
        FROM cims_candidate_rejections cr
        JOIN cims_candidates c ON cr.candidate_id = c.id
        LEFT JOIN cims_applications a ON cr.application_id = a.id
        WHERE cr.type = 'Rejected'
        ORDER BY cr.recordedAt DESC
    ");
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['rejected' => $results]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
