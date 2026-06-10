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
    employeeId VARCHAR(100),
    skills JSON,
    experience VARCHAR(255),
    relevantExperience VARCHAR(255),
    currentCompany VARCHAR(255),
    currentDesignation VARCHAR(255),
    currentCtc VARCHAR(255),
    expectedCtc VARCHAR(255),
    location VARCHAR(255),
    preferredLocation VARCHAR(255),
    alternateMobile VARCHAR(50),
    linkedInProfile VARCHAR(255),
    noticePeriod VARCHAR(100),
    recruiter VARCHAR(255)
)";

try {
    $conn->exec($sql);
    
    $newColumns = [
        "joiningDate DATETIME",
        "designation VARCHAR(255)",
        "employeeId VARCHAR(100)",
        "skills JSON",
        "experience VARCHAR(255)",
        "relevantExperience VARCHAR(255)",
        "currentCompany VARCHAR(255)",
        "currentDesignation VARCHAR(255)",
        "currentCtc VARCHAR(255)",
        "expectedCtc VARCHAR(255)",
        "location VARCHAR(255)",
        "preferredLocation VARCHAR(255)",
        "alternateMobile VARCHAR(50)",
        "linkedInProfile VARCHAR(255)",
        "noticePeriod VARCHAR(100)",
        "recruiter VARCHAR(255)"
    ];

    foreach ($newColumns as $colDef) {
        $colName = explode(" ", $colDef)[0];
        try {
            $conn->exec("ALTER TABLE candidates ADD COLUMN $colDef");
        } catch(PDOException $e) {
            // Column likely already exists, ignore
        }
    }
    
    echo "Table 'candidates' created/updated successfully.";
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage());
}
?>
