<?php
require_once __DIR__ . '/../cors.php';
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('risk_management');
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
            c.photo
        FROM cims_candidate_rejections cr
        JOIN cims_candidates c ON cr.candidate_id = c.id
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
