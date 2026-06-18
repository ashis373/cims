<?php
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
