<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';

try {
    $conn->exec("
    CREATE TABLE IF NOT EXISTS cims_candidate_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        createdBy VARCHAR(255) DEFAULT 'System',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES cims_candidates(id) ON DELETE CASCADE
    );
    ");

    $conn->exec("
    CREATE TABLE IF NOT EXISTS cims_candidate_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        uploadedBy VARCHAR(255) DEFAULT 'System',
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES cims_candidates(id) ON DELETE CASCADE
    );
    ");

    echo "Tables created successfully.";
} catch (PDOException $e) {
    echo "Error creating tables: " . $e->getMessage();
}
?>
