<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

try {
    $startDate = $_GET['startDate'] ?? null;
    $endDate = $_GET['endDate'] ?? null;
    $recruiterFilter = $_GET['recruiter'] ?? null;
    $positionFilter = $_GET['position'] ?? null;

    $whereClauses = ["1=1"];
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
        $stmtF = $conn->prepare("SELECT COUNT(a.id) FROM cims_applications a WHERE a.stage = ? AND $whereSql");
        // We have to merge the single param with the base params
        $fParams = array_merge([$s], $params);
        // But the WHERE clause uses a.appliedAt which is valid.
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
        WHERE cr.type = 'Rejected' AND $whereSql
        GROUP BY cr.reason
    ");
    $stmtRej->execute($params);
    $reports['rejection_reasons'] = $stmtRej->fetchAll(PDO::FETCH_ASSOC);

    // No Join Stats
    $stmtNoJoin = $conn->prepare("
        SELECT a.stageReason as name, COUNT(a.id) as value
        FROM cims_applications a
        WHERE a.stage = 'No Show' AND a.stageReason IS NOT NULL AND a.stageReason != '' AND $whereSql
        GROUP BY a.stageReason
    ");
    $stmtNoJoin->execute($params);
    $reports['no_join_stats'] = $stmtNoJoin->fetchAll(PDO::FETCH_ASSOC);

    // List of Recruiters & Positions for filter dropdowns
    $reports['filters'] = [
        'recruiters' => $conn->query("SELECT DISTINCT recruiter FROM cims_applications WHERE recruiter IS NOT NULL AND recruiter != ''")->fetchAll(PDO::FETCH_COLUMN),
        'positions' => $conn->query("SELECT DISTINCT role_applied FROM cims_applications WHERE role_applied IS NOT NULL AND role_applied != ''")->fetchAll(PDO::FETCH_COLUMN)
    ];

    echo json_encode($reports);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
