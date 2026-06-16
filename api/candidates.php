<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper function to extract date
function parseDate($dateStr) {
    return (isset($dateStr) && $dateStr) ? date('Y-m-d H:i:s', strtotime($dateStr)) : null;
}

if ($method === 'GET') {
    try {
        // Fetch candidates with primary application details
        $stmt = $conn->query("
            SELECT c.*, a.stage, a.role_applied as role, a.department, a.source, a.recruiter, a.appliedAt 
            FROM candidates c 
            LEFT JOIN applications a ON c.id = a.candidate_id 
            ORDER BY c.updatedAt DESC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($results)) {
            echo json_encode([]);
            exit;
        }

        // Collect all IDs for batch querying
        $candidateIds = array_column($results, 'id');
        $inQuery = implode(',', array_fill(0, count($candidateIds), '?'));
        
        // 1. Batch fetch history
        $stmtHist = $conn->prepare("SELECT * FROM candidate_history WHERE candidate_id IN ($inQuery) ORDER BY createdAt DESC");
        $stmtHist->execute($candidateIds);
        $allHistory = $stmtHist->fetchAll(PDO::FETCH_ASSOC);
        $histByCand = [];
        foreach ($allHistory as $h) {
            $histByCand[$h['candidate_id']][] = [
                'id' => $h['id'],
                'at' => str_replace(' ', 'T', $h['createdAt']) . 'Z',
                'kind' => 'system',
                'message' => $h['action'] . ($h['details'] ? ': ' . $h['details'] : '')
            ];
        }

        // 2. Batch fetch notes
        $stmtNotes = $conn->prepare("SELECT * FROM candidate_notes WHERE candidate_id IN ($inQuery) ORDER BY createdAt DESC");
        $stmtNotes->execute($candidateIds);
        $allNotes = $stmtNotes->fetchAll(PDO::FETCH_ASSOC);
        $notesByCand = [];
        foreach ($allNotes as $n) { $notesByCand[$n['candidate_id']][] = $n; }

        // 3. Batch fetch documents
        $stmtDocs = $conn->prepare("SELECT * FROM candidate_documents WHERE candidate_id IN ($inQuery) ORDER BY uploadedAt DESC");
        $stmtDocs->execute($candidateIds);
        $allDocs = $stmtDocs->fetchAll(PDO::FETCH_ASSOC);
        $docsByCand = [];
        foreach ($allDocs as $d) { $docsByCand[$d['candidate_id']][] = $d; }

        // 4. Batch fetch alerts (rejections)
        $stmtRej = $conn->prepare("SELECT * FROM candidate_rejections WHERE candidate_id IN ($inQuery) ORDER BY recordedAt DESC");
        $stmtRej->execute($candidateIds);
        $allRej = $stmtRej->fetchAll(PDO::FETCH_ASSOC);
        $rejByCand = [];
        foreach ($allRej as $r) { $rejByCand[$r['candidate_id']][] = $r; }

        // 5. Batch fetch applications
        $stmtApps = $conn->prepare("SELECT * FROM applications WHERE candidate_id IN ($inQuery) ORDER BY appliedAt DESC");
        $stmtApps->execute($candidateIds);
        $allApps = $stmtApps->fetchAll(PDO::FETCH_ASSOC);
        $appsByCand = [];
        foreach ($allApps as $a) { $appsByCand[$a['candidate_id']][] = $a; }

        // 6. Batch fetch interviews (via applications)
        $stmtInt = $conn->prepare("SELECT i.*, a.candidate_id FROM candidate_interviews i JOIN applications a ON i.application_id = a.id WHERE a.candidate_id IN ($inQuery) ORDER BY i.interviewDate DESC");
        $stmtInt->execute($candidateIds);
        $allInt = $stmtInt->fetchAll(PDO::FETCH_ASSOC);
        $intByCand = [];
        foreach ($allInt as $i) { $intByCand[$i['candidate_id']][] = $i; }

        // Hydrate results
        foreach ($results as &$row) {
            $cid = $row['id'];
            $row['tags'] = json_decode($row['tags'] ?? '[]');
            $row['skills'] = json_decode($row['skills'] ?? '[]');
            $row['interviews'] = json_decode($row['interviews'] ?? '[]');
            
            $row['activity'] = $histByCand[$cid] ?? [];
            if (empty($row['activity']) && isset($row['appliedAt'])) {
                $row['activity'][] = [
                    'id' => 'initial',
                    'at' => str_replace(' ', 'T', $row['appliedAt']) . 'Z',
                    'kind' => 'created',
                    'message' => 'Application received'
                ];
            }
            
            $row['notesList'] = $notesByCand[$cid] ?? [];
            $row['documentsList'] = $docsByCand[$cid] ?? [];
            $row['alerts'] = $rejByCand[$cid] ?? [];
            $row['applicationsList'] = $appsByCand[$cid] ?? [];
            $row['interviewsList'] = $intByCand[$cid] ?? [];
            
            if ($row['appliedAt']) $row['appliedAt'] = str_replace(' ', 'T', $row['appliedAt']) . 'Z';
            if ($row['updatedAt']) $row['updatedAt'] = str_replace(' ', 'T', $row['updatedAt']) . 'Z';
            if ($row['createdAt']) $row['createdAt'] = str_replace(' ', 'T', $row['createdAt']) . 'Z';
            $row['isBlacklisted'] = (bool)$row['isBlacklisted'];
            $row['isActive'] = (bool)$row['isActive'];
        }
        
        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    try {
        $conn->beginTransaction();

        $c = $data;
        $id = $c['id'];
        
        // Duplicate Check
        $stmtCheck = $conn->prepare("SELECT id FROM candidates WHERE email = ? OR (phone != '' AND phone = ?)");
        $stmtCheck->execute([$c['email'], $c['phone'] ?? '']);
        if ($stmtCheck->fetchColumn()) {
            http_response_code(409);
            echo json_encode(["error" => "A candidate with this email or phone already exists."]);
            exit;
        }

        // 1. Insert into candidates table
        $stmtCand = $conn->prepare("INSERT INTO candidates (
            id, name, email, phone, alternateMobile, location, preferredLocation, 
            experience, relevantExperience, currentCompany, currentDesignation, 
            currentCtc, expectedCtc, noticePeriod, skills, resume, linkedInProfile, 
            isBlacklisted, isActive, createdAt, updatedAt
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )");
        
        $skills = json_encode($c['skills'] ?? []);
        $createdAt = parseDate($c['appliedAt'] ?? 'now');
        
        $stmtCand->execute([
            $id,
            $c['name'],
            $c['email'],
            $c['phone'] ?? '',
            $c['alternateMobile'] ?? '',
            $c['location'] ?? '',
            $c['preferredLocation'] ?? '',
            $c['experience'] ?? '',
            $c['relevantExperience'] ?? '',
            $c['currentCompany'] ?? '',
            $c['currentDesignation'] ?? '',
            $c['currentCtc'] ?? '',
            $c['expectedCtc'] ?? '',
            $c['noticePeriod'] ?? '',
            $skills,
            $c['resume'] ?? '',
            $c['linkedInProfile'] ?? '',
            isset($c['isBlacklisted']) ? (int)$c['isBlacklisted'] : 0,
            isset($c['isActive']) ? (int)$c['isActive'] : 1,
            $createdAt,
            $createdAt
        ]);
        
        // 2. Insert into applications table
        $stmtApp = $conn->prepare("INSERT INTO applications (
            candidate_id, role_applied, department, source, stage, recruiter, appliedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $stmtApp->execute([
            $id,
            $c['role'] ?? '',
            $c['department'] ?? '',
            $c['source'] ?? 'Website',
            $c['stage'] ?? 'New Applicant',
            $c['recruiter'] ?? '',
            $createdAt
        ]);
        
        // 3. Log history
        $stmtHist = $conn->prepare("INSERT INTO candidate_history (candidate_id, action, details, createdAt) VALUES (?, ?, ?, ?)");
        $stmtHist->execute([$id, 'Candidate Created', 'Application received from ' . ($c['source'] ?? 'Website'), $createdAt]);
        
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Candidate added"]);
    } catch (PDOException $e) {
        if(isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($_GET['id']) || !$data) {
        http_response_code(400);
        echo json_encode(["error" => "Missing ID or data"]);
        exit;
    }
    
    $id = $_GET['id'];
    
    try {
        $conn->beginTransaction();
        
        // Check if candidate exists
        $stmt = $conn->prepare("SELECT * FROM candidates WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["error" => "Candidate not found"]);
            exit;
        }
        
        // 1. Update candidates table
        $candFields = [
            'name', 'email', 'phone', 'alternateMobile', 'location', 'preferredLocation', 
            'experience', 'relevantExperience', 'currentCompany', 'currentDesignation', 
            'currentCtc', 'expectedCtc', 'noticePeriod', 'resume', 'linkedInProfile', 
            'isBlacklisted', 'isActive'
        ];
        
        $updateStrs = [];
        $params = [];
        foreach ($candFields as $f) {
            if (isset($data[$f])) {
                $updateStrs[] = "$f = ?";
                $params[] = $data[$f];
            }
        }
        
        if (isset($data['skills'])) {
            $updateStrs[] = "skills = ?";
            $params[] = is_array($data['skills']) ? json_encode($data['skills']) : $data['skills'];
        }
        
        if (!empty($updateStrs)) {
            $updateStrs[] = "updatedAt = ?";
            $params[] = date('Y-m-d H:i:s');
            $params[] = $id; // For WHERE clause
            
            $updateSql = "UPDATE candidates SET " . implode(", ", $updateStrs) . " WHERE id = ?";
            $stmt = $conn->prepare($updateSql);
            $stmt->execute($params);
        }
        
        // 2. Update applications table (assuming 1 active application per candidate for now)
        $appFields = ['role', 'department', 'source', 'stage', 'recruiter'];
        $appUpdateStrs = [];
        $appParams = [];
        
        if (isset($data['role'])) {
            $appUpdateStrs[] = "role_applied = ?";
            $appParams[] = $data['role'];
        }
        foreach (['department', 'source', 'stage', 'recruiter'] as $f) {
            if (isset($data[$f])) {
                $appUpdateStrs[] = "$f = ?";
                $appParams[] = $data[$f];
            }
        }
        
        if (!empty($appUpdateStrs)) {
            $appParams[] = $id;
            $appSql = "UPDATE applications SET " . implode(", ", $appUpdateStrs) . " WHERE candidate_id = ?";
            $stmt = $conn->prepare($appSql);
            $stmt->execute($appParams);
        }
        
        // Handle Rejections / Alerts logging
        if (isset($data['stage']) && in_array($data['stage'], ['Rejected', 'No Show', 'Offer Declined', 'Offer Expired'])) {
            $reason = $data['rejectionReason'] ?? $data['stageReason'] ?? 'Status updated to ' . $data['stage'];
            $stmtRej = $conn->prepare("INSERT INTO candidate_rejections (candidate_id, type, reason) VALUES (?, ?, ?)");
            $stmtRej->execute([$id, $data['stage'], $reason]);
        }
        if (isset($data['isBlacklisted']) && $data['isBlacklisted']) {
            $reason = $data['blacklistReason'] ?? 'Blacklisted';
            // Only insert if not already recently blacklisted to prevent duplicates on multiple updates
            $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM candidate_rejections WHERE candidate_id = ? AND type = 'Blacklisted'");
            $stmtCheck->execute([$id]);
            if ($stmtCheck->fetchColumn() == 0) {
                $stmtRej = $conn->prepare("INSERT INTO candidate_rejections (candidate_id, type, reason) VALUES (?, ?, ?)");
                $stmtRej->execute([$id, 'Blacklisted', $reason]);
            }
        }
        
        // 3. Log history
        if (isset($data['activity']) && is_array($data['activity'])) {
            // Find the newest activity and insert it
            $latest = end($data['activity']);
            if ($latest && isset($latest['message'])) {
                $stmtHist = $conn->prepare("INSERT INTO candidate_history (candidate_id, action, details) VALUES (?, ?, ?)");
                $stmtHist->execute([$id, 'Candidate Updated', $latest['message']]);
            }
        } else {
            $stmtHist = $conn->prepare("INSERT INTO candidate_history (candidate_id, action) VALUES (?, ?)");
            $stmtHist->execute([$id, 'Candidate Updated']);
        }
        
        $conn->commit();
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        if(isset($conn) && $conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $ids = [];
    if (isset($data['ids']) && is_array($data['ids'])) {
        $ids = $data['ids'];
    } elseif (isset($_GET['id'])) {
        $ids = [$_GET['id']];
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid IDs"]);
        exit;
    }
    
    try {
        $inQuery = implode(',', array_fill(0, count($ids), '?'));
        // With ON DELETE CASCADE, deleting from candidates will also delete from applications, interviews, etc.
        $stmt = $conn->prepare("DELETE FROM candidates WHERE id IN ($inQuery)");
        $stmt->execute($ids);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>
