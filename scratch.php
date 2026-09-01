<?php
include 'api/db.php';
try {
    $conn->exec("ALTER TABLE cims_smtp_config ADD COLUMN worker_enabled TINYINT(1) DEFAULT 1");
    echo "Added worker_enabled\n";
} catch(Exception $e) { echo $e->getMessage() . "\n"; }

try {
    $conn->exec("ALTER TABLE cims_smtp_config ADD COLUMN last_worker_run DATETIME NULL");
    echo "Added last_worker_run\n";
} catch(Exception $e) { echo $e->getMessage() . "\n"; }
?>
