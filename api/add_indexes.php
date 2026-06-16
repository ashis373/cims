<?php
include 'db.php';
$tables = ['candidate_history', 'candidate_notes', 'candidate_documents', 'candidate_rejections', 'applications'];
foreach ($tables as $t) {
    try {
        $conn->exec("CREATE INDEX idx_{$t}_candidate_id ON {$t}(candidate_id)");
    } catch (Exception $e) {}
}
echo 'Indexes added.';
?>
