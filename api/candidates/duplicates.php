<?php
require_once __DIR__ . '/../cors.php';
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');
try {
    // Return one row per candidate. The previous LEFT JOIN returned a row for
    // every application, which made candidates with multiple applications look
    // like duplicates of themselves in the comparison screen.
    $latestApplicationFields = "
        (SELECT a.stage FROM cims_applications a WHERE a.candidate_id = c.id ORDER BY a.appliedAt DESC, a.id DESC LIMIT 1) AS stage,
        (SELECT a.role_applied FROM cims_applications a WHERE a.candidate_id = c.id ORDER BY a.appliedAt DESC, a.id DESC LIMIT 1) AS role,
        (SELECT a.department FROM cims_applications a WHERE a.candidate_id = c.id ORDER BY a.appliedAt DESC, a.id DESC LIMIT 1) AS department,
        (SELECT a.recruiter FROM cims_applications a WHERE a.candidate_id = c.id ORDER BY a.appliedAt DESC, a.id DESC LIMIT 1) AS recruiter
    ";

    // 1. Exact duplicates: ignore blank values and compare normalised email/phone values.
    // This avoids treating every empty email as an exact duplicate and catches case/format variants.
    $stmtExact = $conn->query("
        SELECT c.*, $latestApplicationFields
        FROM cims_candidates c
        WHERE (
            NULLIF(TRIM(c.email), '') IS NOT NULL
            AND LOWER(TRIM(c.email)) IN (
                SELECT LOWER(TRIM(email))
                FROM cims_candidates
                WHERE NULLIF(TRIM(email), '') IS NOT NULL
                GROUP BY LOWER(TRIM(email))
                HAVING COUNT(*) > 1
            )
        ) OR (
            NULLIF(TRIM(c.phone), '') IS NOT NULL
            AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(c.phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') IN (
                SELECT REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')
                FROM cims_candidates
                WHERE NULLIF(TRIM(phone), '') IS NOT NULL
                GROUP BY REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '')
                HAVING COUNT(*) > 1
            )
        )
        ORDER BY LOWER(TRIM(c.email)), c.updatedAt DESC
    ");
    $exactDuplicates = $stmtExact->fetchAll(PDO::FETCH_ASSOC);
    // 2. Possible duplicates: same non-blank name, case and whitespace insensitive.
    $stmtPossible = $conn->query("
        SELECT c.*, $latestApplicationFields
        FROM cims_candidates c
        WHERE NULLIF(TRIM(c.name), '') IS NOT NULL
        AND LOWER(TRIM(c.name)) IN (
            SELECT LOWER(TRIM(name))
            FROM cims_candidates
            WHERE NULLIF(TRIM(name), '') IS NOT NULL
            GROUP BY LOWER(TRIM(name))
            HAVING COUNT(*) > 1
        )
        ORDER BY LOWER(TRIM(c.name)), c.updatedAt DESC
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
