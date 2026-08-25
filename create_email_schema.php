<?php
include 'api/db.php';

try {
    $conn->exec("
        CREATE TABLE IF NOT EXISTS cims_email_templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'General',
            trigger_event VARCHAR(100) DEFAULT NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    ");

    $conn->exec("
        CREATE TABLE IF NOT EXISTS cims_smtp_config (
            id INT AUTO_INCREMENT PRIMARY KEY,
            host VARCHAR(255) NOT NULL,
            port INT NOT NULL,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            encryption VARCHAR(20) DEFAULT 'tls',
            from_name VARCHAR(100) NOT NULL,
            from_email VARCHAR(100) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    ");
    
    // Insert default SMTP config if none exists
    $stmt = $conn->query("SELECT COUNT(*) FROM cims_smtp_config");
    if ($stmt->fetchColumn() == 0) {
        $conn->exec("
            INSERT INTO cims_smtp_config (host, port, username, password, encryption, from_name, from_email) 
            VALUES ('smtp.example.com', 587, 'ats@example.com', 'password', 'tls', 'Acme ATS', 'ats@example.com')
        ");
    }

    $conn->exec("
        CREATE TABLE IF NOT EXISTS cims_email_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recipient_email VARCHAR(100) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            template_id INT DEFAULT NULL,
            candidate_id VARCHAR(50) DEFAULT NULL,
            status ENUM('Delivered', 'Opened', 'Bounced', 'Processing', 'Failed') DEFAULT 'Processing',
            error_message TEXT DEFAULT NULL,
            unique_hash VARCHAR(64) UNIQUE, /* For duplicate protection */
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ");
    
    // Insert default templates
    $stmt = $conn->query("SELECT COUNT(*) FROM cims_email_templates");
    if ($stmt->fetchColumn() == 0) {
        $conn->exec("
            INSERT INTO cims_email_templates (name, subject, body, category, trigger_event) VALUES 
            ('Interview Invitation', 'Invitation for Interview - [Company Name]', '<p>Dear [Candidate Name],</p><p>We would like to invite you for an interview...</p>', 'Candidate', 'interview_scheduled'),
            ('Offer Letter', 'Job Offer from [Company Name]', '<p>Dear [Candidate Name],</p><p>We are thrilled to offer you...</p>', 'Offer', 'offer_released'),
            ('Application Received', 'We have received your application', '<p>Dear [Candidate Name],</p><p>Thank you for applying to...</p>', 'Candidate', 'application_submitted'),
            ('Rejection Email', 'Update on your application', '<p>Dear [Candidate Name],</p><p>Thank you for your time...</p>', 'Candidate', 'candidate_rejected')
        ");
    }

    echo "Email tables created successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
