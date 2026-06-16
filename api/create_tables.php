<?php
include 'db.php';

try {
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        createdBy VARCHAR(255) DEFAULT 'System',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );
    ");

    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        uploadedBy VARCHAR(255) DEFAULT 'System',
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
    );
    ");

    echo "Tables created successfully.";
} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage();
}
?>
