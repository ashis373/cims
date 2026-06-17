<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$id = $_GET['id'] ?? null;
$params = [];

$whereHist = "";
$whereNotes = "";
$whereInt = "";
$whereRej = "";
$whereApp = "";

if ($id) {
    $whereHist = "WHERE h.candidate_id = ?";
    $whereNotes = "WHERE n.candidate_id = ?";
    $whereInt = "WHERE a.candidate_id = ?";
    $whereRej = "WHERE r.candidate_id = ?";
    $whereApp = "WHERE a.candidate_id = ?";
    // Since there are 5 union queries, we need the ID 5 times
    $params = [$id, $id, $id, $id, $id];
}

try {
    // We use UNION ALL to combine the results directly in MySQL
    // Then we order by the timestamp descending in the final combined dataset
    $query = "
        (
            SELECT 
                'History' as type, 
                h.action as action, 
                h.details as description, 
                h.createdAt as timestamp, 
                'System' as user, 
                c.name as candidateName 
            FROM cims_candidate_history h 
            JOIN cims_candidates c ON h.candidate_id = c.id 
            $whereHist
        )
        UNION ALL
        (
            SELECT 
                'Note' as type, 
                'Note Added' as action, 
                n.text as description, 
                n.createdAt as timestamp, 
                n.createdBy as user, 
                c.name as candidateName 
            FROM cims_candidate_notes n 
            JOIN cims_candidates c ON n.candidate_id = c.id 
            $whereNotes
        )
        UNION ALL
        (
            SELECT 
                'Interview' as type, 
                CONCAT(i.type, ' Interview ', i.status) as action, 
                COALESCE(i.feedback, CONCAT('Scheduled on ', i.interviewDate)) as description, 
                i.interviewDate as timestamp, 
                'System' as user, 
                c.name as candidateName 
            FROM cims_candidate_interviews i 
            JOIN cims_applications a ON i.application_id = a.id 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            $whereInt
        )
        UNION ALL
        (
            SELECT 
                'Alert' as type, 
                CONCAT('Candidate ', r.type) as action, 
                r.reason as description, 
                r.recordedAt as timestamp, 
                'System' as user, 
                c.name as candidateName 
            FROM cims_candidate_rejections r 
            JOIN cims_candidates c ON r.candidate_id = c.id 
            $whereRej
        )
        UNION ALL
        (
            SELECT 
                'Application' as type, 
                'Application Submitted' as action, 
                CONCAT('Applied for ', a.role_applied, ' via ', a.source) as description, 
                a.appliedAt as timestamp, 
                'System' as user, 
                c.name as candidateName 
            FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            $whereApp
        )
        ORDER BY timestamp DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $timeline = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($timeline);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
