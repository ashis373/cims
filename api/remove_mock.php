<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';
try {
    $conn->beginTransaction();
    $conn->exec("DELETE FROM cims_applications WHERE candidate_id IN (SELECT id FROM cims_candidates WHERE name LIKE 'Mock Candidate%')");
    $conn->exec("DELETE FROM cims_candidate_rejections WHERE candidate_id IN (SELECT id FROM cims_candidates WHERE name LIKE 'Mock Candidate%')");
    $conn->exec("DELETE FROM cims_candidates WHERE name LIKE 'Mock Candidate%'");
    $conn->commit();
    echo "Deleted mock data successfully";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Error: " . $e->getMessage();
}
?>
