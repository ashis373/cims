<?php
require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');
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
        // Fetch candidates with scope filter
        $scopeWhere = get_candidate_scope_where('c');
        $stmt = $conn->query("
            SELECT c.* 
            FROM cims_candidates c 
            WHERE $scopeWhere
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
            $cInterviews = $intByCand[$cid] ?? [];
            $hasFinalRoundCompleted = false;
            $hasAnyInterviewScheduled = false;

            foreach ($cInterviews as $civ) {
                $civType = strtolower(trim($civ['type'] ?? ''));
                $civStatus = $civ['status'] ?? '';
                if ($civStatus === 'Completed' && ($civType === 'final round' || $civType === 'final')) {
                    $hasFinalRoundCompleted = true;
                }
                if ($civStatus === 'Scheduled' || $civStatus === 'Rescheduled' || $civStatus === 'Completed') {
                    $hasAnyInterviewScheduled = true;
                }
            }

            if (!empty($apps)) {
                $latestApp = $apps[0];
                $appStage = $latestApp['stage'] ?? null;

                // Only move to 'Interview Completed' if the Final Round is completed
                if ($hasFinalRoundCompleted && in_array($appStage, ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled'])) {
                    $appStage = 'Interview Completed';
                    try {
                        $updAppStmt = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Completed' WHERE id = ?");
                        $updAppStmt->execute([$latestApp['id']]);
                    } catch (Throwable $ignore) {}
                } elseif (!$hasFinalRoundCompleted && $hasAnyInterviewScheduled && in_array($appStage, ['New Applicant', 'Shortlisted', 'HR Call Scheduled'])) {
                    // Intermediate rounds (Technical, Practical, Managerial, HR Call) keep candidate in 'Interview Scheduled'
                    $appStage = 'Interview Scheduled';
                    try {
                        $updAppStmt = $conn->prepare("UPDATE cims_applications SET stage = 'Interview Scheduled' WHERE id = ?");
                        $updAppStmt->execute([$latestApp['id']]);
                    } catch (Throwable $ignore) {}
                }

                $row['stage'] = $appStage;
                $row['role'] = $latestApp['role_applied'] ?? null;
                $row['department'] = $latestApp['department'] ?? null;
                $row['source'] = $latestApp['source'] ?? null;
                $row['recruiter'] = $latestApp['recruiter'] ?? null;
                $row['appliedAt'] = $latestApp['appliedAt'] ?? null;
            } else {
                $row['stage'] = $hasFinalRoundCompleted ? 'Interview Completed' : ($hasAnyInterviewScheduled ? 'Interview Scheduled' : null);
                $row['role'] = null;
                $row['department'] = null;
                $row['source'] = null;
                $row['recruiter'] = null;
                $row['appliedAt'] = null;
            }

            $row['tags'] = json_decode($row['tags'] ?? '[]');
            $row['skills'] = json_decode($row['skills'] ?? '[]');
            $dbInterviews = json_decode($row['interviews'] ?? '[]');
            $candInterviewsList = $intByCand[$cid] ?? [];

            // If cims_candidates.interviews json is empty but candidate has interviews in cims_candidate_interviews, map them
            if (empty($dbInterviews) && !empty($candInterviewsList)) {
                $mappedInterviews = [];
                foreach ($candInterviewsList as $ivRow) {
                    $mappedInterviews[] = [
                        'id' => (string)$ivRow['id'],
                        'application_id' => (string)($ivRow['application_id'] ?? ''),
                        'date' => $ivRow['interviewDate'] ?? $ivRow['date'] ?? '',
                        'type' => $ivRow['type'] ?? 'HR Call',
                        'end_time' => $ivRow['end_time'] ?? null,
                        'mode' => $ivRow['mode'] ?? 'Online',
                        'interviewers' => $ivRow['interviewers'] ?? $ivRow['interviewer'] ?? '',
                        'meeting_link' => $ivRow['meeting_link'] ?? '',
                        'location' => $ivRow['location'] ?? '',
                        'notes' => $ivRow['notes'] ?? '',
                        'status' => $ivRow['status'] ?? 'Scheduled',
                        'feedback' => $ivRow['feedback'] ?? null,
                        'rating' => isset($ivRow['rating']) ? (int)$ivRow['rating'] : null,
                        'recommendation' => $ivRow['recommendation'] ?? null,
                        'result' => $ivRow['result'] ?? null,
                        'comments' => $ivRow['comments'] ?? null,
                        'created_by' => $ivRow['created_by'] ?? 'Admin',
                        'created_at' => $ivRow['created_at'] ?? $ivRow['createdAt'] ?? null
                    ];
                }
                $row['interviews'] = $mappedInterviews;
            } else {
                $row['interviews'] = $dbInterviews;
            }
            
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
        
        // Duplicate Check (normalized email and phone)
        if (!isset($data['forceCreate']) || $data['forceCreate'] !== true) {
            $candEmail = trim($c['email'] ?? '');
            $candPhone = preg_replace('/[^0-9]/', '', $c['phone'] ?? '');
            $dupConds = [];
            $dupParams = [];
            if (!empty($candEmail)) {
                $dupConds[] = "LOWER(TRIM(email)) = ?";
                $dupParams[] = strtolower($candEmail);
            }
            if (!empty($candPhone) && strlen($candPhone) >= 7) {
                $dupConds[] = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') LIKE ?";
                $dupParams[] = "%" . substr($candPhone, -10);
            }
            if (!empty($dupConds)) {
                $stmtCheck = $conn->prepare("SELECT id, name FROM cims_candidates WHERE (" . implode(" OR ", $dupConds) . ") LIMIT 1");
                $stmtCheck->execute($dupParams);
                $dupRow = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                if ($dupRow) {
                    http_response_code(409);
                    echo json_encode(["error" => "A candidate with matching email or phone already exists: " . $dupRow['name']]);
                    exit;
                }
            }
        }
        // 1. Insert into cims_candidates table with assigned recruiter
        $assignedRecruiter = $c['assigned_recruiter_id'] ?? $userId;
        $assignedHM = $c['assigned_hiring_manager_id'] ?? null;
        $stmtCand = $conn->prepare("INSERT INTO cims_candidates (
            id, name, email, phone, alternateMobile, location, preferredLocation, 
            experience, relevantExperience, currentCompany, currentDesignation, 
            currentCtc, expectedCtc, noticePeriod, skills, resume, linkedInProfile, 
            isBlacklisted, isActive, createdAt, updatedAt, photo, assigned_recruiter_id, assigned_hiring_manager_id
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
            $c['photo'] ?? '',
            $assignedRecruiter,
            $assignedHM
        ]);
        
        // 2. Insert into cims_applications table with recruiter_id
        $stmtApp = $conn->prepare("INSERT INTO cims_applications (
            candidate_id, role_applied, department, source, stage, recruiter, recruiter_id, appliedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmtApp->execute([
            $id,
            $c['role'] ?? '',
            $c['department'] ?? '',
            $c['source'] ?? 'Website',
            $c['stage'] ?? 'New Applicant',
            $c['recruiter'] ?? '',
            $assignedRecruiter,
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

        // Scope / Assignment Authorization Check
        if (!check_candidate_access($id)) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to edit this candidate."]);
            exit;
        }
        // Fetch old application stage
        $stmtAppOld = $conn->prepare("SELECT role_applied as role, stage FROM cims_applications WHERE candidate_id = ? ORDER BY appliedAt DESC LIMIT 1");
        $stmtAppOld->execute([$id]);
        $oldApp = $stmtAppOld->fetch(PDO::FETCH_ASSOC);
        $oldStage = $oldApp ? $oldApp['stage'] : null;

        // BACKEND PIPELINE TRANSITION ENFORCEMENT
        if (isset($data['stage']) && $data['stage'] !== $oldStage && !empty($oldStage)) {
            $newStage = $data['stage'];
            $earlyStages = ['New Applicant', 'Shortlisted', 'HR Call Scheduled'];
            $offerAndOutcomes = ['Offer Released', 'Offer Accepted', 'Offer Declined', 'Offer Expired', 'Joined'];

            // 1. Joined candidate cannot be moved backward
            if ($oldStage === 'Joined' && $newStage !== 'Joined') {
                http_response_code(422);
                echo json_encode(["error" => "Candidate is already Joined and cannot be moved backward."]);
                exit;
            }

            // 2. Early stages (New Applicant, Shortlisted, HR Call Scheduled) cannot skip interview workflow to Offer/Joined
            if (in_array($oldStage, $earlyStages) && in_array($newStage, $offerAndOutcomes)) {
                http_response_code(422);
                echo json_encode(["error" => "Candidates in $oldStage must complete interview rounds before an offer can be released."]);
                exit;
            }

            // 3. Interview Scheduled cannot jump directly to Offer/Joined without interview completion
            if ($oldStage === 'Interview Scheduled' && in_array($newStage, $offerAndOutcomes)) {
                http_response_code(422);
                echo json_encode(["error" => "Interview Scheduled is locked. The interview must be conducted and completed before releasing an offer."]);
                exit;
            }

            // 4. Interview Completed cannot be dragged backward to screening stages
            if ($oldStage === 'Interview Completed' && in_array($newStage, ['New Applicant', 'Shortlisted', 'HR Call Scheduled', 'Interview Scheduled'])) {
                http_response_code(422);
                echo json_encode(["error" => "Interview Completed is locked. Cannot move candidate back to prior screening stages."]);
                exit;
            }
        }
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
        $changes = [];
        $fieldMap = [
            'name' => 'Name', 'email' => 'Email', 'phone' => 'Phone', 'alternateMobile' => 'Alternate Mobile',
            'location' => 'Current Location', 'preferredLocation' => 'Preferred Location', 'experience' => 'Total Experience',
            'relevantExperience' => 'Relevant Experience', 'currentCompany' => 'Current Company', 'currentDesignation' => 'Current Designation',
            'currentCtc' => 'Current CTC', 'expectedCtc' => 'Expected CTC', 'noticePeriod' => 'Notice Period',
            'resume' => 'Resume', 'linkedInProfile' => 'LinkedIn Profile', 'isBlacklisted' => 'Blacklisted Status', 'isActive' => 'Active Status', 'photo' => 'Photo'
        ];
        $arrow = json_decode('"\u2192"');
        foreach ($fieldMap as $key => $label) {
            if (array_key_exists($key, $data)) {
                $oldRaw = $existing[$key];
                $newRaw = $data[$key];
                
                // normalize booleans
                if ($key === 'isBlacklisted' || $key === 'isActive') {
                    $oldRaw = (bool)$oldRaw ? 'Yes' : 'No';
                    $newRaw = (bool)$newRaw ? 'Yes' : 'No';
                } else {
                    $oldRaw = trim((string)$oldRaw);
                    $newRaw = trim((string)$newRaw);
                }

                if ($oldRaw !== $newRaw) {
                    $oldVal = $oldRaw ?: '—';
                    $newVal = $newRaw ?: '—';
                    if ($key === 'resume') {
                        $cleanName = preg_replace('/^\d+_/', '', $newRaw);
                        if ($cleanName === '' || $cleanName === '-') $cleanName = 'Resume';
                        $changes[] = ['action' => 'Resume Uploaded', 'details' => $cleanName . ' uploaded'];
                    } elseif ($key === 'photo') {
                        $changes[] = ['action' => 'Profile Updated', 'details' => 'Photo updated'];
                    } else {
                        $changes[] = ['action' => 'Profile Updated', 'details' => "$label: $oldVal $arrow $newVal"];
                    }
                }
            }
        }
        if (isset($data['skills'])) {
            $newSkills = is_array($data['skills']) ? implode(', ', $data['skills']) : $data['skills'];
            $oldSkillsArr = json_decode($existing['skills'] ?? '[]');
            $oldSkills = is_array($oldSkillsArr) ? implode(', ', $oldSkillsArr) : $existing['skills'];
            if (trim($newSkills) !== trim($oldSkills)) {
                $oldVal = trim($oldSkills) ?: '—';
                $newVal = trim($newSkills) ?: '—';
                $changes[] = ['action' => 'Skills Updated', 'details' => "Skills: $oldVal $arrow $newVal"];
            }
        }
        if (isset($data['stage']) && $data['stage'] !== $oldStage) {
            $oldVal = $oldStage ?: 'New Applicant';
            $stageDetails = "$oldVal $arrow {$data['stage']}";
            $reason = $data['rejectionReason'] ?? $data['stageReason'] ?? null;
            if ($reason && trim($reason) !== '') {
                $stageDetails .= " (Reason: " . trim($reason) . ")";
            }
            $changes[] = ['action' => 'Candidate Moved', 'details' => $stageDetails];
        }

        if (empty($changes) && isset($data['activity']) && is_array($data['activity'])) {
            $latest = end($data['activity']);
            if ($latest && isset($latest['message'])) {
                $changes[] = ['action' => 'Candidate Updated', 'details' => $latest['message']];
            }
        }

        $stmtHist = $conn->prepare("INSERT INTO cims_candidate_history (candidate_id, action, details, userId) VALUES (?, ?, ?, ?)");
        foreach ($changes as $c) {
            $stmtHist->execute([$id, $c['action'], $c['details'], $userId]);
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
    
    // Scope / Assignment Authorization Check on all candidate IDs
    foreach ($ids as $candId) {
        if (!check_candidate_access($candId)) {
            http_response_code(403);
            echo json_encode(["error" => "Forbidden: You are not authorized to delete candidate $candId."]);
            exit;
        }
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








