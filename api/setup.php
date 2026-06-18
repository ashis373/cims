<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';

$sql = "CREATE TABLE IF NOT EXISTS cims_candidates (
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
    recruiter VARCHAR(255),
    isBlacklisted TINYINT(1) DEFAULT 0,
    blacklistReason TEXT,
    rejectionReason TEXT,
    stageReason TEXT,
    isActive TINYINT(1) DEFAULT 1,
    positionApplied VARCHAR(255),
    offerDate DATETIME,
    offerStatus VARCHAR(50),
    offerAcceptedDate DATETIME,
    noJoinReason TEXT,
    rejectionDate DATETIME,
    rejectedBy VARCHAR(255),
    blacklistDate DATETIME,
    blacklistedBy VARCHAR(255),
    createdBy VARCHAR(255),
    updatedBy VARCHAR(255)
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
        "recruiter VARCHAR(255)",
        "isBlacklisted TINYINT(1) DEFAULT 0",
        "blacklistReason TEXT",
        "rejectionReason TEXT",
        "stageReason TEXT",
        "isActive TINYINT(1) DEFAULT 1",
        "positionApplied VARCHAR(255)",
        "offerDate DATETIME",
        "offerStatus VARCHAR(50)",
        "offerAcceptedDate DATETIME",
        "noJoinReason TEXT",
        "rejectionDate DATETIME",
        "rejectedBy VARCHAR(255)",
        "blacklistDate DATETIME",
        "blacklistedBy VARCHAR(255)",
        "createdBy VARCHAR(255)",
        "updatedBy VARCHAR(255)"
    ];

    foreach ($newColumns as $colDef) {
        $colName = explode(" ", $colDef)[0];
        try {
            $conn->exec("ALTER TABLE cims_candidates ADD COLUMN $colDef");
        } catch(PDOException $e) {
            // Column likely already exists, ignore
        }
    }
    
    // Add Indexes
    $indexes = [
        "CREATE INDEX idx_candidates_stage_role ON candidates(stage, role)",
        "CREATE INDEX idx_candidates_recruiter ON candidates(recruiter)",
        "CREATE INDEX idx_candidates_appliedAt ON candidates(appliedAt)",
        "CREATE INDEX idx_candidates_name ON candidates(name)",
        "CREATE INDEX idx_candidates_phone ON candidates(phone)",
        "CREATE INDEX idx_candidates_email ON candidates(email)",
        "CREATE INDEX idx_candidates_stage ON candidates(stage)",
        "CREATE INDEX idx_candidates_duplicate_check ON candidates(email, phone)"
    ];

    foreach ($indexes as $indexSql) {
        try {
            $conn->exec($indexSql);
        } catch(PDOException $e) {
            // Index likely already exists
        }
    }
    
    echo "Table 'candidates' created/updated successfully with new fields and indexes.";
} catch (PDOException $e) {
    die("Error creating table: " . $e->getMessage());
}
?>
