<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include '../db.php';

try {
    $stats = [];
    // Total
    $stats['total'] = $conn->query("SELECT COUNT(*) FROM cims_candidates")->fetchColumn();
    // Active (Not inactive stages, not blacklisted)
    $stats['active'] = $conn->query("
        SELECT COUNT(*) FROM cims_applications a 
        JOIN cims_candidates c ON a.candidate_id = c.id 
        WHERE a.stage NOT IN ('Rejected', 'Offer Declined', 'No Show', 'Offer Expired') 
        AND c.isBlacklisted = 0
    ")->fetchColumn();
    // New Applicants
    $stats['newApplicants'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'New Applicant'")->fetchColumn();
    // Scheduled
    $stats['scheduled'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Interview Scheduled'")->fetchColumn();
    // Selected
    $stats['selected'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage IN ('Shortlisted', 'Interview Completed')")->fetchColumn();
    // Offers Released
    $stats['offersReleased'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Offer Released'")->fetchColumn();
    // Offers Accepted
    $stats['offersAccepted'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Offer Accepted'")->fetchColumn();
    // Offers Declined
    $stats['offersDeclined'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Offer Declined'")->fetchColumn();
    // Joined
    $stats['joined'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Joined'")->fetchColumn();
    // Rejected
    $stats['rejected'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'Rejected'")->fetchColumn();
    // Blacklisted
    $stats['blacklisted'] = $conn->query("SELECT COUNT(*) FROM cims_candidates WHERE isBlacklisted = 1")->fetchColumn();
    // No Show
    $stats['noShow'] = $conn->query("SELECT COUNT(*) FROM cims_applications WHERE stage = 'No Show'")->fetchColumn();
    
    // Funnel Data
    $stages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled', 'Offer Released', 'Joined', 'Rejected', 'No Show', 'On Hold'];
    $funnel = [];
    foreach ($stages as $stage) {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM cims_applications WHERE stage = ?");
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
