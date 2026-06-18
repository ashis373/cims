<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';
$tables = ['candidate_history', 'candidate_notes', 'candidate_documents', 'candidate_rejections', 'applications'];
foreach ($tables as $t) {
    try {
        $conn->exec("CREATE INDEX idx_{$t}_candidate_id ON {$t}(candidate_id)");
    } catch (Exception $e) {}
}
echo 'Indexes added.';
?>
