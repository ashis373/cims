<?php
include 'db.php';

try {
    // 1. USERS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        isActive TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ");

    // 2. CANDIDATES_NORMALIZED
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidates_normalized (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        alternateMobile VARCHAR(50),
        location VARCHAR(255),
        preferredLocation VARCHAR(255),
        experience VARCHAR(100),
        relevantExperience VARCHAR(100),
        currentCompany VARCHAR(255),
        currentDesignation VARCHAR(255),
        currentCtc VARCHAR(100),
        expectedCtc VARCHAR(100),
        noticePeriod VARCHAR(100),
        skills JSON,
        resume TEXT,
        linkedInProfile VARCHAR(255),
        isBlacklisted TINYINT(1) DEFAULT 0,
        isActive TINYINT(1) DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE INDEX idx_unique_candidate (email, phone)
    )
    ");

    // 3. JOB OPENINGS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS job_openings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Open',
        createdBy INT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    )
    ");

    // 4. APPLICATIONS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        job_id INT NULL,
        role_applied VARCHAR(255),
        source VARCHAR(100),
        stage VARCHAR(100) DEFAULT 'New Applicant',
        recruiter VARCHAR(255),
        appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates_normalized(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES job_openings(id) ON DELETE SET NULL,
        INDEX idx_applications_stage (stage)
    )
    ");

    // 5. CANDIDATE INTERVIEWS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        interviewDate DATETIME NOT NULL,
        feedback TEXT,
        status VARCHAR(50) DEFAULT 'Scheduled',
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        INDEX idx_interview_date (interviewDate)
    )
    ");

    // 6. CANDIDATE OFFERS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_offers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        offeredCtc VARCHAR(100),
        offerDate DATETIME,
        offerStatus VARCHAR(50) DEFAULT 'Pending',
        acceptedDate DATETIME NULL,
        joiningDate DATETIME NULL,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    )
    ");

    // 7. CANDIDATE REJECTIONS
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_rejections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        application_id INT NULL,
        type VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        recordedBy VARCHAR(255),
        FOREIGN KEY (candidate_id) REFERENCES candidates_normalized(id) ON DELETE CASCADE,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
    )
    ");

    // 8. CANDIDATE HISTORY
    $conn->exec("
    CREATE TABLE IF NOT EXISTS candidate_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_id VARCHAR(50) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        userId INT NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates_normalized(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    )
    ");

    // Data Migration
    $conn->exec("
    INSERT IGNORE INTO candidates_normalized (
        id, name, email, phone, alternateMobile, location, preferredLocation, 
        experience, relevantExperience, currentCompany, currentDesignation, 
        currentCtc, expectedCtc, noticePeriod, skills, resume, linkedInProfile, 
        isBlacklisted, isActive, createdAt, updatedAt
    )
    SELECT 
        id, name, email, phone, alternateMobile, location, preferredLocation, 
        experience, relevantExperience, currentCompany, currentDesignation, 
        currentCtc, expectedCtc, noticePeriod, skills, resume, linkedInProfile, 
        isBlacklisted, isActive, appliedAt, updatedAt
    FROM candidates;
    ");

    $conn->exec("
    INSERT IGNORE INTO applications (
        candidate_id, role_applied, source, stage, recruiter, appliedAt
    )
    SELECT 
        id, role, source, stage, recruiter, appliedAt
    FROM candidates;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Blacklisted', blacklistReason, blacklistDate
    FROM candidates WHERE isBlacklisted = 1 AND blacklistReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Rejected', rejectionReason, rejectionDate
    FROM candidates WHERE stage = 'Rejected' AND rejectionReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason)
    SELECT id, 'No-Join', noJoinReason
    FROM candidates WHERE stage = 'No Show' AND noJoinReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_offers (application_id, offeredCtc, offerDate, offerStatus, acceptedDate, joiningDate)
    SELECT a.id, c.expectedCtc, c.offerDate, c.offerStatus, c.offerAcceptedDate, c.joiningDate
    FROM candidates c
    JOIN applications a ON c.id = a.candidate_id
    WHERE c.offerDate IS NOT NULL OR c.offerStatus IS NOT NULL;
    ");

    echo "Database normalization and migration completed successfully.";
} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage());
}
?>
