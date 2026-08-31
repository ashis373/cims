<?php
$db = new PDO('mysql:host=localhost;dbname=cims', 'root', '');
$db->exec("CREATE TABLE IF NOT EXISTS cims_email_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id VARCHAR(50),
    recipient_email VARCHAR(100),
    template_id INT,
    subject VARCHAR(255),
    body TEXT,
    sending_method ENUM('Automatic', 'Manual') DEFAULT 'Manual',
    unique_hash VARCHAR(255),
    status ENUM('Pending', 'Processing', 'Failed') DEFAULT 'Pending',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    last_error TEXT,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");
echo "Table created.";
?>
