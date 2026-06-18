<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require 'db.php';

try {
    $conn->exec("ALTER TABLE jobs 
        ADD COLUMN job_type VARCHAR(50) DEFAULT 'Full Time',
        ADD COLUMN work_mode VARCHAR(50) DEFAULT 'Hybrid',
        ADD COLUMN min_exp INT DEFAULT 0,
        ADD COLUMN max_exp INT DEFAULT 0,
        ADD COLUMN min_salary INT DEFAULT 0,
        ADD COLUMN max_salary INT DEFAULT 0,
        ADD COLUMN description TEXT,
        ADD COLUMN target_date VARCHAR(50) DEFAULT '',
        ADD COLUMN priority VARCHAR(20) DEFAULT 'Medium',
        ADD COLUMN internal_notes TEXT
    ");
    echo "Columns added successfully.";
} catch (PDOException $e) {
    // If columns already exist, this might throw an error which we can ignore
    echo "Error or already added: " . $e->getMessage();
}
?>
