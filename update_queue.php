<?php
$db = new PDO('mysql:host=localhost;dbname=cims', 'root', '');

// Modify existing table
$db->exec("ALTER TABLE cims_email_queue MODIFY status ENUM('Pending', 'Processing', 'Sent', 'Failed') DEFAULT 'Pending'");
$db->exec("ALTER TABLE cims_email_queue MODIFY body LONGTEXT");
$db->exec("ALTER TABLE cims_email_queue MODIFY recipient_email VARCHAR(255)");
$db->exec("ALTER TABLE cims_email_queue ADD COLUMN IF NOT EXISTS worker_id VARCHAR(50) DEFAULT NULL");

// Add index safely
try {
    $db->exec("CREATE INDEX idx_unique_hash ON cims_email_queue(unique_hash)");
} catch (Exception $e) {
    // Index might already exist
}

echo "Table updated successfully.";
?>
