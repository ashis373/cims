<?php
require 'api/db.php';
$id = 'lfxhyqnxmtmm1e12';

// execute the logic from candidates.php
$newStage = 'Offer Released';
$stageMap = [
    'Interview Scheduled' => 'Interview',
    'Offer Released' => 'Offer',
    'Rejected' => 'Rejection'
];

$type = $stageMap[$newStage];
$tplStmt = $conn->prepare("SELECT * FROM cims_email_templates WHERE category = ? AND (sending_method = 'Automatic' OR LOWER(sending_method) = 'automatic') AND (is_active = 1 OR is_active = '1') LIMIT 1");
$tplStmt->execute([$type]);
$tpl = $tplStmt->fetch(PDO::FETCH_ASSOC);

if ($tpl) {
    echo "Found template ID " . $tpl['id'] . "\n";
    $tplId = $tpl['id'];
    $logCheck = $conn->prepare("SELECT COUNT(*) FROM cims_email_logs WHERE candidate_id = ? AND template_id = ? AND unique_hash LIKE 'auto-%'");
    $logCheck->execute([$id, $tplId]);
    if ($logCheck->fetchColumn() == 0) {
        echo "Log check passed, inserting to queue\n";
        $candName = "test name";
        $candEmail = "test@example.com";
        $candRole = "Role";
        
        $body = str_replace(['{CandidateName}', '{Role}', '{Date}'], [$candName, $candRole, date('m/d/Y')], $tpl['body']);
        $subject = str_replace(['{CandidateName}', '{Role}', '{Date}'], [$candName, $candRole, date('m/d/Y')], $tpl['subject']);
        
        $unique_hash = "auto-$id-$tplId-" . time();
        
        $queueInsert = $conn->prepare("
            INSERT INTO cims_email_queue (candidate_id, recipient_email, template_id, subject, body, sending_method, unique_hash, status) 
            VALUES (?, ?, ?, ?, ?, 'Automatic', ?, 'Pending')
        ");
        $queueInsert->execute([$id, $candEmail, $tplId, $subject, $body, $unique_hash]);
        echo "Inserted to queue\n";
    } else {
        echo "Log check failed - already exists\n";
    }
} else {
    echo "Template not found\n";
}
