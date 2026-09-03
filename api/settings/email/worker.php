<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../../db.php';
require '../../vendor/autoload.php';

// Allow execution without JWT if running directly from CLI (Cron Job)
if (php_sapi_name() !== 'cli') {
$required_module = 'email_settings';
    $required_permission = 'can_view'; // or just general access
    require_once '../../auth_middleware.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// File-based lock to prevent overlapping Cron jobs
$lockFile = __DIR__ . '/worker.lock';
$lock = fopen($lockFile, 'c');
if (!flock($lock, LOCK_EX | LOCK_NB)) {
    echo json_encode(["success" => false, "message" => "Worker is already running."]);
    exit;
}

// Check if worker is enabled by admin
$smtpStmt = $conn->query("SELECT * FROM cims_smtp_config LIMIT 1");
$smtp = $smtpStmt->fetch(PDO::FETCH_ASSOC);

if ($smtp && isset($smtp['worker_enabled']) && $smtp['worker_enabled'] == 0) {
    echo json_encode(["success" => true, "message" => "Worker is paused by admin."]);
    exit;
}

$workerId = uniqid('worker_', true);

// Update last worker run time
$conn->exec("UPDATE cims_smtp_config SET last_worker_run = CURRENT_TIMESTAMP");

// Recover stale processing records (crashed workers > 10 mins ago)
$conn->exec("UPDATE cims_email_queue SET status = 'Pending', worker_id = NULL WHERE status = 'Processing' AND started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE) AND attempts < max_attempts");

// Safely claim up to 50 pending emails (or failed emails scheduled for now/past)
$claimStmt = $conn->prepare("
    UPDATE cims_email_queue 
    SET status = 'Processing', worker_id = ?, started_at = CURRENT_TIMESTAMP 
    WHERE (status = 'Pending' OR (status = 'Failed' AND attempts < max_attempts)) 
      AND scheduled_at <= CURRENT_TIMESTAMP 
    LIMIT 50
");
$claimStmt->execute([$workerId]);

$fetchStmt = $conn->prepare("SELECT * FROM cims_email_queue WHERE status = 'Processing' AND worker_id = ?");
$fetchStmt->execute([$workerId]);
$emails = $fetchStmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($emails)) {
    echo json_encode(["success" => true, "message" => "No emails in queue."]);
    exit;
}

if (!$smtp || !$smtp['host']) {
    // Revert status to failed if SMTP is not configured
    $revertStmt = $conn->prepare("UPDATE cims_email_queue SET status = 'Failed', last_error = 'SMTP not configured', worker_id = NULL WHERE status = 'Processing' AND worker_id = ?");
    $revertStmt->execute([$workerId]);
    echo json_encode(["success" => false, "message" => "SMTP not configured."]);
    exit;
}

$processedCount = 0;
$failedCount = 0;

foreach ($emails as $email) {
    $mail = new PHPMailer(true);
    $mailSent = false;
    $errorMsg = '';

    try {
        $mail->isSMTP();
        $mail->Host       = $smtp['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtp['username'];
        $mail->Password   = $smtp['password'];
        if ($smtp['encryption'] === 'tls') $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        elseif ($smtp['encryption'] === 'ssl') $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = $smtp['port'];

        $mail->setFrom($smtp['from_email'], $smtp['from_name']);
        $mail->addAddress($email['recipient_email']);
        $mail->isHTML(true);
        $mail->Subject = $email['subject'];
        $mail->Body    = $email['body'];

        $mail->send();
        $mailSent = true;
    } catch (Exception $e) {
        $errorMsg = $mail->ErrorInfo ?: $e->getMessage();
    }

    if ($mailSent) {
        // Move to logs
        $logStmt = $conn->prepare("
            INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, error_message, unique_hash, sent_at)
            VALUES (?, ?, ?, ?, ?, 'Delivered', '', ?, CURRENT_TIMESTAMP)
        ");
        $logStmt->execute([
            $email['recipient_email'],
            $email['subject'],
            $email['body'],
            $email['template_id'],
            $email['candidate_id'],
            $email['unique_hash']
        ]);
        
        // Retain in queue as Sent
        $updStmt = $conn->prepare("UPDATE cims_email_queue SET status = 'Sent', sent_at = CURRENT_TIMESTAMP, worker_id = NULL WHERE id = ?");
        $updStmt->execute([$email['id']]);
        
        $processedCount++;
    } else {
        $attempts = $email['attempts'] + 1;
        if ($attempts >= $email['max_attempts']) {
            // Max attempts reached, move to logs as Failed
            $logStmt = $conn->prepare("
                INSERT INTO cims_email_logs (recipient_email, subject, body, template_id, candidate_id, status, error_message, unique_hash, sent_at)
                VALUES (?, ?, ?, ?, ?, 'Failed', ?, ?, NULL)
            ");
            $logStmt->execute([
                $email['recipient_email'],
                $email['subject'],
                $email['body'],
                $email['template_id'],
                $email['candidate_id'],
                $errorMsg,
                $email['unique_hash']
            ]);
            
            // Retain in queue as Permanent Failure
            $updStmt = $conn->prepare("UPDATE cims_email_queue SET status = 'Failed', attempts = ?, last_error = ?, failed_at = CURRENT_TIMESTAMP, worker_id = NULL WHERE id = ?");
            $updStmt->execute([$attempts, $errorMsg, $email['id']]);
        } else {
            // Requeue as failed with exponential backoff (e.g. 5, 10 minutes)
            $delayMinutes = $attempts * 5;
            $updStmt = $conn->prepare("UPDATE cims_email_queue SET status = 'Failed', attempts = ?, last_error = ?, failed_at = CURRENT_TIMESTAMP, scheduled_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE), worker_id = NULL WHERE id = ?");
            $updStmt->execute([$attempts, $errorMsg, $delayMinutes, $email['id']]);
        }
        $failedCount++;
    }
}

echo json_encode([
    "success" => true, 
    "message" => "Queue processed.",
    "processed" => $processedCount,
    "failed" => $failedCount
]);
?>
 
