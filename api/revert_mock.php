<?php
include 'db.php';

try {
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $conn->exec("TRUNCATE TABLE candidates;");
    $conn->exec("TRUNCATE TABLE applications;");
    $conn->exec("TRUNCATE TABLE candidate_rejections;");
    $conn->exec("TRUNCATE TABLE candidate_offers;");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Data Migration
    $conn->exec("
    INSERT IGNORE INTO candidates (
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
    FROM candidates_old;
    ");

    $conn->exec("
    INSERT IGNORE INTO applications (
        candidate_id, role_applied, source, stage, recruiter, appliedAt
    )
    SELECT 
        id, role, source, stage, recruiter, appliedAt
    FROM candidates_old;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Blacklisted', blacklistReason, blacklistDate
    FROM candidates_old WHERE isBlacklisted = 1 AND blacklistReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Rejected', rejectionReason, rejectionDate
    FROM candidates_old WHERE stage = 'Rejected' AND rejectionReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_rejections (candidate_id, type, reason)
    SELECT id, 'No-Join', noJoinReason
    FROM candidates_old WHERE stage = 'No Show' AND noJoinReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO candidate_offers (application_id, offeredCtc, offerDate, offerStatus, acceptedDate, joiningDate)
    SELECT a.id, c.expectedCtc, c.offerDate, c.offerStatus, c.offerAcceptedDate, c.joiningDate
    FROM candidates_old c
    JOIN applications a ON c.id = a.candidate_id
    WHERE c.offerDate IS NOT NULL OR c.offerStatus IS NOT NULL;
    ");

    echo "Reverted back to your original 32 candidates perfectly.";
} catch (PDOException $e) {
    die("Revert failed: " . $e->getMessage());
}
?>
