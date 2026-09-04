<?php
require 'api/db.php';
$id = 'test';
$candEmail = 'test@test.com';
$tplId = 66;
$subject = 'Test';
$body = 'Test';
$unique_hash = 'auto-test';
try {
    $stmt = $conn->prepare("INSERT INTO cims_email_queue (candidate_id, recipient_email, template_id, subject, body, sending_method, unique_hash, status) VALUES (?, ?, ?, ?, ?, 'Automatic', ?, 'Pending')");
    $res = $stmt->execute([$id, $candEmail, $tplId, $subject, $body, $unique_hash]);
    var_dump($res);
} catch (Exception $e) {
    echo $e->getMessage();
}
