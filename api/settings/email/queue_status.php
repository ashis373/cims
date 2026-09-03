<?php
$origin = isset($_SERVER["HTTP_ORIGIN"]) ? $_SERVER["HTTP_ORIGIN"] : "*";
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include '../../db.php';
$required_permission = 'can_view';
require_once '../../auth_middleware.php';
require_permission('email_settings');
$stmt = $conn->query("SELECT status, COUNT(*) as count FROM cims_email_queue GROUP BY status");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
$counts = [
    'Pending' => 0,
    'Processing' => 0,
    'Sent' => 0,
    'Failed' => 0
];
foreach ($results as $row) {
    if (isset($counts[$row['status']])) {
        $counts[$row['status']] = (int)$row['count'];
    }
}
// Get last processed time from smtp config (updated every time the worker runs)
$lastLogStmt = $conn->query("SELECT last_worker_run as last_processed FROM cims_smtp_config LIMIT 1");
$lastProcessed = $lastLogStmt ? $lastLogStmt->fetchColumn() : null;
// Check if worker is running using the lock file
$lockFile = __DIR__ . '/worker.lock';
$isRunning = false;
if (file_exists($lockFile)) {
    $lock = fopen($lockFile, 'c');
    if (!flock($lock, LOCK_EX | LOCK_NB)) {
        // We couldn't get the lock, which means the worker has it and is running
        $isRunning = true;
    } else {
        flock($lock, LOCK_UN);
    }
    fclose($lock);
}
// Get worker enabled status
$smtpStmt = $conn->query("SELECT worker_enabled FROM cims_smtp_config LIMIT 1");
$workerEnabled = $smtpStmt ? $smtpStmt->fetchColumn() : 1;
echo json_encode([
    'counts' => $counts,
    'worker_running' => $isRunning,
    'last_processed' => $lastProcessed,
    'worker_enabled' => $workerEnabled === false ? true : (bool)$workerEnabled
]);
?>
