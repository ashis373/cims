<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../db.php';
$required_module = 'Candidate Management';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';

try {
    // 1. Exact Duplicates (Same Email or Phone)
    $stmtExact = $conn->query("
        SELECT c.*, a.stage 
        FROM cims_candidates c 
        LEFT JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE c.email IN (
            SELECT email FROM cims_candidates GROUP BY email HAVING COUNT(*) > 1
        ) OR (c.phone != '' AND c.phone IN (
            SELECT phone FROM cims_candidates WHERE phone != '' GROUP BY phone HAVING COUNT(*) > 1
        ))
        ORDER BY c.email, c.phone, c.updatedAt DESC
    ");
    $exactDuplicates = $stmtExact->fetchAll(PDO::FETCH_ASSOC);

    // 2. Possible Duplicates (Same Name)
    $stmtPossible = $conn->query("
        SELECT c.*, a.stage 
        FROM cims_candidates c 
        LEFT JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE c.name IN (
            SELECT name FROM cims_candidates GROUP BY name HAVING COUNT(*) > 1
        )
        ORDER BY c.name, c.updatedAt DESC
    ");
    $possibleDuplicates = $stmtPossible->fetchAll(PDO::FETCH_ASSOC);
    
    // Filter out possible duplicates that are already in exact duplicates
    $exactIds = array_column($exactDuplicates, 'id');
    $filteredPossible = array_filter($possibleDuplicates, function($cand) use ($exactIds) {
        return !in_array($cand['id'], $exactIds);
    });

    $results = [
        'exact' => array_values($exactDuplicates),
        'possible' => array_values($filteredPossible)
    ];

    echo json_encode($results);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
