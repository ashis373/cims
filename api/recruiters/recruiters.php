<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-User-Id");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../db.php';
$required_module = 'Users & Roles'; // Recruiter management usually falls under this
require_once '../auth_middleware.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("
            SELECT r.id, r.name, r.email, r.mobile, r.status, r.department, r.designation, r.createdAt,
                (SELECT COUNT(*) FROM cims_jobs j WHERE j.recruiter = r.id OR j.recruiter = r.name) as assigned_jobs,
                (SELECT COUNT(DISTINCT a.candidate_id) FROM cims_applications a WHERE a.recruiter = r.id OR a.recruiter = r.name) as candidates
            FROM cims_recruiters r
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
