<?php
include 'db.php';
try {
    $tables = ['applications', 'candidate_documents', 'candidate_history', 'candidate_interviews', 'candidate_notes', 'candidate_offers', 'candidate_rejections', 'candidates', 'candidates_normalized', 'candidates_old', 'job_openings', 'users'];
    foreach ($tables as $t) {
        // check if table exists
        $stmt = $conn->query("SHOW TABLES LIKE '$t'");
        if ($stmt->rowCount() > 0) {
            $conn->exec("RENAME TABLE `$t` TO `cims_$t`");
            echo "Renamed $t to cims_$t\n";
        }
    }
    echo "All tables renamed successfully.";
} catch (PDOException $e) {
    die("Rename failed: " . $e->getMessage());
}
?>
