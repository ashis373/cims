<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include '../db.php';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') $required_permission = 'can_add';
else if ($method === 'PUT') $required_permission = 'can_edit';
else if ($method === 'DELETE') $required_permission = 'can_delete';
else $required_permission = 'can_view';
require_once '../auth_middleware.php';
require_permission('candidates');
require '../vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
// Helper function to extract date
function parseDate($dateStr) {
    return (isset($dateStr) && $dateStr) ? date('Y-m-d H:i:s', strtotime($dateStr)) : null;
}
if ($method === 'GET') {
    try {
        // Fetch candidates with primary application details
        $stmt = $conn->query("
            SELECT c.* 
            FROM cims_candidates c 
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
        $stmtHist = $conn->prepare("
            SELECT h.*, u.full_name, r.role_name 
            FROM cims_candidate_history h 
            LEFT JOIN cims_users u ON h.userId = u.id 
            LEFT JOIN cims_roles r ON u.role_id = r.id 
            WHERE h.candidate_id IN ($inQuery) 
            ORDER BY h.createdAt DESC
        ");
        $stmtHist->execute($candidateIds);
        $allHistory = $stmtHist->fetchAll(PDO::FETCH_ASSOC);
        $histByCand = [];
        foreach ($allHistory as $h) {
            $author = $h['role_name'] ?: ($h['full_name'] ?: 'System');
            $histByCand[$h['candidate_id']][] = [
                'id' => $h['id'],
                'at' => str_replace(' ', 'T', $h['createdAt']),
                'kind' => 'system',
                'author' => $author,
                'message' => $h['action'] . ($h['details'] ? ': ' . $h['details'] : '')
            ];
        }
        // 2. Batch fetch notes
        $stmtNotes = $conn->prepare("SELECT * FROM cims_candidate_notes WHERE candidate_id IN ($inQuery) ORDER BY createdAt DESC");
        $stmtNotes->execute($candidateIds);
        $allNotes = $stmtNotes->fetchAll(PDO::FETCH_ASSOC);
        $notesByCand = [];
        foreach ($allNotes as $n) { 
            if ($n['createdAt']) $n['createdAt'] = str_replace(' ', 'T', $n['createdAt']);
            $notesByCand[$n['candidate_id']][] = $n; 
        }
        // 3. Batch fetch documents
        $stmtDocs = $conn->prepare("SELECT * FROM cims_candidate_documents WHERE candidate_id IN ($inQuery) ORDER BY uploadedAt DESC");
        $stmtDocs->execute($candidateIds);
        $allDocs = $stmtDocs->fetchAll(PDO::FETCH_ASSOC);
        $docsByCand = [];
        foreach ($allDocs as $d) { 
            if ($d['uploadedAt']) $d['uploadedAt'] = str_replace(' ', 'T', $d['uploadedAt']);
            $docsByCand[$d['candidate_id']][] = $d; 
        }
        // 4. Batch fetch alerts (rejections)
        $stmtRej = $conn->prepare("SELECT * FROM cims_candidate_rejections WHERE candidate_id IN ($inQuery) ORDER BY recordedAt DESC");
        $stmtRej->execute($candidateIds);
        $allRej = $stmtRej->fetchAll(PDO::FETCH_ASSOC);
        $rejByCand = [];
        foreach ($allRej as $r) { 
            if ($r['recordedAt']) $r['recordedAt'] = str_replace(' ', 'T', $r['recordedAt']);
            $rejByCand[$r['candidate_id']][] = $r; 
        }
        // 5. Batch fetch applications
        $stmtApps = $conn->prepare("SELECT * FROM cims_applications WHERE candidate_id IN ($inQuery) ORDER BY appliedAt DESC");
        $stmtApps->execute($candidateIds);
        $allApps = $stmtApps->fetchAll(PDO::FETCH_ASSOC);
        $appsByCand = [];
        foreach ($allApps as $a) { 
            if ($a['appliedAt']) $a['appliedAt'] = str_replace(' ', 'T', $a['appliedAt']);
            $appsByCand[$a['candidate_id']][] = $a; 
        }
        // 6. Batch fetch interviews (via applications)
        $stmtInt = $conn->prepare("SELECT i.*, a.candidate_id FROM cims_candidate_interviews i JOIN cims_applications a ON i.application_id = a.id WHERE a.candidate_id IN ($inQuery) ORDER BY i.interviewDate DESC");
        $stmtInt->execute($candidateIds);
        $allInt = $stmtInt->fetchAll(PDO::FETCH_ASSOC);
        $intByCand = [];
        foreach ($allInt as $i) { 
            if (!empty($i['interviewDate'])) $i['interviewDate'] = str_replace(' ', 'T', $i['interviewDate']);
            if (!empty($i['created_at'])) $i['created_at'] = str_replace(' ', 'T', $i['created_at']);
            elseif (!empty($i['createdAt'])) $i['createdAt'] = str_replace(' ', 'T', $i['createdAt']);
            $intByCand[$i['candidate_id']][] = $i; 
        }
        // 7. Batch fetch email logs
        $stmtEmail = $conn->prepare("SELECT * FROM cims_email_logs WHERE candidate_id IN ($inQuery) ORDER BY sent_at DESC");
        $stmtEmail->execute($candidateIds);
        $allEmails = $stmtEmail->fetchAll(PDO::FETCH_ASSOC);
        $emailsByCand = [];
        foreach ($allEmails as $e) {
            if (!empty($e['sent_at'])) $e['sent_at'] = str_replace(' ', 'T', $e['sent_at']);
            $emailsByCand[$e['candidate_id']][] = $e;
        }
        // Hydrate results
        foreach ($results as &$row) {
            $cid = $row['id'];
            
            $apps = $appsByCand[$cid] ?? [];
            if (!empty($apps)) {
                $latestApp = $apps[0];
                $row['stage'] = $latestApp['stage'] ?? null;
                $row['role'] = $latestApp['role_applied'] ?? null;
                $row['department'] = $latestApp['department'] ?? null;
                $row['source'] = $latestApp['source'] ?? null;
                $row['recruiter'] = $latestApp['recruiter'] ?? null;
                $row['appliedAt'] = $latestApp['appliedAt'] ?? null;
            } else {
                $row['stage'] = null;
                $row['role'] = null;
                $row['department'] = null;
                $row['source'] = null;
                $row['recruiter'] = null;
                $row['appliedAt'] = null;
            }

            $row['tags'] = json_decode($row['tags'] ?? '[]');
            $row['skills'] = json_decode($row['skills'] ?? '[]');
            $row['interviews'] = json_decode($row['interviews'] ?? '[]');
            
            $row['activity'] = $histByCand[$cid] ?? [];
            if (empty($row['activity']) && isset($row['appliedAt'])) {
                $row['activity'][] = [
                    'id' => 'initial',
                    'at' => str_replace(' ', 'T', $row['appliedAt']),
                    'kind' => 'created',
                    'message' => 'Application received'
                ];
            }
            
            $row['notesList'] = $notesByCand[$cid] ?? [];
            $row['documentsList'] = $docsByCand[$cid] ?? [];
            $row['alerts'] = $rejByCand[$cid] ?? [];
            $row['applicationsList'] = $appsByCand[$cid] ?? [];
            $row['interviewsList'] = $intByCand[$cid] ?? [];
            $row['emailLogs'] = $emailsByCand[$cid] ?? [];
            
            if ($row['appliedAt']) $row['appliedAt'] = str_replace(' ', 'T', $row['appliedAt']);
            if ($row['updatedAt']) $row['updatedAt'] = str_replace(' ', 'T', $row['updatedAt']);
            if ($row['createdAt']) $row['createdAt'] = str_replace(' ', 'T', $row['createdAt']);
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
        $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
        
        $userName = 'System';
        if ($userId) {
            $stmtUser = $conn->prepare("SELECT u.full_name, r.role_name FROM cims_users u LEFT JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
            $stmtUser->execute([$userId]);
            $userRow = $stmtUser->fetch(PDO::FETCH_ASSOC);
            if ($userRow) {
                $userName = $userRow['full_name'] ?: ($userRow['role_name'] ?: 'System');
            }
        }
        
        // Duplicate Check
        if (!isset($data['forceCreate']) || $data['forceCreate'] !== true) {
            $stmtCheck = $conn->prepare("SELECT id FROM cims_candidates WHERE email = ?");
            $stmtCheck->execute([$c['email']]);
            if ($stmtCheck->fetchColumn()) {
                http_response_code(409);
                echo json_encode(["error" => "A candidate with this email already exists."]);
                exit;
            }
        }
        // 1. Insert into cims_candidates table
        $stmtCand = $conn->prepare("INSERT INTO cims_candidates (
            id, name, email, phone, alternateMobile, location, preferredLocation, 
            experience, relevantExperience, currentCompany, currentDesignation, 
            currentCtc, expectedCtc, noticePeriod, skills, resume, linkedInProfile, 
            isBlacklisted, isActive, createdAt, updatedAt, photo
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )");
        
        $skills = json_encode($c['skills'] ?? []);
        $appliedAt = parseDate($c['appliedAt'] ?? 'now');
        $now = date('Y-m-d H:i:s');
        
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
            $now,
            $now,
            $c['photo'] ?? ''
        ]);
        
        // 2. Insert into cims_applications table
        $stmtApp = $conn->prepare("INSERT INTO cims_applications (
            candidate_id, role_applied, department, source, stage, recruiter, appliedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        $stmtApp->execute([
            $id,
            $c['role'] ?? '',
            $c['department'] ?? '',
            $c['source'] ?? 'Website',
            $c['stage'] ?? 'New Applicant',
            $c['recruiter'] ?? '',
            $appliedAt
        ]);
        
        // 3. Log history
        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, createdAt, userId) VALUES (?, ?, ?, ?, ?)");
        $stmtHist->execute([$id, 'Candidate Created', 'Application received from ' . ($c['source'] ?? 'Website'), $now, $userId]);
        
        // 4. Save Notes
        if (isset($c['notes']) && trim($c['notes']) !== '') {
            $stmtNote = $conn->prepare("INSERT INTO cims_candidate_notes (candidate_id, text, createdBy, createdAt) VALUES (?, ?, ?, ?)");
            $stmtNote->execute([$id, trim($c['notes']), $userName, $now]);
        }
        
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
        
        $userId = isset($payload['user_id']) ? $payload['user_id'] : null;
        $userName = 'System';
        if ($userId) {
            $stmtUser = $conn->prepare("SELECT u.full_name, r.role_name FROM cims_users u LEFT JOIN cims_roles r ON u.role_id = r.id WHERE u.id = ?");
            $stmtUser->execute([$userId]);
            $userRow = $stmtUser->fetch(PDO::FETCH_ASSOC);
            if ($userRow) {
                $userName = $userRow['full_name'] ?: ($userRow['role_name'] ?: 'System');
            }
        }
        
        // Check if candidate exists
        $stmt = $conn->prepare("SELECT * FROM cims_candidates WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["error" => "Candidate not found"]);
            exit;
        }
        // Fetch old application stage
        $stmtAppOld = $conn->prepare("SELECT role_applied as role, stage FROM cims_applications WHERE candidate_id = ?");
        $stmtAppOld->execute([$id]);
        $oldApp = $stmtAppOld->fetch(PDO::FETCH_ASSOC);
        $oldStage = $oldApp ? $oldApp['stage'] : null;
        
        // 1. Update cims_candidates table
        $candFields = [
            'name', 'email', 'phone', 'alternateMobile', 'location', 'preferredLocation', 
            'experience', 'relevantExperience', 'currentCompany', 'currentDesignation', 
            'currentCtc', 'expectedCtc', 'noticePeriod', 'resume', 'linkedInProfile', 
            'isBlacklisted', 'isActive', 'photo'
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
            
            $updateSql = "UPDATE cims_candidates SET " . implode(", ", $updateStrs) . " WHERE id = ?";
            $stmt = $conn->prepare($updateSql);
            $stmt->execute($params);
        }
        
        // 2. Update or Insert cims_applications table
        if (isset($data['isNewApplication']) && $data['isNewApplication'] === true) {
            $stmtApp = $conn->prepare("INSERT INTO cims_applications (
                candidate_id, role_applied, department, source, stage, recruiter, appliedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmtApp->execute([
                $id,
                $data['role'] ?? '',
                $data['department'] ?? '',
                $data['source'] ?? 'Website',
                'New Applicant',
                $data['recruiter'] ?? '',
                date('Y-m-d H:i:s')
            ]);
        } else {
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
                // Update the latest application if not a new application
                $appSql = "UPDATE cims_applications SET " . implode(", ", $appUpdateStrs) . " WHERE candidate_id = ? ORDER BY appliedAt DESC LIMIT 1";
                $stmt = $conn->prepare($appSql);
                $stmt->execute($appParams);
            }
        }
        
        // Handle Automatic Email Dispatch
        if (isset($data['stage']) && $data['stage'] !== $oldStage) {
            $newStage = $data['stage'];
            $stageMap = [
                'Interview Scheduled' => 'Interview',
                'Offer Released' => 'Offer',
                'Rejected' => 'Rejection'
            ];
            
            if (isset($stageMap[$newStage])) {
                $type = $stageMap[$newStage];
                $tplStmt = $conn->prepare("SELECT * FROM cims_email_templates WHERE category = ? AND (sending_method = 'Automatic' OR LOWER(sending_method) = 'automatic') AND (is_active = 1 OR is_active = '1') LIMIT 1");
                $tplStmt->execute([$type]);
                $tpl = $tplStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($tpl) {
                    $tplId = $tpl['id'];
                    // Prevent duplicate *automatic* emails only (by checking unique_hash prefix)
                    $logCheck = $conn->prepare("SELECT COUNT(*) FROM cims_email_logs WHERE candidate_id = ? AND template_id = ? AND unique_hash LIKE 'auto-%'");
                    $logCheck->execute([$id, $tplId]);
                    if ($logCheck->fetchColumn() == 0) {
                        $candName = isset($data['name']) ? $data['name'] : $existing['name'];
                        $candEmail = isset($data['email']) ? $data['email'] : $existing['email'];
                        $candRole = isset($data['role']) ? $data['role'] : ($oldApp ? $oldApp['role'] : 'the position');
                        
                        $body = str_replace(['{CandidateName}', '{Role}', '{Date}'], [$candName, $candRole, date('m/d/Y')], $tpl['body']);
                        $subject = str_replace(['{CandidateName}', '{Role}', '{Date}'], [$candName, $candRole, date('m/d/Y')], $tpl['subject']);
                        
                        $unique_hash = "auto-$id-$tplId-" . time();
                        
                        $queueInsert = $conn->prepare("
                            INSERT INTO cims_email_queue (candidate_id, recipient_email, template_id, subject, body, sending_method, unique_hash, status) 
                            VALUES (?, ?, ?, ?, ?, 'Automatic', ?, 'Pending')
                        ");
                        $queueInsert->execute([$id, $candEmail, $tplId, $subject, $body, $unique_hash]);
                    }
                }
            }
        }
        
        // Handle Rejections / Alerts logging
        if (isset($data['stage']) && in_array($data['stage'], ['Rejected', 'No Show', 'Offer Declined', 'Offer Expired'])) {
            $reason = $data['rejectionReason'] ?? $data['stageReason'] ?? 'Status updated to ' . $data['stage'];
            $stmtRej = $conn->prepare("INSERT INTO cims_candidate_rejections (candidate_id, type, reason) VALUES (?, ?, ?)");
            $stmtRej->execute([$id, $data['stage'], $reason]);
        }
        if (isset($data['isBlacklisted']) && $data['isBlacklisted']) {
            $reason = $data['blacklistReason'] ?? 'Blacklisted';
            // Only insert if not already recently blacklisted to prevent duplicates on multiple updates
            $stmtCheck = $conn->prepare("SELECT COUNT(*) FROM cims_candidate_rejections WHERE candidate_id = ? AND type = 'Blacklisted'");
            $stmtCheck->execute([$id]);
            if ($stmtCheck->fetchColumn() == 0) {
                $stmtRej = $conn->prepare("INSERT INTO cims_candidate_rejections (candidate_id, type, reason) VALUES (?, ?, ?)");
                $stmtRej->execute([$id, 'Blacklisted', $reason]);
            }
        }
        
        // 3. Log history
        if (isset($data['activity']) && is_array($data['activity'])) {
            // Find the newest activity and insert it
            $latest = end($data['activity']);
            if ($latest && isset($latest['message'])) {
                $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, ?, ?, ?)");
                $stmtHist->execute([$id, 'Candidate Updated', $latest['message'], $userId]);
            }
        } else {
            $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, userId) VALUES (?, ?, ?)");
            $stmtHist->execute([$id, 'Candidate Updated', $userId]);
        }
        
        // 4. Update or Add Notes
        if (isset($data['notes']) && trim($data['notes']) !== '') {
            $now = date('Y-m-d H:i:s');
            // If the note doesn't exist for today, create one, otherwise just append/update. Since the UI just passes 'notes', we'll append a new note.
            $stmtNote = $conn->prepare("INSERT INTO cims_candidate_notes (candidate_id, text, createdBy, createdAt) VALUES (?, ?, ?, ?)");
            $stmtNote->execute([$id, trim($data['notes']), $userName, $now]);
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
        // With ON DELETE CASCADE, deleting from cims_candidates will also delete from cims_applications, interviews, etc.
        $stmt = $conn->prepare("DELETE FROM cims_candidates WHERE id IN ($inQuery)");
        $stmt->execute($ids);
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>

