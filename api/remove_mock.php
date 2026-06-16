<?php
include 'db.php';
try {
    $conn->beginTransaction();
    $conn->exec("DELETE FROM applications WHERE candidate_id IN (SELECT id FROM candidates WHERE name LIKE 'Mock Candidate%')");
    $conn->exec("DELETE FROM candidate_rejections WHERE candidate_id IN (SELECT id FROM candidates WHERE name LIKE 'Mock Candidate%')");
    $conn->exec("DELETE FROM candidates WHERE name LIKE 'Mock Candidate%'");
    $conn->commit();
    echo "Deleted mock data successfully";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Error: " . $e->getMessage();
}
?>
