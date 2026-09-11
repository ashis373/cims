<?php
require_once __DIR__ . '/../cors.php';
include '../db.php';
$required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');
$id = $_GET['id'] ?? null;
$params = [];
$whereHist = "";
$whereNotes = "";
$whereInt = "";
$whereApp = "";
$whereEmail = "";
if ($id) {
    $whereHist = "WHERE h.candidate_id = ?";
    $whereNotes = "WHERE n.candidate_id = ?";
    $whereInt = "WHERE a.candidate_id = ?";
    $whereApp = "WHERE a.candidate_id = ?";
    $whereEmail = "WHERE e.candidate_id = ?";
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
                COALESCE(u.full_name, 'System') as user, 
                COALESCE(rl.role_name, 'System') as userRole,
                c.name as candidateName,
                c.photo as image 
            FROM cims_candidate_history h 
            JOIN cims_candidates c ON h.candidate_id = c.id 
            LEFT JOIN cims_users u ON h.userId = u.id
            LEFT JOIN cims_roles rl ON u.role_id = rl.id
            $whereHist
        )
        UNION ALL
        (
            SELECT 
                'Note' as type, 
                'Note Added' as action, 
                n.text as description, 
                n.createdAt as timestamp, 
                COALESCE(u.full_name, IF(n.createdBy REGEXP '^[0-9]+$', rl.role_name, n.createdBy), 'System') as user, 
                COALESCE(rl.role_name, 'HR Manager') as userRole,
                c.name as candidateName,
                c.photo as image 
            FROM cims_candidate_notes n 
            JOIN cims_candidates c ON n.candidate_id = c.id 
            LEFT JOIN cims_users u ON (
                (n.createdBy REGEXP '^[0-9]+$' AND u.id = n.createdBy)
                OR
                (NOT (n.createdBy REGEXP '^[0-9]+$') AND u.id = (
                    SELECT MIN(u2.id) FROM cims_users u2 
                    LEFT JOIN cims_roles r2 ON u2.role_id = r2.id
                    WHERE u2.full_name = n.createdBy OR r2.role_name = n.createdBy
                ))
            )
            LEFT JOIN cims_roles rl ON u.role_id = rl.id
            $whereNotes
        )
        UNION ALL
        (
            SELECT 
                'Interview' as type, 
                CONCAT(i.type, ' Interview ', i.status) as action, 
                CASE 
                    WHEN NULLIF(TRIM(i.feedback), '') IS NOT NULL THEN TRIM(i.feedback)
                    WHEN i.status = 'Completed' THEN CONCAT(i.type, ' Interview Completed')
                    WHEN i.status = 'Scheduled' THEN CONCAT('Scheduled on ', DATE_FORMAT(i.interviewDate, '%d %b, %h:%i %p'))
                    ELSE CONCAT(i.type, ' Interview ', i.status)
                END as description, 
                i.created_at as timestamp, 
                COALESCE(u.full_name, IF(i.created_by REGEXP '^[0-9]+$', rl.role_name, i.created_by), 'System') as user, 
                COALESCE(rl.role_name, 'HR Manager') as userRole,
                c.name as candidateName,
                c.photo as image 
            FROM cims_candidate_interviews i 
            JOIN cims_applications a ON i.application_id = a.id 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            LEFT JOIN cims_users u ON (
                (i.created_by REGEXP '^[0-9]+$' AND u.id = i.created_by)
                OR
                (NOT (i.created_by REGEXP '^[0-9]+$') AND u.id = (
                    SELECT MIN(u2.id) FROM cims_users u2 
                    LEFT JOIN cims_roles r2 ON u2.role_id = r2.id
                    WHERE u2.full_name = i.created_by OR r2.role_name = i.created_by
                ))
            )
            LEFT JOIN cims_roles rl ON u.role_id = rl.id
            $whereInt
        )
        UNION ALL
        (
            SELECT 
                'Application' as type, 
                'Application Submitted' as action, 
                CONCAT('Applied for ', a.role_applied, ' via ', a.source) as description, 
                a.appliedAt as timestamp, 
                COALESCE(u.full_name, a.recruiter, 'System') as user, 
                COALESCE(rl.role_name, 'Recruiter') as userRole,
                c.name as candidateName,
                c.photo as image 
            FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            LEFT JOIN cims_users u ON a.recruiter = u.full_name
            LEFT JOIN cims_roles rl ON u.role_id = rl.id
            $whereApp
        )
        UNION ALL
        (
            SELECT 
                'Email' as type, 
                CONCAT('Email Sent: ', e.subject) as action, 
                CONCAT('Status: ', e.status) as description, 
                e.sent_at as timestamp, 
                'System' as user, 
                'System' as userRole,
                c.name as candidateName,
                c.photo as image 
            FROM cims_email_logs e 
            JOIN cims_candidates c ON e.candidate_id = c.id 
            $whereEmail
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
