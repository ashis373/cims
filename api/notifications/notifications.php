<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('alerts');
try {
    $alerts = [];
    $idCounter = 1;
    // Helper to add alert
    $addAlert = function($type, $title, $candidateName, $timeStr) use (&$alerts, &$idCounter) {
        $alerts[] = [
            "id" => $idCounter++,
            "type" => $type,
            "title" => $title,
            "candidate" => $candidateName,
            "timeRaw" => $timeStr,
            "unread" => true
        ];
    };
    // 1. Interview pending/upcoming
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage LIKE '%Interview%' AND c.isBlacklisted = 0 AND c.isActive = 1 
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("interview", "Interview feedback pending", $row['name'], $row['updatedAt']);
    }
    
    // 2. Offer acceptance pending
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage = 'Offer Released' AND c.isBlacklisted = 0 AND c.isActive = 1 
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("offer", "Offer acceptance pending", $row['name'], $row['updatedAt']);
    }
    // 3. Joining date approaching
    $stmt = $conn->query("
        SELECT c.name, c.updatedAt 
        FROM cims_candidates c 
        JOIN cims_applications a ON c.id = a.candidate_id 
        WHERE a.stage = 'Joined' AND c.isBlacklisted = 0 AND c.isActive = 1 
        ORDER BY c.updatedAt DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $timeRaw = $row['updatedAt'];
        $addAlert("joining", "Joining date approaching", $row['name'], $timeRaw);
    }
    // 4. Duplicates detected
    $stmt = $conn->query("
        SELECT name, email, COUNT(*) as cnt, MAX(updatedAt) as last_updated
        FROM cims_candidates 
        WHERE email != '' AND email IS NOT NULL AND isBlacklisted = 0 AND isActive = 1
        GROUP BY email 
        HAVING cnt > 1 
        ORDER BY last_updated DESC LIMIT 5
    ");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addAlert("duplicate", "Duplicate candidate detected", $row['name'], $row['last_updated']);
    }
    // Sort all alerts by time descending
    usort($alerts, function($a, $b) {
        return strtotime($b['timeRaw']) - strtotime($a['timeRaw']);
    });
    // Format 'time' field as "X ago"
    foreach ($alerts as &$alert) {
        $time_ago = strtotime($alert['timeRaw']);
        if (!$time_ago) $time_ago = time();
        $time_difference = time() - $time_ago;
        
        // Ensure difference isn't negative
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
        
        // Remove raw time field before sending to client
        unset($alert['timeRaw']);
    }
    echo json_encode($alerts);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>


