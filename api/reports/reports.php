<?php
require_once __DIR__ . '/../cors.php';

include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';

require_once '../auth_middleware.php';
require_permission('reports');

try {
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $recruiterFilter = $_GET['recruiter'] ?? null;
    $positionFilter = $_GET['position'] ?? null;

    $scopeWhere = get_candidate_scope_where('c');
    $whereClauses = [$scopeWhere];
    $params = [];

    if ($startDate) {
        $whereClauses[] = "a.appliedAt >= ?";
        $params[] = $startDate . " 00:00:00";
    }
    if ($endDate) {
        $whereClauses[] = "a.appliedAt <= ?";
        $params[] = $endDate . " 23:59:59";
    }
    if ($recruiterFilter) {
        $whereClauses[] = "a.recruiter = ?";
        $params[] = $recruiterFilter;
    }
    if ($positionFilter) {
        $whereClauses[] = "a.role_applied = ?";
        $params[] = $positionFilter;
    }

    $whereSql = implode(" AND ", $whereClauses);
    $reports = [];

    // Recruiter Performance (Total Applications, Offers, Joined, Rejected by Recruiter)
    $stmt = $conn->prepare("
        SELECT 
            a.recruiter as name,
            COUNT(a.id) as total,
            SUM(CASE WHEN a.stage IN ('Offer Released', 'Offer Accepted', 'Joined') THEN 1 ELSE 0 END) as offers,
            SUM(CASE WHEN a.stage = 'Joined' THEN 1 ELSE 0 END) as joined,
            SUM(CASE WHEN a.stage = 'Rejected' THEN 1 ELSE 0 END) as rejected
        FROM cims_applications a
        JOIN cims_candidates c ON a.candidate_id = c.id
        WHERE $whereSql
        GROUP BY a.recruiter
        HAVING a.recruiter IS NOT NULL AND a.recruiter != ''
    ");
    $stmt->execute($params);
    $reports['recruiter_performance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Funnel / Conversion Rates
    $stages = ['New Applicant', 'Shortlisted', 'Interview Scheduled', 'Offer Released', 'Joined'];
    $funnel = [];
    foreach ($stages as $s) {
        $stmtF = $conn->prepare("
            SELECT COUNT(a.id) 
            FROM cims_applications a 
            JOIN cims_candidates c ON a.candidate_id = c.id 
            WHERE a.stage = ? AND $whereSql
        ");
        $fParams = array_merge([$s], $params);
        $stmtF->execute($fParams);
        $funnel[] = [
            "name" => $s,
            "value" => (int)$stmtF->fetchColumn()
        ];
    }
    $reports['funnel'] = $funnel;

    // Rejection Reasons
    $stmtRej = $conn->prepare("
        SELECT cr.reason as name, COUNT(cr.id) as value
        FROM cims_candidate_rejections cr
        JOIN cims_applications a ON cr.candidate_id = a.candidate_id
        JOIN cims_candidates c ON a.candidate_id = c.id
        WHERE cr.type = 'Rejected' AND $whereSql
        GROUP BY cr.reason
    ");
    $stmtRej->execute($params);
    $reports['rejection_reasons'] = $stmtRej->fetchAll(PDO::FETCH_ASSOC);

    // No Join Stats
    $stmtNoJoin = $conn->prepare("
        SELECT a.stageReason as name, COUNT(a.id) as value
        FROM cims_applications a
        JOIN cims_candidates c ON a.candidate_id = c.id
        WHERE a.stage = 'No Show' AND a.stageReason IS NOT NULL AND a.stageReason != '' AND $whereSql
        GROUP BY a.stageReason
    ");
    $stmtNoJoin->execute($params);
    $reports['no_join_stats'] = $stmtNoJoin->fetchAll(PDO::FETCH_ASSOC);

    // List of Recruiters & Positions for filter dropdowns scoped to accessible candidates
    $stmtRec = $conn->prepare("SELECT DISTINCT a.recruiter FROM cims_applications a JOIN cims_candidates c ON a.candidate_id = c.id WHERE a.recruiter IS NOT NULL AND a.recruiter != '' AND $scopeWhere");
    $stmtRec->execute();
    $recruitersList = $stmtRec->fetchAll(PDO::FETCH_COLUMN);

    $stmtPos = $conn->prepare("SELECT DISTINCT a.role_applied FROM cims_applications a JOIN cims_candidates c ON a.candidate_id = c.id WHERE a.role_applied IS NOT NULL AND a.role_applied != '' AND $scopeWhere");
    $stmtPos->execute();
    $positionsList = $stmtPos->fetchAll(PDO::FETCH_COLUMN);

    $reports['filters'] = [
        'recruiters' => $recruitersList,
        'positions' => $positionsList
    ];

    echo json_encode($reports);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "A database error occurred while generating reports."]);
}
