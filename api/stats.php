<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

try {
    $stats = [];
    // Total
    $stats['total'] = $conn->query("SELECT COUNT(*) FROM candidates")->fetchColumn();
    // New Applicants
    $stats['newApplicants'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'New Applicant'")->fetchColumn();
    // Offers Released
    $stats['offersReleased'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'Offer Released'")->fetchColumn();
    // Offers Accepted
    $stats['offersAccepted'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'Offer Accepted'")->fetchColumn();
    // Joined
    $stats['joined'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'Joined'")->fetchColumn();
    // Rejected
    $stats['rejected'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'Rejected'")->fetchColumn();
    // Blacklisted
    $stats['blacklisted'] = $conn->query("SELECT COUNT(*) FROM candidates WHERE isBlacklisted = 1")->fetchColumn();
    // No Show
    $stats['noShow'] = $conn->query("SELECT COUNT(*) FROM applications WHERE stage = 'No Show'")->fetchColumn();
    
    // Funnel Data
    $stages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled', 'Offer Released', 'Joined', 'Rejected', 'No Show', 'On Hold'];
    $funnel = [];
    foreach ($stages as $stage) {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM applications WHERE stage = ?");
        $stmt->execute([$stage]);
        $funnel[$stage] = $stmt->fetchColumn();
    }
    $stats['funnel'] = $funnel;
    
    echo json_encode($stats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
