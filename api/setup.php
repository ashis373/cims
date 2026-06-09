<?php
include 'db.php';

$sql = "CREATE TABLE IF NOT EXISTS candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    source VARCHAR(50),
    role VARCHAR(255),
    department VARCHAR(100),
    resume TEXT,
    notes TEXT,
    appliedAt DATETIME,
    updatedAt DATETIME,
    stage VARCHAR(50),
    tags JSON,
    interviews JSON,
    activity JSON,
    applications JSON,
    joiningDate DATETIME,
    designation VARCHAR(255),
    employeeId VARCHAR(100)
)";

try {
    $conn->exec($sql);
    try {
        $conn->exec("ALTER TABLE candidates ADD COLUMN joiningDate DATETIME, ADD COLUMN designation VARCHAR(255), ADD COLUMN employeeId VARCHAR(100)");
    } catch(PDOException $e) {}
    echo "Table 'candidates' created successfully or already exists.";
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage());
}
?>
