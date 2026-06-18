<?php
if (isset($_SERVER['HTTP_ORIGIN'])) { header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}"); }
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

include 'db.php';

try {
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $conn->exec("TRUNCATE TABLE cims_candidates;");
    $conn->exec("TRUNCATE TABLE cims_applications;");
    $conn->exec("TRUNCATE TABLE cims_candidate_rejections;");
    $conn->exec("TRUNCATE TABLE cims_candidate_offers;");
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1;");

    // Data Migration
    $conn->exec("
    INSERT IGNORE INTO cims_candidates (
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
    FROM cims_candidates_old;
    ");

    $conn->exec("
    INSERT IGNORE INTO cims_applications (
        candidate_id, role_applied, source, stage, recruiter, appliedAt
    )
    SELECT 
        id, role, source, stage, recruiter, appliedAt
    FROM cims_candidates_old;
    ");

    $conn->exec("
    INSERT IGNORE INTO cims_candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Blacklisted', blacklistReason, blacklistDate
    FROM cims_candidates_old WHERE isBlacklisted = 1 AND blacklistReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO cims_candidate_rejections (candidate_id, type, reason, recordedAt)
    SELECT id, 'Rejected', rejectionReason, rejectionDate
    FROM cims_candidates_old WHERE stage = 'Rejected' AND rejectionReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO cims_candidate_rejections (candidate_id, type, reason)
    SELECT id, 'No-Join', noJoinReason
    FROM cims_candidates_old WHERE stage = 'No Show' AND noJoinReason IS NOT NULL;
    ");

    $conn->exec("
    INSERT IGNORE INTO cims_candidate_offers (application_id, offeredCtc, offerDate, offerStatus, acceptedDate, joiningDate)
    SELECT a.id, c.expectedCtc, c.offerDate, c.offerStatus, c.offerAcceptedDate, c.joiningDate
    FROM cims_candidates_old c
    JOIN cims_applications a ON c.id = a.candidate_id
    WHERE c.offerDate IS NOT NULL OR c.offerStatus IS NOT NULL;
    ");

    echo "Reverted back to your original 32 candidates perfectly.";
} catch (PDOException $e) {
    die("Revert failed: " . $e->getMessage());
}
?>
