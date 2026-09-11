<?php
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

include '../db.php';
require_once '../auth_middleware.php';

// Auth checks
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_permission('alerts');

try {
    $scopeWhere = get_candidate_scope_where('c');
    $alerts = [];
    $idCounter = 1;
    
    // Add alert helper
    $addAlert = function($type, $category, $title, $candidateName, $timeStr, $priority) use (&$alerts, &$idCounter) {
        $alerts[] = [
            "id" => $idCounter++,
            "type" => $type,         // For icon selection
            "category" => $category, // 'Critical', 'Action Required', 'Attention', 'Information', 'Success'
            "title" => $title,
            "candidate" => $candidateName,
            "timeRaw" => $timeStr,
            "unread" => true,
            "priority" => $priority  // 'Critical', 'High', 'Medium', 'Low'
        ];
    };

    // --- CRITICAL ---
    // 1. Duplicate Candidate
    $stmt = $conn->query("
        SELECT c.name, c.email, COUNT(*) as cnt, MAX(c.updatedAt) as last_updated
        FROM cims_candidates c
        WHERE c.email != '' AND c.email IS NOT NULL AND c.isBlacklisted = 0 AND c.isActive = 1 AND $scopeWhere
        GROUP BY c.email 
        HAVING cnt > 1 
        ORDER BY last_updated DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("duplicate", "Critical", "Duplicate candidate detected", $row['name'], $row['last_updated'], "Critical");
    }

    // 2. Email failure (eliminated N+1 query with JOIN)
    try {
        $stmt = $conn->query("
            SELECT l.candidate_id, l.subject, l.sent_at, l.error_message, c.name as candidate_name
            FROM cims_email_logs l
            JOIN cims_candidates c ON l.candidate_id = c.id
            WHERE l.status = 'Failed' AND $scopeWhere
            ORDER BY l.sent_at DESC LIMIT 5
        ");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $candidateName = $row['candidate_name'] ?: 'Unknown';
            $addAlert("email_failed", "Critical", "Email delivery failed", $candidateName, $row['sent_at'], "Critical");
        }
    } catch (Exception $e) {}

    // --- ACTION REQUIRED ---
    // 1. Interview feedback pending (Assuming stage contains Interview, updated more than 1 day ago)
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage LIKE '%Interview%' AND c.isBlacklisted = 0 AND c.isActive = 1 
        AND c.updatedAt < DATE_SUB(NOW(), INTERVAL 1 DAY) AND $scopeWhere
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("interview_feedback", "Action Required", "Interview feedback pending", $row['name'], $row['updatedAt'], "High");
    }

    // 2. Offer acceptance pending (Offer Released more than 2 days ago)
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage = 'Offer Released' AND c.isBlacklisted = 0 AND c.isActive = 1 
        AND c.updatedAt < DATE_SUB(NOW(), INTERVAL 2 DAY) AND $scopeWhere
        ORDER BY c.updatedAt ASC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("offer_pending", "Action Required", "Offer acceptance pending", $row['name'], $row['updatedAt'], "High");
    }

    // 3. Missing candidate info (No email or no phone)
    $stmt = $conn->query("
        SELECT c.name, c.createdAt 
        FROM cims_candidates c
        WHERE (c.email = '' OR c.email IS NULL OR c.phone = '' OR c.phone IS NULL)
        AND c.isBlacklisted = 0 AND c.isActive = 1 AND $scopeWhere
        ORDER BY c.createdAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("missing_info", "Action Required", "Missing candidate information", $row['name'], $row['createdAt'], "Medium");
    }

    // --- ATTENTION ---
    // 1. Candidate stuck in stage (same stage for > 14 days)
    $stmt = $conn->query("
        SELECT c.name, a.stage, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE c.updatedAt < DATE_SUB(NOW(), INTERVAL 14 DAY) 
        AND a.stage NOT IN ('Rejected', 'Hired', 'Joined', 'Offer Accepted', 'New Applicant')
        AND c.isBlacklisted = 0 AND c.isActive = 1 AND $scopeWhere
        ORDER BY c.updatedAt ASC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("stuck_stage", "Attention", "Candidate stuck in " . $row['stage'], $row['name'], $row['updatedAt'], "Medium");
    }

    // 2. Joining approaching (Joined/Offer Accepted stage)
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE (a.stage = 'Offer Accepted' OR a.stage = 'Joined')
        AND c.isBlacklisted = 0 AND c.isActive = 1 AND $scopeWhere
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("joining", "Attention", "Joining date approaching", $row['name'], $row['updatedAt'], "Medium");
    }

    // --- INFORMATION ---
    // 1. New candidate
    $stmt = $conn->query("
        SELECT c.name, c.createdAt 
        FROM cims_candidates c
        WHERE c.createdAt > DATE_SUB(NOW(), INTERVAL 2 DAY)
        AND c.isBlacklisted = 0 AND c.isActive = 1 AND $scopeWhere
        ORDER BY c.createdAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("new_candidate", "Information", "New candidate added", $row['name'], $row['createdAt'], "Low");
    }

    // 2. Blacklisted
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c
        WHERE c.isBlacklisted = 1 AND $scopeWhere
        ORDER BY c.updatedAt DESC LIMIT 3
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("blacklisted", "Information", "Candidate blacklisted", $row['name'], $row['updatedAt'], "High");
    }

    // --- SUCCESS ---
    // 1. Offer accepted
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage = 'Offer Accepted' 
        AND c.updatedAt > DATE_SUB(NOW(), INTERVAL 7 DAY) AND $scopeWhere
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("offer_accepted", "Success", "Offer accepted", $row['name'], $row['updatedAt'], "Low");
    }

    // 2. Joined
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage = 'Joined' 
        AND c.updatedAt > DATE_SUB(NOW(), INTERVAL 7 DAY) AND $scopeWhere
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("joined", "Success", "Candidate joined successfully", $row['name'], $row['updatedAt'], "Low");
    }

    // ---------------------------------------------------------
    // Format Time and Sort
    // ---------------------------------------------------------

    usort($alerts, function($a, $b) {
        return strtotime($b['timeRaw']) - strtotime($a['timeRaw']);
    });

    foreach ($alerts as &$alert) {
        $time_ago = strtotime($alert['timeRaw']);
        if (!$time_ago) $time_ago = time();
        $time_difference = time() - $time_ago;
        if ($time_difference < 0) {
            $time_difference = 0;
        }
        $seconds = $time_difference;
        $minutes = round($seconds / 60);
        $hours   = round($seconds / 3600);
        $days    = round($seconds / 86400);
        if($seconds <= 60) {
            $alert['time'] = "Just Now";
        } else if($minutes <= 60) {
            $alert['time'] = "$minutes minutes ago";
        } else if($hours <= 24) {
            $alert['time'] = "$hours hours ago";
        } else {
            $alert['time'] = "$days days ago";
        }
    }

    echo json_encode($alerts);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "An error occurred while fetching alerts."]);
}
