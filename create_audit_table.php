<?php
require 'api/db.php';

$sql = "CREATE TABLE IF NOT EXISTS system_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

try {
    $conn->exec($sql);
    echo "system_audit_logs table created successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
